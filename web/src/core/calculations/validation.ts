import type { Material, Machine, Tool, Spindle } from '../data/schemas/index.js'
import { safeParseInputs } from '../data/schemas/index.js'

import { getChiploadRange } from './chipload.js'
import { getEffectiveDiameter } from './geometry.js'

/**
 * Validation error interface
 */
export interface ValidationError {
  field: string
  message: string
}

/**
 * Warning interface for validation
 */
export interface ValidationWarning {
  type: string
  message: string
  severity: 'warning' | 'danger'
}

/**
 * Result of input validation
 */
export interface ValidationResult {
  errors: ValidationError[]
  warnings: ValidationWarning[]
  isValid: boolean
}

/**
 * Result of chipload evaluation
 */
export interface ChiploadEvaluationResult {
  warnings: ValidationWarning[]
}

/**
 * Result of deflection evaluation
 */
export interface DeflectionEvaluationResult {
  warnings: ValidationWarning[]
}

/**
 * Comprehensive input validation for all entities and cut parameters
 * Per spec 3.4: Validate inputs for machine, spindle, tool, material, and cut parameters
 */
export function validateInputs(
  inputs: unknown,
  materials: Material[],
  machines: Machine[],
  tools: Tool[],
  spindles: Spindle[]
): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // First validate the input structure using zod schema
  const inputResult = safeParseInputs(inputs)
  if (!inputResult.success) {
    inputResult.error.issues.forEach(issue => {
      errors.push({
        field: issue.path.join('.') || 'root',
        message: issue.message
      })
    })
    
    return {
      errors,
      warnings,
      isValid: false
    }
  }

  const validInputs = inputResult.data

  // Validate that referenced entities exist
  const material = materials.find(m => m.id === validInputs.materialId)
  if (!material) {
    errors.push({
      field: 'materialId',
      message: `Material with ID '${validInputs.materialId}' not found`
    })
  }

  const machine = machines.find(m => m.id === validInputs.machineId)
  if (!machine) {
    errors.push({
      field: 'machineId',
      message: `Machine with ID '${validInputs.machineId}' not found`
    })
  }

  const tool = tools.find(t => t.id === validInputs.toolId)
  if (!tool) {
    errors.push({
      field: 'toolId',
      message: `Tool with ID '${validInputs.toolId}' not found`
    })
  }

  const spindle = spindles.find(s => s.id === validInputs.spindleId)
  if (!spindle) {
    errors.push({
      field: 'spindleId',
      message: `Spindle with ID '${validInputs.spindleId}' not found`
    })
  }

  // If any entities are missing, can't continue validation
  if (!material || !machine || !tool || !spindle) {
    return {
      errors,
      warnings,
      isValid: false
    }
  }

  // Validate cut parameters
  if (validInputs.aggressiveness <= 0 || validInputs.aggressiveness > 3) {
    warnings.push({
      type: 'aggressiveness_warning',
      message: `Aggressiveness factor ${validInputs.aggressiveness} is outside normal range (0.1-3.0)`,
      severity: 'warning'
    })
  }

  // Validate user DOC override against tool and material limits
  if (validInputs.user_doc_mm !== undefined) {
    const effectiveDiameter = getEffectiveDiameter(tool)
    const maxDocFromMaterial = effectiveDiameter * (material.max_engagement_fraction || 0.5)
    const maxDocFromTool = tool.default_doc_mm * 2 // Allow up to 2x default DOC
    const maxAllowedDoc = Math.min(maxDocFromMaterial, maxDocFromTool)

    if (validInputs.user_doc_mm > maxAllowedDoc) {
      warnings.push({
        type: 'doc_override_warning',
        message: `User DOC (${validInputs.user_doc_mm.toFixed(2)} mm) exceeds recommended maximum (${maxAllowedDoc.toFixed(2)} mm)`,
        severity: 'warning'
      })
    }

    if (validInputs.user_doc_mm > effectiveDiameter) {
      warnings.push({
        type: 'doc_override_danger',
        message: `User DOC (${validInputs.user_doc_mm.toFixed(2)} mm) exceeds tool diameter (${effectiveDiameter.toFixed(2)} mm)`,
        severity: 'danger'
      })
    }
  }

  // Validate user WOC override
  if (validInputs.user_woc_mm !== undefined) {
    const effectiveDiameter = getEffectiveDiameter(tool)
    
    if (validInputs.user_woc_mm > effectiveDiameter) {
      warnings.push({
        type: 'woc_override_warning',
        message: `User WOC (${validInputs.user_woc_mm.toFixed(2)} mm) exceeds tool diameter (${effectiveDiameter.toFixed(2)} mm)`,
        severity: 'warning'
      })
    }
  }

  // Validate override flutes if specified
  if (validInputs.override_flutes !== undefined) {
    if (validInputs.override_flutes > 12) {
      warnings.push({
        type: 'flutes_override_warning',
        message: `Override flutes (${validInputs.override_flutes}) is unusually high`,
        severity: 'warning'
      })
    }
  }

  // Validate override stickout
  if (validInputs.override_stickout_mm !== undefined) {
    const effectiveDiameter = getEffectiveDiameter(tool)
    const stickoutToDiameterRatio = validInputs.override_stickout_mm / effectiveDiameter

    if (stickoutToDiameterRatio > 6) {
      warnings.push({
        type: 'stickout_override_warning',
        message: `Override stickout (${validInputs.override_stickout_mm.toFixed(1)} mm) gives high L/D ratio (${stickoutToDiameterRatio.toFixed(1)}). High deflection expected.`,
        severity: 'warning'
      })
    }

    if (stickoutToDiameterRatio > 10) {
      warnings.push({
        type: 'stickout_override_danger',
        message: `Override stickout (${validInputs.override_stickout_mm.toFixed(1)} mm) gives very high L/D ratio (${stickoutToDiameterRatio.toFixed(1)}). Dangerous deflection expected.`,
        severity: 'danger'
      })
    }
  }

  return {
    errors,
    warnings,
    isValid: errors.length === 0
  }
}

