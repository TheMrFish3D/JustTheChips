import type { Material, Tool } from '../data/schemas/index.js'
import { getToolProperties } from '../data/toolMaterials.js'

/**
 * Warning types for force calculations
 */
export interface ForceCalculationWarning {
  type: 'high_force'
  message: string
  severity: 'warning' | 'danger'
}

/**
 * Result of force calculations
 */
export interface ForceCalculationResult {
  chipAreaMm2: number                 // Chip cross-sectional area
  baseForceMaterialN: number          // Base force from material properties
  toolTypeMultiplier: number          // Tool type force multiplier
  toolMaterialMultiplier: number      // Tool material/coating force multiplier
  totalForceN: number                 // Final cutting force
  warnings: ForceCalculationWarning[]
}

/**
 * Get tool material force multiplier based on tool material and coating
 * Uses researched data for material and coating effects on cutting forces
 */
export function getToolMaterialForceMultiplier(tool: Tool): number {
  const toolProps = getToolProperties(tool.material, tool.coating)
  return toolProps.combinedProps.effectiveForceReduction
}

/**
 * Get tool force multiplier based on tool type
 * From spec: drill 1.5, facemill 0.6, etc.
 */
export function getToolForceMultiplier(toolType: Tool['type']): number {
  switch (toolType) {
    case 'endmill_flat':
      return 1.0      // Baseline
    case 'drill':
      return 1.5      // Higher force for drilling
    case 'vbit':
      return 0.8      // Lower for v-bits
    case 'facemill':
      return 0.6      // Lower for facemills
    case 'boring':
      return 1.2      // Higher for boring
    case 'slitting':
      return 1.3      // Higher for slitting saws
    default:
      throw new Error(`Unknown tool type: ${toolType as string}`)
  }
}

/**
 * Calculate cutting force from chip area and material coefficients
 * Per spec 3.2.6:
 * - Chip cross-section: A = ae × fz_adjusted (mm²)
 * - Base force: F = material.force_coeff_KN_mm2 × A × 1000 (N)  
 * - Multiply by tool-type force multipliers
 */
export function calculateCuttingForce(
  material: Material,
  tool: Tool,
  widthOfCutMm: number,
  chiploadMm: number
): ForceCalculationResult {
  const warnings: ForceCalculationWarning[] = []

  // Calculate chip cross-sectional area: A = ae × fz_adjusted
  const chipAreaMm2 = widthOfCutMm * chiploadMm

  // Calculate base force from material properties: F = force_coeff × A × 1000
  const baseForceMaterialN = material.force_coeff_kn_mm2 * chipAreaMm2 * 1000

  // Get tool-specific force multipliers
  const toolTypeMultiplier = getToolForceMultiplier(tool.type)
  const toolMaterialMultiplier = getToolMaterialForceMultiplier(tool)

  // Calculate total cutting force with both tool type and material effects
  const totalForceN = baseForceMaterialN * toolTypeMultiplier * toolMaterialMultiplier

  // Generate warnings for high forces
  // Use tool diameter as reference for force warnings
  const forcePerMmDiameter = totalForceN / tool.diameter_mm

  if (forcePerMmDiameter > 500) { // Above 500 N/mm is very high
    warnings.push({
      type: 'high_force',
      message: `Very high cutting force (${totalForceN.toFixed(0)} N, ${forcePerMmDiameter.toFixed(0)} N/mm diameter)`,
      severity: 'danger'
    })
  } else if (forcePerMmDiameter > 300) { // Above 300 N/mm is concerning
    warnings.push({
      type: 'high_force',
      message: `High cutting force (${totalForceN.toFixed(0)} N, ${forcePerMmDiameter.toFixed(0)} N/mm diameter)`,
      severity: 'warning'
    })
  }

  return {
    chipAreaMm2,
    baseForceMaterialN,
    toolTypeMultiplier,
    toolMaterialMultiplier,
    totalForceN,
    warnings
  }
}