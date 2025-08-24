import { describe, it, expect, beforeEach } from 'vitest'

import type { Spindle, Tool } from '../data/schemas/index.js'

import {
  generateRPMPowerSeries,
  generateDeflectionStickoutSeries,
  clearChartCache,
  getChartCacheStats
} from './index.js'

describe('Chart computation utilities', () => {
  // Test data
  const testSpindle: Spindle = {
    id: 'test_spindle',
    rated_power_kw: 2.2,
    rpm_min: 6000,
    rpm_max: 24000,
    base_rpm: 10000,
    power_curve: [
      { rpm: 6000, power_kw: 1.1 },
      { rpm: 12000, power_kw: 2.2 },
      { rpm: 18000, power_kw: 2.0 },
      { rpm: 24000, power_kw: 1.8 }
    ]
  }
  
  const testTool: Tool = {
    id: 'test_tool',
    type: 'endmill_flat',
    diameter_mm: 10,
    flutes: 4,
    coating: 'TiAlN',
    stickout_mm: 30,
    material: 'carbide',
    default_doc_mm: 5,
    default_woc_mm: 2.5
  }

  beforeEach(() => {
    clearChartCache()
  })

  describe('generateRPMPowerSeries', () => {
    it('should generate power series across RPM range', () => {
      const series = generateRPMPowerSeries({ spindle: testSpindle, pointCount: 10 })
      
      expect(series).toHaveLength(10)
      expect(series[0].rpm).toBe(6000)
      expect(series[9].rpm).toBe(24000)
      
      // Check that power values are reasonable
      series.forEach(point => {
        expect(point.powerW).toBeGreaterThan(0)
        expect(point.powerW).toBeLessThan(3000) // Should be less than 3kW
      })
      
      // Values should be monotonic or have peaks per the power curve
      expect(series[0].powerW).toBeLessThan(series[1].powerW) // Power should increase initially
    })

    it('should use default point count of 50', () => {
      const series = generateRPMPowerSeries({ spindle: testSpindle })
      expect(series).toHaveLength(50)
    })

    it('should return cached results on subsequent calls', () => {
      const series1 = generateRPMPowerSeries({ spindle: testSpindle, pointCount: 5 })
      const series2 = generateRPMPowerSeries({ spindle: testSpindle, pointCount: 5 })
      
      expect(series1).toBe(series2) // Should be the exact same object reference
    })

    it('should handle edge case of single point', () => {
      const series = generateRPMPowerSeries({ spindle: testSpindle, pointCount: 1 })
      expect(series).toHaveLength(1)
      expect(series[0].rpm).toBe(6000)
    })
  })

  describe('generateDeflectionStickoutSeries', () => {
    it('should generate deflection series across stickout range', () => {
      const series = generateDeflectionStickoutSeries({
        tool: testTool,
        forceN: 500,
        rpm: 12000,
        flutes: 4,
        pointCount: 10
      })
      
      expect(series).toHaveLength(10)
      
      // Check that stickout values span the expected range
      const minExpected = Math.max(testTool.diameter_mm * 2, 10) // 20mm for 10mm tool
      const maxExpected = testTool.diameter_mm * 8 // 80mm for 10mm tool
      
      expect(series[0].stickoutMm).toBeCloseTo(minExpected, 1)
      expect(series[9].stickoutMm).toBeCloseTo(maxExpected, 1)
      
      // Deflection should increase with stickout
      for (let i = 1; i < series.length; i++) {
        expect(series[i].deflectionMm).toBeGreaterThan(series[i-1].deflectionMm)
      }
    })

    it('should use custom stickout range when provided', () => {
      const series = generateDeflectionStickoutSeries({
        tool: testTool,
        forceN: 300,
        rpm: 10000,
        flutes: 3,
        minStickoutMm: 15,
        maxStickoutMm: 45,
        pointCount: 5
      })
      
      expect(series).toHaveLength(5)
      expect(series[0].stickoutMm).toBe(15)
      expect(series[4].stickoutMm).toBe(45)
    })

    it('should use default point count of 30', () => {
      const series = generateDeflectionStickoutSeries({
        tool: testTool,
        forceN: 400,
        rpm: 15000,
        flutes: 2
      })
      
      expect(series).toHaveLength(30)
    })

    it('should return cached results on subsequent calls', () => {
      const config = {
        tool: testTool,
        forceN: 200,
        rpm: 8000,
        flutes: 4,
        pointCount: 5
      }
      
      const series1 = generateDeflectionStickoutSeries(config)
      const series2 = generateDeflectionStickoutSeries(config)
      
      expect(series1).toBe(series2) // Should be the exact same object reference
    })

    it('should handle zero force gracefully', () => {
      const series = generateDeflectionStickoutSeries({
        tool: testTool,
        forceN: 0,
        rpm: 12000,
        flutes: 4,
        pointCount: 3
      })
      
      expect(series).toHaveLength(3)
      series.forEach(point => {
        expect(point.deflectionMm).toBe(0) // Zero force should give zero deflection
      })
    })
  })

  describe('cache management', () => {
    it('should track cache statistics', () => {
      expect(getChartCacheStats().size).toBe(0)
      
      generateRPMPowerSeries({ spindle: testSpindle, pointCount: 5 })
      expect(getChartCacheStats().size).toBe(1)
      
      generateDeflectionStickoutSeries({
        tool: testTool,
        forceN: 100,
        rpm: 10000,
        flutes: 2,
        pointCount: 5
      })
      expect(getChartCacheStats().size).toBe(2)
      
      const stats = getChartCacheStats()
      expect(stats.keys).toHaveLength(2)
      expect(stats.keys[0]).toContain('rpm-power:')
      expect(stats.keys[1]).toContain('deflection-stickout:')
    })

    it('should clear cache when requested', () => {
      generateRPMPowerSeries({ spindle: testSpindle })
      generateDeflectionStickoutSeries({
        tool: testTool,
        forceN: 100,
        rpm: 10000,
        flutes: 2
      })
      
      expect(getChartCacheStats().size).toBe(2)
      
      clearChartCache()
      expect(getChartCacheStats().size).toBe(0)
    })

    it('should generate different cache keys for different configurations', () => {
      const series1 = generateRPMPowerSeries({ spindle: testSpindle, pointCount: 10 })
      const series2 = generateRPMPowerSeries({ spindle: testSpindle, pointCount: 20 })
      
      expect(series1).not.toBe(series2) // Different configurations should not share cache
      expect(getChartCacheStats().size).toBe(2)
    })
  })
})