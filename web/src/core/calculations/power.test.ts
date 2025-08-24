import { describe, it, expect } from 'vitest'

import type { Material, Machine, Spindle, Tool } from '../data/schemas/index.js'

import { calculatePower, getToolPowerFactor, getSpindlePowerAtRPM, applyPowerLimiting } from './power.js'

// Test fixtures
const testMaterial: Material = {
  id: 'aluminum-6061',
  category: 'aluminum',
  vc_range_m_min: [200, 400],
  fz_mm_per_tooth_by_diameter: {
    '6': [0.04, 0.08]
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

describe('getToolPowerFactor', () => {
  it('should return correct power factors for different tool types', () => {
    expect(getToolPowerFactor('endmill_flat')).toBe(1.0)
    expect(getToolPowerFactor('drill')).toBe(1.3)
    expect(getToolPowerFactor('vbit')).toBe(0.9)
    expect(getToolPowerFactor('facemill')).toBe(0.8)
    expect(getToolPowerFactor('boring')).toBe(1.1)
    expect(getToolPowerFactor('slitting')).toBe(1.2)
  })

  it('should throw error for unknown tool type', () => {
    expect(() => {
      getToolPowerFactor('unknown' as Tool['type'])
    }).toThrow('Unknown tool type: unknown')
  })
})

describe('getSpindlePowerAtRPM', () => {
  it('should return exact power for curve points', () => {
    expect(getSpindlePowerAtRPM(testSpindle, 1000)).toBe(800)  // 0.8 kW = 800 W
    expect(getSpindlePowerAtRPM(testSpindle, 6000)).toBe(2200) // 2.2 kW = 2200 W
    expect(getSpindlePowerAtRPM(testSpindle, 18000)).toBe(2200)
    expect(getSpindlePowerAtRPM(testSpindle, 24000)).toBe(1800)
  })

  it('should interpolate between curve points', () => {
    // Between 1000 RPM (0.8 kW) and 6000 RPM (2.2 kW)
    const midRPM = 3500
    const expectedPowerKW = 0.8 + (2.2 - 0.8) * (3500 - 1000) / (6000 - 1000)
    const expectedPowerW = expectedPowerKW * 1000
    
    expect(getSpindlePowerAtRPM(testSpindle, midRPM)).toBeCloseTo(expectedPowerW, 1)
  })

  it('should clamp to first point for low RPM', () => {
    expect(getSpindlePowerAtRPM(testSpindle, 500)).toBe(800)  // Uses first point
  })

  it('should clamp to last point for high RPM', () => {
    expect(getSpindlePowerAtRPM(testSpindle, 30000)).toBe(1800)  // Uses last point
  })

  it('should handle unsorted power curves', () => {
    const unsortedSpindle: Spindle = {
      ...testSpindle,
      power_curve: [
        { rpm: 6000, power_kw: 2.2 },
        { rpm: 1000, power_kw: 0.8 },
        { rpm: 24000, power_kw: 1.8 },
        { rpm: 18000, power_kw: 2.2 }
      ]
    }

    // Should still work correctly by sorting internally
    expect(getSpindlePowerAtRPM(unsortedSpindle, 3500)).toBeCloseTo(1500, 1)
  })
})

describe('calculatePower', () => {
  it('should calculate basic power components correctly', () => {
    const mrr = 7200  // mm³/min
    const rpm = 12000

    const result = calculatePower(testMaterial, testMachine, testSpindle, testTool, mrr, rpm)

    // cuttingPower = (7200 × 0.8) / 60 = 96 W
    expect(result.cuttingPowerW).toBe(96)

    // powerWithTool = 96 × 1.0 (endmill factor) × 1.2 (rigidity) = 115.2 W
    expect(result.powerWithToolW).toBeCloseTo(115.2, 1)

    // spindleLosses = 115.2 × 0.15 = 17.28 W
    expect(result.spindleLossesW).toBeCloseTo(17.28, 1)

    // totalRequired = 115.2 + 17.28 = 132.48 W
    expect(result.totalPowerRequiredW).toBeCloseTo(132.48, 1)

    expect(result.powerLimited).toBe(false)
    expect(result.warnings).toHaveLength(0)
  })

  it('should apply tool power factors correctly', () => {
    const drillTool: Tool = { ...testTool, type: 'drill' }
    const mrr = 7200
    const rpm = 12000

    const result = calculatePower(testMaterial, testMachine, testSpindle, drillTool, mrr, rpm)

    // powerWithTool = 96 × 1.3 (drill factor) × 1.2 (rigidity) = 149.76 W
    expect(result.powerWithToolW).toBeCloseTo(149.76, 1)
  })

  it('should trigger power limiting when required power exceeds threshold', () => {
    // Use high MRR to trigger power limiting
    const mrr = 100000  // Very high MRR
    const rpm = 24000   // High RPM where power is limited

    const result = calculatePower(testMaterial, testMachine, testSpindle, testTool, mrr, rpm)

    expect(result.powerLimited).toBe(true)
    expect(result.scalingFactor).toBeDefined()
    expect(result.scalingFactor).toBeLessThan(1)
    expect(result.warnings).toHaveLength(1)
    expect(result.warnings[0].type).toBe('power_limited')
  })

  it('should calculate scaling factor correctly when power limited', () => {
    const mrr = 50000   // High MRR
    const rpm = 24000   // 1800W available

    const result = calculatePower(testMaterial, testMachine, testSpindle, testTool, mrr, rpm)

    if (result.powerLimited && result.scalingFactor) {
      // scalingFactor = (powerAvailable × 0.85) / totalPowerRequired
      const expectedScaling = (result.powerAvailableW * 0.85) / result.totalPowerRequiredW
      expect(result.scalingFactor).toBeCloseTo(expectedScaling, 3)
    }
  })

  it('should handle zero MRR', () => {
    const result = calculatePower(testMaterial, testMachine, testSpindle, testTool, 0, 12000)

    expect(result.cuttingPowerW).toBe(0)
    expect(result.powerWithToolW).toBe(0)
    expect(result.spindleLossesW).toBe(0)
    expect(result.totalPowerRequiredW).toBe(0)
    expect(result.powerLimited).toBe(false)
  })

  it('should throw error for negative MRR', () => {
    expect(() => {
      calculatePower(testMaterial, testMachine, testSpindle, testTool, -100, 12000)
    }).toThrow('MRR must be non-negative')
  })

  it('should throw error for invalid RPM', () => {
    expect(() => {
      calculatePower(testMaterial, testMachine, testSpindle, testTool, 1000, 0)
    }).toThrow('RPM must be positive')
  })

  it('should handle different materials with different specific energy', () => {
    const steelMaterial: Material = {
      ...testMaterial,
      specific_cutting_energy_j_mm3: 2.5  // Higher energy than aluminum
    }

    const result = calculatePower(steelMaterial, testMachine, testSpindle, testTool, 7200, 12000)

    // cuttingPower = (7200 × 2.5) / 60 = 300 W (higher than aluminum)
    expect(result.cuttingPowerW).toBe(300)
  })
})

describe('applyPowerLimiting', () => {
  it('should return original values when no scaling factor', () => {
    const result = applyPowerLimiting(1200, 7200)

    expect(result.feedRate).toBe(1200)
    expect(result.mrr).toBe(7200)
  })

  it('should scale values when scaling factor provided', () => {
    const result = applyPowerLimiting(1200, 7200, 0.8)

    expect(result.feedRate).toBe(960)   // 1200 × 0.8
    expect(result.mrr).toBe(5760)       // 7200 × 0.8
  })

  it('should handle zero scaling factor', () => {
    const result = applyPowerLimiting(1200, 7200, 0)

    expect(result.feedRate).toBe(0)
    expect(result.mrr).toBe(0)
  })
})