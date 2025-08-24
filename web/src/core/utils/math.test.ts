import { describe, expect, it } from 'vitest'

import { clamp, lerp } from './math.js'

describe('Math utilities', () => {
  describe('clamp', () => {
    it('should return the value when within range', () => {
      expect(clamp(5, 1, 10)).toBe(5)
      expect(clamp(0, -5, 5)).toBe(0)
      expect(clamp(-2, -10, 10)).toBe(-2)
    })

    it('should clamp to minimum when value is below range', () => {
      expect(clamp(-5, 1, 10)).toBe(1)
      expect(clamp(0, 5, 10)).toBe(5)
      expect(clamp(-100, -50, 50)).toBe(-50)
    })

    it('should clamp to maximum when value is above range', () => {
      expect(clamp(15, 1, 10)).toBe(10)
      expect(clamp(100, 0, 50)).toBe(50)
      expect(clamp(25, -10, 20)).toBe(20)
    })

    it('should handle edge cases with equal min and max', () => {
      expect(clamp(5, 10, 10)).toBe(10)
      expect(clamp(15, 10, 10)).toBe(10)
      expect(clamp(8, 10, 10)).toBe(10)
    })

    it('should handle floating point numbers', () => {
      expect(clamp(3.14, 2.5, 4.0)).toBe(3.14)
      expect(clamp(1.5, 2.0, 3.0)).toBe(2.0)
      expect(clamp(4.5, 2.0, 3.0)).toBe(3.0)
    })

    it('should handle negative ranges', () => {
      expect(clamp(-5, -10, -1)).toBe(-5)
      expect(clamp(-15, -10, -1)).toBe(-10)
      expect(clamp(0, -10, -1)).toBe(-1)
    })
  })

  describe('lerp', () => {
    it('should return start value when t is 0', () => {
      expect(lerp(10, 20, 0)).toBe(10)
      expect(lerp(-5, 15, 0)).toBe(-5)
      expect(lerp(3.14, 2.71, 0)).toBe(3.14)
    })

    it('should return end value when t is 1', () => {
      expect(lerp(10, 20, 1)).toBe(20)
      expect(lerp(-5, 15, 1)).toBe(15)
      expect(lerp(3.14, 2.71, 1)).toBe(2.71)
    })

    it('should interpolate correctly for values between 0 and 1', () => {
      expect(lerp(0, 10, 0.5)).toBe(5)
      expect(lerp(10, 20, 0.5)).toBe(15)
      expect(lerp(-10, 10, 0.25)).toBe(-5)
      expect(lerp(100, 200, 0.1)).toBe(110)
    })

    it('should handle extrapolation when t is outside [0, 1]', () => {
      expect(lerp(0, 10, 1.5)).toBe(15)
      expect(lerp(0, 10, -0.5)).toBe(-5)
      expect(lerp(10, 20, 2)).toBe(30)
    })

    it('should handle floating point interpolation', () => {
      expect(lerp(1.0, 2.0, 0.3)).toBeCloseTo(1.3, 10)
      expect(lerp(0, Math.PI, 0.5)).toBeCloseTo(Math.PI / 2, 10)
    })

    it('should handle negative values', () => {
      expect(lerp(-10, -5, 0.5)).toBe(-7.5)
      expect(lerp(-20, 10, 0.25)).toBe(-12.5)
    })

    it('should handle identical start and end values', () => {
      expect(lerp(5, 5, 0.5)).toBe(5)
      expect(lerp(5, 5, 0)).toBe(5)
      expect(lerp(5, 5, 1)).toBe(5)
      expect(lerp(5, 5, 2)).toBe(5)
    })
  })
})