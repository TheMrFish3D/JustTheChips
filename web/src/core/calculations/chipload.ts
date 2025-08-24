import type { Machine } from '../data/schemas/machine.js'
import type { Material } from '../data/schemas/material.js'
import type { Tool } from '../data/schemas/tool.js'
import { clamp } from '../utils/math.js'

export interface ChiploadCalculationWarning {
  type: 'feed_limited' | 'chipload_danger' | 'chipload_warning'
  message: string
  severity: 'warning' | 'danger'
}

export interface ChiploadCalculationResult {
  fzBase: number           // Base chipload before chip thinning
  fzAdjusted: number       // Chipload after chip thinning
  vfTheoretical: number    // Theoretical feed rate before machine limiting
  vfActual: number         // Actual feed rate after machine limiting
  chipThinningApplied: boolean
  warnings: ChiploadCalculationWarning[]
}

/**
 * Get chipload factor for tool type
 * Different tool types have different chipload multipliers
 */
export function getToolChiploadFactor(toolType: Tool['type']): number {
  switch (toolType) {
    case 'endmill_flat':
      return 1.0      // Baseline
    case 'drill':
      return 0.8      // Reduced for drilling
    case 'vbit':
      return 0.6      // Reduced for v-bits
    case 'facemill':
      return 1.1      // Slightly higher for facemills
    case 'boring':
      return 0.9      // Slightly reduced for boring
    case 'slitting':
      return 0.7      // Reduced for slitting saws
    default:
      throw new Error(`Unknown tool type: ${toolType as string}`)
  }
}

/**
 * Get coating factor for chipload
 * Different coatings allow for different chipload adjustments
 */
export function getCoatingFactor(coating: string): number {
  // Simple coating factors - could be expanded with more detailed mapping
  switch (coating.toLowerCase()) {
    case 'uncoated':
      return 1.0
    case 'tin':
      return 1.1
    case 'altin':
      return 1.2
    case 'alcrn':
      return 1.15
    case 'diamond':
      return 1.3
    default:
      // Default for unknown coatings
      return 1.0
  }
}

/**
 * Get chipload range for the given effective diameter
 * Interpolates between diameter ranges if needed
 */
export function getChiploadRange(material: Material, effectiveDiameter: number): [number, number] {
  // Try exact match first with the format used in tests
  const exactKey = effectiveDiameter.toFixed(1)
  if (material.fz_mm_per_tooth_by_diameter[exactKey]) {
    return material.fz_mm_per_tooth_by_diameter[exactKey]
  }

  // Find nearest available diameters for interpolation
  const availableKeys = Object.keys(material.fz_mm_per_tooth_by_diameter)
  const availableDiameters = availableKeys
    .map(key => parseFloat(key))
    .sort((a, b) => a - b)

  if (availableDiameters.length === 0) {
    throw new Error('No chipload data available for material')
  }

  // If diameter is smaller than smallest available, use smallest
  if (effectiveDiameter <= availableDiameters[0]) {
    const key = availableDiameters[0].toFixed(1)
    return material.fz_mm_per_tooth_by_diameter[key]
  }

  // If diameter is larger than largest available, use largest
  if (effectiveDiameter >= availableDiameters[availableDiameters.length - 1]) {
    const key = availableDiameters[availableDiameters.length - 1].toFixed(1)
    return material.fz_mm_per_tooth_by_diameter[key]
  }

  // Find the two diameters to interpolate between
  let lowerDia = availableDiameters[0]
  let upperDia = availableDiameters[availableDiameters.length - 1]

  for (let i = 0; i < availableDiameters.length - 1; i++) {
    if (availableDiameters[i] <= effectiveDiameter && effectiveDiameter <= availableDiameters[i + 1]) {
      lowerDia = availableDiameters[i]
      upperDia = availableDiameters[i + 1]
      break
    }
  }

  // Linear interpolation
  const lowerKey = lowerDia.toFixed(1)
  const upperKey = upperDia.toFixed(1)
  const lowerRange = material.fz_mm_per_tooth_by_diameter[lowerKey]
  const upperRange = material.fz_mm_per_tooth_by_diameter[upperKey]

  const factor = (effectiveDiameter - lowerDia) / (upperDia - lowerDia)
  const minInterpolated = lowerRange[0] + factor * (upperRange[0] - lowerRange[0])
  const maxInterpolated = lowerRange[1] + factor * (upperRange[1] - lowerRange[1])

  return [minInterpolated, maxInterpolated]
}

