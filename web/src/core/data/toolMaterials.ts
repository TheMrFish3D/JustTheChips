/**
 * Comprehensive tool material properties database
 * Based on industry standards and manufacturer data
 * 
 * Sources:
 * - Machinery's Handbook 31st Edition
 * - Sandvik Coromant Technical Guide
 * - Kennametal Master Catalog
 * - ASM Metals Handbook Volume 16: Machining
 * - CNC Cookbook Engineering Grade Speed/Feed Calculator
 */

/**
 * Tool material base properties
 */
interface ToolMaterialProperties {
  // Physical properties
  youngsModulusGPa: number        // Young's modulus in GPa
  densityGPerCm3: number          // Density in g/cm³
  hardnessHRC: number             // Rockwell C hardness
  
  // Cutting performance factors  
  surfaceSpeedMultiplier: number  // Multiplier vs baseline (HSS = 1.0)
  chiploadMultiplier: number      // Chipload capability vs baseline
  forceReductionFactor: number    // Cutting force reduction (1.0 = no reduction)
  
  // Thermal properties
  thermalConductivity: number     // W/m·K
  maxOperatingTempC: number       // Maximum operating temperature
  
  // Tool life factors
  wearResistance: number          // Relative wear resistance (1.0 = baseline)
  toughnessRating: number         // Relative toughness (1.0 = baseline)
}

/**
 * Tool coating properties  
 */
interface CoatingProperties {
  // Performance multipliers (applied to base material)
  surfaceSpeedBoost: number       // Additional speed capability
  chiploadBoost: number           // Additional chipload capability  
  forceReduction: number          // Additional force reduction
  wearResistanceBoost: number     // Additional wear resistance
  
  // Thermal properties
  thermalBarrier: number          // Thermal insulation factor
  maxTempIncrease: number         // Additional temperature capability
  
  // Friction properties
  frictionCoefficient: number     // Coefficient of friction vs workpiece
}

/**
 * Tool material database - Industry standard values
 */
export const TOOL_MATERIALS: Record<string, ToolMaterialProperties> = {
  // High Speed Steel variants
  'HSS': {
    youngsModulusGPa: 210,
    densityGPerCm3: 8.0,
    hardnessHRC: 62,
    surfaceSpeedMultiplier: 1.0,     // Baseline reference
    chiploadMultiplier: 1.0,         // Baseline reference  
    forceReductionFactor: 1.0,       // No reduction
    thermalConductivity: 20,
    maxOperatingTempC: 600,
    wearResistance: 1.0,
    toughnessRating: 1.4             // HSS is tough
  },
  
  'M1_HSS': {
    youngsModulusGPa: 205,
    densityGPerCm3: 8.1,
    hardnessHRC: 63,
    surfaceSpeedMultiplier: 1.1,
    chiploadMultiplier: 1.05,
    forceReductionFactor: 0.98,
    thermalConductivity: 22,
    maxOperatingTempC: 620,
    wearResistance: 1.1,
    toughnessRating: 1.3
  },
  
  'M2_HSS': {
    youngsModulusGPa: 210,
    densityGPerCm3: 8.2,
    hardnessHRC: 64,
    surfaceSpeedMultiplier: 1.2,
    chiploadMultiplier: 1.1,
    forceReductionFactor: 0.95,
    thermalConductivity: 25,
    maxOperatingTempC: 650,
    wearResistance: 1.2,
    toughnessRating: 1.25
  },
  
  'M42_HSS': {  // Cobalt HSS - premium grade
    youngsModulusGPa: 220,
    densityGPerCm3: 8.4,
    hardnessHRC: 67,
    surfaceSpeedMultiplier: 1.4,
    chiploadMultiplier: 1.15,
    forceReductionFactor: 0.92,
    thermalConductivity: 28,
    maxOperatingTempC: 700,
    wearResistance: 1.4,
    toughnessRating: 1.1
  },
  
  // Carbide grades
  'carbide': {  // General carbide (C2 equivalent)
    youngsModulusGPa: 600,
    densityGPerCm3: 14.5,
    hardnessHRC: 92,
    surfaceSpeedMultiplier: 3.0,     // 3x faster than HSS baseline
    chiploadMultiplier: 1.3,         // Can handle higher chipload
    forceReductionFactor: 0.85,      // 15% force reduction
    thermalConductivity: 100,
    maxOperatingTempC: 1000,
    wearResistance: 2.5,
    toughnessRating: 0.7             // Carbide is brittle
  },
  
  'C1_carbide': {  // Straight WC-Co, maximum wear resistance
    youngsModulusGPa: 620,
    densityGPerCm3: 15.0,
    hardnessHRC: 94,
    surfaceSpeedMultiplier: 3.5,
    chiploadMultiplier: 1.2,
    forceReductionFactor: 0.88,
    thermalConductivity: 110,
    maxOperatingTempC: 1000,
    wearResistance: 3.0,
    toughnessRating: 0.6
  },
  
  'C2_carbide': {  // General purpose carbide
    youngsModulusGPa: 600,
    densityGPerCm3: 14.5,
    hardnessHRC: 92,
    surfaceSpeedMultiplier: 3.0,
    chiploadMultiplier: 1.3,
    forceReductionFactor: 0.85,
    thermalConductivity: 100,
    maxOperatingTempC: 1000,
    wearResistance: 2.5,
    toughnessRating: 0.7
  },
  
  'C3_carbide': {  // Tougher carbide for roughing
    youngsModulusGPa: 580,
    densityGPerCm3: 14.0,
    hardnessHRC: 89,
    surfaceSpeedMultiplier: 2.5,
    chiploadMultiplier: 1.5,         // Higher chipload capability
    forceReductionFactor: 0.82,
    thermalConductivity: 95,
    maxOperatingTempC: 950,
    wearResistance: 2.0,
    toughnessRating: 0.9
  },
  
  // Cermet tools
  'cermet': {
    youngsModulusGPa: 350,
    densityGPerCm3: 6.0,
    hardnessHRC: 93,
    surfaceSpeedMultiplier: 4.0,     // Very high speed capability
    chiploadMultiplier: 0.9,         // Lower chipload than carbide
    forceReductionFactor: 0.90,
    thermalConductivity: 15,
    maxOperatingTempC: 1200,
    wearResistance: 3.5,
    toughnessRating: 0.5             // Very brittle
  },
  
  // Tool steel for special applications
  'tool_steel': {
    youngsModulusGPa: 210,
    densityGPerCm3: 7.8,
    hardnessHRC: 58,
    surfaceSpeedMultiplier: 0.8,
    chiploadMultiplier: 0.9,
    forceReductionFactor: 1.05,
    thermalConductivity: 30,
    maxOperatingTempC: 500,
    wearResistance: 0.8,
    toughnessRating: 1.6
  }
}

