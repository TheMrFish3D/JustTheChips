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
  // Additional useful calculations
  chipThickness: number      // mm or inches - actual chip thickness
  toolDeflection: number     // mm or inches - estimated tool deflection  
  surfaceFinish: number      // Ra in micrometers or microinches
  toolLife: number           // estimated minutes of tool life
  machiningTime: number      // minutes to complete operation
  heatGeneration: number     // watts of heat generated
  chatterFrequency: number   // Hz - critical frequency for chatter
  costPerPart: number        // estimated cost in currency units
  optimization: string[]     // optimization recommendations
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

    // Calculate additional useful parameters
    const chipThickness = this.calculateChipThickness(chipLoad, depthOfCut)
    const toolDeflection = this.calculateToolDeflection(toolConfig, cuttingForce)
    const surfaceFinish = this.calculateSurfaceFinish(feedRate, rpm, toolConfig)
    const toolLife = this.calculateToolLife(material, toolConfig, rpm, feedRate)
    const machiningTime = this.calculateMachiningTime(operation, materialRemovalRate)
    const heatGeneration = this.calculateHeatGeneration(materialRemovalRate, material)
    const chatterFrequency = this.calculateChatterFrequency(toolConfig, machineConfig)
    const costPerPart = this.calculateCostPerPart(toolLife, machiningTime, material)
    const optimization = this.generateOptimizationRecommendations(
      material, toolConfig, operation, spindlePower, cuttingForce, toolDeflection
    )

    // Add additional warnings based on new calculations
    if (toolDeflection > (this.units === 'metric' ? 0.05 : 0.002)) {
      warnings.push('Excessive tool deflection - reduce overhang or cutting forces')
    }
    
    if (heatGeneration > 200) {
      warnings.push('High heat generation - consider better cooling or lighter cuts')
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
      warnings,
      // Additional calculations
      chipThickness: Math.round(chipThickness * 10000) / 10000,
      toolDeflection: Math.round(toolDeflection * 10000) / 10000,
      surfaceFinish: Math.round(surfaceFinish * 100) / 100,
      toolLife: Math.round(toolLife),
      machiningTime: Math.round(machiningTime * 10) / 10,
      heatGeneration: Math.round(heatGeneration),
      chatterFrequency: Math.round(chatterFrequency),
      costPerPart: Math.round(costPerPart * 100) / 100,
      optimization
    }
  }

  /**
   * Calculate RPM from surface speed and diameter
   * Formula: RPM = (Surface Speed × 12) / (π × diameter_inches) for imperial
   *          RPM = (Surface Speed × 1000) / (π × diameter_mm) for metric
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
      // Imperial: RPM = (SFM × 12) / (π × diameter_inches)
      // Note: 3.82 is approximately 12/π, but using exact calculation for precision
      surfaceSpeed = sfm
      rpm = (sfm * 12) / (Math.PI * diameter)
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

  /**
   * Calculate actual chip thickness (different from chip load)
   * Accounts for tool engagement and cutting geometry
   */
  private calculateChipThickness(chipLoad: number, _depthOfCut: number): number {
    // Chip thickness = chip load × sin(engagement angle)
    // For simplification, assume average engagement of 60 degrees for endmills
    const engagementAngle = Math.PI / 3 // 60 degrees in radians
    const chipThickness = chipLoad * Math.sin(engagementAngle)
    return chipThickness
  }

  /**
   * Calculate tool deflection based on cutting forces and tool geometry
   * Uses beam deflection formula for cantilever beam
   */
  private calculateToolDeflection(toolConfig: ToolConfig, cuttingForce: number): number {
    // Deflection = (F × L³) / (3 × E × I)
    // Where: F = force, L = length, E = elastic modulus, I = moment of inertia
    
    const diameter = toolConfig.diameter
    const length = toolConfig.stickout
    
    // Material properties for tool materials
    let elasticModulus: number // GPa or Mpsi
    switch (toolConfig.material) {
      case 'hss':
        elasticModulus = this.units === 'metric' ? 200 : 29 // GPa or Mpsi
        break
      case 'carbide':
        elasticModulus = this.units === 'metric' ? 630 : 91
        break
      case 'ceramic':
        elasticModulus = this.units === 'metric' ? 400 : 58
        break
      case 'diamond':
        elasticModulus = this.units === 'metric' ? 1000 : 145
        break
      default:
        elasticModulus = this.units === 'metric' ? 200 : 29
    }
    
    // Moment of inertia for circular cross-section: I = π × d⁴ / 64
    const momentOfInertia = (Math.PI * Math.pow(diameter, 4)) / 64
    
    // Convert units and calculate deflection
    let deflection: number
    if (this.units === 'metric') {
      // Convert GPa to N/mm², mm to mm
      elasticModulus *= 1000 // GPa to N/mm²
      deflection = (cuttingForce * Math.pow(length, 3)) / (3 * elasticModulus * momentOfInertia)
    } else {
      // Imperial calculations
      elasticModulus *= 1000000 // Mpsi to psi
      deflection = (cuttingForce * Math.pow(length, 3)) / (3 * elasticModulus * momentOfInertia)
    }
    
    return Math.abs(deflection)
  }

  /**
   * Calculate estimated surface finish (Ra)
   * Based on feed rate, tool nose radius, and cutting speed
   */
  private calculateSurfaceFinish(feedRate: number, rpm: number, toolConfig: ToolConfig): number {
    // Simplified surface finish calculation
    // Ra ≈ (feed_per_tooth²) / (8 × nose_radius)
    
    const feedPerTooth = feedRate / (rpm * toolConfig.flutes)
    
    // Estimate nose radius based on tool type
    let noseRadius: number
    switch (toolConfig.type) {
      case 'ball-endmill':
        noseRadius = toolConfig.diameter / 2
        break
      case 'flat-endmill':
        noseRadius = 0.05 // Small corner radius
        break
      default:
        noseRadius = 0.1
    }
    
    const surfaceFinish = Math.pow(feedPerTooth, 2) / (8 * noseRadius)
    
    // Convert to appropriate units (micrometers for metric, microinches for imperial)
    if (this.units === 'metric') {
      return surfaceFinish * 1000 // Convert mm to micrometers
    } else {
      return surfaceFinish * 1000000 // Convert inches to microinches
    }
  }

  /**
   * Estimate tool life based on cutting conditions
   * Uses Taylor's tool life equation: VT^n = C
   */
  private calculateToolLife(material: MaterialProperties, toolConfig: ToolConfig, rpm: number, _feedRate: number): number {
    // Taylor's equation parameters vary by material and tool
    let taylorC: number // Tool life constant
    let taylorN: number // Tool life exponent
    
    // Values based on tool material and workpiece material
    switch (toolConfig.material) {
      case 'carbide':
        taylorC = 400
        taylorN = 0.25
        break
      case 'hss':
        taylorC = 100
        taylorN = 0.125
        break
      case 'ceramic':
        taylorC = 1000
        taylorN = 0.35
        break
      case 'diamond':
        taylorC = 2000
        taylorN = 0.4
        break
      default:
        taylorC = 200
        taylorN = 0.2
    }
    
    // Adjust for material hardness
    const hardnessFactor = 11 - material.machinabilityRating // Invert machinability
    taylorC /= Math.pow(hardnessFactor, 0.5)
    
    // Calculate surface speed
    const diameter = toolConfig.diameter
    const surfaceSpeed = this.units === 'metric' 
      ? (rpm * Math.PI * diameter) / 1000 // m/min
      : (rpm * Math.PI * diameter) / 12   // ft/min
    
    // Tool life in minutes
    const toolLife = Math.pow(taylorC / surfaceSpeed, 1 / taylorN)
    
    return Math.max(toolLife, 1) // Minimum 1 minute
  }

  /**
   * Calculate estimated machining time for the operation
   */
  private calculateMachiningTime(operation: OperationConfig, materialRemovalRate: number): number {
    // Estimate based on operation type and material removal rate
    let estimatedVolume: number // cm³ or in³
    
    switch (operation.type) {
      case 'drilling':
        estimatedVolume = this.units === 'metric' ? 1 : 0.06 // Small hole
        break
      case 'slotting':
        estimatedVolume = this.units === 'metric' ? 10 : 0.6 // 10cm or 0.6in³ slot
        break
      case 'pocketing':
        estimatedVolume = this.units === 'metric' ? 50 : 3 // Larger pocket
        break
      case 'facing':
        estimatedVolume = this.units === 'metric' ? 5 : 0.3 // Surface area
        break
      default:
        estimatedVolume = this.units === 'metric' ? 20 : 1.2
    }
    
    const machiningTime = estimatedVolume / Math.max(materialRemovalRate, 0.1)
    
    return machiningTime
  }

  /**
   * Calculate heat generation during machining
   */
  private calculateHeatGeneration(materialRemovalRate: number, material: MaterialProperties): number {
    // Heat generation = MRR × specific_energy × efficiency
    // Most cutting energy converts to heat
    
    let specificEnergy: number // J/cm³ or in-lb/in³
    
    switch (material.category) {
      case 'Wood':
        specificEnergy = this.units === 'metric' ? 0.2 : 0.03
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
    
    // 80% of cutting energy becomes heat
    const heatGeneration = materialRemovalRate * specificEnergy * 0.8
    
    return heatGeneration
  }

  /**
   * Calculate chatter frequency for vibration analysis
   */
  private calculateChatterFrequency(toolConfig: ToolConfig, machineConfig: MachineConfig): number {
    // Simplified chatter frequency calculation
    // f = (k × flutes × RPM) / 60
    // Where k is typically 0.75-1.0 for regenerative chatter
    
    const k = 0.8 // Chatter factor
    const rpm = Math.min(24000, machineConfig.spindle.maxRpm) // Use actual RPM when available
    
    const chatterFreq = (k * toolConfig.flutes * rpm) / 60
    
    return chatterFreq
  }

  /**
   * Calculate estimated cost per part
   */
  private calculateCostPerPart(toolLife: number, machiningTime: number, material: MaterialProperties): number {
    // Simple cost model: tool cost + machine time cost + material cost
    
    const machineRatePerMinute = 1.00 // Machine rate per minute
    const materialCostFactor = (11 - material.machinabilityRating) * 0.10 // Harder materials cost more
    
    const toolCost = (machiningTime / toolLife) * 20 // Tool cost amortized
    const machineTimeCost = machiningTime * machineRatePerMinute
    const materialCost = materialCostFactor
    
    return toolCost + machineTimeCost + materialCost
  }

  /**
   * Generate optimization recommendations
   */
  private generateOptimizationRecommendations(
    material: MaterialProperties,
    toolConfig: ToolConfig, 
    operation: OperationConfig,
    spindlePower: number,
    cuttingForce: number,
    toolDeflection: number
  ): string[] {
    const recommendations: string[] = []
    
    // Power optimization
    if (spindlePower < 30) {
      recommendations.push('Power usage is low - consider increasing feed rate or depth of cut for better productivity')
    } else if (spindlePower > 80) {
      recommendations.push('High power usage - reduce cutting parameters to avoid spindle overload')
    }
    
    // Tool deflection optimization
    const deflectionLimit = this.units === 'metric' ? 0.02 : 0.0008
    if (toolDeflection > deflectionLimit) {
      recommendations.push('Reduce tool stickout or cutting forces to minimize deflection and improve accuracy')
    }
    
    // Material-specific recommendations
    if (material.machinabilityRating < 5) {
      recommendations.push('Difficult material - consider carbide or coated tools, and use adequate coolant')
    }
    
    if (material.workHardening > 1.5) {
      recommendations.push('Work hardening material - maintain consistent feed rate and avoid dwelling')
    }
    
    // Tool-specific recommendations
    if (toolConfig.material === 'hss' && material.category === 'Steel') {
      recommendations.push('Consider upgrading to carbide tools for better performance with steel')
    }
    
    if (operation.finish === 'finishing' && cuttingForce > 200) {
      recommendations.push('Use smaller chip loads and higher spindle speeds for better surface finish')
    }
    
    return recommendations
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