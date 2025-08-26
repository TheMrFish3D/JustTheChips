// Machining calculations engine
// Implements industry-standard formulas for feeds, speeds, and forces

import type { MaterialProperties } from './materials'
import { getMaterialById } from './materials'

export interface MachineConfig {
  spindle: {
    power: number      // kW or HP
    frequency: number  // Hz
    maxRpm: number
  }
  motors: {
    xTorque: number    // Nm or lb-ft
    xCount: number
    yTorque: number
    yCount: number
    zTorque: number
    zCount: number
  }
  coolant: 'vacuum' | 'mist' | 'flood' | 'airblast'
}

export interface ToolConfig {
  type: 'flat-endmill' | 'ball-endmill' | 'insert-endmill' | 'drill' | 'threadmill' | 'vbit' | 'chamfer'
  diameter: number     // mm or inches
  flutes: number
  stickout: number     // mm or inches
  material: 'hss' | 'carbide' | 'ceramic' | 'diamond'
  coating: 'none' | 'tin' | 'ticn' | 'tialn' | 'dlc' | 'diamond'
}

export interface OperationConfig {
  type: 'slotting' | 'facing' | 'contour' | 'adaptive' | 'pocketing' | 'drilling' | 'threading'
  finish: 'roughing' | 'finishing'
}

export interface CalculationResult {
  material: string
  operation: string
  rpm: number
  feedRate: number           // mm/min or in/min
  feedPerTooth: number       // mm or inches
  depthOfCut: number         // mm or inches
  stepover: number           // mm or inches
  materialRemovalRate: number // cm³/min or in³/min
  spindlePower: number       // percentage of available power
  cuttingForce: number       // N or lbf
  surfaceSpeed: number       // m/min or ft/min
  warnings: string[]
}

export class MachiningCalculator {
  private units: 'metric' | 'imperial'

  constructor(units: 'metric' | 'imperial' = 'metric') {
    this.units = units
  }

  /**
   * Calculate optimal cutting parameters for given configuration
   */
  calculate(
    machineConfig: MachineConfig,
    toolConfig: ToolConfig,
    materialId: string,
    operation: OperationConfig
  ): CalculationResult | null {
    const material = getMaterialById(materialId)
    if (!material) {
      return null
    }

    const warnings: string[] = []

    // Get surface speed (SFM) based on tool material
    const sfm = material.sfm[toolConfig.material]
    
    // Convert SFM to appropriate units and calculate RPM
    const { rpm, surfaceSpeed } = this.calculateRPM(sfm, toolConfig.diameter)
    
    // Check if RPM exceeds spindle capacity
    if (rpm > machineConfig.spindle.maxRpm) {
      warnings.push(`Calculated RPM (${Math.round(rpm)}) exceeds spindle max (${machineConfig.spindle.maxRpm})`)
    }

    // Get chip load based on tool type and finish
    const chipLoad = this.getChipLoad(material, toolConfig, operation)
    
    // Calculate feed rate
    const feedRate = this.calculateFeedRate(rpm, toolConfig.flutes, chipLoad)
    
    // Calculate cutting depths based on operation and tool
    const { depthOfCut, stepover } = this.calculateCuttingDepths(toolConfig, operation)
    
    // Calculate material removal rate
    const materialRemovalRate = this.calculateMRR(feedRate, depthOfCut, stepover)
    
    // Calculate cutting forces
    const cuttingForce = this.calculateCuttingForce(material, chipLoad, depthOfCut, stepover)
    
    // Calculate spindle power requirements
    const spindlePower = this.calculateSpindlePower(materialRemovalRate, material, machineConfig.spindle.power)
    
    // Add power warnings
    if (spindlePower > 90) {
      warnings.push('High spindle power usage - consider reducing feed rate or depth of cut')
    }
    
    // Add cutting force warnings
    const maxForceLimit = this.units === 'metric' ? 500 : 112 // N or lbf
    if (cuttingForce > maxForceLimit) {
      warnings.push('High cutting forces detected - consider lighter cuts')
    }

    return {
      material: material.name,
      operation: operation.type,
      rpm: Math.round(rpm),
      feedRate: Math.round(feedRate * 10) / 10,
      feedPerTooth: Math.round(chipLoad * 1000) / 1000,
      depthOfCut: Math.round(depthOfCut * 100) / 100,
      stepover: Math.round(stepover * 100) / 100,
      materialRemovalRate: Math.round(materialRemovalRate * 100) / 100,
      spindlePower: Math.round(spindlePower),
      cuttingForce: Math.round(cuttingForce),
      surfaceSpeed: Math.round(surfaceSpeed),
      warnings
    }
  }

