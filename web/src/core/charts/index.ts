// Chart computation utilities with memoization
// Generates data series for various what-if analysis charts

import { calculateDeflection } from '../calculations/deflection.js'
import { getSpindlePowerAtRPM } from '../calculations/power.js'
import type { Spindle, Tool } from '../data/schemas/index.js'

/**
 * Data point for RPM vs Power chart
 */
export interface PowerChartDataPoint {
  rpm: number
  powerW: number
}

/**
 * Data point for Deflection vs Stickout chart
 */
export interface DeflectionChartDataPoint {
  stickoutMm: number
  deflectionMm: number
}

/**
 * Configuration for generating RPM series
 */
export interface RPMSeriesConfig {
  spindle: Spindle
  pointCount?: number // Number of data points to generate (default: 50)
}

/**
 * Configuration for generating stickout deflection series
 */
export interface StickoutSeriesConfig {
  tool: Tool
  forceN: number
  rpm: number
  flutes: number
  minStickoutMm?: number
  maxStickoutMm?: number
  pointCount?: number // Number of data points to generate (default: 30)
}

// Memoization cache for chart data series
const chartCache = new Map<string, unknown>()

/**
 * Generate cache key for memoization
 */
function generateCacheKey(prefix: string, config: unknown): string {
  return `${prefix}:${JSON.stringify(config)}`
}

/**
 * Generate RPM vs Power data series for a spindle
 * Uses spindle power curve to interpolate power at various RPM points
 */
export function generateRPMPowerSeries(config: RPMSeriesConfig): PowerChartDataPoint[] {
  const cacheKey = generateCacheKey('rpm-power', config)
  
  // Check cache first
  const cached = chartCache.get(cacheKey) as PowerChartDataPoint[] | undefined
  if (cached) {
    return cached
  }
  
  const { spindle, pointCount = 50 } = config
  const rpmMin = spindle.rpm_min
  const rpmMax = spindle.rpm_max
  
  const series: PowerChartDataPoint[] = []
  
  if (pointCount === 1) {
    // Special case for single point - use minimum RPM
    const powerW = getSpindlePowerAtRPM(spindle, rpmMin)
    series.push({
      rpm: rpmMin,
      powerW: Math.round(powerW)
    })
  } else {
    const rpmStep = (rpmMax - rpmMin) / (pointCount - 1)
    
    for (let i = 0; i < pointCount; i++) {
      const rpm = rpmMin + (i * rpmStep)
      const powerW = getSpindlePowerAtRPM(spindle, rpm)
      
      series.push({
        rpm: Math.round(rpm),
        powerW: Math.round(powerW)
      })
    }
  }
  
  // Cache the result
  chartCache.set(cacheKey, series)
  
  return series
}

/**
 * Generate Deflection vs Stickout data series for a tool
 * Varies tool stickout and calculates resulting deflection at given force
 */
export function generateDeflectionStickoutSeries(config: StickoutSeriesConfig): DeflectionChartDataPoint[] {
  const cacheKey = generateCacheKey('deflection-stickout', config)
  
  // Check cache first
  const cached = chartCache.get(cacheKey) as DeflectionChartDataPoint[] | undefined
  if (cached) {
    return cached
  }
  
  const { 
    tool, 
    forceN, 
    rpm, 
    flutes,
    minStickoutMm = Math.max(tool.diameter_mm * 2, 10), // Minimum 2x diameter or 10mm
    maxStickoutMm = tool.diameter_mm * 8, // Maximum 8x diameter
    pointCount = 30 
  } = config
  
  const stickoutStep = (maxStickoutMm - minStickoutMm) / (pointCount - 1)
  const series: DeflectionChartDataPoint[] = []
  
  if (pointCount === 1) {
    // Special case for single point - use minimum stickout
    const modifiedTool: Tool = {
      ...tool,
      stickout_mm: minStickoutMm
    }
    
    const deflectionResult = calculateDeflection(modifiedTool, forceN, rpm, flutes)
    
    series.push({
      stickoutMm: Math.round(minStickoutMm * 10) / 10,
      deflectionMm: Math.round(deflectionResult.staticDeflection.totalStaticDeflectionMm * 1000) / 1000
    })
  } else {
    for (let i = 0; i < pointCount; i++) {
      const stickoutMm = minStickoutMm + (i * stickoutStep)
      
      // Create a modified tool with the current stickout
      const modifiedTool: Tool = {
        ...tool,
        stickout_mm: stickoutMm
      }
      
      // Calculate deflection at this stickout
      const deflectionResult = calculateDeflection(modifiedTool, forceN, rpm, flutes)
      
      series.push({
        stickoutMm: Math.round(stickoutMm * 10) / 10, // Round to 0.1mm
        deflectionMm: Math.round(deflectionResult.staticDeflection.totalStaticDeflectionMm * 1000) / 1000 // Round to 0.001mm
      })
    }
  }
  
  // Cache the result
  chartCache.set(cacheKey, series)
  
  return series
}

/**
 * Clear the chart computation cache
 * Useful when underlying data changes
 */
export function clearChartCache(): void {
  chartCache.clear()
}

/**
 * Get cache statistics for debugging
 */
export function getChartCacheStats(): { size: number; keys: string[] } {
  return {
    size: chartCache.size,
    keys: Array.from(chartCache.keys())
  }
}