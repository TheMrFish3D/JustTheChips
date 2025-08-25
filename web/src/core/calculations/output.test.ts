import { describe, it, expect } from 'vitest'

import { assembleOutput, applyOutputRounding, roundForOutput } from './output.js'
import type { OutputAssemblyInput } from './output.js'

// Create test data
const mockOutputAssemblyInput: OutputAssemblyInput = {
  tool: {
    id: 'test_tool',
    type: 'endmill_flat',
    diameter_mm: 6,
    flutes: 4,
    coating: 'uncoated',
    stickout_mm: 20,
    material: 'carbide',
    default_doc_mm: 3,
    default_woc_mm: 1.5
  },
  effectiveDiameter: 6.0,
  userDocOverride: false,
  speedResult: {
    rpmActual: 8542.123,
    vcActual: 161.234,
    vcTarget: 160.0,
    rpmTheoretical: 8542.123,
    warnings: [
      { type: 'rpm_limited', message: 'RPM clamped to spindle limit', severity: 'warning' as const }
    ]
  },
  chiploadResult: {
    fzBase: 0.02345,
    fzAdjusted: 0.02180,
    vfTheoretical: 1876.432,
    vfActual: 1850.567,
    chipThinningApplied: true,
    warnings: [
      { type: 'feed_limited', message: 'Feed limited by machine', severity: 'warning' as const }
    ]
  },
  engagementResult: {
    aeMm: 1.8,
    apMm: 3.2,
    mrrMm3Min: 1123.456,
    warnings: []
  },
  powerResult: {
    cuttingPowerW: 850.234,
    powerWithToolW: 977.769,
    spindleLossesW: 127.535,
    totalPowerRequiredW: 977.769,
    powerAvailableW: 2200.0,
    powerAvailableDeratedW: 2200.0,
    temperatureDeratingFactor: 1.0,
    powerLimited: false,
    warnings: []
  },
  forceResult: {
    chipAreaMm2: 3.456,
    baseForceMaterialN: 245.678,
    toolForceMultiplier: 1.0,
    totalForceN: 245.678,
    warnings: []
  },
  deflectionResult: {
    staticDeflection: {
      bendingDeflectionMm: 0.0123,
      shearDeflectionMm: 0.0045,
      holderDeflectionMm: 0.0089,
      totalStaticDeflectionMm: 0.0257
    },
    dynamicAmplification: {
      naturalFrequencyHz: 1250.0,
      operatingFrequencyHz: 456.78,
      frequencyRatio: 0.365,
      amplificationFactor: 1.037
    },
    totalDeflectionMm: 0.02665,
    warnings: [
      { type: 'deflection_warning', message: 'High deflection detected', severity: 'warning' as const }
    ]
  },
  validationWarnings: [
    { type: 'aggressiveness_warning', message: 'Aggressiveness outside normal range', severity: 'warning' as const }
  ]
}

describe('assembleOutput', () => {
  it('should assemble complete output with all required fields', () => {
    const output = assembleOutput(mockOutputAssemblyInput)

    // Check that all required fields are present
    expect(output).toHaveProperty('rpm')
    expect(output).toHaveProperty('feed_mm_min')
    expect(output).toHaveProperty('fz_mm')
    expect(output).toHaveProperty('fz_actual_mm')
    expect(output).toHaveProperty('ae_mm')
    expect(output).toHaveProperty('ap_mm')
    expect(output).toHaveProperty('mrr_mm3_min')
    expect(output).toHaveProperty('power_W')
    expect(output).toHaveProperty('power_available_W')
    expect(output).toHaveProperty('force_N')
    expect(output).toHaveProperty('deflection_mm')
    expect(output).toHaveProperty('warnings')
    expect(output).toHaveProperty('toolType')
    expect(output).toHaveProperty('effectiveDiameter')
    expect(output).toHaveProperty('user_doc_override')
    expect(output).toHaveProperty('vc_m_min')
    expect(output).toHaveProperty('sfm')
  })

  it('should round integer values correctly', () => {
    const output = assembleOutput(mockOutputAssemblyInput)

    // Integer fields should be rounded
    expect(output.rpm).toBe(8542) // Rounded from 8542.123
    expect(output.feed_mm_min).toBe(1851) // Rounded from 1850.567
    expect(output.vc_m_min).toBe(161) // Rounded from 161.234
    expect(output.sfm).toBe(529) // Converted and rounded: 161.234 * 3.28084 ≈ 529

    // Check that they are actually integers
    expect(Number.isInteger(output.rpm)).toBe(true)
    expect(Number.isInteger(output.feed_mm_min)).toBe(true)
    expect(Number.isInteger(output.vc_m_min)).toBe(true)
    expect(Number.isInteger(output.sfm)).toBe(true)
  })

  it('should preserve float values without unwanted rounding', () => {
    const output = assembleOutput(mockOutputAssemblyInput)

    // Float fields should preserve precision
    expect(output.fz_mm).toBeCloseTo(0.02180, 5)
    expect(output.fz_actual_mm).toBeCloseTo(0.02345, 5)
    expect(output.ae_mm).toBeCloseTo(1.8, 2)
    expect(output.ap_mm).toBeCloseTo(3.2, 2)
    expect(output.mrr_mm3_min).toBeCloseTo(1123.456, 3)
    expect(output.power_W).toBeCloseTo(977.769, 3)
    expect(output.power_available_W).toBeCloseTo(2200.0, 1)
    expect(output.force_N).toBeCloseTo(245.678, 3)
    expect(output.deflection_mm).toBeCloseTo(0.02665, 5)
    expect(output.effectiveDiameter).toBeCloseTo(6.0, 2)
  })

  it('should correctly set string and boolean fields', () => {
    const output = assembleOutput(mockOutputAssemblyInput)

    expect(output.toolType).toBe('endmill_flat')
    expect(output.user_doc_override).toBe(false)
  })

  it('should consolidate all warnings from different sources', () => {
    const output = assembleOutput(mockOutputAssemblyInput)

    // Should have warnings from validation, speed, chipload, and deflection
    expect(output.warnings).toHaveLength(4)
    
    const warningTypes = output.warnings.map(w => w.type)
    expect(warningTypes).toContain('aggressiveness_warning')
    expect(warningTypes).toContain('rpm_limited')
    expect(warningTypes).toContain('feed_limited')
    expect(warningTypes).toContain('deflection_warning')

    // Warnings should have correct structure
    output.warnings.forEach(warning => {
      expect(warning).toHaveProperty('type')
      expect(warning).toHaveProperty('message')
      expect(typeof warning.type).toBe('string')
      expect(typeof warning.message).toBe('string')
    })
  })

  it('should handle case with user DOC override', () => {
    const inputWithDocOverride = {
      ...mockOutputAssemblyInput,
      userDocOverride: true
    }

    const output = assembleOutput(inputWithDocOverride)
    expect(output.user_doc_override).toBe(true)
  })

  it('should correctly convert surface speed from m/min to ft/min', () => {
    const testCases = [
      { vcActual: 100, expectedSfm: 328 }, // 100 * 3.28084 ≈ 328
      { vcActual: 200, expectedSfm: 656 }, // 200 * 3.28084 ≈ 656
      { vcActual: 300, expectedSfm: 984 }  // 300 * 3.28084 ≈ 984
    ]

    testCases.forEach(({ vcActual, expectedSfm }) => {
      const testInput = {
        ...mockOutputAssemblyInput,
        speedResult: {
          ...mockOutputAssemblyInput.speedResult,
          vcActual
        }
      }

      const output = assembleOutput(testInput)
      expect(output.sfm).toBe(expectedSfm)
    })
  })
})

