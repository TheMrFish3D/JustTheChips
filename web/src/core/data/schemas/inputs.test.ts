import { describe, expect, it } from 'vitest'

import { InputsSchema, CutTypeSchema, validateInputs, safeParseInputs } from './inputs.js'

describe('CutType Schema', () => {
  describe('Valid data', () => {
    it('should accept all valid cut types', () => {
      const cutTypes = ['slot', 'profile', 'adaptive', 'facing', 'drilling', 'boring'] as const
      
      cutTypes.forEach(cutType => {
        const result = CutTypeSchema.parse(cutType)
        expect(result).toBe(cutType)
      })
    })
  })

  describe('Invalid data', () => {
    it('should reject invalid cut type', () => {
      const invalidCutType = 'invalid_cut'
      const result = CutTypeSchema.safeParse(invalidCutType)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_value')
      }
    })
  })
})

describe('Inputs Schema', () => {
  const validInputs = {
    machineId: 'haas_vf2',
    spindleId: 'spindle_2_2kw',
    toolId: 'endmill_6mm_carbide',
    materialId: 'aluminum_6061',
    cutType: 'slot' as const,
    aggressiveness: 1.2,
    user_doc_mm: 3.0,
    user_woc_mm: 1.5,
    override_flutes: 4,
    override_stickout_mm: 25.0
  }

  describe('Valid data', () => {
    it('should accept valid inputs data', () => {
      const result = InputsSchema.parse(validInputs)
      expect(result).toEqual(validInputs)
    })

    it('should validate with validateInputs function', () => {
      const result = validateInputs(validInputs)
      expect(result).toEqual(validInputs)
    })

    it('should safely parse valid data', () => {
      const result = safeParseInputs(validInputs)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validInputs)
      }
    })

    it('should accept minimal required fields', () => {
      const minimalInputs = {
        machineId: 'haas_vf2',
        spindleId: 'spindle_2_2kw',
        toolId: 'endmill_6mm_carbide',
        materialId: 'aluminum_6061',
        cutType: 'slot' as const
      }
      const result = safeParseInputs(minimalInputs)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.aggressiveness).toBe(1.0) // Default value
      }
    })

    it('should apply default aggressiveness when not provided', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { aggressiveness: _, ...inputsWithoutAggressiveness } = validInputs
      
      const result = InputsSchema.parse(inputsWithoutAggressiveness)
      expect(result.aggressiveness).toBe(1.0)
    })

    it('should accept inputs without optional fields', () => {
      const inputsWithoutOptional = {
        machineId: 'haas_vf2',
        spindleId: 'spindle_2_2kw',
        toolId: 'endmill_6mm_carbide',
        materialId: 'aluminum_6061',
        cutType: 'adaptive' as const,
        aggressiveness: 0.8
      }
      const result = safeParseInputs(inputsWithoutOptional)
      expect(result.success).toBe(true)
    })
  })

  describe('Invalid data', () => {
    it('should reject inputs with empty machineId', () => {
      const invalidInputs = { ...validInputs, machineId: '' }
      const result = safeParseInputs(invalidInputs)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Machine ID is required')
      }
    })

    it('should reject inputs with empty spindleId', () => {
      const invalidInputs = { ...validInputs, spindleId: '' }
      const result = safeParseInputs(invalidInputs)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Spindle ID is required')
      }
    })

    it('should reject inputs with empty toolId', () => {
      const invalidInputs = { ...validInputs, toolId: '' }
      const result = safeParseInputs(invalidInputs)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Tool ID is required')
      }
    })

    it('should reject inputs with empty materialId', () => {
      const invalidInputs = { ...validInputs, materialId: '' }
      const result = safeParseInputs(invalidInputs)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Material ID is required')
      }
    })

    it('should reject invalid cut type', () => {
      const invalidInputs = { ...validInputs, cutType: 'invalid_cut' as 'slot' }
      const result = safeParseInputs(invalidInputs)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_value')
      }
    })

    it('should reject negative aggressiveness', () => {
      const invalidInputs = { ...validInputs, aggressiveness: -0.5 }
      const result = safeParseInputs(invalidInputs)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Aggressiveness must be positive')
      }
    })

    it('should reject zero aggressiveness', () => {
      const invalidInputs = { ...validInputs, aggressiveness: 0 }
      const result = safeParseInputs(invalidInputs)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Aggressiveness must be positive')
      }
    })

    it('should reject negative user DOC', () => {
      const invalidInputs = { ...validInputs, user_doc_mm: -1.0 }
      const result = safeParseInputs(invalidInputs)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('User DOC must be positive')
      }
    })

    it('should reject negative user WOC', () => {
      const invalidInputs = { ...validInputs, user_woc_mm: -0.5 }
      const result = safeParseInputs(invalidInputs)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('User WOC must be positive')
      }
    })

    it('should reject non-integer override flutes', () => {
      const invalidInputs = { ...validInputs, override_flutes: 3.5 }
      const result = safeParseInputs(invalidInputs)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('invalid_type')
      }
    })

    it('should reject negative override flutes', () => {
      const invalidInputs = { ...validInputs, override_flutes: -2 }
      const result = safeParseInputs(invalidInputs)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Override flutes must be a positive integer')
      }
    })

    it('should reject negative override stickout', () => {
      const invalidInputs = { ...validInputs, override_stickout_mm: -10.0 }
      const result = safeParseInputs(invalidInputs)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Override stickout must be positive')
      }
    })

    it('should reject missing required fields', () => {
      const invalidInputs = { machineId: 'test' } // Missing required fields
      const result = safeParseInputs(invalidInputs)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0)
      }
    })
  })
})