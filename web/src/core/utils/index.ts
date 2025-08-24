// Utility functions for calculations and conversions

// Math utilities
export { clamp, lerp } from './math.js'

// Unit conversion utilities
export {
  // Length conversions
  mmToInches,
  inchesToMm,
  
  // Power conversions
  kWToHP,
  hpToKW,
  
  // Surface speed conversions
  mPerMinToSFM,
  sfmToMPerMin,
  
  // Feed rate conversions
  mmPerMinToInchesPerMin,
  inchesPerMinToMmPerMin,
  
  // Angle conversions
  degreesToRadians,
  radiansToDegrees,
  
  // Chipload conversions
  mmPerToothToInchesPerTooth,
  inchesPerToothToMmPerTooth,
  
  // Force conversions
  newtonsToPounds,
  poundsToNewtons,
  
  // Torque conversions
  newtonMetersToInchPounds,
  inchPoundsToNewtonMeters,
  newtonMetersToFootPounds,
  footPoundsToNewtonMeters,
} from './units.js'