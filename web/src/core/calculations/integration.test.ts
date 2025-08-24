import { describe, it, expect } from 'vitest'

import type { Material, Machine, Spindle, Tool } from '../data/schemas/index.js'

import { 
  calculateSpeedAndRPM, 
  calculateChiploadAndFeed,
  calculateEngagementAndMRR,
  calculatePower,
  calculateCuttingForce,
  calculateDeflection,
  applyPowerLimiting,
  getEffectiveDiameter,
  getEffectiveFlutes
} from './index.js'

// Test fixtures for integration testing
const testMaterial: Material = {
  id: 'aluminum-6061',
  category: 'aluminum',
  vc_range_m_min: [200, 400],
  fz_mm_per_tooth_by_diameter: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '3.0': [0.025, 0.075],  // Small diameter
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '6.0': [0.05, 0.15],    // Medium diameter
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '12.0': [0.1, 0.3]      // Large diameter
  },
  force_coeff_kn_mm2: 1.2,
  specific_cutting_energy_j_mm3: 0.8,
  chip_thinning: {
    enable_below_fraction: 0.3,
    limit_factor: 2.0
  },
  max_engagement_fraction: 0.5
}

const testMachine: Machine = {
  id: 'test-machine',
  axis_max_feed_mm_min: 10000,
  rigidity_factor: 1.2,
  aggressiveness: {
    axial: 1.0,
    radial: 1.0,
    feed: 1.0
  }
}

const testSpindle: Spindle = {
  id: 'test-spindle',
  rated_power_kw: 2.2,
  rpm_min: 1000,
  rpm_max: 24000,
  base_rpm: 18000,
  power_curve: [
    { rpm: 1000, power_kw: 0.8 },
    { rpm: 6000, power_kw: 2.2 },
    { rpm: 18000, power_kw: 2.2 },
    { rpm: 24000, power_kw: 1.8 }
  ]
}

const testTool: Tool = {
  id: 'endmill-6mm',
  type: 'endmill_flat',
  diameter_mm: 6,
  flutes: 3,
  coating: 'TiAlN',
  stickout_mm: 20,
  material: 'carbide',
  default_doc_mm: 1.5,
  default_woc_mm: 3.0
}

