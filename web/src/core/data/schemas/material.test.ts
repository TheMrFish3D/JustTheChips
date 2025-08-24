import { describe, expect, it } from 'vitest'

import { MaterialSchema, validateMaterial, safeParseMaterial } from './material.js'

describe('Material Schema', () => {
  const validMaterial = {
    id: 'aluminum_6061',
    category: 'aluminum',
    vc_range_m_min: [100, 300] as [number, number],
    fz_mm_per_tooth_by_diameter: {
      'dia_3': [0.1, 0.2] as [number, number],
      'dia_6': [0.15, 0.25] as [number, number],
      'dia_12': [0.2, 0.3] as [number, number]
    },
    force_coeff_kn_mm2: 1.5,
    specific_cutting_energy_j_mm3: 0.8,
    chip_thinning: {
      enable_below_fraction: 0.5,
      limit_factor: 2.0
    },
    max_engagement_fraction: 0.75
  }

  describe('Valid data', () => {
    it('should accept valid material data', () => {
      const result = MaterialSchema.parse(validMaterial)
      expect(result).toEqual(validMaterial)
    })

    it('should validate with validateMaterial function', () => {
      const result = validateMaterial(validMaterial)
      expect(result).toEqual(validMaterial)
    })

    it('should safely parse valid data', () => {
      const result = safeParseMaterial(validMaterial)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validMaterial)
      }
    })
  })

  describe('Invalid data', () => {
    it('should reject material with empty id', () => {
      const invalidMaterial = { ...validMaterial, id: '' }
      const result = safeParseMaterial(invalidMaterial)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Material ID is required')
      }
    })

    it('should reject material with empty category', () => {
      const invalidMaterial = { ...validMaterial, category: '' }
      const result = safeParseMaterial(invalidMaterial)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Material category is required')
      }
    })

    it('should reject invalid vc_range where min > max', () => {
      const invalidMaterial = { ...validMaterial, vc_range_m_min: [300, 100] as [number, number] }
      const result = safeParseMaterial(invalidMaterial)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('vc_range min must be <= max')
      }
    })

    it('should reject negative force coefficient', () => {
      const invalidMaterial = { ...validMaterial, force_coeff_kn_mm2: -1.5 }
      const result = safeParseMaterial(invalidMaterial)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Force coefficient must be positive')
      }
    })

    it('should reject negative specific cutting energy', () => {
      const invalidMaterial = { ...validMaterial, specific_cutting_energy_j_mm3: -0.8 }
      const result = safeParseMaterial(invalidMaterial)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Specific cutting energy must be positive')
      }
    })

    it('should reject chip thinning enable_below_fraction > 1', () => {
      const invalidMaterial = { 
        ...validMaterial, 
        chip_thinning: { enable_below_fraction: 1.5, limit_factor: 2.0 }
      }
      const result = safeParseMaterial(invalidMaterial)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Enable below fraction must be <= 1')
      }
    })

    it('should reject negative chip thinning limit factor', () => {
      const invalidMaterial = { 
        ...validMaterial, 
        chip_thinning: { enable_below_fraction: 0.5, limit_factor: -2.0 }
      }
      const result = safeParseMaterial(invalidMaterial)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Limit factor must be positive')
      }
    })

    it('should reject max_engagement_fraction > 1', () => {
      const invalidMaterial = { ...validMaterial, max_engagement_fraction: 1.5 }
      const result = safeParseMaterial(invalidMaterial)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Max engagement fraction must be <= 1')
      }
    })

    it('should reject invalid chipload ranges where min > max', () => {
      const invalidMaterial = { 
        ...validMaterial, 
        fz_mm_per_tooth_by_diameter: {
          'dia_3': [0.2, 0.1] as [number, number] // min > max
        }
      }
      const result = safeParseMaterial(invalidMaterial)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('fz_range min must be <= max')
      }
    })

    it('should reject missing required fields', () => {
      const invalidMaterial = { id: 'test' } // Missing required fields
      const result = safeParseMaterial(invalidMaterial)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0)
      }
    })
  })
})