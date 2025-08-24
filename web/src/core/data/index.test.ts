import { describe, it, expect } from 'vitest'

import { materials, machines, tools, spindles } from './index.js'

describe('Data Integration', () => {
  describe('Materials Dataset', () => {
    it('should load materials from JSON datasets', () => {
      expect(materials).toHaveLength(3)
      expect(materials[0].id).toBe('aluminum_6061')
      expect(materials[0].category).toBe('Aluminum')
      expect(materials[1].id).toBe('steel_1045')
      expect(materials[2].id).toBe('stainless_316')
    })

    it('should have valid material properties', () => {
      const aluminum = materials.find(m => m.id === 'aluminum_6061')
      expect(aluminum).toBeDefined()
      expect(aluminum!.vc_range_m_min).toEqual([150, 300])
      expect(aluminum!.force_coeff_kn_mm2).toBe(0.8)
      expect(aluminum!.chip_thinning.enable_below_fraction).toBe(0.3)
    })
  })

  describe('Machines Dataset', () => {
    it('should load machines from JSON datasets', () => {
      expect(machines).toHaveLength(3)
      expect(machines[0].id).toBe('haas_vf2')
      expect(machines[1].id).toBe('tormach_1100mx')
      expect(machines[2].id).toBe('makino_v33i')
    })

    it('should have valid machine properties', () => {
      const haas = machines.find(m => m.id === 'haas_vf2')
      expect(haas).toBeDefined()
      expect(haas!.axis_max_feed_mm_min).toBe(15000)
      expect(haas!.rigidity_factor).toBe(1.0)
      expect(haas!.aggressiveness.axial).toBe(1.0)
    })
  })

  describe('Tools Dataset', () => {
    it('should load tools from JSON datasets', () => {
      expect(tools).toHaveLength(5)
      expect(tools[0].id).toBe('endmill_6mm_carbide')
      expect(tools[0].type).toBe('endmill_flat')
      expect(tools.some(t => t.type === 'drill')).toBe(true)
      expect(tools.some(t => t.type === 'vbit')).toBe(true)
      expect(tools.some(t => t.type === 'facemill')).toBe(true)
    })

    it('should have valid tool properties', () => {
      const endmill = tools.find(t => t.id === 'endmill_6mm_carbide')
      expect(endmill).toBeDefined()
      expect(endmill!.diameter_mm).toBe(6.0)
      expect(endmill!.flutes).toBe(2)
      expect(endmill!.coating).toBe('TiAlN')
      expect(endmill!.material).toBe('carbide')
    })

    it('should have vbit with metadata', () => {
      const vbit = tools.find(t => t.type === 'vbit')
      expect(vbit).toBeDefined()
      expect(vbit!.metadata).toBeDefined()
      expect(vbit!.metadata!.angle_deg).toBe(90)
    })
  })

  describe('Spindles Dataset', () => {
    it('should load spindles from JSON datasets', () => {
      expect(spindles).toHaveLength(3)
      expect(spindles[0].id).toBe('spindle_2_2kw')
      expect(spindles[1].id).toBe('spindle_7_5kw')
      expect(spindles[2].id).toBe('spindle_0_8kw_high_speed')
    })

    it('should have valid spindle properties', () => {
      const spindle = spindles.find(s => s.id === 'spindle_2_2kw')
      expect(spindle).toBeDefined()
      expect(spindle!.rated_power_kw).toBe(2.2)
      expect(spindle!.rpm_min).toBe(100)
      expect(spindle!.rpm_max).toBe(24000)
      expect(spindle!.base_rpm).toBe(1000)
      expect(spindle!.power_curve).toHaveLength(6)
    })

    it('should have valid power curves', () => {
      const highSpeed = spindles.find(s => s.id === 'spindle_0_8kw_high_speed')
      expect(highSpeed).toBeDefined()
      expect(highSpeed!.rpm_max).toBe(60000)
      expect(highSpeed!.power_curve[0].rpm).toBe(500)
      expect(highSpeed!.power_curve[0].power_kw).toBe(0.05)
    })
  })

  describe('Data Consistency', () => {
    it('should have unique IDs within each dataset', () => {
      const materialIds = materials.map(m => m.id)
      const machineIds = machines.map(m => m.id)
      const toolIds = tools.map(t => t.id)
      const spindleIds = spindles.map(s => s.id)

      expect(new Set(materialIds).size).toBe(materialIds.length)
      expect(new Set(machineIds).size).toBe(machineIds.length)
      expect(new Set(toolIds).size).toBe(toolIds.length)
      expect(new Set(spindleIds).size).toBe(spindleIds.length)
    })

    it('should have realistic property ranges', () => {
      // Check that all materials have reasonable values
      materials.forEach(material => {
        expect(material.vc_range_m_min[0]).toBeGreaterThan(0)
        expect(material.vc_range_m_min[1]).toBeGreaterThan(material.vc_range_m_min[0])
        expect(material.force_coeff_kn_mm2).toBeGreaterThan(0)
        expect(material.specific_cutting_energy_j_mm3).toBeGreaterThan(0)
      })

      // Check that all tools have reasonable diameters
      tools.forEach(tool => {
        expect(tool.diameter_mm).toBeGreaterThan(0)
        expect(tool.diameter_mm).toBeLessThan(100) // Reasonable max diameter
        expect(tool.flutes).toBeGreaterThan(0)
        expect(tool.stickout_mm).toBeGreaterThan(0)
      })

      // Check that all spindles have reasonable power curves
      spindles.forEach(spindle => {
        expect(spindle.power_curve.length).toBeGreaterThan(0)
        spindle.power_curve.forEach(point => {
          expect(point.rpm).toBeGreaterThanOrEqual(spindle.rpm_min)
          expect(point.rpm).toBeLessThanOrEqual(spindle.rpm_max)
          expect(point.power_kw).toBeGreaterThanOrEqual(0)
        })
      })
    })
  })
})