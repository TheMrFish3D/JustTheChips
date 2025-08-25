import { describe, it, expect } from 'vitest'

import {
  validateBundle,
  validateSettings,
  validateLibraries,
  safeParseBundle,
  safeParseSettings,
  safeParseLibraries
} from './bundle.js'

describe('Bundle Schema', () => {
  describe('SettingsSchema', () => {
    it('should validate empty settings', () => {
      const settings = {}
      const result = safeParseSettings(settings)
      expect(result.success).toBe(true)
    })

    it('should validate complete settings', () => {
      const settings = {
        machineId: 'haas-vf2',
        spindleId: 'haas-40-taper',
        toolId: 'endmill-6mm',
        materialId: 'aluminum-6061',
        cutType: 'slot',
        aggressiveness: 1.5,
        user_doc_mm: 2.0,
        user_woc_mm: 4.0,
        override_flutes: 4,
        override_stickout_mm: 25.0
      }
      const result = safeParseSettings(settings)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(settings)
      }
    })

    it('should reject invalid aggressiveness values', () => {
      const settings = { aggressiveness: -1 }
      const result = safeParseSettings(settings)
      expect(result.success).toBe(false)
    })

    it('should reject invalid cut type', () => {
      const settings = { cutType: 'invalid' }
      const result = safeParseSettings(settings)
      expect(result.success).toBe(false)
    })

    it('should reject negative numeric values', () => {
      const settings = { user_doc_mm: -1 }
      const result = safeParseSettings(settings)
      expect(result.success).toBe(false)
    })
  })

  describe('LibrariesSchema', () => {
    it('should validate empty libraries', () => {
      const libraries = {}
      const result = safeParseLibraries(libraries)
      expect(result.success).toBe(true)
    })

    it('should validate libraries with empty arrays', () => {
      const libraries = {
        materials: [],
        machines: [],
        tools: [],
        spindles: []
      }
      const result = safeParseLibraries(libraries)
      expect(result.success).toBe(true)
    })

    it('should validate libraries with valid data', () => {
      const libraries = {
        materials: [{
          id: 'test-material',
          category: 'Metal',
          vc_range_m_min: [100, 300],
          fz_mm_per_tooth_by_diameter: {
            'dia_6': [0.1, 0.3]
          },
          force_coeff_kn_mm2: 1000,
          specific_cutting_energy_j_mm3: 2.5,
          chip_thinning: {
            enable_below_fraction: 0.1,
            limit_factor: 2.0
          },
          max_engagement_fraction: 1.0
        }],
        tools: [{
          id: 'test-tool',
          type: 'endmill_flat',
          diameter_mm: 6.0,
          flutes: 2,
          coating: 'uncoated',
          stickout_mm: 25.0,
          material: 'carbide',
          default_doc_mm: 1.5,
          default_woc_mm: 3.0
        }]
      }
      const result = safeParseLibraries(libraries)
      expect(result.success).toBe(true)
    })

    it('should reject invalid material data', () => {
      const libraries = {
        materials: [{
          id: 'test',
          name: 'Test',
          // Missing required fields
        }]
      }
      const result = safeParseLibraries(libraries)
      expect(result.success).toBe(false)
    })
  })

  describe('BundleSchema', () => {
    it('should validate complete bundle', () => {
      const bundle = {
        version: '1.0' as const,
        timestamp: '2024-01-01T00:00:00.000Z',
        settings: {
          aggressiveness: 1.0
        },
        libraries: {
          materials: []
        }
      }
      const result = safeParseBundle(bundle)
      expect(result.success).toBe(true)
    })

    it('should reject invalid version', () => {
      const bundle = {
        version: '2.0',
        timestamp: '2024-01-01T00:00:00.000Z',
        settings: {},
        libraries: {}
      }
      const result = safeParseBundle(bundle)
      expect(result.success).toBe(false)
    })

    it('should reject missing required fields', () => {
      const bundle = {
        version: '1.0',
        // Missing timestamp, settings, libraries
      }
      const result = safeParseBundle(bundle)
      expect(result.success).toBe(false)
    })

    it('should validate nested settings and libraries', () => {
      const bundle = {
        version: '1.0' as const,
        timestamp: '2024-01-01T00:00:00.000Z',
        settings: {
          aggressiveness: 1.5,
          cutType: 'slot' as const
        },
        libraries: {
          materials: [{
            id: 'aluminum',
            category: 'Aluminum',
            vc_range_m_min: [200, 600],
            fz_mm_per_tooth_by_diameter: {
              'dia_6': [0.1, 0.3]
            },
            force_coeff_kn_mm2: 800,
            specific_cutting_energy_j_mm3: 2.0,
            chip_thinning: {
              enable_below_fraction: 0.1,
              limit_factor: 2.0
            },
            max_engagement_fraction: 1.0
          }]
        }
      }
      const result = safeParseBundle(bundle)
      expect(result.success).toBe(true)
    })
  })

  describe('Validation functions', () => {
    it('should throw on invalid data with validate functions', () => {
      expect(() => validateSettings({ aggressiveness: -1 })).toThrow()
      expect(() => validateLibraries({ materials: [{ invalid: true }] })).toThrow()
      expect(() => validateBundle({ version: '2.0' })).toThrow()
    })

    it('should return parsed data on valid input', () => {
      const settings = { aggressiveness: 1.0 }
      const result = validateSettings(settings)
      expect(result).toEqual(settings)

      const libraries = { materials: [] }
      const libResult = validateLibraries(libraries)
      expect(libResult).toEqual(libraries)

      const bundle = {
        version: '1.0' as const,
        timestamp: '2024-01-01T00:00:00.000Z',
        settings: {},
        libraries: {}
      }
      const bundleResult = validateBundle(bundle)
      expect(bundleResult).toEqual(bundle)
    })
  })
})