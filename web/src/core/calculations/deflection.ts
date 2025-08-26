import type { Tool } from '../data/schemas/index.js'
import { getToolProperties } from '../data/toolMaterials.js'
import { clamp } from '../utils/math.js'

/**
 * Warning types for deflection calculations
 */
export interface DeflectionCalculationWarning {
  type: 'deflection_warning' | 'deflection_danger'
  message: string
  severity: 'warning' | 'danger'
}

/**
 * Result of static deflection calculations
 */
export interface StaticDeflectionResult {
  bendingDeflectionMm: number    // Bending component
  shearDeflectionMm: number      // Shear component
  holderDeflectionMm: number     // Holder compliance component
  totalStaticDeflectionMm: number // Sum of all components
}

/**
 * Result of dynamic amplification calculations
 */
export interface DynamicAmplificationResult {
  naturalFrequencyHz: number     // Natural frequency of the tool
  operatingFrequencyHz: number   // Operating frequency (cutting frequency)
  frequencyRatio: number         // Operating/natural frequency ratio
  amplificationFactor: number    // Dynamic amplification factor G(ratio)
}

/**
 * Complete deflection calculation result
 */
export interface DeflectionCalculationResult {
  staticDeflection: StaticDeflectionResult
  dynamicAmplification: DynamicAmplificationResult
  totalDeflectionMm: number      // Final deflection including dynamic effects
  warnings: DeflectionCalculationWarning[]
}

/**
 * Material constants for Young's modulus (E) in GPa
 * From spec: carbide 600 GPa, HSS 210 GPa
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const MATERIAL_MODULUS_GPA = {
  carbide: 600,
  hss: 210,
  high_speed_steel: 210,
  steel: 210,
  // Default fallback for unknown materials
  default: 400
} as const

/**
 * Default holder compliance in mm/N
 * From spec: default 0.002 mm/N
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const DEFAULT_HOLDER_COMPLIANCE_MM_PER_N = 0.002

/**
 * Estimate tool mass for natural frequency calculation using accurate material data
 * Based on tool diameter and length, using researched tool densities
 */
export function estimateToolMass(tool: Tool): number {
  // Get accurate density from researched data
  const density = getToolDensity(tool.material)
  
  // Volume approximation: cylindrical tool
  const radiusMm = tool.diameter_mm / 2
  const volumeCm3 = Math.PI * Math.pow(radiusMm / 10, 2) * (tool.stickout_mm / 10)
  
  // Mass in kg
  return (volumeCm3 * density) / 1000
}

/**
 * Get Young's modulus for tool material using researched data
 */
export function getYoungsModulus(material: string): number {
  const toolProps = getToolProperties(material, 'uncoated')
  return toolProps.materialProps.youngsModulusGPa
}

/**
 * Get accurate tool density using researched data
 */
export function getToolDensity(material: string): number {
  const toolProps = getToolProperties(material, 'uncoated')
  return toolProps.materialProps.densityGPerCm3
}

/**
 * Calculate static tool deflection components
 * Per spec 3.2.7:
 * - L = stickout_mm
 * - E = modulus (carbide 600 GPa, HSS 210 GPa)
 * - I = π d⁴ / 64  
 * - A = π d² / 4
 * - G = E / 2.6
 * - bending = (F × L³) / (3 × E × I)
 * - shear = (1.2 × F × L) / (G × A)
 * - holder = F × holder_compliance (default 0.002 mm/N)
 */
