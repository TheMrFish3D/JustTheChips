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
  stickout: number     // mm or inches - total stickout from spindle face
  material: 'hss' | 'carbide' | 'ceramic' | 'diamond'
  coating: 'none' | 'tin' | 'ticn' | 'tialn' | 'dlc' | 'diamond'
  // Tool deflection analysis specific fields
  holderType: 'collet' | 'shrink-fit' | 'hydraulic' | 'side-lock' | 'end-mill-holder' | 'drill-chuck'
  projectionLength: number    // mm or inches - actual cutting tool projection beyond holder
  coreDiameter?: number | null       // mm or inches - tool core diameter (optional, calculated if not provided)
  helixAngle?: number | null         // degrees - helix angle (affects cutting forces)
  runoutTolerance?: number | null    // mm or inches - tool runout (affects cutting forces)
}

export interface OperationConfig {
  type: 'slotting' | 'facing' | 'contour' | 'adaptive' | 'pocketing' | 'drilling' | 'threading'
  finish: 'roughing' | 'finishing'
}

export interface ToolMaterialProperties {
  elasticModulus: number
  shearModulus: number
  density: number
  tensileStrength: number
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
  toolDeflection: number     // mm or inches - total tool deflection  
  surfaceFinish: number      // Ra in micrometers or microinches
  toolLife: number           // estimated minutes of tool life
  machiningTime: number      // minutes to complete operation
  heatGeneration: number     // watts of heat generated
  chatterFrequency: number   // Hz - critical frequency for chatter
  costPerPart: number        // estimated cost in currency units
  optimization: string[]     // optimization recommendations
  // Comprehensive deflection analysis
  deflectionAnalysis: {
    lateralDeflection: number    // mm or inches - lateral beam deflection
    torsionalDeflection: number  // mm or inches - torsional deflection converted to linear
    staticDeflection: number     // mm or inches - combined static deflection
    totalDeflection: number      // mm or inches - including dynamic effects
    dynamicFactor: number        // amplification factor for dynamic effects
    naturalFrequency: number     // Hz - tool natural frequency
    effectiveDiameter: number    // mm or inches - considering flute depth
    limitingFactor: string       // what limits maximum depth of cut
    holderStiffnessFactor: number // tool holder stiffness factor
  }
  // Maximum depth of cut analysis
  maxDepthAnalysis: {
    powerLimit: number           // mm or inches - power-limited max depth
    deflectionLimit: number      // mm or inches - deflection-limited max depth
    strengthLimit: number        // mm or inches - tool strength-limited max depth
    stabilityLimit: number       // mm or inches - chatter stability-limited max depth
    rigidityLimit: number        // mm or inches - machine rigidity-limited max depth
    overallLimit: number         // mm or inches - most restrictive limit
    limitingFactor: string       // which factor is most restrictive
  }
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
    
    // Calculate cutting depths based on operation, tool, and material
    const { depthOfCut, stepover } = this.calculateCuttingDepths(toolConfig, operation, material)
    
    // Calculate material removal rate
    const materialRemovalRate = this.calculateMRR(feedRate, depthOfCut, stepover)
    
    // Calculate cutting forces
    const cuttingForce = this.calculateCuttingForce(material, chipLoad, depthOfCut)
    
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

    // Calculate comprehensive deflection analysis
    const deflectionAnalysis = this.calculateComprehensiveDeflection(toolConfig, cuttingForce)
    
    // Calculate maximum depth of cut analysis
    const maxDepthAnalysis = this.calculateMaximumDepthOfCut(toolConfig, operation, material)

    // Calculate additional useful parameters
    const chipThickness = this.calculateChipThickness(chipLoad)
    const surfaceFinish = this.calculateSurfaceFinish(feedRate, rpm, toolConfig)
    const toolLife = this.calculateToolLife(material, toolConfig, rpm)
    const machiningTime = this.calculateMachiningTime(operation, materialRemovalRate)
    const heatGeneration = this.calculateHeatGeneration(materialRemovalRate, material)
    const chatterFrequency = this.calculateChatterFrequency(toolConfig, machineConfig)
    const costPerPart = this.calculateCostPerPart(toolLife, machiningTime, material)
    const optimization = this.generateOptimizationRecommendations(
      material, toolConfig, operation, spindlePower, cuttingForce, deflectionAnalysis.totalDeflection
    )

