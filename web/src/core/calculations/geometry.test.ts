import { describe, expect, it } from 'vitest'

import type { Tool } from '../data/schemas/tool.js'

import { getEffectiveDiameter, getEffectiveFlutes } from './geometry.js'

describe('Geometry calculations', () => {
  describe('getEffectiveDiameter', () => {
    describe('endmill_flat tools', () => {
      it('should return diameter_mm for endmill_flat', () => {
        const tool: Tool = {
          id: 'test-endmill',
          type: 'endmill_flat',
          diameter_mm: 6.35,
          flutes: 2,
          coating: 'TiAlN',
          stickout_mm: 25.0,
          material: 'carbide',
          default_doc_mm: 3.0,
          default_woc_mm: 3.0
        }
        
        expect(getEffectiveDiameter(tool)).toBe(6.35)
      })

      it('should ignore DOC parameter for endmill_flat', () => {
        const tool: Tool = {
          id: 'test-endmill',
          type: 'endmill_flat',
          diameter_mm: 12.7,
          flutes: 4,
          coating: 'uncoated',
          stickout_mm: 30.0,
          material: 'HSS',
          default_doc_mm: 5.0,
          default_woc_mm: 6.0
        }
        
        expect(getEffectiveDiameter(tool, 10.0)).toBe(12.7)
      })
    })

    describe('drill tools', () => {
      it('should return diameter_mm for drill', () => {
        const tool: Tool = {
          id: 'test-drill',
          type: 'drill',
          diameter_mm: 8.0,
          flutes: 2,
          coating: 'TiN',
          stickout_mm: 40.0,
          material: 'carbide',
          default_doc_mm: 20.0,
          default_woc_mm: 8.0
        }
        
        expect(getEffectiveDiameter(tool)).toBe(8.0)
      })
    })

    describe('vbit tools', () => {
      it('should calculate effective diameter using tip diameter, angle, and DOC', () => {
        const tool: Tool = {
          id: 'test-vbit',
          type: 'vbit',
          diameter_mm: 0.1, // tip diameter
          flutes: 2,
          coating: 'uncoated',
          stickout_mm: 15.0,
          material: 'carbide',
          default_doc_mm: 1.0,
          default_woc_mm: 2.0,
          metadata: {
            angle_deg: 60
          }
        }
        
        // tipDiameter + 2 * tan(30°) * doc
        // 0.1 + 2 * tan(30°) * 2.0 = 0.1 + 2 * 0.577 * 2.0 ≈ 2.41
        const result = getEffectiveDiameter(tool, 2.0)
        expect(result).toBeCloseTo(2.41, 2)
      })

      it('should handle 90 degree V-bit', () => {
        const tool: Tool = {
          id: 'test-vbit-90',
          type: 'vbit',
          diameter_mm: 0.2,
          flutes: 1,
          coating: 'uncoated',
          stickout_mm: 20.0,
          material: 'carbide',
          default_doc_mm: 1.0,
          default_woc_mm: 1.0,
          metadata: {
            angle_deg: 90
          }
        }
        
        // tipDiameter + 2 * tan(45°) * doc
        // 0.2 + 2 * 1.0 * 1.5 = 0.2 + 3.0 = 3.2
        const result = getEffectiveDiameter(tool, 1.5)
        expect(result).toBeCloseTo(3.2, 2)
      })

      it('should throw error when angle_deg is missing', () => {
        const tool: Tool = {
          id: 'test-vbit-no-angle',
          type: 'vbit',
          diameter_mm: 0.1,
          flutes: 1,
          coating: 'uncoated',
          stickout_mm: 15.0,
          material: 'carbide',
          default_doc_mm: 1.0,
          default_woc_mm: 1.0
        }
        
        expect(() => getEffectiveDiameter(tool, 2.0)).toThrow('V-bit tools require angle_deg in metadata')
      })

      it('should throw error when DOC is not provided', () => {
        const tool: Tool = {
          id: 'test-vbit-no-doc',
          type: 'vbit',
          diameter_mm: 0.1,
          flutes: 1,
          coating: 'uncoated',
          stickout_mm: 15.0,
          material: 'carbide',
          default_doc_mm: 1.0,
          default_woc_mm: 1.0,
          metadata: {
            angle_deg: 60
          }
        }
        
        expect(() => getEffectiveDiameter(tool)).toThrow('V-bit effective diameter calculation requires depth of cut (doc)')
      })
    })

    describe('facemill tools', () => {
      it('should return body_diameter_mm for facemill', () => {
        const tool: Tool = {
          id: 'test-facemill',
          type: 'facemill',
          diameter_mm: 25.4, // individual cutter diameter
          flutes: 6,
          coating: 'TiAlN',
          stickout_mm: 50.0,
          material: 'carbide',
          default_doc_mm: 2.0,
          default_woc_mm: 20.0,
          metadata: {
            body_diameter_mm: 63.5 // actual cutting diameter
          }
        }
        
        expect(getEffectiveDiameter(tool)).toBe(63.5)
      })

      it('should throw error when body_diameter_mm is missing', () => {
        const tool: Tool = {
          id: 'test-facemill-no-body',
          type: 'facemill',
          diameter_mm: 25.4,
          flutes: 6,
          coating: 'TiAlN',
          stickout_mm: 50.0,
          material: 'carbide',
          default_doc_mm: 2.0,
          default_woc_mm: 20.0
        }
        
        expect(() => getEffectiveDiameter(tool)).toThrow('Facemill tools require body_diameter_mm in metadata')
      })
    })

    describe('slitting tools', () => {
      it('should return diameter_mm for slitting saw', () => {
        const tool: Tool = {
          id: 'test-slitting',
          type: 'slitting',
          diameter_mm: 75.0, // disk diameter
          flutes: 32,
          coating: 'uncoated',
          stickout_mm: 10.0,
          material: 'HSS',
          default_doc_mm: 1.0,
          default_woc_mm: 1.5
        }
        
        expect(getEffectiveDiameter(tool)).toBe(75.0)
      })
    })

    describe('boring tools', () => {
      it('should calculate boring diameter using offset and bit diameter', () => {
        const tool: Tool = {
          id: 'test-boring',
          type: 'boring',
          diameter_mm: 5.0, // offset
          flutes: 1,
          coating: 'uncoated',
          stickout_mm: 80.0,
          material: 'carbide',
          default_doc_mm: 10.0,
          default_woc_mm: 2.0,
          metadata: {
            body_diameter_mm: 8.0 // bit diameter
          }
        }
        
        // 2 * (offset + bit_diameter/2) = 2 * (5.0 + 8.0/2) = 2 * 9.0 = 18.0
        expect(getEffectiveDiameter(tool)).toBe(18.0)
      })

      it('should throw error when body_diameter_mm is missing', () => {
        const tool: Tool = {
          id: 'test-boring-no-bit',
          type: 'boring',
          diameter_mm: 5.0,
          flutes: 1,
          coating: 'uncoated',
          stickout_mm: 80.0,
          material: 'carbide',
          default_doc_mm: 10.0,
          default_woc_mm: 2.0
        }
        
        expect(() => getEffectiveDiameter(tool)).toThrow('Boring tools require body_diameter_mm in metadata (bit diameter)')
      })
    })

    describe('unknown tool types', () => {
      it('should throw error for unknown tool type', () => {
        const tool = {
          id: 'test-unknown',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
          type: 'unknown_type' as any,
          diameter_mm: 10.0,
          flutes: 2,
          coating: 'uncoated',
          stickout_mm: 25.0,
          material: 'carbide',
          default_doc_mm: 5.0,
          default_woc_mm: 5.0
        } as Tool
        
        expect(() => getEffectiveDiameter(tool)).toThrow('Unknown tool type: unknown_type')
      })
    })
  })

  describe('getEffectiveFlutes', () => {
    describe('standard tools', () => {
      it('should return flute count for endmill_flat', () => {
        const tool: Tool = {
          id: 'test-endmill',
          type: 'endmill_flat',
          diameter_mm: 6.35,
          flutes: 2,
          coating: 'TiAlN',
          stickout_mm: 25.0,
          material: 'carbide',
          default_doc_mm: 3.0,
          default_woc_mm: 3.0
        }
        
        expect(getEffectiveFlutes(tool)).toBe(2)
      })

      it('should return flute count for drill', () => {
        const tool: Tool = {
          id: 'test-drill',
          type: 'drill',
          diameter_mm: 8.0,
          flutes: 2,
          coating: 'TiN',
          stickout_mm: 40.0,
          material: 'carbide',
          default_doc_mm: 20.0,
          default_woc_mm: 8.0
        }
        
        expect(getEffectiveFlutes(tool)).toBe(2)
      })

      it('should return flute count for vbit', () => {
        const tool: Tool = {
          id: 'test-vbit',
          type: 'vbit',
          diameter_mm: 0.1,
          flutes: 1,
          coating: 'uncoated',
          stickout_mm: 15.0,
          material: 'carbide',
          default_doc_mm: 1.0,
          default_woc_mm: 1.0,
          metadata: {
            angle_deg: 60
          }
        }
        
        expect(getEffectiveFlutes(tool)).toBe(1)
      })
    })

    describe('special case tools', () => {
      it('should return flute count for facemill (may be reduced in future)', () => {
        const tool: Tool = {
          id: 'test-facemill',
          type: 'facemill',
          diameter_mm: 25.4,
          flutes: 6,
          coating: 'TiAlN',
          stickout_mm: 50.0,
          material: 'carbide',
          default_doc_mm: 2.0,
          default_woc_mm: 20.0,
          metadata: {
            body_diameter_mm: 63.5
          }
        }
        
        expect(getEffectiveFlutes(tool)).toBe(6)
      })

      it('should return flute count for slitting saw', () => {
        const tool: Tool = {
          id: 'test-slitting',
          type: 'slitting',
          diameter_mm: 75.0,
          flutes: 32,
          coating: 'uncoated',
          stickout_mm: 10.0,
          material: 'HSS',
          default_doc_mm: 1.0,
          default_woc_mm: 1.5
        }
        
        expect(getEffectiveFlutes(tool)).toBe(32)
      })

      it('should return 1 effective flute for boring tools', () => {
        const tool: Tool = {
          id: 'test-boring',
          type: 'boring',
          diameter_mm: 5.0,
          flutes: 1,
          coating: 'uncoated',
          stickout_mm: 80.0,
          material: 'carbide',
          default_doc_mm: 10.0,
          default_woc_mm: 2.0,
          metadata: {
            body_diameter_mm: 8.0
          }
        }
        
        expect(getEffectiveFlutes(tool)).toBe(1)
      })
    })

    describe('unknown tool types', () => {
      it('should throw error for unknown tool type', () => {
        const tool = {
          id: 'test-unknown',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
          type: 'unknown_type' as any,
          diameter_mm: 10.0,
          flutes: 2,
          coating: 'uncoated',
          stickout_mm: 25.0,
          material: 'carbide',
          default_doc_mm: 5.0,
          default_woc_mm: 5.0
        } as Tool
        
        expect(() => getEffectiveFlutes(tool)).toThrow('Unknown tool type: unknown_type')
      })
    })
  })
})