  /**
   * Calculate RPM from surface speed and diameter
   * Formula: RPM = (SFM × 3.82) / diameter_inches  (for metric: RPM = (SMM × 1000) / (π × diameter_mm))
   */
  private calculateRPM(sfm: number, diameter: number): { rpm: number, surfaceSpeed: number } {
    let rpm: number
    let surfaceSpeed: number

    if (this.units === 'metric') {
      // Convert SFM to SMM (surface meters per minute)
      const smm = sfm * 0.3048
      surfaceSpeed = smm
      // RPM = (SMM × 1000) / (π × diameter_mm)
      rpm = (smm * 1000) / (Math.PI * diameter)
    } else {
      // Imperial: RPM = (SFM × 3.82) / diameter_inches
      surfaceSpeed = sfm
      rpm = (sfm * 3.82) / diameter
    }

    return { rpm, surfaceSpeed }
  }

  /**
   * Get appropriate chip load based on material, tool, and operation
   */
  private getChipLoad(material: MaterialProperties, toolConfig: ToolConfig, operation: OperationConfig): number {
    const finish = operation.finish
    let baseChipLoad: number

    // Get base chip load from material database
    switch (toolConfig.type) {
      case 'flat-endmill':
      case 'insert-endmill':
        baseChipLoad = material.chipLoad[finish].flatEndmill
        break
      case 'ball-endmill':
        baseChipLoad = material.chipLoad[finish].ballEndmill
        break
      case 'drill':
      case 'threadmill':
        baseChipLoad = material.chipLoad[finish].drill
        break
      default:
        baseChipLoad = material.chipLoad[finish].flatEndmill
    }

    // Apply modifiers based on tool coating
    let coatingFactor = 1.0
    switch (toolConfig.coating) {
      case 'tin':
        coatingFactor = 1.1
        break
      case 'ticn':
        coatingFactor = 1.15
        break
      case 'tialn':
        coatingFactor = 1.2
        break
      case 'dlc':
        coatingFactor = 1.25
        break
      case 'diamond':
        coatingFactor = 1.3
        break
    }

    // Apply stickout penalty (longer stickout = reduced chip load for stability)
    let stickoutFactor = 1.0
    const stickoutRatio = toolConfig.stickout / toolConfig.diameter
    if (stickoutRatio > 3) {
      stickoutFactor = 0.8
    } else if (stickoutRatio > 4) {
      stickoutFactor = 0.6
    }

    // Convert to metric if needed
    let adjustedChipLoad = baseChipLoad * coatingFactor * stickoutFactor
    if (this.units === 'metric') {
      adjustedChipLoad *= 25.4 // Convert inches to mm
    }

    return adjustedChipLoad
  }

  /**
   * Calculate feed rate
   * Formula: Feed Rate = RPM × Number of Flutes × Chip Load
   */
  private calculateFeedRate(rpm: number, flutes: number, chipLoad: number): number {
    return rpm * flutes * chipLoad
  }

