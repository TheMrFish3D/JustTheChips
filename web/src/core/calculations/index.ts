// Core calculation modules
// Will contain speeds-feeds, power, deflection, and validation logic
// All modules will be pure, side-effect free functions

// Export geometry functions
export { getEffectiveDiameter, getEffectiveFlutes } from './geometry.js'

// Export speed calculation functions
export { 
  calculateSpeedAndRPM, 
  getSpeedFactor,
  type CutType,
  type SpeedCalculationResult,
  type SpeedCalculationWarning
} from './speeds.js'

// Export chipload and feed calculation functions
export {
  calculateChiploadAndFeed,
  getChiploadRange,
  getCoatingFactor,
  getToolChiploadFactor,
  type ChiploadCalculationResult,
  type ChiploadCalculationWarning
} from './chipload.js'

// Export engagement and MRR calculation functions
export {
  calculateEngagementAndMRR,
  type EngagementCalculationResult,
  type EngagementCalculationWarning
} from './engagement.js'

// Export power calculation functions
export {
  calculatePower,
  getToolPowerFactor,
  getSpindlePowerAtRPM,
  applyPowerLimiting,
  type PowerCalculationResult,
  type PowerCalculationWarning
} from './power.js'

// Export force calculation functions
export {
  calculateCuttingForce,
  getToolForceMultiplier,
  type ForceCalculationResult,
  type ForceCalculationWarning
} from './force.js'

// Export deflection calculation functions
export {
  calculateDeflection,
  calculateStaticDeflection,
  calculateDynamicAmplification,
  getYoungsModulus,
  estimateToolMass,
  MATERIAL_MODULUS_GPA,
  DEFAULT_HOLDER_COMPLIANCE_MM_PER_N,
  type DeflectionCalculationResult,
  type StaticDeflectionResult,
  type DynamicAmplificationResult,
  type DeflectionCalculationWarning
} from './deflection.js'

// TODO: Remove these placeholder exports once all modules are implemented
// These are just stubs to prevent compilation errors

// speeds-feeds.ts - RPM, feed, chipload calculations
export function calculateRPM(): number {
  throw new Error('calculateRPM() not yet implemented')
}

// validation.ts - Input validation and warnings
export function validateInputs(): boolean {
  throw new Error('validateInputs() not yet implemented')
}