export function calculateStaticDeflection(
  tool: Tool,
  forceN: number,
  holderComplianceMmPerN: number = DEFAULT_HOLDER_COMPLIANCE_MM_PER_N
): StaticDeflectionResult {
  const L = tool.stickout_mm
  const d = tool.diameter_mm
  const eGpa = getYoungsModulus(tool.material)
  const eNPerMm2 = eGpa * 1000 // Convert GPa to N/mm² (1 GPa = 1000 N/mm²)
  
  // Geometric properties
  const I = (Math.PI * Math.pow(d, 4)) / 64 // Second moment of area (mm⁴)
  const A = (Math.PI * Math.pow(d, 2)) / 4  // Cross-sectional area (mm²)
  const G = eNPerMm2 / 2.6 // Shear modulus (N/mm²)
  
  // Bending deflection: (F × L³) / (3 × E × I)
  // Force in N, L in mm, E in N/mm², I in mm⁴
  // Result: mm
  const bendingDeflectionMm = (forceN * Math.pow(L, 3)) / (3 * eNPerMm2 * I)
  
  // Shear deflection: (1.2 × F × L) / (G × A)
  // Force in N, L in mm, G in N/mm², A in mm²
  // Result: mm
  const shearDeflectionMm = (1.2 * forceN * L) / (G * A)
  
  // Holder deflection: F × holder_compliance
  const holderDeflectionMm = forceN * holderComplianceMmPerN
  
  const totalStaticDeflectionMm = bendingDeflectionMm + shearDeflectionMm + holderDeflectionMm
  
  return {
    bendingDeflectionMm,
    shearDeflectionMm,
    holderDeflectionMm,
    totalStaticDeflectionMm
  }
}

/**
 * Calculate dynamic amplification factor
 * Per spec:
 * - naturalFreq = (1/(2π)) × sqrt(3EI/(mL³))
 * - operatingFreq = rpm / 60 × z_eff  
 * - ratio = operatingFreq/naturalFreq
 * - Amplification factor G(ratio) rules:
 *   - ratio < 0.7: 1 + 0.1 × ratio
 *   - 0.7 ≤ ratio ≤ 1.3: 3 + 2 × sin(π × ratio)
 *   - ratio > 1.3: 1 / (ratio²)
 */
export function calculateDynamicAmplification(
  tool: Tool,
  rpm: number,
  effectiveFlutes: number
): DynamicAmplificationResult {
  const L = tool.stickout_mm / 1000 // Convert to meters for calculation
  const d = tool.diameter_mm / 1000 // Convert to meters
  const eNPerM2 = getYoungsModulus(tool.material) * 1e9 // GPa to N/m²
  const mass = estimateToolMass(tool) // kg
  
  // Second moment of area in m⁴
  const I = (Math.PI * Math.pow(d, 4)) / 64
  
  // Natural frequency: (1/(2π)) × sqrt(3EI/(mL³))
  const naturalFrequencyHz = (1 / (2 * Math.PI)) * Math.sqrt((3 * eNPerM2 * I) / (mass * Math.pow(L, 3)))
  
  // Operating frequency: rpm / 60 × z_eff
  const operatingFrequencyHz = (rpm / 60) * effectiveFlutes
  
  // Frequency ratio
  const frequencyRatio = operatingFrequencyHz / naturalFrequencyHz
  
  // Amplification factor G(ratio)
  let amplificationFactor: number
  
  if (frequencyRatio < 0.7) {
    amplificationFactor = 1 + 0.1 * frequencyRatio
  } else if (frequencyRatio >= 0.7 && frequencyRatio <= 1.3) {
    amplificationFactor = 3 + 2 * Math.sin(Math.PI * frequencyRatio)
  } else {
    amplificationFactor = 1 / Math.pow(frequencyRatio, 2)
  }
  
  // Clamp amplification factor to reasonable bounds
  amplificationFactor = clamp(amplificationFactor, 0.1, 50)
  
  return {
    naturalFrequencyHz,
    operatingFrequencyHz,
    frequencyRatio,
    amplificationFactor
  }
}

/**
 * Calculate complete tool deflection with static and dynamic components
 * Per spec 3.2.7: dynamicDeflection = staticDeflection × G(ratio)
 */
