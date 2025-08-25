import { describe, it, expect } from 'vitest'

import type { Machine, Material } from '../data/schemas/index.js'

import {
  classifyMachine,
  getHobbyMaterialAdjustment,
  applyHobbyAdjustments,
  validateHobbyDeflection,
  validateHobbyPower,
  MachineClass,
  type HobbyMaterialAdjustment
} from './hobbyMachineAdjustments.js'

describe('hobbyMachineAdjustments', () => {
  // Test machines representing different classes
  const ultraLightMachine: Machine = {
    id: '3018_cnc',
    axis_max_feed_mm_min: 800,
    rigidity_factor: 0.15,
    aggressiveness: { axial: 0.25, radial: 0.35, feed: 0.45 }
  }

  const mediumHobbyMachine: Machine = {
    id: 'lowrider_v3',
    axis_max_feed_mm_min: 2500,
    rigidity_factor: 0.25,
    aggressiveness: { axial: 0.35, radial: 0.45, feed: 0.55 }
  }

  const heavyHobbyMachine: Machine = {
    id: 'printnc',
    axis_max_feed_mm_min: 5000,
    rigidity_factor: 0.6,
    aggressiveness: { axial: 0.65, radial: 0.75, feed: 0.75 }
  }

  const entryCommercialMachine: Machine = {
    id: 'entry_vmc',
    axis_max_feed_mm_min: 8000,
    rigidity_factor: 0.8,
    aggressiveness: { axial: 0.75, radial: 0.85, feed: 0.85 }
  }

  // Test materials
  const aluminumMaterial: Material = {
    id: 'aluminum_6061',
    category: 'Aluminum',
    vc_range_m_min: [150, 300],
    fz_mm_per_tooth_by_diameter: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '6.0': [0.08, 0.15]
    },
    force_coeff_kn_mm2: 0.8,
    specific_cutting_energy_j_mm3: 0.7,
    chip_thinning: { enable_below_fraction: 0.3, limit_factor: 2.0 },
    max_engagement_fraction: 0.8
  }

  const steelMaterial: Material = {
    id: 'steel_1045',
    category: 'Carbon Steel',
    vc_range_m_min: [80, 150],
    fz_mm_per_tooth_by_diameter: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '6.0': [0.05, 0.12]
    },
    force_coeff_kn_mm2: 2.5,
    specific_cutting_energy_j_mm3: 2.8,
    chip_thinning: { enable_below_fraction: 0.25, limit_factor: 1.8 },
    max_engagement_fraction: 0.6
  }

  describe('classifyMachine', () => {
    it('should classify ultra-light machines correctly', () => {
      expect(classifyMachine(ultraLightMachine)).toBe(MachineClass.ULTRA_LIGHT)
    })

    it('should classify medium hobby machines correctly', () => {
      expect(classifyMachine(mediumHobbyMachine)).toBe(MachineClass.MEDIUM_HOBBY)
    })

    it('should classify heavy hobby machines correctly', () => {
      expect(classifyMachine(heavyHobbyMachine)).toBe(MachineClass.HEAVY_HOBBY)
    })

    it('should classify entry commercial machines correctly', () => {
      expect(classifyMachine(entryCommercialMachine)).toBe(MachineClass.ENTRY_COMMERCIAL)
    })
  })

  describe('getHobbyMaterialAdjustment', () => {
    it('should return aluminum adjustments for ultra-light machine', () => {
      const adjustment = getHobbyMaterialAdjustment(ultraLightMachine, aluminumMaterial)
      expect(adjustment).toBeDefined()
      expect(adjustment?.surfaceSpeedMultiplier).toBe(0.6)
      expect(adjustment?.chipLoadMultiplier).toBe(0.7)
      expect(adjustment?.maxRadialEngagement).toBe(0.25)
      expect(adjustment?.maxAxialEngagement).toBe(0.3)
    })

    it('should return steel adjustments for medium hobby machine', () => {
      const adjustment = getHobbyMaterialAdjustment(mediumHobbyMachine, steelMaterial)
      expect(adjustment).toBeDefined()
      expect(adjustment?.surfaceSpeedMultiplier).toBe(0.6)
      expect(adjustment?.chipLoadMultiplier).toBe(0.7)
      expect(adjustment?.maxRadialEngagement).toBe(0.25)
      expect(adjustment?.maxAxialEngagement).toBe(0.4)
    })

    it('should return null for unknown material', () => {
      const unknownMaterial: Material = {
        ...aluminumMaterial,
        id: 'unknown_material'
      }
      const adjustment = getHobbyMaterialAdjustment(ultraLightMachine, unknownMaterial)
      expect(adjustment).toBeNull()
    })
  })

  describe('applyHobbyAdjustments', () => {
    it('should apply surface speed and chip load multipliers', () => {
      const adjustment: HobbyMaterialAdjustment = {
        surfaceSpeedMultiplier: 0.6,
        chipLoadMultiplier: 0.7,
        maxRadialEngagement: 0.25,
        maxAxialEngagement: 0.3,
        forceReductionFactor: 0.8,
        recommendedStrategy: 'Test strategy',
        warningThresholds: { deflectionLimit: 0.015, powerLimit: 0.6 }
      }

      const baseParams = {
        surfaceSpeed: 200,
        chipLoad: 0.1,
        radialEngagement: 0.5,
        axialEngagement: 0.5
      }

      const result = applyHobbyAdjustments(baseParams, adjustment)

      expect(result.adjustedSurfaceSpeed).toBe(120) // 200 * 0.6
      expect(result.adjustedChipLoad).toBeCloseTo(0.07, 3) // 0.1 * 0.7 (handle floating point)
    })

    it('should limit engagement values to hobby-safe limits', () => {
      const adjustment: HobbyMaterialAdjustment = {
        surfaceSpeedMultiplier: 1.0,
        chipLoadMultiplier: 1.0,
        maxRadialEngagement: 0.25,
        maxAxialEngagement: 0.3,
        forceReductionFactor: 1.0,
        recommendedStrategy: 'Test strategy',
        warningThresholds: { deflectionLimit: 0.015, powerLimit: 0.6 }
      }

      const baseParams = {
        surfaceSpeed: 200,
        chipLoad: 0.1,
        radialEngagement: 0.8, // Exceeds limit
        axialEngagement: 1.0   // Exceeds limit
      }

      const result = applyHobbyAdjustments(baseParams, adjustment)

      expect(result.adjustedRadialEngagement).toBe(0.25)
      expect(result.adjustedAxialEngagement).toBe(0.3)
      expect(result.warnings).toHaveLength(3) // 2 engagement warnings + strategy
      expect(result.warnings[0]).toContain('Radial engagement limited')
      expect(result.warnings[1]).toContain('Axial engagement limited')
    })

    it('should include strategy recommendation in warnings', () => {
      const adjustment: HobbyMaterialAdjustment = {
        surfaceSpeedMultiplier: 1.0,
        chipLoadMultiplier: 1.0,
        maxRadialEngagement: 1.0,
        maxAxialEngagement: 10.0,
        forceReductionFactor: 1.0,
        recommendedStrategy: 'Use light passes with high RPM',
        warningThresholds: { deflectionLimit: 0.015, powerLimit: 0.6 }
      }

      const baseParams = {
        surfaceSpeed: 200,
        chipLoad: 0.1,
        radialEngagement: 0.3,
        axialEngagement: 0.5
      }

      const result = applyHobbyAdjustments(baseParams, adjustment)

      expect(result.warnings).toContain('Recommended strategy: Use light passes with high RPM')
    })
  })

  describe('validateHobbyDeflection', () => {
    const adjustment: HobbyMaterialAdjustment = {
      surfaceSpeedMultiplier: 1.0,
      chipLoadMultiplier: 1.0,
      maxRadialEngagement: 1.0,
      maxAxialEngagement: 10.0,
      forceReductionFactor: 1.0,
      recommendedStrategy: '',
      warningThresholds: { deflectionLimit: 0.015, powerLimit: 0.6 }
    }

    it('should pass validation for deflection within limits', () => {
      const result = validateHobbyDeflection(0.01, adjustment)
      expect(result.isValid).toBe(true)
      expect(result.warning).toBeUndefined()
    })

    it('should fail validation for excessive deflection', () => {
      const result = validateHobbyDeflection(0.02, adjustment)
      expect(result.isValid).toBe(false)
      expect(result.warning).toContain('Tool deflection')
      expect(result.warning).toContain('exceeds hobby machine limit')
    })
  })

  describe('validateHobbyPower', () => {
    const adjustment: HobbyMaterialAdjustment = {
      surfaceSpeedMultiplier: 1.0,
      chipLoadMultiplier: 1.0,
      maxRadialEngagement: 1.0,
      maxAxialEngagement: 10.0,
      forceReductionFactor: 1.0,
      recommendedStrategy: '',
      warningThresholds: { deflectionLimit: 0.015, powerLimit: 0.6 }
    }

    it('should pass validation for power within limits', () => {
      const result = validateHobbyPower(0.5, adjustment)
      expect(result.isValid).toBe(true)
      expect(result.warning).toBeUndefined()
    })

    it('should fail validation for excessive power usage', () => {
      const result = validateHobbyPower(0.8, adjustment)
      expect(result.isValid).toBe(false)
      expect(result.warning).toContain('Power usage')
      expect(result.warning).toContain('exceeds hobby machine limit')
    })
  })

  describe('edge cases', () => {
    it('should handle machine at rigidity boundaries correctly', () => {
      const boundaryMachine: Machine = {
        id: 'boundary_test',
        axis_max_feed_mm_min: 3000,
        rigidity_factor: 0.2, // Exactly at boundary
        aggressiveness: { axial: 0.5, radial: 0.5, feed: 0.5 }
      }

      expect(classifyMachine(boundaryMachine)).toBe(MachineClass.MEDIUM_HOBBY)
    })

    it('should handle zero engagement gracefully', () => {
      const adjustment: HobbyMaterialAdjustment = {
        surfaceSpeedMultiplier: 1.0,
        chipLoadMultiplier: 1.0,
        maxRadialEngagement: 1.0,
        maxAxialEngagement: 10.0,
        forceReductionFactor: 1.0,
        recommendedStrategy: '', // Empty strategy should not generate warning
        warningThresholds: { deflectionLimit: 0.015, powerLimit: 0.6 }
      }

      const baseParams = {
        surfaceSpeed: 200,
        chipLoad: 0.1,
        radialEngagement: 0,
        axialEngagement: 0
      }

      const result = applyHobbyAdjustments(baseParams, adjustment)

      expect(result.adjustedRadialEngagement).toBe(0)
      expect(result.adjustedAxialEngagement).toBe(0)
      expect(result.warnings).toHaveLength(0) // No warnings if strategy is empty
    })
  })
})