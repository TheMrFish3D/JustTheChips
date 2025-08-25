import type { Material, Machine } from '../data/schemas/index.js'

/**
 * Hobby machine material-specific adjustments
 * Based on research of low-rigidity machine limitations
 */

export interface HobbyMaterialAdjustment {
  surfaceSpeedMultiplier: number    // Reduction factor for surface speed
  chipLoadMultiplier: number        // Reduction factor for chip load  
  maxRadialEngagement: number       // Maximum safe radial engagement fraction
  maxAxialEngagement: number        // Maximum safe axial engagement (mm)
  forceReductionFactor: number      // Additional force reduction beyond aggressiveness
  recommendedStrategy: string       // Recommended machining approach
  warningThresholds: {
    deflectionLimit: number         // Maximum acceptable deflection (mm)
    powerLimit: number              // Maximum spindle power usage (fraction)
  }
}

/**
 * Machine capability classes for material adjustments
 */
export const MachineClass = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ULTRA_LIGHT: 'ultra_light',    // 3018 CNC class: rigidity < 0.2
  // eslint-disable-next-line @typescript-eslint/naming-convention
  MEDIUM_HOBBY: 'medium_hobby',  // Lowrider/Queenbee: rigidity 0.2-0.4
  // eslint-disable-next-line @typescript-eslint/naming-convention
  HEAVY_HOBBY: 'heavy_hobby',    // PrintNC class: rigidity 0.4-0.7
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ENTRY_COMMERCIAL: 'entry_commercial' // Benchtop/VMC: rigidity > 0.7
} as const

export type MachineClassType = typeof MachineClass[keyof typeof MachineClass]

/**
 * Classify machine based on rigidity factor
 */
export function classifyMachine(machine: Machine): MachineClassType {
  const rigidity = machine.rigidity_factor
  
  if (rigidity < 0.2) return MachineClass.ULTRA_LIGHT
  if (rigidity < 0.4) return MachineClass.MEDIUM_HOBBY
  if (rigidity < 0.7) return MachineClass.HEAVY_HOBBY
  return MachineClass.ENTRY_COMMERCIAL
}

/**
 * Material-specific adjustments for hobby machines
 * Key: materialId, Value: adjustments by machine class
 */