export function calculateDeflection(
  tool: Tool,
  forceN: number,
  rpm: number,
  effectiveFlutes: number,
  holderComplianceMmPerN: number = DEFAULT_HOLDER_COMPLIANCE_MM_PER_N
): DeflectionCalculationResult {
  const warnings: DeflectionCalculationWarning[] = []
  
  // Calculate static deflection components
  const staticDeflection = calculateStaticDeflection(tool, forceN, holderComplianceMmPerN)
  
  // Calculate dynamic amplification
  const dynamicAmplification = calculateDynamicAmplification(tool, rpm, effectiveFlutes)
  
  // Total deflection with dynamic amplification
  const totalDeflectionMm = staticDeflection.totalStaticDeflectionMm * dynamicAmplification.amplificationFactor
  
  // Generate warnings based on deflection thresholds
  // Per spec: >0.05 mm (danger), >0.02 mm (warning)
  if (totalDeflectionMm > 0.05) {
    warnings.push({
      type: 'deflection_danger',
      message: `Dangerous tool deflection (${totalDeflectionMm.toFixed(3)} mm > 0.05 mm)`,
      severity: 'danger'
    })
  } else if (totalDeflectionMm > 0.02) {
    warnings.push({
      type: 'deflection_warning',
      message: `High tool deflection (${totalDeflectionMm.toFixed(3)} mm > 0.02 mm)`,
      severity: 'warning'
    })
  }
  
  return {
    staticDeflection,
    dynamicAmplification,
    totalDeflectionMm,
    warnings
  }
}

/**
 * Configuration for diameter/stickout optimization
 */
export interface DeflectionOptimizationConfig {
  targetDeflectionMm: number        // Target deflection to achieve
  forceN: number                    // Expected cutting force
  rpm: number                       // Operating RPM
  effectiveFlutes: number           // Number of effective flutes
  toolType?: string                 // Optional tool type filter
  diameterRangeMm?: [number, number] // Diameter range to consider (default: 3-25mm)
  stickoutRangeMm?: [number, number] // Stickout range to consider (default: 10-100mm)
  maxSuggestions?: number           // Maximum number of suggestions (default: 5)
  holderComplianceMmPerN?: number   // Holder compliance (default: 0.002)
}

/**
 * Suggested tool configuration for target deflection
 */
export interface ToolDeflectionSuggestion {
  diameterMm: number               // Suggested tool diameter
  stickoutMm: number               // Suggested stickout length
  predictedDeflectionMm: number    // Predicted deflection with this configuration
  deflectionError: number          // Absolute error from target (mm)
  relativeError: number            // Relative error from target (%)
  isWithinTolerance: boolean       // Whether within 10% of target
  rigidityScore: number            // Relative rigidity score (higher = more rigid)
}

/**
 * Result of deflection optimization
 */
export interface DeflectionOptimizationResult {
  targetDeflectionMm: number
  suggestions: ToolDeflectionSuggestion[]
  searchRanges: {
    diameterMm: [number, number]
    stickoutMm: [number, number]
  }
  totalEvaluations: number
}

/**
 * Suggest optimal diameter/stickout combinations for a target deflection
 * Evaluates different tool configurations to find those closest to target deflection
 */