/**
 * Calculate chipload and feed rate with chip thinning and machine limiting
 */
export function calculateChiploadAndFeed(
  material: Material,
  machine: Machine,
  tool: Tool,
  effectiveDiameter: number,
  effectiveFlutes: number,
  rpm: number,
  widthOfCut: number,
  aggressiveness: number = 1.0
): ChiploadCalculationResult {
  // Validate inputs
  if (effectiveDiameter <= 0) {
    throw new Error('Effective diameter must be positive')
  }
  if (effectiveFlutes <= 0) {
    throw new Error('Effective flutes must be positive')
  }
  if (rpm <= 0) {
    throw new Error('RPM must be positive')
  }
  if (widthOfCut < 0) {
    throw new Error('Width of cut cannot be negative')
  }
  if (aggressiveness <= 0) {
    throw new Error('Aggressiveness must be positive')
  }

  const warnings: ChiploadCalculationWarning[] = []

  // Get chipload range for this diameter
  const [fzMin, fzMax] = getChiploadRange(material, effectiveDiameter)
  
  // Calculate base chipload
  const fzRangeAverage = (fzMin + fzMax) / 2
  const toolFactor = getToolChiploadFactor(tool.type)
  const coatingFactor = getCoatingFactor(tool.coating)
  
  const fzBase = fzRangeAverage * aggressiveness * toolFactor * coatingFactor

  // Apply chip thinning if conditions are met
  let fzAdjusted = fzBase
  let chipThinningApplied = false

  const chipThinningThreshold = effectiveDiameter * material.chip_thinning.enable_below_fraction
  
  if (widthOfCut > 0 && widthOfCut < chipThinningThreshold) {
    // Apply chip thinning: fz_adjusted = fz_base × sqrt(D_eff / ae)
    const chipThinningMultiplier = Math.sqrt(effectiveDiameter / widthOfCut)
    const clampedMultiplier = clamp(chipThinningMultiplier, 1.0, material.chip_thinning.limit_factor)
    
    fzAdjusted = fzBase * clampedMultiplier
    chipThinningApplied = true
  }

  // Calculate theoretical feed rate: vf = rpm × z_eff × fz
  const vfTheoretical = rpm * effectiveFlutes * fzAdjusted

  // Apply machine axis feed limit
  let vfActual = vfTheoretical
  if (vfTheoretical > machine.axis_max_feed_mm_min) {
    vfActual = machine.axis_max_feed_mm_min
    // Recompute fz_adjusted based on limited feed rate
    fzAdjusted = vfActual / (rpm * effectiveFlutes)
    
    warnings.push({
      type: 'feed_limited',
      message: `Feed rate limited by machine axis (${machine.axis_max_feed_mm_min.toFixed(0)} mm/min)`,
      severity: 'warning'
    })
  }

  // Validate final chipload against material ranges
  const finalFzMin = 0.5 * fzMin
  const finalFzMax = 1.5 * fzMax

  if (fzAdjusted < finalFzMin) {
    warnings.push({
      type: 'chipload_danger',
      message: `Chipload too low (${fzAdjusted.toFixed(4)} mm/tooth < ${finalFzMin.toFixed(4)} mm/tooth)`,
      severity: 'danger'
    })
  } else if (fzAdjusted > finalFzMax) {
    warnings.push({
      type: 'chipload_warning',
      message: `Chipload very high (${fzAdjusted.toFixed(4)} mm/tooth > ${finalFzMax.toFixed(4)} mm/tooth)`,
      severity: 'warning'
    })
  }

  return {
    fzBase,
    fzAdjusted,
    vfTheoretical,
    vfActual,
    chipThinningApplied,
    warnings
  }
}