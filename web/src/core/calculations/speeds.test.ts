import { describe, expect, it } from 'vitest'

import type { Material } from '../data/schemas/material.js'
import type { Spindle } from '../data/schemas/spindle.js'

import { calculateSpeedAndRPM, getSpeedFactor } from './speeds.js'

describe('Speed calculations', () => {
  // Test data
  const testMaterial: Material = {
    id: 'aluminum-6061',
    category: 'aluminum',
    vc_range_m_min: [200, 400], // 300 m/min average
    fz_mm_per_tooth_by_diameter: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '6.0': [0.05, 0.15],
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '12.0': [0.1, 0.2]
    },
    force_coeff_kn_mm2: 1.5,
    specific_cutting_energy_j_mm3: 0.8,
    chip_thinning: {
      enable_below_fraction: 0.3,
      limit_factor: 2.0
    },
    max_engagement_fraction: 0.6
  }

  const testSpindle: Spindle = {
    id: 'test-spindle',
    rated_power_kw: 5.0,
    rpm_min: 100,
    rpm_max: 24000,
    base_rpm: 3000,
    type: 'vfd_spindle',
    power_curve: [
      { rpm: 100, power_kw: 5.0 },
      { rpm: 3000, power_kw: 5.0 },
      { rpm: 24000, power_kw: 2.0 }
    ]
  }

  describe('getSpeedFactor', () => {
    it('should return correct factors for each cut type', () => {
      expect(getSpeedFactor('slot')).toBe(0.8)
      expect(getSpeedFactor('profile')).toBe(1.0)
      expect(getSpeedFactor('adaptive')).toBe(1.2)
      expect(getSpeedFactor('facing')).toBe(0.9)
      expect(getSpeedFactor('drilling')).toBe(0.7)
      expect(getSpeedFactor('boring')).toBe(0.8)
    })

    it('should throw error for unknown cut type', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
      expect(() => getSpeedFactor('unknown' as any)).toThrow('Unknown cut type: unknown')
    })
  })

  describe('calculateSpeedAndRPM', () => {
    describe('basic calculations', () => {
      it('should calculate correct RPM for profile cutting', () => {
        const result = calculateSpeedAndRPM(
          testMaterial,
          testSpindle,
          6.35, // 1/4" endmill
          'profile',
          1.0 // standard aggressiveness
        )

        // vc_target = 300 * 1.0 * 1.0 = 300 m/min
        expect(result.vcTarget).toBe(300)

        // rpm_theoretical = (300 * 1000) / (π * 6.35) ≈ 15038
        expect(result.rpmTheoretical).toBeCloseTo(15038, 0)

        // Should be clamped to spindle max (24000)
        expect(result.rpmActual).toBe(result.rpmTheoretical) // Not clamped in this case

        // Should have no warnings since not clamped
        expect(result.warnings).toHaveLength(0)

        // vc_actual should equal vc_target since not clamped
        expect(result.vcActual).toBeCloseTo(300, 1)
      })

      it('should apply aggressiveness factor', () => {
        const result = calculateSpeedAndRPM(
          testMaterial,
          testSpindle,
          6.35,
          'profile',
          1.5 // 50% more aggressive
        )

        // vc_target = 300 * 1.0 * 1.5 = 450 m/min
        expect(result.vcTarget).toBe(450)

        // rpm_theoretical = (450 * 1000) / (π * 6.35) ≈ 22557
        expect(result.rpmTheoretical).toBeCloseTo(22557, 0)
      })

      it('should apply cut type speed factors', () => {
        const slotResult = calculateSpeedAndRPM(testMaterial, testSpindle, 6.35, 'slot', 1.0)
        const adaptiveResult = calculateSpeedAndRPM(testMaterial, testSpindle, 6.35, 'adaptive', 1.0)

        // Slot: 300 * 0.8 = 240 m/min
        expect(slotResult.vcTarget).toBe(240)

        // Adaptive: 300 * 1.2 = 360 m/min
        expect(adaptiveResult.vcTarget).toBe(360)
      })
    })

    describe('spindle clamping', () => {
      it('should clamp to maximum RPM and generate warning', () => {
        const result = calculateSpeedAndRPM(
          testMaterial,
          testSpindle,
          1.0, // Very small diameter to force high RPM
          'adaptive', // High speed factor
          2.0 // High aggressiveness
        )

        // vc_target = 300 * 1.2 * 2.0 = 720 m/min
        expect(result.vcTarget).toBe(720)

        // rpm_theoretical = (720 * 1000) / (π * 1.0) ≈ 229183
        expect(result.rpmTheoretical).toBeCloseTo(229183, 0)

        // Should be clamped to spindle max
        expect(result.rpmActual).toBe(24000)

        // Should have warning
        expect(result.warnings).toHaveLength(1)
        expect(result.warnings[0].type).toBe('rpm_limited')
        expect(result.warnings[0].message).toContain('maximum RPM')
        expect(result.warnings[0].severity).toBe('warning')

        // vc_actual should be reduced due to clamping
        // vc_actual = (24000 * π * 1.0) / 1000 ≈ 75.4
        expect(result.vcActual).toBeCloseTo(75.4, 1)
      })

      it('should clamp to minimum RPM and generate warning', () => {
        const result = calculateSpeedAndRPM(
          testMaterial,
          testSpindle,
          100.0, // Very large diameter to force low RPM
          'drilling', // Low speed factor
          0.1 // Low aggressiveness
        )

        // vc_target = 300 * 0.7 * 0.1 = 21 m/min
        expect(result.vcTarget).toBe(21)

        // rpm_theoretical = (21 * 1000) / (π * 100.0) ≈ 66.8
        expect(result.rpmTheoretical).toBeCloseTo(66.8, 1)

        // Should be clamped to spindle min
        expect(result.rpmActual).toBe(100)

        // Should have warning
        expect(result.warnings).toHaveLength(1)
        expect(result.warnings[0].type).toBe('rpm_limited')
        expect(result.warnings[0].message).toContain('minimum RPM')
        expect(result.warnings[0].severity).toBe('warning')

        // vc_actual should be higher due to clamping
        // vc_actual = (100 * π * 100.0) / 1000 ≈ 31.4
        expect(result.vcActual).toBeCloseTo(31.4, 1)
      })

      it('should not generate warnings when within range', () => {
        const result = calculateSpeedAndRPM(
          testMaterial,
          testSpindle,
          12.7, // 1/2" endmill
          'profile',
          1.0
        )

        // rpm_theoretical = (300 * 1000) / (π * 12.7) ≈ 7519
        expect(result.rpmTheoretical).toBeCloseTo(7519, 0)

        // Should not be clamped (within 100-24000 range)
        expect(result.rpmActual).toBe(result.rpmTheoretical)

        // No warnings
        expect(result.warnings).toHaveLength(0)
      })
    })

    describe('edge cases and validation', () => {
      it('should throw error for zero effective diameter', () => {
        expect(() => {
          calculateSpeedAndRPM(testMaterial, testSpindle, 0, 'profile', 1.0)
        }).toThrow('Effective diameter must be positive')
      })

      it('should throw error for negative effective diameter', () => {
        expect(() => {
          calculateSpeedAndRPM(testMaterial, testSpindle, -5.0, 'profile', 1.0)
        }).toThrow('Effective diameter must be positive')
      })

      it('should throw error for zero aggressiveness', () => {
        expect(() => {
          calculateSpeedAndRPM(testMaterial, testSpindle, 6.35, 'profile', 0)
        }).toThrow('Aggressiveness must be positive')
      })

      it('should throw error for negative aggressiveness', () => {
        expect(() => {
          calculateSpeedAndRPM(testMaterial, testSpindle, 6.35, 'profile', -0.5)
        }).toThrow('Aggressiveness must be positive')
      })

      it('should handle very small diameters', () => {
        const result = calculateSpeedAndRPM(testMaterial, testSpindle, 0.1, 'profile', 1.0)

        // Should calculate and clamp properly
        expect(result.rpmTheoretical).toBeGreaterThan(100000)
        expect(result.rpmActual).toBe(24000) // Clamped to max
        expect(result.warnings).toHaveLength(1)
      })

      it('should handle very large diameters', () => {
        const result = calculateSpeedAndRPM(testMaterial, testSpindle, 200.0, 'profile', 1.0)

        // Should calculate and clamp properly
        expect(result.rpmTheoretical).toBeLessThan(1000)
        expect(result.rpmActual).toBe(result.rpmTheoretical) // Within range
        expect(result.warnings).toHaveLength(0)
      })

      it('should handle materials with different vc ranges', () => {
        const steelMaterial: Material = {
          ...testMaterial,
          vc_range_m_min: [50, 150] // 100 m/min average (slower than aluminum)
        }

        const result = calculateSpeedAndRPM(steelMaterial, testSpindle, 6.35, 'profile', 1.0)

        // vc_target = 100 * 1.0 * 1.0 = 100 m/min
        expect(result.vcTarget).toBe(100)

        // Should result in lower RPM
        expect(result.rpmTheoretical).toBeCloseTo(5013, 0)
      })
    })

    describe('comprehensive test scenarios', () => {
      it('should handle drilling with large drill bit', () => {
        const result = calculateSpeedAndRPM(
          testMaterial,
          testSpindle,
          25.4, // 1" drill
          'drilling',
          0.8
        )

        // vc_target = 300 * 0.7 * 0.8 = 168 m/min
        expect(result.vcTarget).toBe(168)

        // rpm_theoretical = (168 * 1000) / (π * 25.4) ≈ 2105
        expect(result.rpmTheoretical).toBeCloseTo(2105, 0)

        // Should be within spindle range
        expect(result.rpmActual).toBe(result.rpmTheoretical)
        expect(result.warnings).toHaveLength(0)
      })

      it('should handle aggressive adaptive milling', () => {
        const result = calculateSpeedAndRPM(
          testMaterial,
          testSpindle,
          3.175, // 1/8" endmill
          'adaptive',
          2.0 // Very aggressive
        )

        // vc_target = 300 * 1.2 * 2.0 = 720 m/min
        expect(result.vcTarget).toBe(720)

        // High RPM expected, likely to be clamped
        expect(result.rpmTheoretical).toBeGreaterThan(50000)
        expect(result.rpmActual).toBe(24000)
        expect(result.warnings).toHaveLength(1)
      })
    })
  })
})