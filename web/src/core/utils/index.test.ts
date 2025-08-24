import { describe, expect, it } from 'vitest'

import {
  clamp,
  degreesToRadians,
  hpToKW,
  inchesToMm,
  kWToHP,
  lerp,
  mPerMinToSFM,
  mmToInches,
  newtonsToPounds,
  poundsToNewtons,
  radiansToDegrees,
  sfmToMPerMin,
} from './index.js'

describe('Utils index exports', () => {
  it('should export math utilities correctly', () => {
    expect(typeof clamp).toBe('function')
    expect(typeof lerp).toBe('function')
    
    // Test they work as expected
    expect(clamp(5, 1, 10)).toBe(5)
    expect(lerp(0, 10, 0.5)).toBe(5)
  })

  it('should export unit conversion functions correctly', () => {
    expect(typeof mmToInches).toBe('function')
    expect(typeof inchesToMm).toBe('function')
    expect(typeof kWToHP).toBe('function')
    expect(typeof hpToKW).toBe('function')
    expect(typeof mPerMinToSFM).toBe('function')
    expect(typeof sfmToMPerMin).toBe('function')
    expect(typeof degreesToRadians).toBe('function')
    expect(typeof radiansToDegrees).toBe('function')
    expect(typeof newtonsToPounds).toBe('function')
    expect(typeof poundsToNewtons).toBe('function')
    
    // Test a few key conversions work as expected
    expect(mmToInches(25.4)).toBeCloseTo(1, 10)
    expect(kWToHP(0.7457)).toBeCloseTo(1, 4)
    expect(degreesToRadians(180)).toBeCloseTo(Math.PI, 10)
  })

  it('should provide access to all essential CNC conversion utilities', () => {
    // Length conversions
    expect(inchesToMm(mmToInches(10))).toBeCloseTo(10, 10)
    
    // Power conversions
    expect(hpToKW(kWToHP(5))).toBeCloseTo(5, 10)
    
    // Surface speed conversions
    expect(sfmToMPerMin(mPerMinToSFM(100))).toBeCloseTo(100, 10)
    
    // Angle conversions
    expect(radiansToDegrees(degreesToRadians(90))).toBeCloseTo(90, 10)
    
    // Force conversions
    expect(poundsToNewtons(newtonsToPounds(100))).toBeCloseTo(100, 10)
  })
})