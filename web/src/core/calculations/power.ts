import type { Material, Machine, Spindle, Tool } from '../data/schemas/index.js'
import { clamp, lerp } from '../utils/math.js'

/**
 * Warning types for power calculations
 */
export interface PowerCalculationWarning {
  type: 'power_limited'
  message: string
  severity: 'warning'
}

/**
 * Result of power calculations
 */
export interface PowerCalculationResult {
  cuttingPowerW: number      // Base cutting power
  powerWithToolW: number     // Power with tool and machine factors
  spindleLossesW: number     // Spindle mechanical losses
  totalPowerRequiredW: number // Total power required
  powerAvailableW: number    // Power available at current RPM
  powerLimited: boolean       // Whether operation is power-limited
  scalingFactor?: number      // Feed rate scaling factor if power-limited
  warnings: PowerCalculationWarning[]
}

/**
 * Get tool power factor based on tool type
 * From spec: drill 1.3, facemill 0.8, etc.
 */
export function getToolPowerFactor(toolType: Tool['type']): number {
  switch (toolType) {
    case 'endmill_flat':
      return 1.0      // Baseline
    case 'drill':
      return 1.3      // Higher power for drilling
    case 'vbit':
      return 0.9      // Slightly lower for v-bits
    case 'facemill':
      return 0.8      // Lower for facemills
    case 'boring':
      return 1.1      // Slightly higher for boring
    case 'slitting':
      return 1.2      // Higher for slitting saws
    default:
      throw new Error(`Unknown tool type: ${toolType as string}`)
  }
}

/**
 * Get power available at a specific RPM from spindle power curve
 * Interpolates between curve points to get accurate power at any RPM
 */
export function getSpindlePowerAtRPM(spindle: Spindle, rpm: number): number {
  // Clamp RPM to spindle range
  const clampedRPM = clamp(rpm, spindle.rpm_min, spindle.rpm_max)
  
  // Sort power curve by RPM to ensure proper interpolation
  const sortedCurve = [...spindle.power_curve].sort((a, b) => a.rpm - b.rpm)
  
  // If RPM is at or below first point, use first point power
  if (clampedRPM <= sortedCurve[0].rpm) {
    return sortedCurve[0].power_kw * 1000  // Convert kW to W
  }
  
  // If RPM is at or above last point, use last point power
  if (clampedRPM >= sortedCurve[sortedCurve.length - 1].rpm) {
    return sortedCurve[sortedCurve.length - 1].power_kw * 1000  // Convert kW to W
  }
  
  // Find the two points to interpolate between
  for (let i = 0; i < sortedCurve.length - 1; i++) {
    const point1 = sortedCurve[i]
    const point2 = sortedCurve[i + 1]
    
    if (clampedRPM >= point1.rpm && clampedRPM <= point2.rpm) {
      // Linear interpolation between the two points
      const t = (clampedRPM - point1.rpm) / (point2.rpm - point1.rpm)
      const powerKW = lerp(point1.power_kw, point2.power_kw, t)
      return powerKW * 1000  // Convert kW to W
    }
  }
  
  // Fallback to rated power (should not reach here with valid curve)
  return spindle.rated_power_kw * 1000
}

/**
 * Calculate cutting power with all factors and power limiting
 * 
 * According to spec 3.2.5:
 * - specificEnergy = material-specific or category fallback
 * - cuttingPower = (MRR × specificEnergy) / 60 (W)
 * - toolPowerFactor from tool type
 * - powerWithTool = cuttingPower × toolPowerFactor × machine.rigidity_factor
 * - spindleLosses = powerWithTool × 0.15
 * - totalPowerRequired = powerWithTool + spindleLosses
 * - powerAvailable = getSpindlePowerAtRPM(spindle, rpm)
 * - If totalPowerRequired > 0.9 × powerAvailable: scale and warn
 */
export function calculatePower(
  material: Material,
  machine: Machine,
  spindle: Spindle,
  tool: Tool,
  mrrMm3Min: number,
  rpm: number
): PowerCalculationResult {
  // Validate inputs
  if (mrrMm3Min < 0) {
    throw new Error('MRR must be non-negative')
  }
  if (rpm <= 0) {
    throw new Error('RPM must be positive')
  }

  const warnings: PowerCalculationWarning[] = []

  // Calculate base cutting power
  // cuttingPower = (MRR × specificEnergy) / 60 (W)
  const specificEnergy = material.specific_cutting_energy_j_mm3
  const cuttingPowerW = (mrrMm3Min * specificEnergy) / 60

  // Apply tool power factor and machine rigidity factor
  const toolPowerFactor = getToolPowerFactor(tool.type)
  const powerWithToolW = cuttingPowerW * toolPowerFactor * machine.rigidity_factor

  // Calculate spindle mechanical losses (15% of cutting power)
  const spindleLossesW = powerWithToolW * 0.15

  // Total power required
  const totalPowerRequiredW = powerWithToolW + spindleLossesW

  // Get available power at current RPM
  const powerAvailableW = getSpindlePowerAtRPM(spindle, rpm)

  // Check if power limiting is needed (threshold at 90% of available power)
  const powerThreshold = powerAvailableW * 0.9
  const powerLimited = totalPowerRequiredW > powerThreshold
  
  let scalingFactor: number | undefined

  if (powerLimited) {
    // Calculate scaling factor: (powerAvailable × 0.85) / totalPowerRequired
    scalingFactor = (powerAvailableW * 0.85) / totalPowerRequiredW
    
    warnings.push({
      type: 'power_limited',
      message: `Operation power-limited (${totalPowerRequiredW.toFixed(0)}W required > ${powerThreshold.toFixed(0)}W available). Feed rate scaled by ${(scalingFactor * 100).toFixed(1)}%`,
      severity: 'warning'
    })
  }

  return {
    cuttingPowerW,
    powerWithToolW,
    spindleLossesW,
    totalPowerRequiredW,
    powerAvailableW,
    powerLimited,
    scalingFactor,
    warnings
  }
}

/**
 * Apply power limiting to feed rate and MRR
 * Returns scaled values when power limiting is active
 */
export function applyPowerLimiting(
  feedRate: number,
  mrr: number,
  scalingFactor?: number
): { feedRate: number; mrr: number } {
  if (scalingFactor === undefined) {
    return { feedRate, mrr }
  }

  return {
    feedRate: feedRate * scalingFactor,
    mrr: mrr * scalingFactor
  }
}