describe('roundForOutput', () => {
  it('should round to specified decimal places', () => {
    expect(roundForOutput(1.23456, 2)).toBe(1.23)
    expect(roundForOutput(1.23456, 3)).toBe(1.235)
    expect(roundForOutput(1.23456, 4)).toBe(1.2346)
    expect(roundForOutput(1.23456, 0)).toBe(1)
  })

  it('should handle edge cases', () => {
    expect(roundForOutput(0, 2)).toBe(0)
    expect(roundForOutput(1.999, 2)).toBe(2.00)
    expect(roundForOutput(-1.23456, 2)).toBe(-1.23)
  })
})

describe('applyOutputRounding', () => {
  it('should apply appropriate rounding to each field', () => {
    const unroundedOutput = assembleOutput(mockOutputAssemblyInput)
    const roundedOutput = applyOutputRounding(unroundedOutput)

    // Check that appropriate precision is applied
    expect(roundedOutput.fz_mm).toBe(roundForOutput(unroundedOutput.fz_mm, 4))
    expect(roundedOutput.fz_actual_mm).toBe(roundForOutput(unroundedOutput.fz_actual_mm, 4))
    expect(roundedOutput.ae_mm).toBe(roundForOutput(unroundedOutput.ae_mm, 2))
    expect(roundedOutput.ap_mm).toBe(roundForOutput(unroundedOutput.ap_mm, 2))
    expect(roundedOutput.mrr_mm3_min).toBe(roundForOutput(unroundedOutput.mrr_mm3_min, 1))
    expect(roundedOutput.power_W).toBe(roundForOutput(unroundedOutput.power_W, 1))
    expect(roundedOutput.power_available_W).toBe(roundForOutput(unroundedOutput.power_available_W, 1))
    expect(roundedOutput.force_N).toBe(roundForOutput(unroundedOutput.force_N, 1))
    expect(roundedOutput.deflection_mm).toBe(roundForOutput(unroundedOutput.deflection_mm, 4))
    expect(roundedOutput.effectiveDiameter).toBe(roundForOutput(unroundedOutput.effectiveDiameter, 2))
  })

  it('should preserve integer fields unchanged', () => {
    const unroundedOutput = assembleOutput(mockOutputAssemblyInput)
    const roundedOutput = applyOutputRounding(unroundedOutput)

    expect(roundedOutput.rpm).toBe(unroundedOutput.rpm)
    expect(roundedOutput.feed_mm_min).toBe(unroundedOutput.feed_mm_min)
    expect(roundedOutput.vc_m_min).toBe(unroundedOutput.vc_m_min)
    expect(roundedOutput.sfm).toBe(unroundedOutput.sfm)
  })

  it('should preserve non-numeric fields unchanged', () => {
    const unroundedOutput = assembleOutput(mockOutputAssemblyInput)
    const roundedOutput = applyOutputRounding(unroundedOutput)

    expect(roundedOutput.warnings).toEqual(unroundedOutput.warnings)
    expect(roundedOutput.toolType).toBe(unroundedOutput.toolType)
    expect(roundedOutput.user_doc_override).toBe(unroundedOutput.user_doc_override)
  })
})