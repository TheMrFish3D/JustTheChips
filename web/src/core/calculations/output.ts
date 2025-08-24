import type { Tool } from '../data/schemas/index.js'

import type { ChiploadCalculationResult } from './chipload.js'
import type { DeflectionCalculationResult } from './deflection.js'
import type { EngagementCalculationResult } from './engagement.js'
import type { ForceCalculationResult } from './force.js'
import type { PowerCalculationResult } from './power.js'
import type { SpeedCalculationResult } from './speeds.js'
import type { ValidationWarning } from './validation.js'

/**
 * Complete calculation output as specified in docs/initial-spec.md section 3.3
 */
export interface CalculationOutput {
  rpm: number                      // Rounded to integer
  feed_mm_min: number             // Rounded to integer  
  fz_mm: number                   // Adjusted chipload (float)
  fz_actual_mm: number            // Chipload before limits (float)
  ae_mm: number                   // Radial engagement (float)
  ap_mm: number                   // Axial engagement DOC (float)
  mrr_mm3_min: number             // Material removal rate (float)
  // eslint-disable-next-line @typescript-eslint/naming-convention
  power_W: number                 // Required power (float)
  // eslint-disable-next-line @typescript-eslint/naming-convention
  power_available_W: number       // Available power (float)
  // eslint-disable-next-line @typescript-eslint/naming-convention
  force_N: number                 // Cutting force (float)
  deflection_mm: number           // Total deflection (float)
  warnings: Array<{type: string, message: string}>  // All warnings
  toolType: string                // Tool type string
  effectiveDiameter: number       // Effective diameter (float)
  user_doc_override: boolean      // Whether user DOC was used
  vc_m_min: number               // Actual surface speed m/min (integer)
  sfm: number                    // Actual surface speed ft/min (integer)
}

/**
 * Input data for assembling the calculation output
 */
export interface OutputAssemblyInput {
  tool: Tool
  effectiveDiameter: number
  userDocOverride: boolean
  speedResult: SpeedCalculationResult
  chiploadResult: ChiploadCalculationResult
  engagementResult: EngagementCalculationResult
  powerResult: PowerCalculationResult
  forceResult: ForceCalculationResult
  deflectionResult: DeflectionCalculationResult
  validationWarnings: ValidationWarning[]
}

/**
 * Assemble the final calculation output with proper rounding rules
 * Per spec 3.3: Return object with all required keys and proper data types
 */
export function assembleOutput(input: OutputAssemblyInput): CalculationOutput {
  // Collect all warnings from different calculation modules
  const allWarnings = [
    ...input.validationWarnings,
    ...input.speedResult.warnings,
    ...input.chiploadResult.warnings,
    ...input.engagementResult.warnings,
    ...input.powerResult.warnings,
    ...input.forceResult.warnings,
    ...input.deflectionResult.warnings
  ].map(warning => ({
    type: warning.type,
    message: warning.message
  }))

  // Convert surface speed from m/min to ft/min (1 m = 3.28084 ft)
  const sfm = Math.round(input.speedResult.vcActual * 3.28084)

  return {
    // Integer values (rounded)
    rpm: Math.round(input.speedResult.rpmActual),
    feed_mm_min: Math.round(input.chiploadResult.vfActual),
    vc_m_min: Math.round(input.speedResult.vcActual),
    sfm: sfm,
    
    // Float values (preserved precision)
    fz_mm: input.chiploadResult.fzAdjusted,
    fz_actual_mm: input.chiploadResult.fzBase,
    ae_mm: input.engagementResult.aeMm,
    ap_mm: input.engagementResult.apMm,
    mrr_mm3_min: input.engagementResult.mrrMm3Min,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    power_W: input.powerResult.totalPowerRequiredW,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    power_available_W: input.powerResult.powerAvailableW,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    force_N: input.forceResult.totalForceN,
    deflection_mm: input.deflectionResult.totalDeflectionMm,
    effectiveDiameter: input.effectiveDiameter,
    
    // Other required fields
    warnings: allWarnings,
    toolType: input.tool.type,
    user_doc_override: input.userDocOverride
  }
}

/**
 * Utility function to round values according to their typical precision needs
 */
export function roundForOutput(value: number, decimalPlaces: number): number {
  const factor = Math.pow(10, decimalPlaces)
  return Math.round(value * factor) / factor
}

/**
 * Apply consistent rounding rules for different value types
 */
export function applyOutputRounding(output: CalculationOutput): CalculationOutput {
  return {
    ...output,
    // Round float values to appropriate precision
    fz_mm: roundForOutput(output.fz_mm, 4),              // 0.1 µm precision
    fz_actual_mm: roundForOutput(output.fz_actual_mm, 4), // 0.1 µm precision
    ae_mm: roundForOutput(output.ae_mm, 2),              // 0.01 mm precision
    ap_mm: roundForOutput(output.ap_mm, 2),              // 0.01 mm precision
    mrr_mm3_min: roundForOutput(output.mrr_mm3_min, 1),  // 0.1 mm³/min precision
    // eslint-disable-next-line @typescript-eslint/naming-convention
    power_W: roundForOutput(output.power_W, 1),          // 0.1 W precision
    // eslint-disable-next-line @typescript-eslint/naming-convention
    power_available_W: roundForOutput(output.power_available_W, 1), // 0.1 W precision
    // eslint-disable-next-line @typescript-eslint/naming-convention
    force_N: roundForOutput(output.force_N, 1),          // 0.1 N precision
    deflection_mm: roundForOutput(output.deflection_mm, 4), // 0.1 µm precision
    effectiveDiameter: roundForOutput(output.effectiveDiameter, 2) // 0.01 mm precision
  }
}