/**
 * Evaluate chipload for warnings
 * Per spec: Danger if fz_adjusted < 0.5 × min, Warning if fz_adjusted > 1.5 × max
 */
export function evaluateChipload(
  fzActual: number,
  material: Material,
  effectiveDiameter: number
): ChiploadEvaluationResult {
  const warnings: ValidationWarning[] = []

  try {
    const fzRange = getChiploadRange(material, effectiveDiameter)
    const [fzMin, fzMax] = fzRange

    // Danger threshold: fz < 0.5 × min
    const dangerThreshold = 0.5 * fzMin
    if (fzActual < dangerThreshold) {
      warnings.push({
        type: 'chipload_danger',
        message: `Chipload too low (${(fzActual * 1000).toFixed(3)} µm < ${(dangerThreshold * 1000).toFixed(3)} µm). Risk of poor surface finish and tool wear.`,
        severity: 'danger'
      })
    }

    // Warning threshold: fz > 1.5 × max  
    const warningThreshold = 1.5 * fzMax
    if (fzActual > warningThreshold) {
      warnings.push({
        type: 'chipload_warning',
        message: `Chipload very high (${(fzActual * 1000).toFixed(3)} µm > ${(warningThreshold * 1000).toFixed(3)} µm). Risk of tool breakage.`,
        severity: 'warning'
      })
    }

  } catch (error) {
    warnings.push({
      type: 'chipload_error',
      message: `Could not evaluate chipload: ${error instanceof Error ? error.message : 'Unknown error'}`,
      severity: 'warning'
    })
  }

  return { warnings }
}

/**
 * Evaluate tool deflection for warnings
 * Per spec: Warning if deflection > 0.02 mm, Danger if deflection > 0.05 mm
 */
export function evaluateDeflection(deflectionMm: number): DeflectionEvaluationResult {
  const warnings: ValidationWarning[] = []

  // Danger threshold: > 0.05 mm
  if (deflectionMm > 0.05) {
    warnings.push({
      type: 'deflection_danger',
      message: `Dangerous tool deflection (${deflectionMm.toFixed(3)} mm > 0.05 mm). Risk of poor accuracy and tool breakage.`,
      severity: 'danger'
    })
  }
  // Warning threshold: > 0.02 mm (only if not already danger)
  else if (deflectionMm > 0.02) {
    warnings.push({
      type: 'deflection_warning',
      message: `High tool deflection (${deflectionMm.toFixed(3)} mm > 0.02 mm). May affect surface finish and dimensional accuracy.`,
      severity: 'warning'
    })
  }

  return { warnings }
}