describe('Integration: Complete Calculation Pipeline', () => {
  it('should perform complete calculation pipeline for typical endmill operation', () => {
    const cutType = 'slot'
    const aggressiveness = 1.0
    const userDocMm = 2.0
    const userWocMm = 4.0

    // Step 1: Calculate effective geometry
    const effectiveDiameter = getEffectiveDiameter(testTool)
    const effectiveFlutes = getEffectiveFlutes(testTool)

    expect(effectiveDiameter).toBe(6.0)
    expect(effectiveFlutes).toBe(3)

    // Step 2: Calculate speed and RPM
    const speedResult = calculateSpeedAndRPM(
      testMaterial, 
      testSpindle, 
      effectiveDiameter, 
      cutType, 
      aggressiveness
    )

    expect(speedResult.rpmActual).toBeGreaterThan(0)
    expect(speedResult.rpmActual).toBeLessThanOrEqual(testSpindle.rpm_max)

    // Step 3: Calculate chipload and feed
    const chiploadResult = calculateChiploadAndFeed(
      testMaterial,
      testMachine,
      testTool,
      effectiveDiameter,
      effectiveFlutes,
      speedResult.rpmActual,
      userWocMm,
      aggressiveness
    )

    expect(chiploadResult.fzAdjusted).toBeGreaterThan(0)
    expect(chiploadResult.vfActual).toBeGreaterThan(0)

    // Step 4: Calculate engagement and MRR
    const engagementResult = calculateEngagementAndMRR(
      testMaterial,
      testTool,
      effectiveDiameter,
      chiploadResult.vfActual,
      userDocMm,
      userWocMm
    )

    // WOC should be limited by material max_engagement_fraction (50% of 6mm = 3mm)
    expect(engagementResult.aeMm).toBe(3.0)
    expect(engagementResult.apMm).toBe(userDocMm)
    expect(engagementResult.mrrMm3Min).toBeGreaterThan(0)
    expect(engagementResult.warnings).toHaveLength(1) // WOC limited warning

    // Step 5: Calculate power requirements
    const powerResult = calculatePower(
      testMaterial,
      testMachine,
      testSpindle,
      testTool,
      engagementResult.mrrMm3Min,
      speedResult.rpmActual
    )

    expect(powerResult.cuttingPowerW).toBeGreaterThan(0)
    expect(powerResult.totalPowerRequiredW).toBeGreaterThan(powerResult.cuttingPowerW)
    expect(powerResult.powerAvailableW).toBeGreaterThan(0)

    // Step 6: Apply power limiting if needed
    let finalFeedRate = chiploadResult.vfActual
    let finalMRR = engagementResult.mrrMm3Min

    if (powerResult.powerLimited) {
      const limitedValues = applyPowerLimiting(
        chiploadResult.vfActual,
        engagementResult.mrrMm3Min,
        powerResult.scalingFactor
      )
      finalFeedRate = limitedValues.feedRate
      finalMRR = limitedValues.mrr
    }

    // Final results should be reasonable
    expect(finalFeedRate).toBeGreaterThan(0)
    expect(finalMRR).toBeGreaterThan(0)

    // Step 7: Calculate cutting force
    const forceResult = calculateCuttingForce(
      testMaterial,
      testTool,
      engagementResult.aeMm,
      chiploadResult.fzAdjusted
    )

    expect(forceResult.totalForceN).toBeGreaterThan(0)
    expect(forceResult.chipAreaMm2).toBeGreaterThan(0)

    // Step 8: Calculate tool deflection
    const deflectionResult = calculateDeflection(
      testTool,
      forceResult.totalForceN,
      speedResult.rpmActual,
      effectiveFlutes
    )

    expect(deflectionResult.totalDeflectionMm).toBeGreaterThan(0)
    expect(deflectionResult.staticDeflection.totalStaticDeflectionMm).toBeGreaterThan(0)
    expect(deflectionResult.dynamicAmplification.amplificationFactor).toBeGreaterThan(0)
  })

  it('should handle power-limited operation correctly', () => {
    // Use high aggressiveness to trigger power limiting
    const highAggressiveness = 3.0
    const largeDocMm = 3.0  // Will be limited to max engagement
    const largeWocMm = 3.0

    const effectiveDiameter = getEffectiveDiameter(testTool)
    const effectiveFlutes = getEffectiveFlutes(testTool)

    const speedResult = calculateSpeedAndRPM(
      testMaterial, 
      testSpindle, 
      effectiveDiameter, 
      'slot', 
      highAggressiveness
    )

    const chiploadResult = calculateChiploadAndFeed(
      testMaterial,
      testMachine,
      testTool,
      effectiveDiameter,
      effectiveFlutes,
      speedResult.rpmActual,
      largeWocMm,
      highAggressiveness
    )

    const engagementResult = calculateEngagementAndMRR(
      testMaterial,
      testTool,
      effectiveDiameter,
      chiploadResult.vfActual,
      largeDocMm,
      largeWocMm
    )

    const powerResult = calculatePower(
      testMaterial,
      testMachine,
      testSpindle,
      testTool,
      engagementResult.mrrMm3Min,
      speedResult.rpmActual
    )

    // With high aggressiveness, we might hit power limits
    if (powerResult.powerLimited) {
      expect(powerResult.scalingFactor).toBeLessThan(1.0)
      expect(powerResult.warnings).toHaveLength(1)
      expect(powerResult.warnings[0].type).toBe('power_limited')

      const limitedValues = applyPowerLimiting(
        chiploadResult.vfActual,
        engagementResult.mrrMm3Min,
        powerResult.scalingFactor
      )

      expect(limitedValues.feedRate).toBeLessThan(chiploadResult.vfActual)
      expect(limitedValues.mrr).toBeLessThan(engagementResult.mrrMm3Min)
    }
  })

  it('should handle drilling operation correctly', () => {
    const drillTool: Tool = {
      ...testTool,
      type: 'drill',
      default_doc_mm: 6.0  // Full depth for drilling
    }

    const effectiveDiameter = getEffectiveDiameter(drillTool)
    const effectiveFlutes = getEffectiveFlutes(drillTool)

    const speedResult = calculateSpeedAndRPM(
      testMaterial, 
      testSpindle, 
      effectiveDiameter, 
      'drilling', 
      1.0
    )

    const chiploadResult = calculateChiploadAndFeed(
      testMaterial,
      testMachine,
      drillTool,
      effectiveDiameter,
      effectiveFlutes,
      speedResult.rpmActual,
      effectiveDiameter, // For drilling, WOC = diameter
      1.0
    )

    const engagementResult = calculateEngagementAndMRR(
      testMaterial,
      drillTool,
      effectiveDiameter,
      chiploadResult.vfActual
      // No user DOC/WOC for drilling - use tool defaults
    )

    // For drilling, MRR should use circular area formula
    const expectedMRR = (Math.PI * Math.pow(effectiveDiameter, 2) / 4) * chiploadResult.vfActual
    expect(engagementResult.mrrMm3Min).toBeCloseTo(expectedMRR, 5)

    const powerResult = calculatePower(
      testMaterial,
      testMachine,
      testSpindle,
      drillTool,
      engagementResult.mrrMm3Min,
      speedResult.rpmActual
    )

    // Drilling has higher power factor (1.3) so should require more power
    expect(powerResult.cuttingPowerW).toBeGreaterThan(0)
  })

  it('should collect all warnings from the complete pipeline', () => {
    // Use parameters that will trigger multiple warnings
    const highAggressiveness = 2.0
    const veryLargeDocMm = 5.0  // Will exceed max engagement
    const veryLargeWocMm = 5.0  // Will exceed max engagement

    const effectiveDiameter = getEffectiveDiameter(testTool)
    const effectiveFlutes = getEffectiveFlutes(testTool)

    const speedResult = calculateSpeedAndRPM(
      testMaterial, 
      testSpindle, 
      effectiveDiameter, 
      'slot', 
      highAggressiveness
    )

    const chiploadResult = calculateChiploadAndFeed(
      testMaterial,
      testMachine,
      testTool,
      effectiveDiameter,
      effectiveFlutes,
      speedResult.rpmActual,
      veryLargeWocMm,
      highAggressiveness
    )

    const engagementResult = calculateEngagementAndMRR(
      testMaterial,
      testTool,
      effectiveDiameter,
      chiploadResult.vfActual,
      veryLargeDocMm,
      veryLargeWocMm
    )

    const powerResult = calculatePower(
      testMaterial,
      testMachine,
      testSpindle,
      testTool,
      engagementResult.mrrMm3Min,
      speedResult.rpmActual
    )

    // Collect all warnings
    const allWarnings = [
      ...speedResult.warnings,
      ...chiploadResult.warnings,
      ...engagementResult.warnings,
      ...powerResult.warnings
    ]

    // Should have engagement limiting warnings at minimum
    expect(allWarnings.length).toBeGreaterThan(0)
    
    // Check that we have the expected engagement warnings
    const engagementWarnings = engagementResult.warnings.filter(w => 
      w.type === 'doc_limited' || w.type === 'woc_limited'
    )
    expect(engagementWarnings.length).toBeGreaterThan(0)
  })

  it('should calculate force and deflection for complete machining operation', () => {
    // Use moderate parameters that should generate reasonable force and deflection
    const effectiveDiameter = getEffectiveDiameter(testTool)
    const effectiveFlutes = getEffectiveFlutes(testTool)

    const speedResult = calculateSpeedAndRPM(
      testMaterial, 
      testSpindle, 
      effectiveDiameter, 
      'slot', 
      1.0
    )

    const chiploadResult = calculateChiploadAndFeed(
      testMaterial,
      testMachine,
      testTool,
      effectiveDiameter,
      effectiveFlutes,
      speedResult.rpmActual,
      3.0, // Moderate WOC
      1.0
    )

    const engagementResult = calculateEngagementAndMRR(
      testMaterial,
      testTool,
      effectiveDiameter,
      chiploadResult.vfActual,
      1.5, // Moderate DOC
      3.0  // Moderate WOC
    )

    // Calculate cutting force
    const forceResult = calculateCuttingForce(
      testMaterial,
      testTool,
      engagementResult.aeMm,
      chiploadResult.fzAdjusted
    )

    // Force should be reasonable for aluminum with moderate cuts
    expect(forceResult.totalForceN).toBeGreaterThan(50)
    expect(forceResult.totalForceN).toBeLessThan(2000) // Not excessively high
    expect(forceResult.toolForceMultiplier).toBe(1.0) // Endmill multiplier

    // Calculate deflection
    const deflectionResult = calculateDeflection(
      testTool,
      forceResult.totalForceN,
      speedResult.rpmActual,
      effectiveFlutes
    )

    // Deflection should be positive but reasonable for a 6mm carbide tool at 20mm stickout
    expect(deflectionResult.totalDeflectionMm).toBeGreaterThan(0)
    expect(deflectionResult.totalDeflectionMm).toBeLessThan(2.0) // Should be under 2mm for reasonable cuts

    // Check individual deflection components
    expect(deflectionResult.staticDeflection.bendingDeflectionMm).toBeGreaterThan(0)
    expect(deflectionResult.staticDeflection.shearDeflectionMm).toBeGreaterThan(0)
    expect(deflectionResult.staticDeflection.holderDeflectionMm).toBeGreaterThan(0)

    // Dynamic amplification should be reasonable
    expect(deflectionResult.dynamicAmplification.naturalFrequencyHz).toBeGreaterThan(0)
    expect(deflectionResult.dynamicAmplification.operatingFrequencyHz).toBeGreaterThan(0)
    expect(deflectionResult.dynamicAmplification.amplificationFactor).toBeGreaterThan(0.1)
    expect(deflectionResult.dynamicAmplification.amplificationFactor).toBeLessThan(50)

    // For moderate cutting conditions, deflection warnings should be expected
    const deflectionWarnings = deflectionResult.warnings.filter(w => 
      w.type === 'deflection_danger' || w.type === 'deflection_warning'
    )
    // With 0.75mm deflection, we should get a danger warning
    if (deflectionResult.totalDeflectionMm > 0.05) {
      expect(deflectionWarnings.length).toBeGreaterThanOrEqual(1)
      expect(deflectionWarnings[0].severity).toBe('danger')
    }
  })
})