    // Add additional warnings based on comprehensive analysis
    if (deflectionAnalysis.totalDeflection > (this.units === 'metric' ? 0.05 : 0.002)) {
      warnings.push('Excessive tool deflection - reduce overhang or cutting forces')
    }
    
    if (deflectionAnalysis.dynamicFactor > 2.0) {
      warnings.push('High dynamic amplification - consider avoiding resonance speeds')
    }
    
    if (depthOfCut >= maxDepthAnalysis.overallLimit * 0.9) {
      warnings.push(`Depth of cut near maximum limit (${maxDepthAnalysis.limitingFactor} constrained)`)
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
      toolDeflection: Math.round(deflectionAnalysis.totalDeflection * 10000) / 10000,
      surfaceFinish: Math.round(surfaceFinish * 100) / 100,
      toolLife: Math.round(toolLife),
      machiningTime: Math.round(machiningTime * 10) / 10,
      heatGeneration: Math.round(heatGeneration),
      chatterFrequency: Math.round(chatterFrequency),
      costPerPart: Math.round(costPerPart * 100) / 100,
      optimization,
      // Comprehensive deflection analysis
      deflectionAnalysis: {
        lateralDeflection: Math.round(deflectionAnalysis.lateralDeflection * 10000) / 10000,
        torsionalDeflection: Math.round(deflectionAnalysis.torsionalDeflection * 10000) / 10000,
        staticDeflection: Math.round(deflectionAnalysis.staticDeflection * 10000) / 10000,
        totalDeflection: Math.round(deflectionAnalysis.totalDeflection * 10000) / 10000,
        dynamicFactor: Math.round(deflectionAnalysis.dynamicFactor * 100) / 100,
        naturalFrequency: Math.round(deflectionAnalysis.naturalFrequency),
        effectiveDiameter: Math.round(deflectionAnalysis.effectiveDiameter * 100) / 100,
        limitingFactor: 'analysis', // Will be set by comprehensive analysis
        holderStiffnessFactor: Math.round(deflectionAnalysis.holderStiffnessFactor * 100) / 100
      },
      // Maximum depth of cut analysis
      maxDepthAnalysis: {
        powerLimit: Math.round(maxDepthAnalysis.powerLimit * 100) / 100,
        deflectionLimit: Math.round(maxDepthAnalysis.deflectionLimit * 100) / 100,
        strengthLimit: Math.round(maxDepthAnalysis.strengthLimit * 100) / 100,
        stabilityLimit: Math.round(maxDepthAnalysis.stabilityLimit * 100) / 100,
        rigidityLimit: Math.round(maxDepthAnalysis.rigidityLimit * 100) / 100,
        overallLimit: Math.round(maxDepthAnalysis.overallLimit * 100) / 100,
        limitingFactor: maxDepthAnalysis.limitingFactor
      }
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
   * Calculate appropriate depth of cut and stepover based on operation, material, and tool properties
   */
  private calculateCuttingDepths(toolConfig: ToolConfig, operation: OperationConfig, material?: MaterialProperties): { depthOfCut: number, stepover: number } {
    const diameter = toolConfig.diameter
    let depthOfCut: number
    let stepover: number

    // More aggressive base depth and stepover values based on industry standards
    switch (operation.type) {
      case 'slotting':
        depthOfCut = diameter * (operation.finish === 'roughing' ? 0.4 : 0.15)  // 40% roughing, 15% finishing
        stepover = diameter * 1.0    // Full diameter for slotting
        break
      case 'pocketing':
      case 'adaptive':
        depthOfCut = diameter * (operation.finish === 'roughing' ? 0.3 : 0.12)  // 30% roughing, 12% finishing
        stepover = diameter * (operation.finish === 'roughing' ? 0.5 : 0.3)     // Adaptive stepover
        break
      case 'facing':
      case 'contour':
        depthOfCut = diameter * (operation.finish === 'roughing' ? 0.25 : 0.08) // 25% roughing, 8% finishing
        stepover = diameter * (operation.finish === 'roughing' ? 0.15 : 0.08)   // Conservative stepover
        break
      case 'drilling':
        depthOfCut = diameter * 0.75 // 75% for drilling pecks (more aggressive)
        stepover = 0                 // No stepover for drilling
        break
      case 'threading':
        depthOfCut = diameter * 0.08 // Light cuts for threading
        stepover = diameter * 0.1
        break
      default:
        depthOfCut = diameter * (operation.finish === 'roughing' ? 0.2 : 0.08)
        stepover = diameter * (operation.finish === 'roughing' ? 0.4 : 0.2)
    }

    // Apply material-based adjustments if material is provided
    if (material) {
      const materialFactor = this.getMaterialDepthFactor(material)
      depthOfCut *= materialFactor
    }

    // Apply tool material and coating factors
    const toolFactor = this.getToolDepthFactor(toolConfig)
    depthOfCut *= toolFactor

    // Apply stickout penalty for tool deflection
    const stickoutFactor = this.getStickoutDepthFactor(toolConfig)
    depthOfCut *= stickoutFactor

    // Calculate maximum depth based on multiple constraints
    const maxDepthLimits = this.calculateMaximumDepthOfCut(toolConfig, operation, material)
    
    // Apply the most restrictive limit
    depthOfCut = Math.min(depthOfCut, maxDepthLimits.overallLimit)

    // Ensure minimum depth of cut (0.01mm or 0.0004")
    const minDepth = this.units === 'metric' ? 0.01 : 0.0004
    depthOfCut = Math.max(depthOfCut, minDepth)

    return { depthOfCut, stepover }
  }

  /**
   * Calculate maximum depth of cut based on multiple engineering constraints
   */
  private calculateMaximumDepthOfCut(
    toolConfig: ToolConfig, 
    operation: OperationConfig, 
    material?: MaterialProperties
  ) {
    const diameter = toolConfig.diameter
    
    // 1. Power-limited depth of cut
    const powerLimit = this.calculatePowerLimitedDepth(toolConfig, operation, material)
    
    // 2. Deflection-limited depth of cut
    const deflectionLimit = this.calculateDeflectionLimitedDepth(toolConfig, operation)
    
    // 3. Tool strength-limited depth of cut
    const strengthLimit = this.calculateStrengthLimitedDepth(toolConfig, operation)
    
    // 4. Stability-limited depth of cut (chatter avoidance)
    const stabilityLimit = this.calculateStabilityLimitedDepth(toolConfig, operation, material)
    
    // 5. Machine rigidity consideration (future enhancement)
    const rigidityLimit = diameter * 0.5 // Conservative assumption for now
    
    // Apply safety factors
    const safetyFactor = this.getSafetyFactor(operation)
    
    const powerLimitSafe = powerLimit / safetyFactor
    const deflectionLimitSafe = deflectionLimit / safetyFactor
    const strengthLimitSafe = strengthLimit / safetyFactor
    const stabilityLimitSafe = stabilityLimit / safetyFactor
    
    // Overall limit is the most restrictive (excluding deflection per user request)
    const overallLimit = Math.min(
      powerLimitSafe,
      strengthLimitSafe,
      stabilityLimitSafe,
      rigidityLimit
    )
    
    return {
      powerLimit: powerLimitSafe,
      deflectionLimit: deflectionLimitSafe,
      strengthLimit: strengthLimitSafe,
      stabilityLimit: stabilityLimitSafe,
      rigidityLimit,
      overallLimit,
      limitingFactor: this.identifyLimitingFactor({
        power: powerLimitSafe,
        strength: strengthLimitSafe,
        stability: stabilityLimitSafe,
        rigidity: rigidityLimit
      })
    }
  }

  /**
   * Calculate power-limited maximum depth of cut
   * Based on available spindle power and machining efficiency
   */
  private calculatePowerLimitedDepth(
    toolConfig: ToolConfig,
    _operation: OperationConfig,
    material?: MaterialProperties
  ): number {
    // For now, use a conservative approach
    // This will be enhanced when machine config is available in context
    const diameter = toolConfig.diameter
    
    // Estimate power requirement based on material and operation
    let specificPowerEstimate = 2.0 // kW per cm³/min for moderate materials
    
    if (material) {
      switch (material.category) {
        case 'Wood':
          specificPowerEstimate = 0.2
          break
        case 'Plastic':
          specificPowerEstimate = 0.5
          break
        case 'Aluminum':
          specificPowerEstimate = 1.5
          break
        case 'Steel':
          specificPowerEstimate = 3.0
          break
        case 'Copper Alloy':
          specificPowerEstimate = 1.2
          break
        default:
          specificPowerEstimate = 2.0
      }
    }
    
    // Assume typical machine power (will be improved with actual machine config)
    const typicalPower = Math.max(3.0, diameter * 0.5) // Scale with tool size
    const usablePower = typicalPower * 0.8 // 80% power utilization limit
    
    // Power-limited depth calculation
    // P = MRR × specific_power, MRR = feed × depth × stepover
    // Assuming moderate feed and stepover for this calculation
    const assumedFeedRate = 1000 // mm/min
    const assumedStepover = diameter * 0.3
    
    const maxMRR = usablePower / specificPowerEstimate
    const powerLimitedDepth = (maxMRR * 1000) / (assumedFeedRate * assumedStepover)
    
    return Math.min(powerLimitedDepth, diameter * 0.8) // Cap at 80% of diameter
  }

  /**
   * Calculate deflection-limited maximum depth of cut
   * Based on acceptable deflection tolerances
   */
  private calculateDeflectionLimitedDepth(
    toolConfig: ToolConfig,
    operation: OperationConfig
  ): number {
    // Define acceptable deflection limits based on operation type
    let maxAcceptableDeflection: number
    
    if (operation.finish === 'finishing') {
      maxAcceptableDeflection = this.units === 'metric' ? 0.005 : 0.0002 // High precision
    } else {
      maxAcceptableDeflection = this.units === 'metric' ? 0.02 : 0.0008 // General machining
    }
    
    // Use iterative approach to find maximum depth that keeps deflection within limits
    const diameter = toolConfig.diameter
    const testDepth = diameter * 0.1 // Start conservative
    const increment = diameter * 0.01
    let maxSafeDepth = testDepth
    
    // Estimate cutting force coefficient
    const forceCoefficient = 800 // N/mm² typical for moderate materials
    
    for (let depth = testDepth; depth <= diameter; depth += increment) {
      // Estimate cutting force for this depth
      const estimatedForce = forceCoefficient * depth * (diameter * 0.1) // Simplified
      
      // Calculate tool deflection using tool-specific analysis
      const materialProps = this.getToolMaterialProperties(toolConfig.material)
      const holderStiffnessFactor = this.getToolHolderStiffnessFactor(toolConfig.holderType)
      const deflection = this.calculateToolLateralDeflection(
        estimatedForce,
        toolConfig.projectionLength,
        this.getEffectiveToolDiameter(toolConfig),
        materialProps.elasticModulus,
        holderStiffnessFactor
      )
      
      if (deflection <= maxAcceptableDeflection) {
        maxSafeDepth = depth
      } else {
        break
      }
    }
    
    return maxSafeDepth
  }

  /**
   * Calculate tool strength-limited maximum depth of cut
   * Based on tool material ultimate strength and stress concentration
   */
  private calculateStrengthLimitedDepth(
    toolConfig: ToolConfig,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _operation: OperationConfig
  ): number {
    const diameter = toolConfig.diameter
    const materialProps = this.getToolMaterialProperties(toolConfig.material)
    
    // Calculate minimum cross-sectional area (at flute root)
    const effectiveDiameter = this.getEffectiveToolDiameter(toolConfig)
    const minArea = Math.PI * Math.pow(effectiveDiameter, 2) / 4
    
    // Maximum allowable force based on material strength
    // Apply stress concentration factor for fluted tools
    const stressConcentrationFactor = 1.5 + (toolConfig.flutes - 2) * 0.1
    const maxAllowableStress = materialProps.tensileStrength / (3.0 * stressConcentrationFactor) // Safety factor of 3
    const maxAllowableForce = maxAllowableStress * minArea
    
    // Convert force limit to depth limit
    // F = Kc × a × fz × D (simplified cutting force model)
    const assumedKc = 800 // N/mm² cutting force coefficient
    const assumedFeedPerTooth = 0.05 // mm conservative
    
    const strengthLimitedDepth = maxAllowableForce / (assumedKc * assumedFeedPerTooth * diameter)
    
    return Math.min(strengthLimitedDepth, diameter * 0.6) // Cap at 60% of diameter
  }

  /**
   * Calculate chatter stability-limited maximum depth of cut
   * Based on simplified stability lobe theory
   */
  private calculateStabilityLimitedDepth(
    toolConfig: ToolConfig,
    _operation: OperationConfig,
    material?: MaterialProperties
  ): number {
    const diameter = toolConfig.diameter
    
    // const materialProps = this.getToolMaterialProperties(toolConfig.material)
    // const naturalFreq = this.calculateNaturalFrequency(toolConfig, materialProps)
    
    // Simplified stability limit calculation
    // This is a conservative approximation - full stability analysis requires
    // detailed modal analysis and cutting force coefficients
    
    const stickoutRatio = toolConfig.stickout / diameter
    let stabilityFactor = 1.0
    
    if (stickoutRatio > 3) {
      stabilityFactor = 0.5 / Math.pow(stickoutRatio / 3, 1.5)
    }
    
    // Material-based cutting force coefficient
    let cuttingForceCoeff = 800 // Default N/mm²
    if (material) {
      cuttingForceCoeff = material.specificCuttingForce
    }
    
    // Simplified stability limit
    const baseStabilityDepth = diameter * 0.2 // Conservative base
    const stabilityLimitedDepth = baseStabilityDepth * stabilityFactor * (1000 / cuttingForceCoeff)
    
    return Math.max(stabilityLimitedDepth, diameter * 0.05) // Minimum 5% of diameter
  }

  /**
   * Get safety factor based on operation type and criticality
   */
  private getSafetyFactor(operation: OperationConfig): number {
    if (operation.finish === 'finishing') {
      return 2.5 // Higher safety for finishing operations
    } else {
      return 2.0 // Standard safety for roughing
    }
  }

  /**
   * Identify which factor is limiting the maximum depth of cut
   */
  private identifyLimitingFactor(limits: {
    power: number
    deflection?: number
    strength: number
    stability: number
    rigidity: number
  }): string {
    const minValue = Math.min(...Object.values(limits))
    
    for (const [factor, value] of Object.entries(limits)) {
      if (Math.abs(value - minValue) < 0.001) {
        return factor
      }
    }
    
    return 'unknown'
  }

  /**
   * Calculate material-based depth of cut modifier
   * Uses machinability rating: higher rating = more aggressive cuts possible
   */
  private getMaterialDepthFactor(material: MaterialProperties): number {
    // Scale from 0.5 (hardest materials) to 1.5 (easiest materials)
    // machinabilityRating is 1-10 scale where 10 = easiest
    const baseFactor = 0.5 + (material.machinabilityRating - 1) * 0.1
    
    // Additional adjustment for work hardening materials
    const workHardeningPenalty = 1.0 / material.workHardening
    
    return baseFactor * workHardeningPenalty
  }

  /**
   * Calculate tool material and coating depth of cut modifier
   */
  private getToolDepthFactor(toolConfig: ToolConfig): number {
    let materialFactor = 1.0
    let coatingFactor = 1.0

    // Tool material factors
    switch (toolConfig.material) {
      case 'carbide':
        materialFactor = 1.3  // Carbide can handle more aggressive cuts
        break
      case 'ceramic':
        materialFactor = 1.5  // Ceramic very aggressive but brittle
        break
      case 'diamond':
        materialFactor = 1.4  // Diamond excellent for non-ferrous
        break
      case 'hss':
        materialFactor = 0.8  // HSS more conservative
        break
    }

    // Coating factors
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
      default: // uncoated
        coatingFactor = 1.0
    }

    return materialFactor * coatingFactor
  }

