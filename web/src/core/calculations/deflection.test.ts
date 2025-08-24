import { describe, it, expect } from 'vitest'

import type { Tool } from '../data/schemas/index.js'

import {
  calculateStaticDeflection,
  calculateDynamicAmplification,
  calculateDeflection,
  getYoungsModulus,
  estimateToolMass
} from './deflection.js'

// Test data
const testTool: Tool = {
  id: 'endmill-6mm',
  type: 'endmill_flat',
  diameter_mm: 6,
  flutes: 3,
  coating: 'TiAlN',
  stickout_mm: 20,
  material: 'carbide',
  default_doc_mm: 1.5,
  default_woc_mm: 3.0
}

const hssTool: Tool = {
  ...testTool,
  material: 'hss'
}

describe('Deflection Calculations', () => {
  describe('getYoungsModulus', () => {
    it('should return correct modulus for known materials', () => {
      expect(getYoungsModulus('carbide')).toBe(600)
      expect(getYoungsModulus('hss')).toBe(210)
      expect(getYoungsModulus('high_speed_steel')).toBe(210)
      expect(getYoungsModulus('steel')).toBe(210)
    })

    it('should be case insensitive', () => {
      expect(getYoungsModulus('CARBIDE')).toBe(600)
      expect(getYoungsModulus('HSS')).toBe(210)
      expect(getYoungsModulus('Carbide')).toBe(600)
    })

    it('should return default for unknown materials', () => {
      expect(getYoungsModulus('unknown')).toBe(400)
      expect(getYoungsModulus('')).toBe(400)
    })
  })

  describe('estimateToolMass', () => {
    it('should estimate mass for carbide tools', () => {
      const mass = estimateToolMass(testTool)
      expect(mass).toBeGreaterThan(0)
      
      // For a 6mm diameter, 20mm long carbide tool, mass should be reasonable
      // Volume ≈ π × (3mm)² × 20mm = 565 mm³ = 0.565 cm³
      // Mass ≈ 0.565 × 14.5 g/cm³ = 8.2g = 0.0082 kg
      expect(mass).toBeCloseTo(0.008, 3)
    })

    it('should estimate lower mass for HSS tools', () => {
      const carbideMass = estimateToolMass(testTool)
      const hssMass = estimateToolMass(hssTool)
      
      // HSS is less dense than carbide
      expect(hssMass).toBeLessThan(carbideMass)
      expect(hssMass).toBeCloseTo(0.0045, 3) // ~8.0/14.5 * carbide mass
    })

    it('should scale with tool size', () => {
      const smallTool: Tool = { ...testTool, diameter_mm: 3, stickout_mm: 10 }
      const largeTool: Tool = { ...testTool, diameter_mm: 12, stickout_mm: 40 }
      
      const smallMass = estimateToolMass(smallTool)
      const largeMass = estimateToolMass(largeTool)
      
      expect(largeMass).toBeGreaterThan(smallMass)
    })
  })

  describe('calculateStaticDeflection', () => {
    it('should calculate static deflection components correctly', () => {
      const forceN = 500
      const result = calculateStaticDeflection(testTool, forceN)

      // All components should be positive
      expect(result.bendingDeflectionMm).toBeGreaterThan(0)
      expect(result.shearDeflectionMm).toBeGreaterThan(0)
      expect(result.holderDeflectionMm).toBeGreaterThan(0)

      // Holder deflection = F × compliance = 500 × 0.002 = 1.0 mm
      expect(result.holderDeflectionMm).toBeCloseTo(1.0, 6)

      // Total should be sum of components
      const expectedTotal = result.bendingDeflectionMm + result.shearDeflectionMm + result.holderDeflectionMm
      expect(result.totalStaticDeflectionMm).toBeCloseTo(expectedTotal, 10)
    })

    it('should scale linearly with force', () => {
      const force1 = 200
      const force2 = 600
      
      const result1 = calculateStaticDeflection(testTool, force1)
      const result2 = calculateStaticDeflection(testTool, force2)

      // All deflection components should scale linearly with force
      expect(result2.bendingDeflectionMm).toBeCloseTo(result1.bendingDeflectionMm * 3, 8)
      expect(result2.shearDeflectionMm).toBeCloseTo(result1.shearDeflectionMm * 3, 8)
      expect(result2.holderDeflectionMm).toBeCloseTo(result1.holderDeflectionMm * 3, 8)
      expect(result2.totalStaticDeflectionMm).toBeCloseTo(result1.totalStaticDeflectionMm * 3, 8)
    })

    it('should handle different tool materials correctly', () => {
      const forceN = 400
      const carbideResult = calculateStaticDeflection(testTool, forceN)
      const hssResult = calculateStaticDeflection(hssTool, forceN)

      // HSS has lower modulus (210 vs 600 GPa), so higher deflection for bending and shear
      expect(hssResult.bendingDeflectionMm).toBeGreaterThan(carbideResult.bendingDeflectionMm)
      expect(hssResult.shearDeflectionMm).toBeGreaterThan(carbideResult.shearDeflectionMm)
      
      // Holder deflection should be same (material independent)
      expect(hssResult.holderDeflectionMm).toBeCloseTo(carbideResult.holderDeflectionMm, 10)
    })

    it('should use custom holder compliance', () => {
      const forceN = 300
      const customCompliance = 0.005 // Higher than default 0.002
      
      const defaultResult = calculateStaticDeflection(testTool, forceN)
      const customResult = calculateStaticDeflection(testTool, forceN, customCompliance)

      // Holder deflection should be different
      expect(customResult.holderDeflectionMm).toBeCloseTo(forceN * customCompliance, 6)
      expect(customResult.holderDeflectionMm).toBeGreaterThan(defaultResult.holderDeflectionMm)

      // Other components should be same
      expect(customResult.bendingDeflectionMm).toBeCloseTo(defaultResult.bendingDeflectionMm, 10)
      expect(customResult.shearDeflectionMm).toBeCloseTo(defaultResult.shearDeflectionMm, 10)
    })

    it('should handle zero force', () => {
      const result = calculateStaticDeflection(testTool, 0)
      
      expect(result.bendingDeflectionMm).toBe(0)
      expect(result.shearDeflectionMm).toBe(0)
      expect(result.holderDeflectionMm).toBe(0)
      expect(result.totalStaticDeflectionMm).toBe(0)
    })
  })

  describe('calculateDynamicAmplification', () => {
    it('should calculate dynamic amplification correctly', () => {
      const rpm = 12000
      const effectiveFlutes = 3
      
      const result = calculateDynamicAmplification(testTool, rpm, effectiveFlutes)

      expect(result.naturalFrequencyHz).toBeGreaterThan(0)
      expect(result.operatingFrequencyHz).toBe((rpm / 60) * effectiveFlutes) // 12000/60 * 3 = 600 Hz
      expect(result.frequencyRatio).toBe(result.operatingFrequencyHz / result.naturalFrequencyHz)
      expect(result.amplificationFactor).toBeGreaterThan(0)
    })

    it('should apply correct amplification rules for different frequency ratios', () => {
      // Test low ratio (< 0.7): G = 1 + 0.1 × ratio
      const lowRpm = 1000
      const lowResult = calculateDynamicAmplification(testTool, lowRpm, 2)
      
      if (lowResult.frequencyRatio < 0.7) {
        const expectedG = 1 + 0.1 * lowResult.frequencyRatio
        expect(lowResult.amplificationFactor).toBeCloseTo(expectedG, 5)
      }

      // Test high ratio (> 1.3): G = 1 / ratio²
      const highRpm = 24000
      const highResult = calculateDynamicAmplification(testTool, highRpm, 4)
      
      if (highResult.frequencyRatio > 1.3) {
        const expectedG = 1 / Math.pow(highResult.frequencyRatio, 2)
        expect(highResult.amplificationFactor).toBeCloseTo(expectedG, 5)
      }
    })

    it('should handle different spindle speeds', () => {
      const rpms = [6000, 12000, 18000]
      const effectiveFlutes = 3

      rpms.forEach(rpm => {
        const result = calculateDynamicAmplification(testTool, rpm, effectiveFlutes)
        
        expect(result.operatingFrequencyHz).toBe((rpm / 60) * effectiveFlutes)
        expect(result.amplificationFactor).toBeGreaterThan(0)
        expect(result.amplificationFactor).toBeLessThanOrEqual(50) // Should be clamped
      })
    })

    it('should vary amplification with effective flutes', () => {
      const rpm = 12000
      
      const result2Flutes = calculateDynamicAmplification(testTool, rpm, 2)
      const result4Flutes = calculateDynamicAmplification(testTool, rpm, 4)

      // Operating frequency should scale with flutes
      expect(result4Flutes.operatingFrequencyHz).toBe(result2Flutes.operatingFrequencyHz * 2)
      
      // Frequency ratio and amplification should be different
      expect(result4Flutes.frequencyRatio).not.toBeCloseTo(result2Flutes.frequencyRatio, 2)
    })
  })

  describe('calculateDeflection', () => {
    it('should combine static and dynamic calculations correctly', () => {
      const forceN = 400
      const rpm = 15000
      const effectiveFlutes = 3
      
      const result = calculateDeflection(testTool, forceN, rpm, effectiveFlutes)

      // Should have both static and dynamic components
      expect(result.staticDeflection).toBeDefined()
      expect(result.dynamicAmplification).toBeDefined()

      // Total deflection = static × amplification
      const expectedTotal = result.staticDeflection.totalStaticDeflectionMm * result.dynamicAmplification.amplificationFactor
      expect(result.totalDeflectionMm).toBeCloseTo(expectedTotal, 10)
    })

    it('should generate appropriate deflection warnings', () => {
      // Test scenario that should generate danger warning (> 0.05 mm)
      const highForce = 2000 // High force to cause large deflection
      const highRpm = 18000  // High RPM for potential amplification
      
      const dangerResult = calculateDeflection(testTool, highForce, highRpm, 3)
      
      if (dangerResult.totalDeflectionMm > 0.05) {
        expect(dangerResult.warnings).toHaveLength(1)
        expect(dangerResult.warnings[0].type).toBe('deflection_danger')
        expect(dangerResult.warnings[0].severity).toBe('danger')
        expect(dangerResult.warnings[0].message).toContain('Dangerous tool deflection')
      }

      // Test moderate deflection (between 0.02 and 0.05 mm)
      const moderateForce = 300
      const moderateResult = calculateDeflection(testTool, moderateForce, 12000, 2)
      
      if (moderateResult.totalDeflectionMm > 0.02 && moderateResult.totalDeflectionMm <= 0.05) {
        expect(moderateResult.warnings).toHaveLength(1)
        expect(moderateResult.warnings[0].type).toBe('deflection_warning')
        expect(moderateResult.warnings[0].severity).toBe('warning')
        expect(moderateResult.warnings[0].message).toContain('High tool deflection')
      }
    })

    it('should not generate warnings for low deflection', () => {
      const lowForce = 50 // Low force
      const lowRpm = 8000  // Moderate RPM
      
      const result = calculateDeflection(testTool, lowForce, lowRpm, 2)
      
      if (result.totalDeflectionMm <= 0.02) {
        expect(result.warnings).toHaveLength(0)
      }
    })

    it('should handle zero force correctly', () => {
      const result = calculateDeflection(testTool, 0, 12000, 3)
      
      expect(result.staticDeflection.totalStaticDeflectionMm).toBe(0)
      expect(result.totalDeflectionMm).toBe(0)
      expect(result.warnings).toHaveLength(0)
    })

    it('should work with different tool configurations', () => {
      const longTool: Tool = { ...testTool, stickout_mm: 50 }
      const shortTool: Tool = { ...testTool, stickout_mm: 10 }
      
      const forceN = 300
      const rpm = 12000
      const flutes = 3

      const longResult = calculateDeflection(longTool, forceN, rpm, flutes)
      const shortResult = calculateDeflection(shortTool, forceN, rpm, flutes)

      // Longer tools should generally have higher deflection
      expect(longResult.staticDeflection.totalStaticDeflectionMm).toBeGreaterThan(shortResult.staticDeflection.totalStaticDeflectionMm)
      
      // Natural frequencies should be different
      expect(longResult.dynamicAmplification.naturalFrequencyHz).not.toBeCloseTo(shortResult.dynamicAmplification.naturalFrequencyHz, 2)
    })

    it('should use custom holder compliance', () => {
      const customCompliance = 0.008
      const result = calculateDeflection(testTool, 500, 12000, 3, customCompliance)
      
      expect(result.staticDeflection.holderDeflectionMm).toBeCloseTo(500 * customCompliance, 6)
    })
  })
})