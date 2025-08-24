/**
 * Unit conversion utilities for CNC machining calculations
 * 
 * Base units (per spec):
 * - Length: mm
 * - Time: min
 * - Force: N  
 * - Power: kW
 * - Speed: RPM
 * - Angle: degrees
 * - Specific energy: J/mm³
 */

// Length conversions
export function mmToInches(mm: number): number {
  return mm / 25.4
}

export function inchesToMm(inches: number): number {
  return inches * 25.4
}

// Power conversions
export function kWToHP(kW: number): number {
  return kW / 0.7457
}

export function hpToKW(hp: number): number {
  return hp * 0.7457
}

// Surface speed conversions (cutting speed)
export function mPerMinToSFM(mPerMin: number): number {
  return mPerMin * 3.28084
}

export function sfmToMPerMin(sfm: number): number {
  return sfm / 3.28084
}

// Feed rate conversions
export function mmPerMinToInchesPerMin(mmPerMin: number): number {
  return mmPerMin / 25.4
}

export function inchesPerMinToMmPerMin(inchesPerMin: number): number {
  return inchesPerMin * 25.4
}

// Angle conversions
export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

export function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI)
}

// Chipload conversions (feed per tooth)
export function mmPerToothToInchesPerTooth(mmPerTooth: number): number {
  return mmPerTooth / 25.4
}

export function inchesPerToothToMmPerTooth(inchesPerTooth: number): number {
  return inchesPerTooth * 25.4
}

// Force conversions
export function newtonsToPounds(newtons: number): number {
  return newtons / 4.448222
}

export function poundsToNewtons(pounds: number): number {
  return pounds * 4.448222
}

// Torque conversions
export function newtonMetersToInchPounds(newtonMeters: number): number {
  return newtonMeters * 8.850746
}

export function inchPoundsToNewtonMeters(inchPounds: number): number {
  return inchPounds / 8.850746
}

export function newtonMetersToFootPounds(newtonMeters: number): number {
  return newtonMeters / 1.355818
}

export function footPoundsToNewtonMeters(footPounds: number): number {
  return footPounds * 1.355818
}