/**
 * Tool coating database - Industry standard values
 */
export const TOOL_COATINGS: Record<string, CoatingProperties> = {
  'uncoated': {
    surfaceSpeedBoost: 1.0,          // No boost
    chiploadBoost: 1.0,
    forceReduction: 1.0,
    wearResistanceBoost: 1.0,
    thermalBarrier: 1.0,
    maxTempIncrease: 0,
    frictionCoefficient: 0.6         // Baseline friction
  },
  
  'TiN': {  // Titanium Nitride - first generation
    surfaceSpeedBoost: 1.15,
    chiploadBoost: 1.1,
    forceReduction: 0.95,
    wearResistanceBoost: 1.3,
    thermalBarrier: 1.1,
    maxTempIncrease: 50,
    frictionCoefficient: 0.45
  },
  
  'TiAlN': {  // Titanium Aluminum Nitride - excellent for aluminum
    surfaceSpeedBoost: 1.25,
    chiploadBoost: 1.15,
    forceReduction: 0.90,
    wearResistanceBoost: 1.6,
    thermalBarrier: 1.3,
    maxTempIncrease: 100,
    frictionCoefficient: 0.40
  },
  
  'AlCrN': {  // Aluminum Chromium Nitride - high temperature
    surfaceSpeedBoost: 1.30,
    chiploadBoost: 1.2,
    forceReduction: 0.88,
    wearResistanceBoost: 1.8,
    thermalBarrier: 1.4,
    maxTempIncrease: 150,
    frictionCoefficient: 0.38
  },
  
  'AlTiN': {  // Aluminum Titanium Nitride - premium coating
    surfaceSpeedBoost: 1.35,
    chiploadBoost: 1.25,
    forceReduction: 0.85,
    wearResistanceBoost: 2.0,
    thermalBarrier: 1.5,
    maxTempIncrease: 200,
    frictionCoefficient: 0.35
  },
  
  'DLC': {  // Diamond-Like Carbon - low friction
    surfaceSpeedBoost: 1.20,
    chiploadBoost: 1.3,
    forceReduction: 0.80,            // Excellent force reduction
    wearResistanceBoost: 2.5,
    thermalBarrier: 1.2,
    maxTempIncrease: 100,
    frictionCoefficient: 0.25        // Very low friction
  },
  
  'PVD': {  // Generic PVD coating
    surfaceSpeedBoost: 1.20,
    chiploadBoost: 1.15,
    forceReduction: 0.92,
    wearResistanceBoost: 1.5,
    thermalBarrier: 1.2,
    maxTempIncrease: 75,
    frictionCoefficient: 0.42
  },
  
  'CVD': {  // Chemical Vapor Deposition - thick coating
    surfaceSpeedBoost: 1.40,
    chiploadBoost: 1.1,              // Thicker coating, less chipload boost
    forceReduction: 0.93,
    wearResistanceBoost: 2.2,
    thermalBarrier: 1.6,
    maxTempIncrease: 200,
    frictionCoefficient: 0.50
  }
}