export const hobbyMaterialAdjustments: Record<string, Record<MachineClassType, HobbyMaterialAdjustment>> = {
  aluminum_6061: {
    [MachineClass.ULTRA_LIGHT]: {
      surfaceSpeedMultiplier: 0.6,  // 40% reduction to minimize forces
      chipLoadMultiplier: 0.7,      // 30% reduction for safer cutting
      maxRadialEngagement: 0.25,    // Very conservative engagement
      maxAxialEngagement: 0.3,      // Maximum 0.3mm depth of cut
      forceReductionFactor: 0.8,    // Additional 20% force reduction
      recommendedStrategy: 'Multiple light passes, conventional milling, high RPM',
      warningThresholds: {
        deflectionLimit: 0.015,     // Stricter deflection limit
        powerLimit: 0.6             // Conservative power usage
      }
    },
    [MachineClass.MEDIUM_HOBBY]: {
      surfaceSpeedMultiplier: 0.75,
      chipLoadMultiplier: 0.8,
      maxRadialEngagement: 0.4,
      maxAxialEngagement: 0.8,
      forceReductionFactor: 0.9,
      recommendedStrategy: 'Adaptive clearing, climb milling acceptable',
      warningThresholds: {
        deflectionLimit: 0.02,
        powerLimit: 0.7
      }
    },
    [MachineClass.HEAVY_HOBBY]: {
      surfaceSpeedMultiplier: 0.9,
      chipLoadMultiplier: 0.9,
      maxRadialEngagement: 0.6,
      maxAxialEngagement: 2.0,
      forceReductionFactor: 1.0,
      recommendedStrategy: 'Standard aluminum parameters, climb milling preferred',
      warningThresholds: {
        deflectionLimit: 0.025,
        powerLimit: 0.8
      }
    },
    [MachineClass.ENTRY_COMMERCIAL]: {
      surfaceSpeedMultiplier: 0.95,
      chipLoadMultiplier: 0.95,
      maxRadialEngagement: 0.8,
      maxAxialEngagement: 4.0,
      forceReductionFactor: 1.0,
      recommendedStrategy: 'Near-industrial parameters acceptable',
      warningThresholds: {
        deflectionLimit: 0.03,
        powerLimit: 0.85
      }
    }
  },

  steel_1045: {
    [MachineClass.ULTRA_LIGHT]: {
      surfaceSpeedMultiplier: 0.4,  // Major reduction for steel's high forces
      chipLoadMultiplier: 0.5,      // Very conservative chip loads
      maxRadialEngagement: 0.15,    // Minimal engagement
      maxAxialEngagement: 0.1,      // Extremely light cuts
      forceReductionFactor: 0.6,    // Major force reduction
      recommendedStrategy: 'Avoid steel on ultra-light machines if possible',
      warningThresholds: {
        deflectionLimit: 0.01,      // Very strict limits
        powerLimit: 0.4
      }
    },
    [MachineClass.MEDIUM_HOBBY]: {
      surfaceSpeedMultiplier: 0.6,
      chipLoadMultiplier: 0.7,
      maxRadialEngagement: 0.25,
      maxAxialEngagement: 0.4,
      forceReductionFactor: 0.7,
      recommendedStrategy: 'Light steel cuts possible, use carbide tools',
      warningThresholds: {
        deflectionLimit: 0.015,
        powerLimit: 0.6
      }
    },
    [MachineClass.HEAVY_HOBBY]: {
      surfaceSpeedMultiplier: 0.8,
      chipLoadMultiplier: 0.8,
      maxRadialEngagement: 0.4,
      maxAxialEngagement: 1.0,
      forceReductionFactor: 0.85,
      recommendedStrategy: 'Moderate steel machining possible with proper tooling',
      warningThresholds: {
        deflectionLimit: 0.02,
        powerLimit: 0.7
      }
    },
    [MachineClass.ENTRY_COMMERCIAL]: {
      surfaceSpeedMultiplier: 0.9,
      chipLoadMultiplier: 0.9,
      maxRadialEngagement: 0.6,
      maxAxialEngagement: 2.5,
      forceReductionFactor: 0.95,
      recommendedStrategy: 'Good steel machining capability',
      warningThresholds: {
        deflectionLimit: 0.025,
        powerLimit: 0.8
      }
    }
  },

  stainless_316: {
    [MachineClass.ULTRA_LIGHT]: {
      surfaceSpeedMultiplier: 0.3,  // Very low speeds to prevent work hardening
      chipLoadMultiplier: 0.8,      // Maintain chip load to prevent hardening
      maxRadialEngagement: 0.1,     // Minimal engagement
      maxAxialEngagement: 0.05,     // Extremely light cuts
      forceReductionFactor: 0.5,    // Major force reduction
      recommendedStrategy: 'Avoid stainless on ultra-light machines',
      warningThresholds: {
        deflectionLimit: 0.008,     // Very strict for work hardening prevention
        powerLimit: 0.3
      }
    },
    [MachineClass.MEDIUM_HOBBY]: {
      surfaceSpeedMultiplier: 0.5,
      chipLoadMultiplier: 0.9,      // Important to maintain chip load
      maxRadialEngagement: 0.2,
      maxAxialEngagement: 0.2,
      forceReductionFactor: 0.6,
      recommendedStrategy: 'Very light stainless cuts, flood coolant essential',
      warningThresholds: {
        deflectionLimit: 0.012,
        powerLimit: 0.5
      }
    },
    [MachineClass.HEAVY_HOBBY]: {
      surfaceSpeedMultiplier: 0.7,
      chipLoadMultiplier: 0.9,
      maxRadialEngagement: 0.3,
      maxAxialEngagement: 0.6,
      forceReductionFactor: 0.75,
      recommendedStrategy: 'Light stainless machining possible with care',
      warningThresholds: {
        deflectionLimit: 0.015,
        powerLimit: 0.65
      }
    },
    [MachineClass.ENTRY_COMMERCIAL]: {
      surfaceSpeedMultiplier: 0.85,
      chipLoadMultiplier: 0.95,
      maxRadialEngagement: 0.5,
      maxAxialEngagement: 1.5,
      forceReductionFactor: 0.9,
      recommendedStrategy: 'Moderate stainless capability with proper technique',
      warningThresholds: {
        deflectionLimit: 0.02,
        powerLimit: 0.75
      }
    }
  }
}

