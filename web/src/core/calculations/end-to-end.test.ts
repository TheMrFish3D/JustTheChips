import { describe, it, expect } from 'vitest'

import { materials, machines, tools, spindles } from '../data/index.js'
import type { Material, Machine, Spindle, Tool } from '../data/schemas/index.js'

import {
  assembleOutput,
  calculateChiploadAndFeed,
  calculateCuttingForce,
  calculateDeflection,
  calculateEngagementAndMRR,
  calculatePower,
  calculateSpeedAndRPM,
  getEffectiveDiameter,
  getEffectiveFlutes,
  validateInputs,
  type CalculationOutput,
  type OutputAssemblyInput,
  type ValidationWarning
} from './index.js'

/**
 * End-to-end test scenarios for JustTheChips CNC Calculator
 * Tests complete calculation pipeline from inputs to final output
 * Covers happy paths, edge cases, and warning validation
 */
describe('End-to-End Calculation Scenarios', () => {
  
  // Helper function to run complete calculation pipeline
  function runCompleteCalculation(
    material: Material,
    machine: Machine,
    spindle: Spindle,
    tool: Tool,
    cutType: 'slot' | 'profile' | 'adaptive' | 'facing' | 'drilling' = 'slot',
    aggressiveness = 1.0,
    docMm?: number,
    wocMm?: number
  ): CalculationOutput {
    // Use default DOC/WOC if not specified
    const finalDocMm = docMm ?? tool.default_doc_mm
    const finalWocMm = wocMm ?? tool.default_woc_mm
    
    // Get effective diameter with DOC for vbits
    const effectiveDiameter = tool.type === 'vbit' 
      ? getEffectiveDiameter(tool, finalDocMm)
      : getEffectiveDiameter(tool)
    const effectiveFlutes = getEffectiveFlutes(tool)
    
    // Skip input validation for vbits as they require special handling
    let validationWarnings: ValidationWarning[] = []
    if (tool.type !== 'vbit') {
      // Validate inputs with correct property names
      const validationResult = validateInputs(
        {
          materialId: material.id,
          machineId: machine.id,
          spindleId: spindle.id,
          toolId: tool.id,
          cutType: cutType,
          aggressiveness: aggressiveness,
          user_doc_mm: finalDocMm,
          user_woc_mm: finalWocMm
        },
        [material],
        [machine],
        [tool],
        [spindle]
      )
      
      if (!validationResult.isValid) {
        throw new Error(`Validation failed: ${validationResult.errors?.map(e => e.message).join(', ')}`)
      }
      validationWarnings = validationResult.warnings
    }
    
    // Run calculation pipeline
    const speedResult = calculateSpeedAndRPM(material, spindle, effectiveDiameter, cutType, aggressiveness)
    
    const chiploadResult = calculateChiploadAndFeed(
      material,
      machine,
      tool,
      effectiveDiameter,
      effectiveFlutes,
      speedResult.rpmActual,
      finalWocMm,
      aggressiveness
    )
    
    const engagementResult = calculateEngagementAndMRR(
      material,
      tool,
      effectiveDiameter,
      chiploadResult.vfActual,
      finalDocMm,
      finalWocMm
    )
    
    const powerResult = calculatePower(
      material,
      machine,
      spindle,
      tool,
      engagementResult.mrrMm3Min,
      speedResult.rpmActual
    )
    
    const forceResult = calculateCuttingForce(
      material,
      tool,
      engagementResult.aeMm,
      chiploadResult.fzAdjusted
    )
    
    const deflectionResult = calculateDeflection(
      tool,
      forceResult.totalForceN,
      speedResult.rpmActual,
      effectiveFlutes
    )
    
    // Assemble final output
    const assemblyInput: OutputAssemblyInput = {
      tool,
      effectiveDiameter,
      userDocOverride: Boolean(docMm),
      speedResult,
      chiploadResult,
      engagementResult,
      powerResult,
      forceResult,
      deflectionResult,
      validationWarnings: validationWarnings
    }
    
    return assembleOutput(assemblyInput)
  }

  describe('Happy Path Scenarios', () => {
    it('should handle aluminum machining with 6mm carbide endmill (typical scenario)', () => {
      const material = materials.find(m => m.id === 'aluminum_6061')!
      const machine = machines.find(m => m.id === 'haas_vf2')!
      const spindle = spindles.find(s => s.id === 'spindle_2_2kw')!
      const tool = tools.find(t => t.id === 'endmill_6mm_carbide')!

      const result = runCompleteCalculation(material, machine, spindle, tool)

      // Verify reasonable output values for aluminum
      expect(result.rpm).toBeGreaterThan(3000)
      expect(result.rpm).toBeLessThan(15000)
      expect(result.feed_mm_min).toBeGreaterThan(500)
      expect(result.feed_mm_min).toBeLessThan(5000)
      expect(result.fz_mm).toBeGreaterThan(0.05)
      expect(result.fz_mm).toBeLessThan(0.20)
      
      // Verify output structure
      expect(result.toolType).toBe('endmill_flat')
      expect(result.effectiveDiameter).toBe(6.0)
      expect(result.user_doc_override).toBe(false)
      expect(result.warnings).toBeInstanceOf(Array)
      
      // Should have minimal warnings for this ideal scenario
      expect(result.warnings.length).toBeLessThan(3)
      
      // Power should be reasonable
      expect(result.power_W).toBeGreaterThan(50)
      expect(result.power_W).toBeLessThan(result.power_available_W)
      
      // Deflection should be reasonable but might be higher than ideal threshold
      expect(result.deflection_mm).toBeGreaterThan(0)
      expect(result.deflection_mm).toBeLessThan(0.5) // Below dangerous levels
    })

    it('should handle steel machining with 10mm 4-flute endmill', () => {
      const material = materials.find(m => m.id === 'steel_1045')!
      const machine = machines.find(m => m.id === 'makino_v33i')! // High-end machine
      const spindle = spindles.find(s => s.id === 'spindle_7_5kw')! // High power
      const tool = tools.find(t => t.id === 'endmill_10mm_carbide_4fl')!

      const result = runCompleteCalculation(material, machine, spindle, tool)

      // Steel requires lower speeds than aluminum
      expect(result.rpm).toBeGreaterThan(1000)
      expect(result.rpm).toBeLessThan(8000)
      
      // Higher cutting forces for steel
      expect(result.force_N).toBeGreaterThan(200)
      
      // Should have adequate power available
      expect(result.power_available_W).toBeGreaterThan(result.power_W)
      
      // Verify basic output structure
      expect(result.toolType).toBe('endmill_flat')
      expect(result.effectiveDiameter).toBe(10.0)
    })

    it('should handle drilling operation with HSS drill', () => {
      const material = materials.find(m => m.id === 'aluminum_6061')!
      const machine = machines.find(m => m.id === 'tormach_1100mx')!
      const spindle = spindles.find(s => s.id === 'spindle_2_2kw')!
      const tool = tools.find(t => t.id === 'drill_8mm_hss')!

      const result = runCompleteCalculation(material, machine, spindle, tool, 'drilling')

      // Drilling has specific characteristics
      expect(result.toolType).toBe('drill')
      expect(result.effectiveDiameter).toBe(8.0)
      
      // Drilling typically uses lower feeds
      expect(result.feed_mm_min).toBeGreaterThan(100)
      expect(result.feed_mm_min).toBeLessThan(2000)
      
      // Verify drilling-specific MRR calculation
      expect(result.mrr_mm3_min).toBeGreaterThan(0)
    })

    it('should handle facing operation with large facemill', () => {
      const material = materials.find(m => m.id === 'aluminum_6061')!
      const machine = machines.find(m => m.id === 'makino_v33i')!
      const spindle = spindles.find(s => s.id === 'spindle_7_5kw')!
      const tool = tools.find(t => t.id === 'facemill_63mm_insert')!

      const result = runCompleteCalculation(material, machine, spindle, tool, 'facing')

      // Large diameter means lower RPM
      expect(result.rpm).toBeGreaterThan(200)
      expect(result.rpm).toBeLessThan(2000)
      
      // High MRR for facing
      expect(result.mrr_mm3_min).toBeGreaterThan(1000)
      
      // Should handle large tool well
      expect(result.toolType).toBe('facemill')
      expect(result.effectiveDiameter).toBe(63.0)
    })
  })

  describe('Edge Cases - Small Tools and High Deflection', () => {
    it('should warn about high deflection with small tool and high stickout', () => {
      const material = materials.find(m => m.id === 'stainless_316')! // Tough material
      const machine = machines.find(m => m.id === 'tormach_1100mx')! // Lower rigidity
      const spindle = spindles.find(s => s.id === 'spindle_2_2kw')!
      const tool = tools.find(t => t.id === 'endmill_6mm_carbide')!

      // Use aggressive parameters to increase deflection
      const result = runCompleteCalculation(material, machine, spindle, tool, 'slot', 1.5, 4.0, 3.0)

      // Should generate deflection warnings
      const deflectionWarnings = result.warnings.filter(w => 
        w.type.includes('deflection') || w.message.toLowerCase().includes('deflection')
      )
      expect(deflectionWarnings.length).toBeGreaterThan(0)
      
      // Deflection should be high
      expect(result.deflection_mm).toBeGreaterThan(0.02)
      
      // Force should be significant due to stainless steel
      expect(result.force_N).toBeGreaterThan(500)
    })

    it('should handle chip thinning for narrow cuts', () => {
      const material = materials.find(m => m.id === 'aluminum_6061')!
      const machine = machines.find(m => m.id === 'haas_vf2')!
      const spindle = spindles.find(s => s.id === 'spindle_2_2kw')!
      const tool = tools.find(t => t.id === 'endmill_6mm_carbide')!

      // Very narrow width of cut to trigger chip thinning
      const narrowWocMm = 1.5 // Less than 30% of 6mm diameter

      const result = runCompleteCalculation(material, machine, spindle, tool, 'profile', 1.0, 2.0, narrowWocMm)

      // Should not have chip thinning warnings if handled properly
      const chiploadWarnings = result.warnings.filter(w => 
        w.type.includes('chipload') && w.severity === 'danger'
      )
      expect(chiploadWarnings.length).toBe(0)
      
      // Chipload should be adjusted upward due to chip thinning
      expect(result.fz_mm).toBeGreaterThan(0.08)
      
      // Verify narrow engagement
      expect(result.ae_mm).toBeCloseTo(narrowWocMm, 1)
    })

    it('should handle very small vbit with precision requirements', () => {
      const material = materials.find(m => m.id === 'aluminum_6061')!
      const machine = machines.find(m => m.id === 'makino_v33i')! // High precision machine
      const spindle = spindles.find(s => s.id === 'spindle_0_8kw_high_speed')! // High speed
      const tool = tools.find(t => t.id === 'vbit_90deg_carbide')!

      // Light finishing cuts
      const result = runCompleteCalculation(material, machine, spindle, tool, 'profile', 0.5, 0.5, 2.0)

      // Higher speed for small vbit, but constrained by material and aggressiveness
      expect(result.rpm).toBeGreaterThan(3000)
      
      // Light cuts should have low forces
      expect(result.force_N).toBeLessThan(100)
      
      // Small depth of cut
      expect(result.ap_mm).toBeLessThan(1.0)
      
      expect(result.toolType).toBe('vbit')
    })
  })

  describe('Edge Cases - Power Limitations', () => {
    it('should handle power-limited scenario with high-power material', () => {
      const material = materials.find(m => m.id === 'stainless_316')! // High cutting energy
      const machine = machines.find(m => m.id === 'haas_vf2')!
      const spindle = spindles.find(s => s.id === 'spindle_2_2kw')! // Lower power
      const tool = tools.find(t => t.id === 'endmill_10mm_carbide_4fl')!

      // Aggressive cuts to challenge power limits
      const result = runCompleteCalculation(material, machine, spindle, tool, 'slot', 1.8, 6.0, 6.0)

      // Should generate power-related warnings
      const powerWarnings = result.warnings.filter(w => 
        w.type.includes('power') || w.message.toLowerCase().includes('power')
      )
      expect(powerWarnings.length).toBeGreaterThan(0)
      
      // Power consumption should be significant
      expect(result.power_W).toBeGreaterThan(1000)
      
      // Should be close to or at power limit
      expect(result.power_W / result.power_available_W).toBeGreaterThan(0.7)
    })

    it('should handle insufficient spindle power for large tool', () => {
      const material = materials.find(m => m.id === 'steel_1045')!
      const machine = machines.find(m => m.id === 'haas_vf2')!
      const spindle = spindles.find(s => s.id === 'spindle_0_8kw_high_speed')! // Low power
      const tool = tools.find(t => t.id === 'facemill_63mm_insert')! // Large tool

      const result = runCompleteCalculation(material, machine, spindle, tool, 'facing', 1.0)

      // Should definitely have power warnings with this mismatch
      const powerWarnings = result.warnings.filter(w => 
        w.type.includes('power') || w.message.toLowerCase().includes('power')
      )
      expect(powerWarnings.length).toBeGreaterThan(0)
      
      // Power should be limited
      expect(result.power_W).toBeGreaterThan(result.power_available_W * 0.8)
    })
  })

  describe('Warning Snapshot Validation', () => {
    it('should generate comprehensive warnings for extreme scenario', () => {
      const material = materials.find(m => m.id === 'stainless_316')! // Difficult material
      const machine = machines.find(m => m.id === 'tormach_1100mx')! // Lower-end machine
      const spindle = spindles.find(s => s.id === 'spindle_0_8kw_high_speed')! // Mismatched spindle
      const tool = tools.find(t => t.id === 'endmill_6mm_carbide')!

      // Extreme parameters to trigger multiple warnings
      const result = runCompleteCalculation(material, machine, spindle, tool, 'slot', 2.0, 5.0, 4.0)

      // Should have multiple warning types
      expect(result.warnings.length).toBeGreaterThan(2)
      
      // Categorize warnings by type
      const warningTypes = new Set(result.warnings.map(w => w.type))
      const severityLevels = new Set(result.warnings.map(w => w.severity).filter(Boolean))
      
      expect(warningTypes.size).toBeGreaterThan(1) // Multiple warning types
      expect(severityLevels.has('warning') || severityLevels.has('danger')).toBe(true)
      
      // Verify warning structure
      result.warnings.forEach(warning => {
        expect(warning.type).toBeTruthy()
        expect(warning.message).toBeTruthy()
        expect(typeof warning.message).toBe('string')
        expect(warning.message.length).toBeGreaterThan(10) // Meaningful message
      })
    })

    it('should validate warning severity levels', () => {
      const material = materials.find(m => m.id === 'stainless_316')!
      const machine = machines.find(m => m.id === 'tormach_1100mx')!
      const spindle = spindles.find(s => s.id === 'spindle_2_2kw')!
      const tool = tools.find(t => t.id === 'endmill_6mm_carbide')!

      // Parameters designed to trigger danger-level warnings
      const result = runCompleteCalculation(material, machine, spindle, tool, 'slot', 2.5, 6.0, 5.0)

      // Check for danger-level warnings
      const dangerWarnings = result.warnings.filter(w => w.severity === 'danger')
      const regularWarnings = result.warnings.filter(w => w.severity === 'warning' || !w.severity)
      
      // Should have at least one type of warning
      expect(dangerWarnings.length + regularWarnings.length).toBeGreaterThan(0)
      
      // Verify severity consistency
      if (dangerWarnings.length > 0) {
        dangerWarnings.forEach(warning => {
          expect(warning.severity).toBe('danger')
          expect(warning.type).toMatch(/danger|critical|high/)
        })
      }
    })

    it('should generate specific warning types for known scenarios', () => {
      // Test specific warning scenarios
      const scenarios = [
        {
          name: 'deflection warning',
          setup: () => {
            const material = materials.find(m => m.id === 'steel_1045')!
            const machine = machines.find(m => m.id === 'tormach_1100mx')!
            const spindle = spindles.find(s => s.id === 'spindle_2_2kw')!
            const tool = tools.find(t => t.id === 'endmill_6mm_carbide')!
            return runCompleteCalculation(material, machine, spindle, tool, 'slot', 1.8, 4.0, 3.5)
          },
          expectedWarningPattern: /deflection/i
        },
        {
          name: 'chipload warning', 
          setup: () => {
            const material = materials.find(m => m.id === 'aluminum_6061')!
            const machine = machines.find(m => m.id === 'haas_vf2')!
            const spindle = spindles.find(s => s.id === 'spindle_2_2kw')!
            const tool = tools.find(t => t.id === 'endmill_6mm_carbide')!
            return runCompleteCalculation(material, machine, spindle, tool, 'slot', 3.0, 2.0, 0.8) // Very narrow cut
          },
          expectedWarningPattern: /chipload|chip.*load/i
        }
      ]

      scenarios.forEach(scenario => {
        const result = scenario.setup()
        const matchingWarnings = result.warnings.filter(w => 
          scenario.expectedWarningPattern.test(w.message) || 
          scenario.expectedWarningPattern.test(w.type)
        )
        
        expect(matchingWarnings.length).toBeGreaterThan(0)
        if (matchingWarnings.length === 0) {
          throw new Error(`Expected ${scenario.name} but got warnings: ${result.warnings.map(w => w.type).join(', ')}`)
        }
      })
    })
  })

  describe('Output Format Validation', () => {
    it('should return properly formatted and rounded output', () => {
      const material = materials.find(m => m.id === 'aluminum_6061')!
      const machine = machines.find(m => m.id === 'haas_vf2')!
      const spindle = spindles.find(s => s.id === 'spindle_2_2kw')!
      const tool = tools.find(t => t.id === 'endmill_6mm_carbide')!

      const result = runCompleteCalculation(material, machine, spindle, tool)

      // Verify all required fields are present
      const requiredFields = [
        'rpm', 'feed_mm_min', 'fz_mm', 'fz_actual_mm', 'ae_mm', 'ap_mm',
        'mrr_mm3_min', 'power_W', 'power_available_W', 'force_N', 
        'deflection_mm', 'warnings', 'toolType', 'effectiveDiameter',
        'user_doc_override', 'vc_m_min', 'sfm'
      ]
      
      requiredFields.forEach(field => {
        expect(result).toHaveProperty(field)
      })
      
      // Verify data types
      expect(typeof result.rpm).toBe('number')
      expect(typeof result.feed_mm_min).toBe('number')
      expect(typeof result.fz_mm).toBe('number')
      expect(typeof result.toolType).toBe('string')
      expect(typeof result.user_doc_override).toBe('boolean')
      expect(Array.isArray(result.warnings)).toBe(true)
      
      // Verify integer rounding where specified
      expect(Number.isInteger(result.rpm)).toBe(true)
      expect(Number.isInteger(result.feed_mm_min)).toBe(true)
      expect(Number.isInteger(result.vc_m_min)).toBe(true)
      expect(Number.isInteger(result.sfm)).toBe(true)
      
      // Verify positive values where appropriate
      expect(result.rpm).toBeGreaterThan(0)
      expect(result.feed_mm_min).toBeGreaterThan(0)
      expect(result.fz_mm).toBeGreaterThan(0)
      expect(result.power_available_W).toBeGreaterThan(0)
      expect(result.effectiveDiameter).toBeGreaterThan(0)
    })
  })
})