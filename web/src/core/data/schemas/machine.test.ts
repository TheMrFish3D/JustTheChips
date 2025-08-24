import { describe, expect, it } from 'vitest'

import { MachineSchema, validateMachine, safeParseMachine } from './machine.js'

describe('Machine Schema', () => {
  const validMachine = {
    id: 'haas_vf2',
    axis_max_feed_mm_min: 15000,
    rigidity_factor: 1.2,
    aggressiveness: {
      axial: 1.0,
      radial: 0.8,
      feed: 1.1
    }
  }

  describe('Valid data', () => {
    it('should accept valid machine data', () => {
      const result = MachineSchema.parse(validMachine)
      expect(result).toEqual(validMachine)
    })

    it('should validate with validateMachine function', () => {
      const result = validateMachine(validMachine)
      expect(result).toEqual(validMachine)
    })

    it('should safely parse valid data', () => {
      const result = safeParseMachine(validMachine)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validMachine)
      }
    })
  })

  describe('Invalid data', () => {
    it('should reject machine with empty id', () => {
      const invalidMachine = { ...validMachine, id: '' }
      const result = safeParseMachine(invalidMachine)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Machine ID is required')
      }
    })

    it('should reject negative axis max feed', () => {
      const invalidMachine = { ...validMachine, axis_max_feed_mm_min: -1000 }
      const result = safeParseMachine(invalidMachine)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Axis max feed must be positive')
      }
    })

    it('should reject zero axis max feed', () => {
      const invalidMachine = { ...validMachine, axis_max_feed_mm_min: 0 }
      const result = safeParseMachine(invalidMachine)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Axis max feed must be positive')
      }
    })

    it('should reject negative rigidity factor', () => {
      const invalidMachine = { ...validMachine, rigidity_factor: -0.5 }
      const result = safeParseMachine(invalidMachine)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Rigidity factor must be positive')
      }
    })

    it('should reject negative axial aggressiveness', () => {
      const invalidMachine = { 
        ...validMachine, 
        aggressiveness: { axial: -1.0, radial: 0.8, feed: 1.1 }
      }
      const result = safeParseMachine(invalidMachine)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Axial aggressiveness must be positive')
      }
    })

    it('should reject negative radial aggressiveness', () => {
      const invalidMachine = { 
        ...validMachine, 
        aggressiveness: { axial: 1.0, radial: -0.8, feed: 1.1 }
      }
      const result = safeParseMachine(invalidMachine)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Radial aggressiveness must be positive')
      }
    })

    it('should reject negative feed aggressiveness', () => {
      const invalidMachine = { 
        ...validMachine, 
        aggressiveness: { axial: 1.0, radial: 0.8, feed: -1.1 }
      }
      const result = safeParseMachine(invalidMachine)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Feed aggressiveness must be positive')
      }
    })

    it('should reject missing required fields', () => {
      const invalidMachine = { id: 'test' } // Missing required fields
      const result = safeParseMachine(invalidMachine)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0)
      }
    })

    it('should reject incomplete aggressiveness object', () => {
      const invalidMachine = { 
        ...validMachine, 
        aggressiveness: { axial: 1.0 } // Missing radial and feed
      }
      const result = safeParseMachine(invalidMachine)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(2) // Missing radial and feed
      }
    })
  })
})