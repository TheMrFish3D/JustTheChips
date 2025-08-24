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

// TODO: Remove these placeholder exports once all modules are implemented
// These are just stubs to prevent compilation errors

// speeds-feeds.ts - RPM, feed, chipload calculations
export function calculateRPM(): number {
  throw new Error('calculateRPM() not yet implemented')
}

// deflection.ts - Static and dynamic tool deflection
export function calculateDeflection(): number {
  throw new Error('calculateDeflection() not yet implemented')
}

// validation.ts - Input validation and warnings
export function validateInputs(): boolean {
  throw new Error('validateInputs() not yet implemented')
}