  /**
   * Calculate appropriate depth of cut and stepover based on operation
   */
  private calculateCuttingDepths(toolConfig: ToolConfig, operation: OperationConfig): { depthOfCut: number, stepover: number } {
    const diameter = toolConfig.diameter
    let depthOfCut: number
    let stepover: number

    // Base depth and stepover as percentage of tool diameter
    switch (operation.type) {
      case 'slotting':
        depthOfCut = diameter * 0.2  // 20% of diameter
        stepover = diameter * 1.0    // Full diameter for slotting
        break
      case 'pocketing':
      case 'adaptive':
        depthOfCut = diameter * 0.15 // 15% of diameter
        stepover = diameter * 0.4    // 40% stepover for pocketing
        break
      case 'facing':
      case 'contour':
        depthOfCut = diameter * 0.05 // 5% of diameter for finishing
        stepover = diameter * 0.1    // 10% stepover
        break
      case 'drilling':
        depthOfCut = diameter * 0.5  // 50% for drilling pecks
        stepover = 0                 // No stepover for drilling
        break
      case 'threading':
        depthOfCut = diameter * 0.05 // Light cuts for threading
        stepover = diameter * 0.1
        break
      default:
        depthOfCut = diameter * 0.1
        stepover = diameter * 0.3
    }

    // Adjust for finishing vs roughing
    if (operation.finish === 'finishing') {
      depthOfCut *= 0.5  // Half depth for finishing
      stepover *= 0.5    // Smaller stepover for better finish
    }

    return { depthOfCut, stepover }
  }

  /**
   * Calculate material removal rate
   * Formula: MRR = feed_rate × axial_depth × radial_depth
   */
  private calculateMRR(feedRate: number, depthOfCut: number, stepover: number): number {
    // Convert to volume units (cm³/min or in³/min)
    const mrr = (feedRate * depthOfCut * stepover) / (this.units === 'metric' ? 1000 : 1)
    return mrr
  }

  /**
   * Calculate cutting forces based on material properties and cutting conditions
   */
  private calculateCuttingForce(material: MaterialProperties, chipLoad: number, depthOfCut: number, _stepover: number): number {
    // Cutting force formula: F = Kc × chip_area
    // Where Kc is specific cutting force and chip_area is cross-sectional area of chip
    
    const chipArea = chipLoad * depthOfCut // Cross-sectional area of chip
    let specificForce = material.specificCuttingForce // N/mm²
    
    // Convert to proper units
    if (this.units === 'imperial') {
      specificForce *= 0.145 // Convert N/mm² to psi, then to lbf/in²
      // Convert mm² to in²
    }
    
    const cuttingForce = specificForce * chipArea * material.workHardening
    
    // Convert to display units
    if (this.units === 'imperial') {
      return cuttingForce * 0.2248 // Convert N to lbf
    }
    
    return cuttingForce
  }

  /**
   * Calculate spindle power requirements as percentage of available power
   */
  private calculateSpindlePower(mrr: number, material: MaterialProperties, maxPower: number): number {
    // Power formula: P = MRR × specific_energy
    // Specific energy varies by material (J/cm³ or in-lb/in³)
    
    let specificEnergy: number // Energy required per unit volume
    
    // Estimate specific energy based on material properties
    switch (material.category) {
      case 'Wood':
        specificEnergy = this.units === 'metric' ? 0.2 : 0.03 // J/cm³ or in-lb/in³
        break
      case 'Plastic':
        specificEnergy = this.units === 'metric' ? 0.5 : 0.07
        break
      case 'Aluminum':
        specificEnergy = this.units === 'metric' ? 1.5 : 0.22
        break
      case 'Steel':
        specificEnergy = this.units === 'metric' ? 3.0 : 0.44
        break
      case 'Copper Alloy':
        specificEnergy = this.units === 'metric' ? 1.2 : 0.18
        break
      default:
        specificEnergy = this.units === 'metric' ? 1.0 : 0.15
    }
    
    const requiredPower = mrr * specificEnergy / 1000 // Convert to kW or HP
    const powerPercentage = (requiredPower / maxPower) * 100
    
    return Math.max(powerPercentage, 5) // Minimum 5% for spindle overhead
  }
}

/**
 * Calculate multiple operations for multiple materials
 */
export function calculateParameters(
  machineConfig: MachineConfig,
  toolConfig: ToolConfig,
  materialIds: string[],
  operations: OperationConfig[],
  units: 'metric' | 'imperial' = 'metric'
): CalculationResult[] {
  const calculator = new MachiningCalculator(units)
  const results: CalculationResult[] = []

  for (const materialId of materialIds) {
    for (const operation of operations) {
      const result = calculator.calculate(machineConfig, toolConfig, materialId, operation)
      if (result) {
        results.push(result)
      }
    }
  }

  return results
}