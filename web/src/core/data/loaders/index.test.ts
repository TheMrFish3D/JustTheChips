import { describe, it, expect } from 'vitest'

import { loadMaterials, loadMachines, loadTools, loadSpindles, loadAllData } from './index.js'

describe('Data Loaders', () => {
  describe('loadMaterials', () => {
    it('should successfully load valid materials', () => {
      const validMaterials = [
        {
          id: 'test_material',
          category: 'Test',
          vc_range_m_min: [100, 200],
          fz_mm_per_tooth_by_diameter: {
            'dia_6': [0.1, 0.2]
          },
          force_coeff_kn_mm2: 1.5,
          specific_cutting_energy_j_mm3: 2.0,
          chip_thinning: {
            enable_below_fraction: 0.3,
            limit_factor: 2.0
          },
          max_engagement_fraction: 0.8
        }
      ]

      const result = loadMaterials(validMaterials)
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
      expect(result.data![0].id).toBe('test_material')
      expect(result.errors).toBeUndefined()
    })

    it('should handle invalid materials with helpful errors', () => {
      const invalidMaterials = [
        {
          id: '', // Invalid: empty ID
          category: 'Test',
          vc_range_m_min: [100, 200],
          fz_mm_per_tooth_by_diameter: {},
          force_coeff_kn_mm2: 1.5,
          specific_cutting_energy_j_mm3: 2.0,
          chip_thinning: {
            enable_below_fraction: 0.3,
            limit_factor: 2.0
          },
          max_engagement_fraction: 0.8
        },
        {
          id: 'valid_material',
          category: 'Test',
          vc_range_m_min: [200, 100], // Invalid: min > max
          fz_mm_per_tooth_by_diameter: {
            'dia_6': [0.1, 0.2]
          },
          force_coeff_kn_mm2: 1.5,
          specific_cutting_energy_j_mm3: 2.0,
          chip_thinning: {
            enable_below_fraction: 0.3,
            limit_factor: 2.0
          },
          max_engagement_fraction: 0.8
        }
      ]

      const result = loadMaterials(invalidMaterials)
      expect(result.success).toBe(false)
      expect(result.data).toHaveLength(0)
      expect(result.errors).toHaveLength(2)
      expect(result.errors![0]).toContain('Material at index 0')
      expect(result.errors![0]).toContain('Material ID is required')
      expect(result.errors![1]).toContain('Material at index 1')
      expect(result.errors![1]).toContain('vc_range min must be <= max')
    })

    it('should reject non-array input', () => {
      const result = loadMaterials({ not: 'an array' })
      expect(result.success).toBe(false)
      expect(result.errors).toEqual(['Expected an array of materials'])
    })
  })

  describe('loadMachines', () => {
    it('should successfully load valid machines', () => {
      const validMachines = [
        {
          id: 'test_machine',
          axis_max_feed_mm_min: 10000,
          rigidity_factor: 1.0,
          aggressiveness: {
            axial: 1.0,
            radial: 1.0,
            feed: 1.0
          }
        }
      ]

      const result = loadMachines(validMachines)
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
      expect(result.data![0].id).toBe('test_machine')
      expect(result.errors).toBeUndefined()
    })

    it('should handle invalid machines with helpful errors', () => {
      const invalidMachines = [
        {
          id: 'test_machine',
          axis_max_feed_mm_min: -5000, // Invalid: negative feed
          rigidity_factor: 1.0,
          aggressiveness: {
            axial: 1.0,
            radial: 1.0,
            feed: 1.0
          }
        }
      ]

      const result = loadMachines(invalidMachines)
      expect(result.success).toBe(false)
      expect(result.errors![0]).toContain('Machine at index 0')
      expect(result.errors![0]).toContain('Axis max feed must be positive')
    })

    it('should reject non-array input', () => {
      const result = loadMachines('not an array')
      expect(result.success).toBe(false)
      expect(result.errors).toEqual(['Expected an array of machines'])
    })
  })

  describe('loadTools', () => {
    it('should successfully load valid tools', () => {
      const validTools = [
        {
          id: 'test_tool',
          type: 'endmill_flat',
          diameter_mm: 6.0,
          flutes: 2,
          coating: 'TiAlN',
          stickout_mm: 25.0,
          material: 'carbide',
          default_doc_mm: 3.0,
          default_woc_mm: 1.8
        }
      ]

      const result = loadTools(validTools)
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
      expect(result.data![0].id).toBe('test_tool')
      expect(result.errors).toBeUndefined()
    })

    it('should handle invalid tools with helpful errors', () => {
      const invalidTools = [
        {
          id: 'test_tool',
          type: 'invalid_type', // Invalid type
          diameter_mm: 6.0,
          flutes: 2,
          coating: 'TiAlN',
          stickout_mm: 25.0,
          material: 'carbide',
          default_doc_mm: 3.0,
          default_woc_mm: 1.8
        }
      ]

      const result = loadTools(invalidTools)
      expect(result.success).toBe(false)
      expect(result.errors![0]).toContain('Tool at index 0')
    })

    it('should reject non-array input', () => {
      const result = loadTools(123)
      expect(result.success).toBe(false)
      expect(result.errors).toEqual(['Expected an array of tools'])
    })
  })

  describe('loadSpindles', () => {
    it('should successfully load valid spindles', () => {
      const validSpindles = [
        {
          id: 'test_spindle',
          rated_power_kw: 2.2,
          rpm_min: 100,
          rpm_max: 24000,
          base_rpm: 1000,
          power_curve: [
            { rpm: 100, power_kw: 0.2 },
            { rpm: 1000, power_kw: 2.2 },
            { rpm: 24000, power_kw: 0.8 }
          ]
        }
      ]

      const result = loadSpindles(validSpindles)
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
      expect(result.data![0].id).toBe('test_spindle')
      expect(result.errors).toBeUndefined()
    })

    it('should handle invalid spindles with helpful errors', () => {
      const invalidSpindles = [
        {
          id: 'test_spindle',
          rated_power_kw: 2.2,
          rpm_min: 24000, // Invalid: min > max
          rpm_max: 100,
          base_rpm: 1000,
          power_curve: [
            { rpm: 100, power_kw: 0.2 }
          ]
        }
      ]

      const result = loadSpindles(invalidSpindles)
      expect(result.success).toBe(false)
      expect(result.errors![0]).toContain('Spindle at index 0')
      expect(result.errors![0]).toContain('Minimum RPM must be <= maximum RPM')
    })

    it('should reject non-array input', () => {
      const result = loadSpindles(null)
      expect(result.success).toBe(false)
      expect(result.errors).toEqual(['Expected an array of spindles'])
    })
  })

  describe('loadAllData', () => {
    it('should load all domain data successfully', () => {
      const testData = {
        materials: [
          {
            id: 'test_material',
            category: 'Test',
            vc_range_m_min: [100, 200],
            fz_mm_per_tooth_by_diameter: { 'dia_6': [0.1, 0.2] },
            force_coeff_kn_mm2: 1.5,
            specific_cutting_energy_j_mm3: 2.0,
            chip_thinning: { enable_below_fraction: 0.3, limit_factor: 2.0 },
            max_engagement_fraction: 0.8
          }
        ],
        machines: [
          {
            id: 'test_machine',
            axis_max_feed_mm_min: 10000,
            rigidity_factor: 1.0,
            aggressiveness: { axial: 1.0, radial: 1.0, feed: 1.0 }
          }
        ],
        tools: [
          {
            id: 'test_tool',
            type: 'endmill_flat',
            diameter_mm: 6.0,
            flutes: 2,
            coating: 'TiAlN',
            stickout_mm: 25.0,
            material: 'carbide',
            default_doc_mm: 3.0,
            default_woc_mm: 1.8
          }
        ],
        spindles: [
          {
            id: 'test_spindle',
            rated_power_kw: 2.2,
            rpm_min: 100,
            rpm_max: 24000,
            base_rpm: 1000,
            power_curve: [{ rpm: 100, power_kw: 0.2 }]
          }
        ]
      }

      const result = loadAllData(testData)
      expect(result.materials.success).toBe(true)
      expect(result.machines.success).toBe(true)
      expect(result.tools.success).toBe(true)
      expect(result.spindles.success).toBe(true)
      expect(result.materials.data).toHaveLength(1)
      expect(result.machines.data).toHaveLength(1)
      expect(result.tools.data).toHaveLength(1)
      expect(result.spindles.data).toHaveLength(1)
    })

    it('should handle empty data gracefully', () => {
      const result = loadAllData({})
      expect(result.materials.success).toBe(true)
      expect(result.machines.success).toBe(true)
      expect(result.tools.success).toBe(true)
      expect(result.spindles.success).toBe(true)
      expect(result.materials.data).toHaveLength(0)
      expect(result.machines.data).toHaveLength(0)
      expect(result.tools.data).toHaveLength(0)
      expect(result.spindles.data).toHaveLength(0)
    })

    it('should handle mixed valid and invalid data', () => {
      const testData = {
        materials: [{ invalid: 'material' }],
        machines: [
          {
            id: 'valid_machine',
            axis_max_feed_mm_min: 10000,
            rigidity_factor: 1.0,
            aggressiveness: { axial: 1.0, radial: 1.0, feed: 1.0 }
          }
        ]
      }

      const result = loadAllData(testData)
      expect(result.materials.success).toBe(false)
      expect(result.machines.success).toBe(true)
      expect(result.tools.success).toBe(true) // Empty data
      expect(result.spindles.success).toBe(true) // Empty data
      expect(result.materials.errors).toBeDefined()
      expect(result.machines.data).toHaveLength(1)
    })
  })
})