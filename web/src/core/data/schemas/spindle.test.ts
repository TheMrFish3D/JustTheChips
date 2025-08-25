import { describe, expect, it } from 'vitest'

import { SpindleSchema, PowerCurvePointSchema, validateSpindle, safeParseSpindle } from './spindle.js'

describe('PowerCurvePoint Schema', () => {
  describe('Valid data', () => {
    it('should accept valid power curve point', () => {
      const validPoint = { rpm: 12000, power_kw: 2.5 }
      const result = PowerCurvePointSchema.parse(validPoint)
      expect(result).toEqual(validPoint)
    })

    it('should accept zero power', () => {
      const validPoint = { rpm: 1000, power_kw: 0 }
      const result = PowerCurvePointSchema.parse(validPoint)
      expect(result).toEqual(validPoint)
    })
  })

  describe('Invalid data', () => {
    it('should reject negative rpm', () => {
      const invalidPoint = { rpm: -1000, power_kw: 2.0 }
      const result = PowerCurvePointSchema.safeParse(invalidPoint)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('RPM must be positive')
      }
    })

    it('should reject negative power', () => {
      const invalidPoint = { rpm: 12000, power_kw: -1.0 }
      const result = PowerCurvePointSchema.safeParse(invalidPoint)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Power must be non-negative')
      }
    })
  })
})

describe('Spindle Schema', () => {
  const validSpindle = {
    id: 'spindle_2_2kw',
    rated_power_kw: 2.2,
    rpm_min: 6000,
    rpm_max: 24000,
    base_rpm: 12000,
    power_curve: [
      { rpm: 6000, power_kw: 1.1 },
      { rpm: 12000, power_kw: 2.2 },
      { rpm: 18000, power_kw: 2.0 },
      { rpm: 24000, power_kw: 1.8 }
    ]
  }

  describe('Valid data', () => {
    it('should accept valid spindle data', () => {
      const result = SpindleSchema.parse(validSpindle)
      expect(result).toEqual({ ...validSpindle, type: 'vfd_spindle' })
    })

    it('should validate with validateSpindle function', () => {
      const result = validateSpindle(validSpindle)
      expect(result).toEqual({ ...validSpindle, type: 'vfd_spindle' })
    })

    it('should safely parse valid data', () => {
      const result = safeParseSpindle(validSpindle)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual({ ...validSpindle, type: 'vfd_spindle' })
      }
    })

    it('should accept base_rpm equal to rpm_min', () => {
      const spindle = { ...validSpindle, base_rpm: validSpindle.rpm_min }
      const result = safeParseSpindle(spindle)
      expect(result.success).toBe(true)
    })

    it('should accept base_rpm equal to rpm_max', () => {
      const spindle = { ...validSpindle, base_rpm: validSpindle.rpm_max }
      const result = safeParseSpindle(spindle)
      expect(result.success).toBe(true)
    })

    it('should accept single power curve point', () => {
      const spindle = { 
        ...validSpindle, 
        power_curve: [{ rpm: 12000, power_kw: 2.2 }]
      }
      const result = safeParseSpindle(spindle)
      expect(result.success).toBe(true)
    })

    it('should default to vfd_spindle type when not specified', () => {
      const result = SpindleSchema.parse(validSpindle)
      expect(result.type).toBe('vfd_spindle')
    })

    it('should accept explicit router type', () => {
      const routerSpindle = { ...validSpindle, type: 'router' as const }
      const result = SpindleSchema.parse(routerSpindle)
      expect(result.type).toBe('router')
    })

    it('should accept explicit vfd_spindle type', () => {
      const vfdSpindle = { ...validSpindle, type: 'vfd_spindle' as const }
      const result = SpindleSchema.parse(vfdSpindle)
      expect(result.type).toBe('vfd_spindle')
    })
  })

  describe('Invalid data', () => {
    it('should reject spindle with empty id', () => {
      const invalidSpindle = { ...validSpindle, id: '' }
      const result = safeParseSpindle(invalidSpindle)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Spindle ID is required')
      }
    })

    it('should reject negative rated power', () => {
      const invalidSpindle = { ...validSpindle, rated_power_kw: -2.2 }
      const result = safeParseSpindle(invalidSpindle)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Rated power must be positive')
      }
    })

    it('should reject negative rpm_min', () => {
      const invalidSpindle = { ...validSpindle, rpm_min: -1000 }
      const result = safeParseSpindle(invalidSpindle)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Minimum RPM must be positive')
      }
    })

    it('should reject negative rpm_max', () => {
      const invalidSpindle = { ...validSpindle, rpm_max: -24000 }
      const result = safeParseSpindle(invalidSpindle)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Maximum RPM must be positive')
      }
    })

    it('should reject rpm_min > rpm_max', () => {
      const invalidSpindle = { ...validSpindle, rpm_min: 25000, rpm_max: 24000 }
      const result = safeParseSpindle(invalidSpindle)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Minimum RPM must be <= maximum RPM')
      }
    })

    it('should reject base_rpm below rpm_min', () => {
      const invalidSpindle = { ...validSpindle, base_rpm: 5000 }
      const result = safeParseSpindle(invalidSpindle)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Base RPM must be within min/max RPM range')
      }
    })

    it('should reject base_rpm above rpm_max', () => {
      const invalidSpindle = { ...validSpindle, base_rpm: 25000 }
      const result = safeParseSpindle(invalidSpindle)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Base RPM must be within min/max RPM range')
      }
    })

    it('should reject empty power curve', () => {
      const invalidSpindle = { ...validSpindle, power_curve: [] }
      const result = safeParseSpindle(invalidSpindle)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Power curve must have at least one point')
      }
    })

    it('should reject power curve with invalid point', () => {
      const invalidSpindle = { 
        ...validSpindle, 
        power_curve: [{ rpm: -1000, power_kw: 2.0 }]
      }
      const result = safeParseSpindle(invalidSpindle)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('RPM must be positive')
      }
    })

    it('should reject missing required fields', () => {
      const invalidSpindle = { id: 'test' } // Missing required fields
      const result = safeParseSpindle(invalidSpindle)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0)
      }
    })
  })
})