import { describe, expect, it } from 'vitest'

import { ToolSchema, validateTool, safeParseTool } from './tool.js'

describe('Tool Schema', () => {
  const validTool = {
    id: 'endmill_6mm_carbide',
    type: 'endmill_flat' as const,
    diameter_mm: 6.0,
    flutes: 4,
    coating: 'TiAlN',
    stickout_mm: 20.0,
    material: 'carbide',
    default_doc_mm: 3.0,
    default_woc_mm: 1.5,
    metadata: {
      angle_deg: 30.0,
      body_diameter_mm: 6.0
    }
  }

  describe('Valid data', () => {
    it('should accept valid tool data', () => {
      const result = ToolSchema.parse(validTool)
      expect(result).toEqual(validTool)
    })

    it('should validate with validateTool function', () => {
      const result = validateTool(validTool)
      expect(result).toEqual(validTool)
    })

    it('should safely parse valid data', () => {
      const result = safeParseTool(validTool)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validTool)
      }
    })

    it('should accept tool without metadata', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { metadata: _, ...toolWithoutMeta } = validTool
      const result = ToolSchema.parse(toolWithoutMeta)
      expect(result).toEqual(toolWithoutMeta)
    })

    it('should accept all valid tool types', () => {
      const toolTypes = ['endmill_flat', 'drill', 'vbit', 'facemill', 'boring', 'slitting'] as const
      
      toolTypes.forEach(type => {
        const tool = { ...validTool, type }
        const result = safeParseTool(tool)
        expect(result.success).toBe(true)
      })
    })
  })

  describe('Invalid data', () => {
    it('should reject tool with empty id', () => {
      const invalidTool = { ...validTool, id: '' }
      const result = safeParseTool(invalidTool)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Tool ID is required')
      }
    })

    it('should reject invalid tool type', () => {
      const invalidTool = { ...validTool, type: 'invalid_type' }
      const result = safeParseTool(invalidTool)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_value')
      }
    })

    it('should reject negative diameter', () => {
      const invalidTool = { ...validTool, diameter_mm: -6.0 }
      const result = safeParseTool(invalidTool)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Tool diameter must be positive')
      }
    })

    it('should reject zero diameter', () => {
      const invalidTool = { ...validTool, diameter_mm: 0 }
      const result = safeParseTool(invalidTool)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Tool diameter must be positive')
      }
    })

    it('should reject non-integer flutes', () => {
      const invalidTool = { ...validTool, flutes: 3.5 }
      const result = safeParseTool(invalidTool)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_type')
      }
    })

    it('should reject negative flutes', () => {
      const invalidTool = { ...validTool, flutes: -2 }
      const result = safeParseTool(invalidTool)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Flute count must be a positive integer')
      }
    })

    it('should reject empty coating', () => {
      const invalidTool = { ...validTool, coating: '' }
      const result = safeParseTool(invalidTool)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Coating is required')
      }
    })

    it('should reject negative stickout', () => {
      const invalidTool = { ...validTool, stickout_mm: -10.0 }
      const result = safeParseTool(invalidTool)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Stickout must be positive')
      }
    })

    it('should reject empty material', () => {
      const invalidTool = { ...validTool, material: '' }
      const result = safeParseTool(invalidTool)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Tool material is required')
      }
    })

    it('should reject negative default DOC', () => {
      const invalidTool = { ...validTool, default_doc_mm: -1.0 }
      const result = safeParseTool(invalidTool)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Default DOC must be positive')
      }
    })

    it('should reject negative default WOC', () => {
      const invalidTool = { ...validTool, default_woc_mm: -0.5 }
      const result = safeParseTool(invalidTool)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Default WOC must be positive')
      }
    })

    it('should reject negative body diameter in metadata', () => {
      const invalidTool = { 
        ...validTool, 
        metadata: { ...validTool.metadata, body_diameter_mm: -5.0 }
      }
      const result = safeParseTool(invalidTool)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Too small')
      }
    })

    it('should reject missing required fields', () => {
      const invalidTool = { id: 'test', type: 'endmill_flat' } // Missing required fields
      const result = safeParseTool(invalidTool)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0)
      }
    })
  })
})