/**
 * Get hobby-specific material adjustments for a machine/material combination
 */
export function getHobbyMaterialAdjustment(
  machine: Machine, 
  material: Material
): HobbyMaterialAdjustment | null {
  const machineClass = classifyMachine(machine)
  const materialAdjustments = hobbyMaterialAdjustments[material.id]
  
  if (!materialAdjustments) {
    return null
  }
  
  return materialAdjustments[machineClass] || null
}

/**
 * Apply hobby machine adjustments to base cutting parameters
 */
export function applyHobbyAdjustments(
  baseParams: {
    surfaceSpeed: number
    chipLoad: number
    radialEngagement: number
    axialEngagement: number
  },
  adjustment: HobbyMaterialAdjustment
): {
  adjustedSurfaceSpeed: number
  adjustedChipLoad: number
  adjustedRadialEngagement: number
  adjustedAxialEngagement: number
  warnings: string[]
} {
  const warnings: string[] = []
  
  // Apply surface speed reduction
  const adjustedSurfaceSpeed = baseParams.surfaceSpeed * adjustment.surfaceSpeedMultiplier
  
  // Apply chip load adjustment
  const adjustedChipLoad = baseParams.chipLoad * adjustment.chipLoadMultiplier
  
  // Limit engagements to hobby-safe values
  let adjustedRadialEngagement = baseParams.radialEngagement
  if (adjustedRadialEngagement > adjustment.maxRadialEngagement) {
    adjustedRadialEngagement = adjustment.maxRadialEngagement
    warnings.push(`Radial engagement limited to ${(adjustment.maxRadialEngagement * 100).toFixed(0)}% for hobby machine safety`)
  }
  
  let adjustedAxialEngagement = baseParams.axialEngagement
  if (adjustedAxialEngagement > adjustment.maxAxialEngagement) {
    adjustedAxialEngagement = adjustment.maxAxialEngagement
    warnings.push(`Axial engagement limited to ${adjustment.maxAxialEngagement}mm for hobby machine safety`)
  }
  
  // Add strategy recommendation
  if (adjustment.recommendedStrategy && adjustment.recommendedStrategy.trim() !== '') {
    warnings.push(`Recommended strategy: ${adjustment.recommendedStrategy}`)
  }
  
  return {
    adjustedSurfaceSpeed,
    adjustedChipLoad,
    adjustedRadialEngagement,
    adjustedAxialEngagement,
    warnings
  }
}

/**
 * Check if calculated deflection exceeds hobby machine limits
 */
export function validateHobbyDeflection(
  deflectionMm: number,
  adjustment: HobbyMaterialAdjustment
): { isValid: boolean; warning?: string } {
  if (deflectionMm > adjustment.warningThresholds.deflectionLimit) {
    return {
      isValid: false,
      warning: `Tool deflection (${deflectionMm.toFixed(3)}mm) exceeds hobby machine limit (${adjustment.warningThresholds.deflectionLimit}mm). Reduce cutting parameters.`
    }
  }
  
  return { isValid: true }
}

/**
 * Check if power usage exceeds hobby machine limits
 */
export function validateHobbyPower(
  powerUsageFraction: number,
  adjustment: HobbyMaterialAdjustment
): { isValid: boolean; warning?: string } {
  if (powerUsageFraction > adjustment.warningThresholds.powerLimit) {
    return {
      isValid: false,
      warning: `Power usage (${(powerUsageFraction * 100).toFixed(0)}%) exceeds hobby machine limit (${(adjustment.warningThresholds.powerLimit * 100).toFixed(0)}%). Reduce cutting parameters.`
    }
  }
  
  return { isValid: true }
}