  /**
   * Calculate stickout-based depth of cut modifier
   * Longer stickout = reduced depth due to deflection concerns
   */
  private getStickoutDepthFactor(toolConfig: ToolConfig): number {
    const stickoutRatio = toolConfig.stickout / toolConfig.diameter
    
    if (stickoutRatio <= 3) {
      return 1.0    // No penalty for short stickout
    } else if (stickoutRatio <= 5) {
      return 0.8    // 20% reduction for moderate stickout
    } else if (stickoutRatio <= 8) {
      return 0.6    // 40% reduction for long stickout
    } else {
      return 0.4    // 60% reduction for very long stickout
    }
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
  private calculateCuttingForce(material: MaterialProperties, chipLoad: number, depthOfCut: number): number {
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
  private calculateChipThickness(chipLoad: number): number {
    // Chip thickness = chip load × sin(engagement angle)
    // For simplification, assume average engagement of 60 degrees for endmills
    const engagementAngle = Math.PI / 3 // 60 degrees in radians
    const chipThickness = chipLoad * Math.sin(engagementAngle)
    return chipThickness
  }

  /**
   * Comprehensive tool deflection analysis
   * Focuses on cutting tool deformation under machining forces
   */
  private calculateComprehensiveDeflection(toolConfig: ToolConfig, cuttingForce: number) {
    // Tool deflection analysis considers the actual cutting tool characteristics
    const projectionLength = toolConfig.projectionLength
    
    // Tool material properties based on comprehensive research
    const materialProps = this.getToolMaterialProperties(toolConfig.material)
    
    // Calculate effective tool diameter considering actual geometry
    const effectiveDiameter = this.getEffectiveToolDiameter(toolConfig)
    
    // Tool holder stiffness affects overall system compliance
    const holderStiffnessFactor = this.getToolHolderStiffnessFactor(toolConfig.holderType)
    
    // Calculate tool-specific deflection modes
    const toolLateralDeflection = this.calculateToolLateralDeflection(
      cuttingForce, projectionLength, effectiveDiameter, materialProps.elasticModulus, holderStiffnessFactor
    )
    
    const toolTorsionalDeflection = this.calculateToolTorsionalDeflection(
      toolConfig, materialProps.shearModulus, holderStiffnessFactor
    )
    
    // Dynamic effects specific to rotating cutting tools
    const dynamicFactor = this.getToolDynamicAmplificationFactor(toolConfig, materialProps)
    
    // Combined tool deflection (not beam deflection)
    const staticDeflection = Math.sqrt(
      Math.pow(toolLateralDeflection, 2) + Math.pow(toolTorsionalDeflection, 2)
    )
    
    const totalToolDeflection = staticDeflection * dynamicFactor
    
    return {
      lateralDeflection: toolLateralDeflection,
      torsionalDeflection: toolTorsionalDeflection, 
      staticDeflection,
      totalDeflection: totalToolDeflection,
      dynamicFactor,
      naturalFrequency: this.calculateToolNaturalFrequency(toolConfig, materialProps),
      effectiveDiameter,
      materialProps,
      holderStiffnessFactor
    }
  }

  /**
   * Get comprehensive material properties for tool materials
   */
  private getToolMaterialProperties(material: string) {
    const props = {
      hss: {
        elasticModulus: this.units === 'metric' ? 215000 : 31.2, // N/mm² or psi
        shearModulus: this.units === 'metric' ? 85000 : 12.3,
        density: this.units === 'metric' ? 8.2e-6 : 0.000296, // kg/mm³ or lb/in³
        tensileStrength: this.units === 'metric' ? 2400 : 348000 // N/mm² or psi
      },
      carbide: {
        elasticModulus: this.units === 'metric' ? 640000 : 92.8,
        shearModulus: this.units === 'metric' ? 256000 : 37.1,
        density: this.units === 'metric' ? 14.5e-6 : 0.000524,
        tensileStrength: this.units === 'metric' ? 1500 : 217500
      },
      ceramic: {
        elasticModulus: this.units === 'metric' ? 400000 : 58.0,
        shearModulus: this.units === 'metric' ? 160000 : 23.2,
        density: this.units === 'metric' ? 4.0e-6 : 0.000145,
        tensileStrength: this.units === 'metric' ? 800 : 116000
      },
      diamond: {
        elasticModulus: this.units === 'metric' ? 1100000 : 159.5,
        shearModulus: this.units === 'metric' ? 450000 : 65.3,
        density: this.units === 'metric' ? 3.5e-6 : 0.000126,
        tensileStrength: this.units === 'metric' ? 1200 : 174000
      }
    }
    
    return props[material as keyof typeof props] || props.hss
  }

  /**
   * Calculate effective tool diameter considering actual geometry
   */
  private getEffectiveToolDiameter(toolConfig: ToolConfig): number {
    // Use provided core diameter if available, otherwise calculate from flutes
    if (toolConfig.coreDiameter && toolConfig.coreDiameter > 0) {
      return toolConfig.coreDiameter
    }
    
    // Fallback to flute-based calculation
    const fluteDepthRatio = this.getFluteDepthRatio(toolConfig.flutes)
    const coreRatio = 1 - fluteDepthRatio
    
    return toolConfig.diameter * coreRatio
  }

  /**
   * Get tool holder stiffness factor based on holder type
   */
  private getToolHolderStiffnessFactor(holderType: string): number {
    // Stiffness factors relative to rigid clamping (1.0 = perfect rigidity)
    const stiffnessFactors = {
      'shrink-fit': 0.95,      // Excellent clamping stiffness
      'hydraulic': 0.90,       // Very good uniform clamping
      'collet': 0.85,          // Good for small tools
      'side-lock': 0.80,       // Good for larger tools with flats
      'end-mill-holder': 0.70, // Set screw clamping
      'drill-chuck': 0.60      // Weakest clamping method
    }
    
    return stiffnessFactors[holderType as keyof typeof stiffnessFactors] || 0.75
  }

  /**
   * Calculate tool lateral deflection considering holder compliance
   * Uses tool projection length rather than total stickout
   */
  private calculateToolLateralDeflection(
    force: number, 
    projectionLength: number, 
    diameter: number, 
    elasticModulus: number,
    holderStiffnessFactor: number
  ): number {
    // Moment of inertia for circular cross-section: I = π × d⁴ / 64
    const momentOfInertia = (Math.PI * Math.pow(diameter, 4)) / 64
    
    // Tool deflection with holder compliance consideration
    const toolDeflection = (force * Math.pow(projectionLength, 3)) / (3 * elasticModulus * momentOfInertia)
    
    // Adjust for holder stiffness (lower stiffness = more deflection)
    const adjustedDeflection = toolDeflection / holderStiffnessFactor
    
    return Math.abs(adjustedDeflection)
  }

  /**
   * Calculate tool torsional deflection under cutting torque
   * Considers holder torsional stiffness
   */
  private calculateToolTorsionalDeflection(
    toolConfig: ToolConfig, 
    shearModulus: number, 
    holderStiffnessFactor: number
  ): number {
    const diameter = this.getEffectiveToolDiameter(toolConfig)
    const projectionLength = toolConfig.projectionLength
    
    // Estimate cutting torque based on tool-specific characteristics
    const estimatedTorque = this.estimateToolCuttingTorque(toolConfig)
    
    // Polar moment of inertia: J = π × d⁴ / 32
    const polarMomentOfInertia = (Math.PI * Math.pow(diameter, 4)) / 32
    
    // Angle of twist: θ = (T × L) / (G × J)
    const angleOfTwist = (estimatedTorque * projectionLength) / (shearModulus * polarMomentOfInertia)
    
    // Convert angular deflection to linear deflection at tool tip
    const linearTorsionalDeflection = angleOfTwist * (diameter / 2)
    
    // Adjust for holder torsional stiffness
    const adjustedDeflection = linearTorsionalDeflection / holderStiffnessFactor
    
    return Math.abs(adjustedDeflection)
  }

  /**
   * Get flute depth ratio based on flute count
   */
  private getFluteDepthRatio(flutes: number): number {
    switch (flutes) {
      case 1: return 0.35  // Single flute - deepest
      case 2: return 0.275 // Two flute standard
      case 3: return 0.225 // Three flute
      case 4: return 0.175 // Four flute
      case 5: return 0.15  // Five flute
      case 6: return 0.125 // Six flute - shallowest
      default: return 0.2  // Default assumption
    }
  }

  /**
   * Estimate cutting torque based on tool-specific characteristics
   * More accurate than the previous generic estimation
   */
  private estimateToolCuttingTorque(toolConfig: ToolConfig): number {
    const radius = toolConfig.diameter / 2
    
    // Torque coefficients based on specific tool characteristics
    let torqueCoefficient = 0.3 // Base coefficient
    
    // Adjust based on tool type and geometry
    switch (toolConfig.type) {
      case 'flat-endmill':
        torqueCoefficient = 0.4
        break
      case 'ball-endmill':
        torqueCoefficient = 0.35
        break
      case 'insert-endmill':
        torqueCoefficient = 0.45 // Higher due to positive geometry
        break
      case 'drill':
        torqueCoefficient = 0.5
        break
    }
    
    // Adjust for helix angle if provided
    if (toolConfig.helixAngle && toolConfig.helixAngle > 0) {
      // Higher helix angle reduces cutting forces
      const helixFactor = 1.0 - (toolConfig.helixAngle - 30) * 0.005
      torqueCoefficient *= Math.max(0.8, Math.min(1.2, helixFactor))
    }
    
    // Adjust for runout if provided
    if (toolConfig.runoutTolerance && toolConfig.runoutTolerance > 0) {
      // Higher runout increases force variation and average forces
      const runoutLimit = this.units === 'metric' ? 0.01 : 0.0004
      const runoutFactor = 1.0 + (toolConfig.runoutTolerance / runoutLimit) * 0.1
      torqueCoefficient *= Math.min(1.5, runoutFactor)
    }
    
    // Estimate torque based on tool-specific parameters
    const estimatedRadialForce = 100 * Math.pow(toolConfig.diameter, 1.2) // Empirical scaling
    const torque = estimatedRadialForce * radius * torqueCoefficient
    
    return torque
  }

  /**
   * Calculate natural frequency of the cutting tool (not generic beam)
   * Considers tool holder interface effects
   */
  private calculateToolNaturalFrequency(
    toolConfig: ToolConfig, 
    materialProps: ToolMaterialProperties
  ): number {
    const diameter = this.getEffectiveToolDiameter(toolConfig)
    const projectionLength = toolConfig.projectionLength
    const holderStiffnessFactor = this.getToolHolderStiffnessFactor(toolConfig.holderType)
    
    // Modified eigenvalue for tool holder interface (not pure cantilever)
    const lambda1 = 1.875 * Math.sqrt(holderStiffnessFactor) // Adjusted for holder stiffness
    
    // Cross-sectional area
    const area = Math.PI * Math.pow(diameter, 2) / 4
    
    // Moment of inertia
    const momentOfInertia = Math.PI * Math.pow(diameter, 4) / 64
    
    // Natural frequency calculation with holder effects
    const frequency = (Math.pow(lambda1, 2) / (2 * Math.PI)) * 
      Math.sqrt((materialProps.elasticModulus * momentOfInertia) / 
                (materialProps.density * area * Math.pow(projectionLength, 4)))
    
    return frequency
  }

  /**
   * Calculate dynamic amplification factor for rotating cutting tools
   * Different from generic beam vibration
   */
  private getToolDynamicAmplificationFactor(toolConfig: ToolConfig, materialProps: ToolMaterialProperties): number {
    const naturalFreq = this.calculateToolNaturalFrequency(toolConfig, materialProps)
    
    // Estimate actual cutting speed based on tool diameter and typical practices
    const typicalRpm = Math.min(24000, 150000 / toolConfig.diameter) // More realistic RPM estimation
    const spindleFreq = typicalRpm / 60 // Convert to Hz
    
    // Tool passing frequency (flutes × spindle frequency)
    const toolPassingFreq = toolConfig.flutes * spindleFreq
    
    // Check multiple frequency ratios for cutting tool dynamics
    const spindleRatio = spindleFreq / naturalFreq
    const passingRatio = toolPassingFreq / naturalFreq
    
    // Dynamic amplification factors for cutting tools
    const dampingRatio = 0.03 // Lower damping for rotating tools
    let dynamicFactor = 1.0
    
    // Check spindle frequency effects
    if (spindleRatio > 0.7 && spindleRatio < 1.3) {
      dynamicFactor = Math.max(dynamicFactor, 1.0 / (2 * dampingRatio))
    }
    
    // Check tool passing frequency effects (more critical)
    if (passingRatio > 0.8 && passingRatio < 1.2) {
      dynamicFactor = Math.max(dynamicFactor, 1.5 / (2 * dampingRatio))
    }
    
    // Consider holder stiffness effects on damping
    const holderStiffnessFactor = this.getToolHolderStiffnessFactor(toolConfig.holderType)
    dynamicFactor *= (2.0 - holderStiffnessFactor) // Lower stiffness = higher amplification
    
    return Math.max(1.0, Math.min(8.0, dynamicFactor)) // Reasonable bounds for cutting tools
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
  private calculateToolLife(material: MaterialProperties, toolConfig: ToolConfig, rpm: number): number {
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