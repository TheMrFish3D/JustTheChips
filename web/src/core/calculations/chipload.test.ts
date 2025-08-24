import { describe, expect, it } from 'vitest'

import type { Machine } from '../data/schemas/machine.js'
import type { Material } from '../data/schemas/material.js'
import type { Tool } from '../data/schemas/tool.js'

import { 
  calculateChiploadAndFeed,
  getChiploadRange,
  getCoatingFactor,
  getToolChiploadFactor
} from './chipload.js'

describe('Chipload calculations', () => {
  // Test data
  const testMaterial: Material = {
    id: 'aluminum-6061',
    category: 'aluminum',
    vc_range_m_min: [200, 400],
    fz_mm_per_tooth_by_diameter: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '3.0': [0.025, 0.075],  // Small diameter: 0.05 average
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '6.0': [0.05, 0.15],    // Medium diameter: 0.1 average
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '12.0': [0.1, 0.2]      // Large diameter: 0.15 average
    },
    force_coeff_kn_mm2: 1.5,
    specific_cutting_energy_j_mm3: 0.8,
    chip_thinning: {
      enable_below_fraction: 0.3, // Enable when ae < 30% of diameter
      limit_factor: 2.0            // Maximum 2x chipload increase
    },
    max_engagement_fraction: 0.6
  }

  const testMachine: Machine = {
    id: 'test-machine',
    axis_max_feed_mm_min: 5000, // 5000 mm/min max feed
    rigidity_factor: 1.0,
    aggressiveness: {
      axial: 1.0,
      radial: 1.0,
      feed: 1.0
    }
  }

  const testTool: Tool = {
    id: 'test-endmill',
    type: 'endmill_flat',
    diameter_mm: 6.0,
    flutes: 3,
    coating: 'altin',
    stickout_mm: 25.0,
    material: 'carbide',
    default_doc_mm: 3.0,
    default_woc_mm: 1.8
  }

  describe('getToolChiploadFactor', () => {
    it('should return correct factors for each tool type', () => {
      expect(getToolChiploadFactor('endmill_flat')).toBe(1.0)
      expect(getToolChiploadFactor('drill')).toBe(0.8)
      expect(getToolChiploadFactor('vbit')).toBe(0.6)
      expect(getToolChiploadFactor('facemill')).toBe(1.1)
      expect(getToolChiploadFactor('boring')).toBe(0.9)
      expect(getToolChiploadFactor('slitting')).toBe(0.7)
    })

    it('should throw error for unknown tool type', () => {
      expect(() => getToolChiploadFactor('unknown' as Tool['type']))
        .toThrow('Unknown tool type: unknown')
    })
  })

  describe('getCoatingFactor', () => {
    it('should return correct factors for known coatings', () => {
      expect(getCoatingFactor('uncoated')).toBe(1.0)
      expect(getCoatingFactor('tin')).toBe(1.1)
      expect(getCoatingFactor('altin')).toBe(1.2)
      expect(getCoatingFactor('alcrn')).toBe(1.15)
      expect(getCoatingFactor('diamond')).toBe(1.3)
    })

    it('should return default factor for unknown coatings', () => {
      expect(getCoatingFactor('unknown-coating')).toBe(1.0)
    })

    it('should be case insensitive', () => {
      expect(getCoatingFactor('ALTIN')).toBe(1.2)
      expect(getCoatingFactor('AlTiN')).toBe(1.2)
    })
  })

  describe('getChiploadRange', () => {
    it('should return exact match when diameter exists', () => {
      const range = getChiploadRange(testMaterial, 6.0)
      expect(range).toEqual([0.05, 0.15])
    })

    it('should use smallest diameter when below range', () => {
      const range = getChiploadRange(testMaterial, 1.0)
      expect(range).toEqual([0.025, 0.075]) // Should use 3.0mm data
    })

    it('should use largest diameter when above range', () => {
      const range = getChiploadRange(testMaterial, 20.0)
      expect(range).toEqual([0.1, 0.2]) // Should use 12.0mm data
    })

    it('should interpolate between available diameters', () => {
      const range = getChiploadRange(testMaterial, 9.0) // Halfway between 6.0 and 12.0
      // Expected: halfway between [0.05, 0.15] and [0.1, 0.2]
      expect(range[0]).toBeCloseTo(0.075, 3) // (0.05 + 0.1) / 2
      expect(range[1]).toBeCloseTo(0.175, 3) // (0.15 + 0.2) / 2
    })

    it('should throw error when no chipload data available', () => {
      const emptyMaterial = { ...testMaterial, fz_mm_per_tooth_by_diameter: {} }
      expect(() => getChiploadRange(emptyMaterial, 6.0))
        .toThrow('No chipload data available for material')
    })
  })

  describe('calculateChiploadAndFeed', () => {
    const rpm = 8000
    const effectiveDiameter = 6.0
    const effectiveFlutes = 3
    const aggressiveness = 1.0

    describe('input validation', () => {
      it('should throw error for invalid effective diameter', () => {
        expect(() => calculateChiploadAndFeed(testMaterial, testMachine, testTool, 0, effectiveFlutes, rpm, 1.8))
          .toThrow('Effective diameter must be positive')
      })

      it('should throw error for invalid effective flutes', () => {
        expect(() => calculateChiploadAndFeed(testMaterial, testMachine, testTool, effectiveDiameter, 0, rpm, 1.8))
          .toThrow('Effective flutes must be positive')
      })

      it('should throw error for invalid RPM', () => {
        expect(() => calculateChiploadAndFeed(testMaterial, testMachine, testTool, effectiveDiameter, effectiveFlutes, 0, 1.8))
          .toThrow('RPM must be positive')
      })

      it('should throw error for negative width of cut', () => {
        expect(() => calculateChiploadAndFeed(testMaterial, testMachine, testTool, effectiveDiameter, effectiveFlutes, rpm, -1))
          .toThrow('Width of cut cannot be negative')
      })

      it('should throw error for invalid aggressiveness', () => {
        expect(() => calculateChiploadAndFeed(testMaterial, testMachine, testTool, effectiveDiameter, effectiveFlutes, rpm, 1.8, 0))
          .toThrow('Aggressiveness must be positive')
      })
    })

    describe('basic chipload calculation', () => {
      it('should calculate correct base chipload without chip thinning', () => {
        const widthOfCut = 3.0 // Above chip thinning threshold (6.0 * 0.3 = 1.8)
        const result = calculateChiploadAndFeed(testMaterial, testMachine, testTool, effectiveDiameter, effectiveFlutes, rpm, widthOfCut, aggressiveness)

        // Expected: 0.1 (avg) × 1.0 (aggressiveness) × 1.0 (endmill factor) × 1.2 (altin coating) = 0.12
        expect(result.fzBase).toBeCloseTo(0.12, 3)
        expect(result.fzAdjusted).toBeCloseTo(0.12, 3)
        expect(result.chipThinningApplied).toBe(false)
      })

      it('should apply correct factors for different tool types', () => {
        const drillTool = { ...testTool, type: 'drill' as const, coating: 'uncoated' }
        const widthOfCut = 3.0
        const result = calculateChiploadAndFeed(testMaterial, testMachine, drillTool, effectiveDiameter, effectiveFlutes, rpm, widthOfCut, aggressiveness)

        // Expected: 0.1 (avg) × 1.0 (aggressiveness) × 0.8 (drill factor) × 1.0 (uncoated) = 0.08
        expect(result.fzBase).toBeCloseTo(0.08, 3)
      })
    })

    describe('chip thinning', () => {
      it('should apply chip thinning when width of cut is below threshold', () => {
        // Use lower RPM to avoid feed limiting
        const lowRpm = 3000
        const widthOfCut = 1.0 // Below threshold (6.0 * 0.3 = 1.8)
        const result = calculateChiploadAndFeed(testMaterial, testMachine, testTool, effectiveDiameter, effectiveFlutes, lowRpm, widthOfCut, aggressiveness)

        expect(result.chipThinningApplied).toBe(true)
        
        // Chip thinning multiplier: sqrt(6.0 / 1.0) = sqrt(6) ≈ 2.449
        // Limited by limit_factor = 2.0
        // Expected fz_adjusted: 0.12 × 2.0 = 0.24
        expect(result.fzAdjusted).toBeCloseTo(0.24, 3)
        
        // Feed rate should be: 3000 × 3 × 0.24 = 2160 mm/min (within machine limit)
        expect(result.vfTheoretical).toBeCloseTo(2160, 1)
        expect(result.vfActual).toBeCloseTo(2160, 1)
      })

      it('should not apply chip thinning when width of cut is above threshold', () => {
        const widthOfCut = 2.0 // Above threshold (6.0 * 0.3 = 1.8)
        const result = calculateChiploadAndFeed(testMaterial, testMachine, testTool, effectiveDiameter, effectiveFlutes, rpm, widthOfCut, aggressiveness)

        expect(result.chipThinningApplied).toBe(false)
        expect(result.fzAdjusted).toBeCloseTo(result.fzBase, 3)
      })

      it('should limit chip thinning by material limit factor', () => {
        // Use lower RPM to avoid feed limiting
        const lowRpm = 2000
        const widthOfCut = 0.5 // Very small width of cut
        const result = calculateChiploadAndFeed(testMaterial, testMachine, testTool, effectiveDiameter, effectiveFlutes, lowRpm, widthOfCut, aggressiveness)

        // Chip thinning multiplier: sqrt(6.0 / 0.5) = sqrt(12) ≈ 3.464
        // Should be limited to 2.0
        const expectedFzAdjusted = result.fzBase * 2.0
        expect(result.fzAdjusted).toBeCloseTo(expectedFzAdjusted, 3)
      })

      it('should not apply chip thinning when width of cut is zero', () => {
        const widthOfCut = 0
        const result = calculateChiploadAndFeed(testMaterial, testMachine, testTool, effectiveDiameter, effectiveFlutes, rpm, widthOfCut, aggressiveness)

        expect(result.chipThinningApplied).toBe(false)
        expect(result.fzAdjusted).toBeCloseTo(result.fzBase, 3)
      })
    })

    describe('feed rate calculation', () => {
      it('should calculate correct theoretical feed rate', () => {
        const widthOfCut = 3.0
        const result = calculateChiploadAndFeed(testMaterial, testMachine, testTool, effectiveDiameter, effectiveFlutes, rpm, widthOfCut, aggressiveness)

        // Expected: 8000 × 3 × 0.12 = 2880 mm/min
        expect(result.vfTheoretical).toBeCloseTo(2880, 1)
        expect(result.vfActual).toBeCloseTo(2880, 1)
        expect(result.warnings).toHaveLength(0)
      })

      it('should limit feed rate to machine axis maximum', () => {
        const limitedMachine = { ...testMachine, axis_max_feed_mm_min: 2000 }
        const widthOfCut = 3.0
        const result = calculateChiploadAndFeed(testMaterial, limitedMachine, testTool, effectiveDiameter, effectiveFlutes, rpm, widthOfCut, aggressiveness)

        expect(result.vfTheoretical).toBeCloseTo(2880, 1)
        expect(result.vfActual).toBe(2000)
        
        // Should recompute fz_adjusted: 2000 / (8000 × 3) ≈ 0.0833
        expect(result.fzAdjusted).toBeCloseTo(0.0833, 4)
        
        expect(result.warnings).toHaveLength(1)
        expect(result.warnings[0].type).toBe('feed_limited')
        expect(result.warnings[0].severity).toBe('warning')
      })
    })

    describe('chipload validation warnings', () => {
      it('should generate danger warning for chipload too low', () => {
        // Use very low aggressiveness to get low chipload
        const lowAggressiveness = 0.1
        const widthOfCut = 3.0
        const result = calculateChiploadAndFeed(testMaterial, testMachine, testTool, effectiveDiameter, effectiveFlutes, rpm, widthOfCut, lowAggressiveness)

        // fz_adjusted = 0.1 × 0.1 × 1.0 × 1.2 = 0.012
        // Danger threshold = 0.5 × 0.05 = 0.025
        expect(result.fzAdjusted).toBeLessThan(0.025)
        
        const dangerWarning = result.warnings.find(w => w.type === 'chipload_danger')
        expect(dangerWarning).toBeDefined()
        expect(dangerWarning?.severity).toBe('danger')
      })

      it('should generate warning for chipload very high', () => {
        // Use very high aggressiveness with low RPM to avoid feed limiting
        const highAggressiveness = 5.0
        const lowRpm = 1000  // Lower RPM to avoid feed limiting
        const widthOfCut = 3.0
        const result = calculateChiploadAndFeed(testMaterial, testMachine, testTool, effectiveDiameter, effectiveFlutes, lowRpm, widthOfCut, highAggressiveness)

        // fz_adjusted = 0.1 × 5.0 × 1.0 × 1.2 = 0.6
        // Warning threshold = 1.5 × 0.15 = 0.225
        expect(result.fzAdjusted).toBeGreaterThan(0.225)
        
        const warning = result.warnings.find(w => w.type === 'chipload_warning')
        expect(warning).toBeDefined()
        expect(warning?.severity).toBe('warning')
      })

      it('should not generate chipload warnings when within acceptable range', () => {
        const widthOfCut = 3.0
        const result = calculateChiploadAndFeed(testMaterial, testMachine, testTool, effectiveDiameter, effectiveFlutes, rpm, widthOfCut, aggressiveness)

        const chiploadWarnings = result.warnings.filter(w => 
          w.type === 'chipload_danger' || w.type === 'chipload_warning'
        )
        expect(chiploadWarnings).toHaveLength(0)
      })
    })

    describe('combined scenarios', () => {
      it('should handle chip thinning and feed limiting together', () => {
        const limitedMachine = { ...testMachine, axis_max_feed_mm_min: 1000 }
        const widthOfCut = 1.0 // Below chip thinning threshold
        const result = calculateChiploadAndFeed(testMaterial, limitedMachine, testTool, effectiveDiameter, effectiveFlutes, rpm, widthOfCut, aggressiveness)

        expect(result.chipThinningApplied).toBe(true)
        
        // Initial fz with chip thinning: 0.12 × 2.0 = 0.24
        // Theoretical feed: 8000 × 3 × 0.24 = 5760 mm/min
        expect(result.vfTheoretical).toBeCloseTo(5760, 1)
        
        // Limited to 1000 mm/min
        expect(result.vfActual).toBe(1000)
        
        // Recomputed fz: 1000 / (8000 × 3) ≈ 0.0417
        expect(result.fzAdjusted).toBeCloseTo(0.0417, 4)
        
        // Should have feed_limited warning
        expect(result.warnings.some(w => w.type === 'feed_limited')).toBe(true)
        
        // The final chipload (0.0417) is less than danger threshold (0.5 × 0.05 = 0.025)? Let's check
        // Danger threshold = 0.5 × 0.05 = 0.025, but 0.0417 > 0.025, so no chipload danger
        // Actually let's verify the calculation
        expect(result.warnings.length).toBeGreaterThanOrEqual(1) // At least feed_limited
      })
    })
  })
})