export function suggestToolsForTargetDeflection(config: DeflectionOptimizationConfig): DeflectionOptimizationResult {
  const {
    targetDeflectionMm,
    forceN,
    rpm,
    effectiveFlutes,
    toolType = 'endmill_flat',
    diameterRangeMm = [3, 25],      // Reasonable range for most endmills
    stickoutRangeMm = [10, 100],    // Practical stickout range
    maxSuggestions = 5,
    holderComplianceMmPerN = DEFAULT_HOLDER_COMPLIANCE_MM_PER_N
  } = config

  const suggestions: ToolDeflectionSuggestion[] = []
  const [minDiameter, maxDiameter] = diameterRangeMm
  const [minStickout, maxStickout] = stickoutRangeMm
  
  // Define evaluation grid - balance between accuracy and performance
  const diameterSteps = 15  // 15 diameter steps
  const stickoutSteps = 20  // 20 stickout steps
  
  const diameterStep = (maxDiameter - minDiameter) / (diameterSteps - 1)
  const stickoutStep = (maxStickout - minStickout) / (stickoutSteps - 1)
  
  let totalEvaluations = 0

  // Evaluate each combination
  for (let d = 0; d < diameterSteps; d++) {
    for (let s = 0; s < stickoutSteps; s++) {
      const diameter = minDiameter + (d * diameterStep)
      const stickout = minStickout + (s * stickoutStep)
      
      // Create test tool with current configuration
      const testTool: Tool = {
        id: 'optimization_test',
        type: toolType as Tool['type'],
        diameter_mm: diameter,
        flutes: effectiveFlutes,
        coating: 'carbide',
        stickout_mm: stickout,
        material: 'carbide',
        default_doc_mm: diameter * 0.1,
        default_woc_mm: diameter * 0.5
      }
      
      // Calculate deflection for this configuration
      const deflectionResult = calculateDeflection(testTool, forceN, rpm, effectiveFlutes, holderComplianceMmPerN)
      const predictedDeflection = deflectionResult.totalDeflectionMm
      
      // Calculate error metrics
      const deflectionError = Math.abs(predictedDeflection - targetDeflectionMm)
      const relativeError = (deflectionError / targetDeflectionMm) * 100
      const isWithinTolerance = relativeError <= 10 // Within 10% is considered good
      
      // Calculate rigidity score (inverse of deflection per unit force)
      const rigidityScore = forceN / predictedDeflection
      
      const suggestion: ToolDeflectionSuggestion = {
        diameterMm: Math.round(diameter * 10) / 10,  // Round to 0.1mm
        stickoutMm: Math.round(stickout * 10) / 10,  // Round to 0.1mm
        predictedDeflectionMm: Math.round(predictedDeflection * 1000) / 1000, // Round to 0.001mm
        deflectionError: Math.round(deflectionError * 1000) / 1000,
        relativeError: Math.round(relativeError * 10) / 10,
        isWithinTolerance,
        rigidityScore: Math.round(rigidityScore)
      }
      
      suggestions.push(suggestion)
      totalEvaluations++
    }
  }
  
  // Sort by deflection error (best matches first)
  suggestions.sort((a, b) => a.deflectionError - b.deflectionError)
  
  // Return top suggestions
  return {
    targetDeflectionMm,
    suggestions: suggestions.slice(0, maxSuggestions),
    searchRanges: {
      diameterMm: diameterRangeMm,
      stickoutMm: stickoutRangeMm
    },
    totalEvaluations
  }
}

/**
 * Optimize an existing tool configuration for better deflection performance
 * Given a tool and target deflection, suggest diameter and stickout adjustments
 */
export function optimizeToolConfiguration(
  baseTool: Tool,
  targetDeflectionMm: number,
  forceN: number,
  rpm: number,
  effectiveFlutes: number,
  holderComplianceMmPerN: number = DEFAULT_HOLDER_COMPLIANCE_MM_PER_N
): DeflectionOptimizationResult {
  // Define search range around current tool configuration
  const currentDiameter = baseTool.diameter_mm
  const currentStickout = baseTool.stickout_mm
  
  // Search within ±50% of current diameter, ±30% of current stickout
  const diameterRange: [number, number] = [
    Math.max(currentDiameter * 0.5, 3),    // Don't go below 3mm
    Math.min(currentDiameter * 1.5, 25)    // Don't go above 25mm
  ]
  
  const stickoutRange: [number, number] = [
    Math.max(currentStickout * 0.7, 10),   // Don't go below 10mm
    Math.min(currentStickout * 1.3, 100)   // Don't go above 100mm
  ]
  
  const config: DeflectionOptimizationConfig = {
    targetDeflectionMm,
    forceN,
    rpm,
    effectiveFlutes,
    toolType: baseTool.type,
    diameterRangeMm: diameterRange,
    stickoutRangeMm: stickoutRange,
    maxSuggestions: 3, // Fewer suggestions for optimization
    holderComplianceMmPerN
  }
  
  return suggestToolsForTargetDeflection(config)
}