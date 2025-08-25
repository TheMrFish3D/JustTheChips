import { describe, it, expect } from 'vitest'

import { 
  estimateMachineRigidity, 
  validateEstimationFramework,
  type MachineRigidityInputs 
} from './rigidity-estimation.js'

describe('Machine Rigidity Estimation Framework', () => {
  describe('Basic Estimation', () => {
    it('should estimate rigidity for 3018-style machine', () => {
      const inputs: MachineRigidityInputs = {
        weightKg: 8,
        workingVolumeMm3: 300 * 180 * 45,
        frameConstructionType: 'aluminum_extrusion',
        motionSystemType: 'leadscrew',
        spindleMountType: 'router_clamp'
      }

      const result = estimateMachineRigidity(inputs)

      // Should be in low rigidity range
      expect(result.estimatedRigidityFactor).toBeGreaterThan(0.1)
      expect(result.estimatedRigidityFactor).toBeLessThan(0.3)
      expect(result.confidence).toBeGreaterThan(0.5)
      
      // Should find 3018 as nearest known machine
      expect(result.nearestKnownMachines[0].machineId).toBe('3018_cnc')
    })

    it('should estimate rigidity for PrintNC-style machine', () => {
      const inputs: MachineRigidityInputs = {
        weightKg: 150,
        workingVolumeMm3: 500 * 500 * 300,
        frameConstructionType: 'steel_welded',
        motionSystemType: 'ballscrew',
        spindleMountType: 'fixed_mount'
      }

      const result = estimateMachineRigidity(inputs)

      // Should be in medium-high rigidity range
      expect(result.estimatedRigidityFactor).toBeGreaterThan(0.4)
      expect(result.estimatedRigidityFactor).toBeLessThan(0.8)
      expect(result.confidence).toBeGreaterThan(0.7)
      
      // Should find PrintNC as nearest known machine
      expect(result.nearestKnownMachines[0].machineId).toBe('printnc')
    })

    it('should estimate rigidity for VMC-style machine', () => {
      const inputs: MachineRigidityInputs = {
        weightKg: 2500,
        workingVolumeMm3: 600 * 400 * 500,
        frameConstructionType: 'cast_iron',
        motionSystemType: 'ballscrew',
        spindleMountType: 'integrated_spindle'
      }

      const result = estimateMachineRigidity(inputs)

      // Should be in high rigidity range
      expect(result.estimatedRigidityFactor).toBeGreaterThan(0.6)
      expect(result.estimatedRigidityFactor).toBeLessThan(1.0)
      expect(result.confidence).toBeGreaterThan(0.8)
      
      // Should find entry_vmc as nearest known machine
      expect(result.nearestKnownMachines[0].machineId).toBe('entry_vmc')
    })
  })

  describe('Component Factor Analysis', () => {
    it('should have higher frame rigidity for cast iron vs aluminum', () => {
      const aluminumInputs: MachineRigidityInputs = {
        weightKg: 50,
        workingVolumeMm3: 400 * 400 * 200,
        frameConstructionType: 'aluminum_extrusion',
        motionSystemType: 'ballscrew',
        spindleMountType: 'fixed_mount'
      }

      const castIronInputs: MachineRigidityInputs = {
        ...aluminumInputs,
        frameConstructionType: 'cast_iron',
        weightKg: 200 // Heavier for cast iron
      }

      const aluminumResult = estimateMachineRigidity(aluminumInputs)
      const castIronResult = estimateMachineRigidity(castIronInputs)

      expect(castIronResult.frameRigidityFactor).toBeGreaterThan(aluminumResult.frameRigidityFactor)
      expect(castIronResult.estimatedRigidityFactor).toBeGreaterThan(aluminumResult.estimatedRigidityFactor)
    })

    it('should have higher motion system factor for ballscrew vs belt', () => {
      const baseInputs: MachineRigidityInputs = {
        weightKg: 100,
        workingVolumeMm3: 500 * 500 * 200,
        frameConstructionType: 'steel_welded',
        motionSystemType: 'belt_drive',
        spindleMountType: 'fixed_mount'
      }

      const beltResult = estimateMachineRigidity(baseInputs)
      const ballscrewResult = estimateMachineRigidity({
        ...baseInputs,
        motionSystemType: 'ballscrew'
      })

      expect(ballscrewResult.motionSystemFactor).toBeGreaterThan(beltResult.motionSystemFactor)
      expect(ballscrewResult.estimatedRigidityFactor).toBeGreaterThan(beltResult.estimatedRigidityFactor)
    })

    it('should have higher spindle mount factor for integrated vs clamp', () => {
      const baseInputs: MachineRigidityInputs = {
        weightKg: 100,
        workingVolumeMm3: 500 * 500 * 200,
        frameConstructionType: 'steel_welded',
        motionSystemType: 'ballscrew',
        spindleMountType: 'router_clamp'
      }

      const clampResult = estimateMachineRigidity(baseInputs)
      const integratedResult = estimateMachineRigidity({
        ...baseInputs,
        spindleMountType: 'integrated_spindle'
      })

      expect(integratedResult.spindleMountFactor).toBeGreaterThan(clampResult.spindleMountFactor)
      expect(integratedResult.estimatedRigidityFactor).toBeGreaterThan(clampResult.estimatedRigidityFactor)
    })
  })

  describe('Size and Weight Effects', () => {
    it('should penalize low weight-to-volume ratio', () => {
      const heavyInputs: MachineRigidityInputs = {
        weightKg: 200,
        workingVolumeMm3: 400 * 400 * 200, // 32L
        frameConstructionType: 'steel_welded',
        motionSystemType: 'ballscrew',
        spindleMountType: 'fixed_mount'
      }

      const lightInputs: MachineRigidityInputs = {
        ...heavyInputs,
        weightKg: 20 // Much lighter for same volume
      }

      const heavyResult = estimateMachineRigidity(heavyInputs)
      const lightResult = estimateMachineRigidity(lightInputs)

      expect(heavyResult.sizePenaltyFactor).toBeGreaterThan(lightResult.sizePenaltyFactor)
      expect(heavyResult.estimatedRigidityFactor).toBeGreaterThan(lightResult.estimatedRigidityFactor)
    })

    it('should apply geometric penalties for tall machines', () => {
      const normalInputs: MachineRigidityInputs = {
        weightKg: 100,
        workingVolumeMm3: 500 * 500 * 200,
        frameConstructionType: 'steel_welded',
        motionSystemType: 'ballscrew',
        spindleMountType: 'fixed_mount',
        heightToWidthRatio: 1.0
      }

      const tallInputs: MachineRigidityInputs = {
        ...normalInputs,
        heightToWidthRatio: 2.0 // Tall machine
      }

      const normalResult = estimateMachineRigidity(normalInputs)
      const tallResult = estimateMachineRigidity(tallInputs)

      expect(tallResult.estimatedRigidityFactor).toBeLessThan(normalResult.estimatedRigidityFactor)
      expect(tallResult.warnings).toContain('High height-to-width ratio may reduce stability')
    })

    it('should apply span penalties for large unsupported spans', () => {
      const normalInputs: MachineRigidityInputs = {
        weightKg: 100,
        workingVolumeMm3: 500 * 500 * 200,
        frameConstructionType: 'steel_welded',
        motionSystemType: 'ballscrew',
        spindleMountType: 'fixed_mount',
        maxSpanMm: 600
      }

      const largeSpanInputs: MachineRigidityInputs = {
        ...normalInputs,
        maxSpanMm: 2000 // Large span
      }

      const normalResult = estimateMachineRigidity(normalInputs)
      const largeSpanResult = estimateMachineRigidity(largeSpanInputs)

      expect(largeSpanResult.estimatedRigidityFactor).toBeLessThan(normalResult.estimatedRigidityFactor)
      expect(largeSpanResult.warnings).toContain('Large unsupported spans reduce rigidity')
    })
  })

  describe('Validation and Similarity Matching', () => {
    it('should find similar known machines', () => {
      // Create inputs similar to Lowrider v3
      const inputs: MachineRigidityInputs = {
        weightKg: 30,
        workingVolumeMm3: 1200 * 2400 * 90,
        frameConstructionType: 'torsion_box',
        motionSystemType: 'belt_drive',
        spindleMountType: 'router_clamp'
      }

      const result = estimateMachineRigidity(inputs)

      expect(result.nearestKnownMachines.length).toBeGreaterThanOrEqual(1)
      expect(result.nearestKnownMachines[0].machineId).toBe('lowrider_v3')
      expect(result.nearestKnownMachines[0].similarity).toBeGreaterThan(0.8)
    })

    it('should provide meaningful similarity reasons', () => {
      const inputs: MachineRigidityInputs = {
        weightKg: 50,
        workingVolumeMm3: 800 * 800 * 80,
        frameConstructionType: 'aluminum_machined',
        motionSystemType: 'ballscrew',
        spindleMountType: 'fixed_mount'
      }

      const result = estimateMachineRigidity(inputs)

      const nearestMachine = result.nearestKnownMachines[0]
      expect(nearestMachine.reason).toContain('same frame construction')
      expect(nearestMachine.reason).toContain('same motion system')
      expect(nearestMachine.reason).toContain('same spindle mount')
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should throw error for invalid weight', () => {
      const inputs: MachineRigidityInputs = {
        weightKg: -5,
        workingVolumeMm3: 400 * 400 * 200,
        frameConstructionType: 'steel_welded',
        motionSystemType: 'ballscrew',
        spindleMountType: 'fixed_mount'
      }

      expect(() => estimateMachineRigidity(inputs)).toThrow('Machine weight must be positive')
    })

    it('should throw error for invalid working volume', () => {
      const inputs: MachineRigidityInputs = {
        weightKg: 100,
        workingVolumeMm3: 0,
        frameConstructionType: 'steel_welded',
        motionSystemType: 'ballscrew',
        spindleMountType: 'fixed_mount'
      }

      expect(() => estimateMachineRigidity(inputs)).toThrow('Working volume must be positive')
    })

    it('should clamp rigidity factor to valid range', () => {
      // Extreme inputs that might produce out-of-range values
      const inputs: MachineRigidityInputs = {
        weightKg: 0.1, // Very light
        workingVolumeMm3: 10000 * 10000 * 1000, // Very large volume
        frameConstructionType: 'aluminum_extrusion',
        motionSystemType: 'belt_drive',
        spindleMountType: 'router_clamp'
      }

      const result = estimateMachineRigidity(inputs)

      expect(result.estimatedRigidityFactor).toBeGreaterThanOrEqual(0.1)
      expect(result.estimatedRigidityFactor).toBeLessThanOrEqual(1.0)
    })

    it('should warn about extreme machine weights', () => {
      const veryLightInputs: MachineRigidityInputs = {
        weightKg: 2,
        workingVolumeMm3: 200 * 200 * 100,
        frameConstructionType: 'aluminum_extrusion',
        motionSystemType: 'belt_drive',
        spindleMountType: 'router_clamp'
      }

      const veryHeavyInputs: MachineRigidityInputs = {
        weightKg: 10000,
        workingVolumeMm3: 1000 * 1000 * 500,
        frameConstructionType: 'cast_iron',
        motionSystemType: 'ballscrew',
        spindleMountType: 'integrated_spindle'
      }

      const lightResult = estimateMachineRigidity(veryLightInputs)
      const heavyResult = estimateMachineRigidity(veryHeavyInputs)

      expect(lightResult.warnings).toContain('Machine weight is outside typical range')
      expect(heavyResult.warnings).toContain('Machine weight is outside typical range')
    })
  })

  describe('Framework Validation', () => {
    it('should validate against known machines with reasonable accuracy', () => {
      const validation = validateEstimationFramework()

      expect(validation.predictions).toHaveLength(6) // All known machines
      expect(validation.averageError).toBeLessThan(0.2) // Average error < 20%
      expect(validation.maxError).toBeLessThan(0.3) // Max error < 30%

      // Check that each prediction is reasonable
      validation.predictions.forEach(prediction => {
        expect(prediction.actualRigidity).toBeGreaterThan(0)
        expect(prediction.estimatedRigidity).toBeGreaterThan(0)
        expect(prediction.error).toBeGreaterThanOrEqual(0)
      })
    })

    it('should have better accuracy for machines with well-known construction types', () => {
      const validation = validateEstimationFramework()

      // Find predictions for 3018 and PrintNC (well-known types)
      const hobbyMachine = validation.predictions.find(p => p.machineId === '3018_cnc')
      const professionalMachine = validation.predictions.find(p => p.machineId === 'entry_vmc')

      expect(hobbyMachine).toBeDefined()
      expect(professionalMachine).toBeDefined()

      // These should have relatively good accuracy
      expect(hobbyMachine!.error).toBeLessThan(0.15)
      expect(professionalMachine!.error).toBeLessThan(0.15)
    })
  })

  describe('Breakdown Analysis', () => {
    it('should provide detailed breakdown of rigidity components', () => {
      const inputs: MachineRigidityInputs = {
        weightKg: 100,
        workingVolumeMm3: 500 * 500 * 200,
        frameConstructionType: 'steel_welded',
        motionSystemType: 'ballscrew',
        spindleMountType: 'fixed_mount'
      }

      const result = estimateMachineRigidity(inputs)

      expect(result.breakdown.frameType).toContain('steel welded')
      expect(result.breakdown.motionSystem).toContain('ballscrew')
      expect(result.breakdown.spindleMount).toContain('fixed mount')
      expect(result.breakdown.sizeAnalysis).toContain('100kg')

      // Check that component factors are in reasonable ranges
      expect(result.frameRigidityFactor).toBeGreaterThan(0.1)
      expect(result.frameRigidityFactor).toBeLessThan(1.0)
      expect(result.motionSystemFactor).toBeGreaterThan(0.5)
      expect(result.motionSystemFactor).toBeLessThan(1.2)
      expect(result.spindleMountFactor).toBeGreaterThan(0.7)
      expect(result.spindleMountFactor).toBeLessThan(1.2)
      expect(result.sizePenaltyFactor).toBeGreaterThan(0.5)
      expect(result.sizePenaltyFactor).toBeLessThan(1.1)
    })
  })

  describe('Confidence Estimation', () => {
    it('should have higher confidence for well-known construction types', () => {
      const knownTypeInputs: MachineRigidityInputs = {
        weightKg: 100,
        workingVolumeMm3: 500 * 500 * 200,
        frameConstructionType: 'cast_iron', // Well-known type
        motionSystemType: 'ballscrew',
        spindleMountType: 'integrated_spindle'
      }

      const unknownTypeInputs: MachineRigidityInputs = {
        weightKg: 100,
        workingVolumeMm3: 500 * 500 * 200,
        frameConstructionType: 'composite', // Less common type
        motionSystemType: 'linear_motor',
        spindleMountType: 'cartridge_spindle'
      }

      const knownResult = estimateMachineRigidity(knownTypeInputs)
      const unknownResult = estimateMachineRigidity(unknownTypeInputs)

      expect(knownResult.confidence).toBeGreaterThan(unknownResult.confidence)
    })

    it('should have lower confidence for extreme parameters', () => {
      const normalInputs: MachineRigidityInputs = {
        weightKg: 100,
        workingVolumeMm3: 500 * 500 * 200,
        frameConstructionType: 'steel_welded',
        motionSystemType: 'ballscrew',
        spindleMountType: 'fixed_mount'
      }

      const extremeInputs: MachineRigidityInputs = {
        weightKg: 8000, // Extreme weight
        workingVolumeMm3: 500 * 500 * 200,
        frameConstructionType: 'steel_welded',
        motionSystemType: 'ballscrew',
        spindleMountType: 'fixed_mount'
      }

      const normalResult = estimateMachineRigidity(normalInputs)
      const extremeResult = estimateMachineRigidity(extremeInputs)

      expect(normalResult.confidence).toBeGreaterThan(extremeResult.confidence)
    })
  })
})