/**
 * Get combined tool properties accounting for base material and coating
 */
export function getToolProperties(material: string, coating: string): {
  materialProps: ToolMaterialProperties
  coatingProps: CoatingProperties
  combinedProps: {
    effectiveSurfaceSpeedMultiplier: number
    effectiveChiploadMultiplier: number  
    effectiveForceReduction: number
    effectiveYoungsModulus: number
    effectiveDensity: number
    effectiveWearResistance: number
  }
} {
  // Normalize material name
  const normalizedMaterial = material.toLowerCase().trim()
  
  // Find best match for material
  let materialProps = TOOL_MATERIALS[normalizedMaterial]
  if (!materialProps) {
    // Try partial matches
    if (normalizedMaterial.includes('carbide')) {
      materialProps = TOOL_MATERIALS['carbide']
    } else if (normalizedMaterial.includes('hss') || normalizedMaterial.includes('high_speed_steel')) {
      materialProps = TOOL_MATERIALS['HSS']
    } else if (normalizedMaterial.includes('steel')) {
      materialProps = TOOL_MATERIALS['tool_steel']
    } else {
      // Default to HSS if unknown
      materialProps = TOOL_MATERIALS['HSS']
    }
  }
  
  // Find coating properties
  const normalizedCoating = coating.toLowerCase().trim()
  const coatingProps = TOOL_COATINGS[normalizedCoating] || TOOL_COATINGS['uncoated']
  
  // Calculate combined properties
  const combinedProps = {
    effectiveSurfaceSpeedMultiplier: materialProps.surfaceSpeedMultiplier * coatingProps.surfaceSpeedBoost,
    effectiveChiploadMultiplier: materialProps.chiploadMultiplier * coatingProps.chiploadBoost,
    effectiveForceReduction: materialProps.forceReductionFactor * coatingProps.forceReduction,
    effectiveYoungsModulus: materialProps.youngsModulusGPa,
    effectiveDensity: materialProps.densityGPerCm3,
    effectiveWearResistance: materialProps.wearResistance * coatingProps.wearResistanceBoost
  }
  
  return {
    materialProps,
    coatingProps,
    combinedProps
  }
}

/**
 * Get material-specific cutting recommendations for workpiece material combinations
 */
export function getToolMaterialRecommendations(toolMaterial: string, workpieceMaterial: string): {
  recommendedSurfaceSpeedMultiplier: number
  recommendedChiploadMultiplier: number
  notes: string[]
} {
  const toolProps = getToolProperties(toolMaterial, 'uncoated')
  const notes: string[] = []
  
  let surfaceSpeedMultiplier = toolProps.combinedProps.effectiveSurfaceSpeedMultiplier
  let chiploadMultiplier = toolProps.combinedProps.effectiveChiploadMultiplier
  
  // Adjust for specific material combinations
  const workpiece = workpieceMaterial.toLowerCase()
  
  if (workpiece.includes('aluminum')) {
    if (toolMaterial.includes('carbide')) {
      surfaceSpeedMultiplier *= 1.2  // Carbide excellent in aluminum
      chiploadMultiplier *= 1.1
      notes.push('Carbide excels in aluminum - can run very high speeds')
    } else if (toolMaterial.includes('HSS')) {
      surfaceSpeedMultiplier *= 0.9  // HSS lower speeds in aluminum to prevent galling
      notes.push('HSS in aluminum requires slower speeds to prevent built-up edge')
    }
  } else if (workpiece.includes('steel')) {
    if (toolMaterial.includes('carbide')) {
      surfaceSpeedMultiplier *= 1.0  // Standard carbide performance
      notes.push('Carbide provides good steel cutting performance')
    } else if (toolMaterial.includes('HSS')) {
      surfaceSpeedMultiplier *= 1.1  // HSS good in steel
      chiploadMultiplier *= 1.05
      notes.push('HSS performs well in steel with good toughness')
    }
  } else if (workpiece.includes('stainless')) {
    if (toolMaterial.includes('carbide')) {
      chiploadMultiplier *= 1.2      // Carbide can handle aggressive cuts in stainless
      notes.push('Carbide recommended for stainless - maintain aggressive cuts')
    } else if (toolMaterial.includes('HSS')) {
      surfaceSpeedMultiplier *= 0.8  // Reduce speeds for HSS in stainless
      notes.push('HSS in stainless requires reduced speeds due to work hardening')
    }
  }
  
  return {
    recommendedSurfaceSpeedMultiplier: surfaceSpeedMultiplier,
    recommendedChiploadMultiplier: chiploadMultiplier,
    notes
  }
}