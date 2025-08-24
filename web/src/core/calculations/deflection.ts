import type { Tool } from '../data/schemas/index.js'
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
 * Estimate tool mass for natural frequency calculation
 * Based on tool diameter and length, assuming typical tool densities
 */
export function estimateToolMass(tool: Tool): number {
  // Carbide density ~14.5 g/cm³, HSS ~8.0 g/cm³
  const density = tool.material.toLowerCase().includes('carbide') ? 14.5 : 8.0
  
  // Volume approximation: cylindrical tool
  const radiusMm = tool.diameter_mm / 2
  const volumeCm3 = Math.PI * Math.pow(radiusMm / 10, 2) * (tool.stickout_mm / 10)
  
  // Mass in kg
  return (volumeCm3 * density) / 1000
}

/**
 * Get Young's modulus for tool material
 */
export function getYoungsModulus(material: string): number {
  const materialKey = material.toLowerCase() as keyof typeof MATERIAL_MODULUS_GPA
  return MATERIAL_MODULUS_GPA[materialKey] ?? MATERIAL_MODULUS_GPA.default
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