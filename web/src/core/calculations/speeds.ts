import type { Material } from '../data/schemas/material.js'
import type { Spindle } from '../data/schemas/spindle.js'
import type { Tool } from '../data/schemas/tool.js'
import { getToolProperties, getToolMaterialRecommendations } from '../data/toolMaterials.js'
import { clamp } from '../utils/math.js'

export type CutType = 'slot' | 'profile' | 'adaptive' | 'facing' | 'drilling' | 'boring'

export interface SpeedCalculationWarning {
  type: 'rpm_limited'
  message: string
  severity: 'warning' | 'error'
}

export interface SpeedCalculationResult {
  vcTarget: number          // Target surface speed (m/min)
  rpmTheoretical: number    // Theoretical RPM before clamping
  rpmActual: number         // Actual RPM after clamping
  vcActual: number          // Actual surface speed achieved
  warnings: SpeedCalculationWarning[]
}

/**
 * Get speed factor based on cut type
 * These factors adjust the base surface speed for different cutting operations
 */
export function getSpeedFactor(cutType: CutType): number {
  switch (cutType) {
    case 'slot':
      return 0.8      // Slower for full engagement
    case 'profile':
      return 1.0      // Baseline speed
    case 'adaptive':
      return 1.2      // Faster for light engagement
    case 'facing':
      return 0.9      // Slightly reduced for large contact area
    case 'drilling':
      return 0.7      // Slower for drilling operations
    case 'boring':
      return 0.8      // Reduced for boring operations
    default:
      throw new Error(`Unknown cut type: ${cutType as string}`)
  }
}

/**
 * Calculate surface speed and RPM with tool material factors and spindle clamping
 */
export function calculateSpeedAndRPM(
  material: Material,
  spindle: Spindle,
  effectiveDiameter: number,
  cutType: CutType,
  aggressiveness: number = 1.0,
  tool?: Tool  // Optional tool for material-specific adjustments
): SpeedCalculationResult {
  // Validate inputs
  if (effectiveDiameter <= 0) {
    throw new Error('Effective diameter must be positive')
  }
  if (aggressiveness <= 0) {
    throw new Error('Aggressiveness must be positive')
  }

  // Calculate target surface speed
  const [vcMin, vcMax] = material.vc_range_m_min
  const vcBase = (vcMin + vcMax) / 2  // Average of range
  const speedFactor = getSpeedFactor(cutType)
  
  // Apply tool material factors if tool is provided
  let toolMaterialFactor = 1.0
  let materialRecommendations: string[] = []
  
  if (tool) {
    const toolProps = getToolProperties(tool.material, tool.coating)
    const recommendations = getToolMaterialRecommendations(tool.material, material.category)
    
    toolMaterialFactor = recommendations.recommendedSurfaceSpeedMultiplier
    materialRecommendations = recommendations.notes
  }
  
  const vcTarget = vcBase * speedFactor * aggressiveness * toolMaterialFactor

  // Calculate theoretical RPM: rpm = (vc × 1000) / (π × D_eff)
  const rpmTheoretical = (vcTarget * 1000) / (Math.PI * effectiveDiameter)

  // Clamp to spindle limits
  const rpmActual = clamp(rpmTheoretical, spindle.rpm_min, spindle.rpm_max)

  // Calculate actual surface speed achieved
  const vcActual = (rpmActual * Math.PI * effectiveDiameter) / 1000

  // Generate warnings if RPM was limited
  const warnings: SpeedCalculationWarning[] = []
  if (rpmActual !== rpmTheoretical) {
    const limitType = rpmActual === spindle.rpm_min ? 'minimum' : 'maximum'
    warnings.push({
      type: 'rpm_limited',
      message: `Spindle speed limited by ${limitType} RPM (${rpmActual.toFixed(0)} RPM)`,
      severity: 'warning'
    })
  }
  
  // Add tool material recommendations as warnings if applicable
  materialRecommendations.forEach(note => {
    warnings.push({
      type: 'rpm_limited', // Reuse existing type for now
      message: note,
      severity: 'warning'
    })
  })

  return {
    vcTarget,
    rpmTheoretical,
    rpmActual,
    vcActual,
    warnings
  }
}