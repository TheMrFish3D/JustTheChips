import { describe, it, expect } from 'vitest'

import type { Material, Tool } from '../data/schemas/index.js'

import { calculateCuttingForce, getToolForceMultiplier } from './force.js'

// Test data
const testMaterial: Material = {
  id: 'aluminum-6061',
  category: 'aluminum',
  vc_range_m_min: [100, 300],
  fz_mm_per_tooth_by_diameter: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '6.0': [0.05, 0.15],
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '12.0': [0.1, 0.3]
  },
  force_coeff_kn_mm2: 1.2,
  specific_cutting_energy_j_mm3: 0.8,
  chip_thinning: {
    enable_below_fraction: 0.3,
    limit_factor: 2.0
  },
  max_engagement_fraction: 0.5
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

describe('Force Calculations', () => {
  describe('getToolForceMultiplier', () => {
    it('should return correct force multipliers for each tool type', () => {
      expect(getToolForceMultiplier('endmill_flat')).toBe(1.0)
      expect(getToolForceMultiplier('drill')).toBe(1.5)
      expect(getToolForceMultiplier('vbit')).toBe(0.8)
      expect(getToolForceMultiplier('facemill')).toBe(0.6)
      expect(getToolForceMultiplier('boring')).toBe(1.2)
      expect(getToolForceMultiplier('slitting')).toBe(1.3)
    })

    it('should throw error for unknown tool type', () => {
      expect(() => getToolForceMultiplier('unknown' as Tool['type'])).toThrow('Unknown tool type: unknown')
    })
  })

  describe('calculateCuttingForce', () => {
    it('should calculate basic cutting force correctly', () => {
      const result = calculateCuttingForce(testMaterial, testTool, 3.0, 0.1)

      // A = ae × fz = 3.0 × 0.1 = 0.3 mm²
      expect(result.chipAreaMm2).toBeCloseTo(0.3, 10)

      // F_base = force_coeff × A × 1000 = 1.2 × 0.3 × 1000 = 360 N
      expect(result.baseForceMaterialN).toBeCloseTo(360, 5)

      // Tool multiplier for endmill_flat = 1.0
      expect(result.toolForceMultiplier).toBe(1.0)

      // Total force = 360 × 1.0 = 360 N
      expect(result.totalForceN).toBeCloseTo(360, 5)
      expect(result.warnings).toHaveLength(0)
    })

    it('should apply tool-specific force multipliers', () => {
      const drillTool: Tool = { ...testTool, type: 'drill' }
      const result = calculateCuttingForce(testMaterial, drillTool, 3.0, 0.1)

      // Base force = 360 N (same as above)
      expect(result.baseForceMaterialN).toBeCloseTo(360, 5)

      // Tool multiplier for drill = 1.5
      expect(result.toolForceMultiplier).toBe(1.5)

      // Total force = 360 × 1.5 = 540 N
      expect(result.totalForceN).toBeCloseTo(540, 5)
    })

    it('should calculate force with different chip areas', () => {
      const result1 = calculateCuttingForce(testMaterial, testTool, 1.0, 0.05)
      const result2 = calculateCuttingForce(testMaterial, testTool, 2.0, 0.1)

      // Area1 = 1.0 × 0.05 = 0.05 mm²
      expect(result1.chipAreaMm2).toBeCloseTo(0.05, 10)
      expect(result1.baseForceMaterialN).toBeCloseTo(60, 5) // 1.2 × 0.05 × 1000

      // Area2 = 2.0 × 0.1 = 0.2 mm²
      expect(result2.chipAreaMm2).toBeCloseTo(0.2, 10)
      expect(result2.baseForceMaterialN).toBeCloseTo(240, 5) // 1.2 × 0.2 × 1000

      // Force should scale linearly with chip area
      expect(result2.baseForceMaterialN).toBeCloseTo(result1.baseForceMaterialN * 4, 5)
    })

    it('should generate high force warnings', () => {
      // Use high force coefficients and large chip area to trigger warnings
      const highForceMaterial: Material = {
        ...testMaterial,
        force_coeff_kn_mm2: 3.0 // High force coefficient
      }

      // Large chip area: 5.0 × 0.3 = 1.5 mm²
      const result = calculateCuttingForce(highForceMaterial, testTool, 5.0, 0.3)

      // Force = 3.0 × 1.5 × 1000 = 4500 N
      expect(result.totalForceN).toBeCloseTo(4500, 5)

      // Force per mm diameter = 4500 / 6 = 750 N/mm (> 500, should be danger)
      expect(result.warnings).toHaveLength(1)
      expect(result.warnings[0].type).toBe('high_force')
      expect(result.warnings[0].severity).toBe('danger')
      expect(result.warnings[0].message).toContain('Very high cutting force')
      expect(result.warnings[0].message).toContain('4500 N')
    })

    it('should generate moderate force warnings', () => {
      const moderateForceScenario = calculateCuttingForce(testMaterial, testTool, 6.0, 0.2)

      // Force = 1.2 × 1.2 × 1000 = 1440 N
      // Force per mm = 1440 / 6 = 240 N/mm (< 300, no warning)
      expect(moderateForceScenario.warnings).toHaveLength(0)

      // Now test a scenario that triggers warning level
      const highForceCoeff: Material = { ...testMaterial, force_coeff_kn_mm2: 1.8 }
      const result = calculateCuttingForce(highForceCoeff, testTool, 6.0, 0.2)

      // Force = 1.8 × 1.2 × 1000 = 2160 N
      // Force per mm = 2160 / 6 = 360 N/mm (> 300 but < 500, should be warning)
      expect(result.warnings).toHaveLength(1)
      expect(result.warnings[0].severity).toBe('warning')
      expect(result.warnings[0].message).toContain('High cutting force')
    })

    it('should handle edge cases', () => {
      // Zero chip area
      const zeroAreaResult = calculateCuttingForce(testMaterial, testTool, 0, 0.1)
      expect(zeroAreaResult.chipAreaMm2).toBe(0)
      expect(zeroAreaResult.totalForceN).toBe(0)
      expect(zeroAreaResult.warnings).toHaveLength(0)

      // Zero chipload
      const zeroChiploadResult = calculateCuttingForce(testMaterial, testTool, 3.0, 0)
      expect(zeroChiploadResult.chipAreaMm2).toBe(0)
      expect(zeroChiploadResult.totalForceN).toBe(0)
    })

    it('should work with different tool types and their multipliers', () => {
      const testCases = [
        { type: 'endmill_flat' as const, multiplier: 1.0 },
        { type: 'drill' as const, multiplier: 1.5 },
        { type: 'vbit' as const, multiplier: 0.8 },
        { type: 'facemill' as const, multiplier: 0.6 },
        { type: 'boring' as const, multiplier: 1.2 },
        { type: 'slitting' as const, multiplier: 1.3 }
      ]

      testCases.forEach(({ type, multiplier }) => {
        const tool: Tool = { ...testTool, type }
        const result = calculateCuttingForce(testMaterial, tool, 2.0, 0.1)

        // Base force should be same for all: 1.2 × 0.2 × 1000 = 240 N
        expect(result.baseForceMaterialN).toBeCloseTo(240, 5)
        expect(result.toolForceMultiplier).toBe(multiplier)
        expect(result.totalForceN).toBeCloseTo(240 * multiplier, 5)
      })
    })

    it('should be consistent with different material force coefficients', () => {
      const materials = [
        { ...testMaterial, force_coeff_kn_mm2: 0.8 },
        { ...testMaterial, force_coeff_kn_mm2: 1.5 },
        { ...testMaterial, force_coeff_kn_mm2: 2.2 }
      ]

      materials.forEach(material => {
        const result = calculateCuttingForce(material, testTool, 2.0, 0.1)
        const expectedBaseForce = material.force_coeff_kn_mm2 * 0.2 * 1000
        expect(result.baseForceMaterialN).toBeCloseTo(expectedBaseForce, 5)
        expect(result.totalForceN).toBeCloseTo(expectedBaseForce * 1.0, 5) // Endmill multiplier
      })
    })
  })
})