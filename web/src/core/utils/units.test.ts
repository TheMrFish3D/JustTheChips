import { describe, expect, it } from 'vitest'

import {
  degreesToRadians,
  footPoundsToNewtonMeters,
  hpToKW,
  inchesPerMinToMmPerMin,
  inchesPerToothToMmPerTooth,
  inchesToMm,
  inchPoundsToNewtonMeters,
  kWToHP,
  mPerMinToSFM,
  mmPerMinToInchesPerMin,
  mmPerToothToInchesPerTooth,
  mmToInches,
  newtonMetersToFootPounds,
  newtonMetersToInchPounds,
  newtonsToPounds,
  poundsToNewtons,
  radiansToDegrees,
  sfmToMPerMin,
} from './units.js'

describe('Unit conversion utilities', () => {
  describe('Length conversions', () => {
    describe('mmToInches', () => {
      it('should convert millimeters to inches correctly', () => {
        expect(mmToInches(25.4)).toBeCloseTo(1, 10)
        expect(mmToInches(0)).toBe(0)
        expect(mmToInches(254)).toBeCloseTo(10, 10)
        expect(mmToInches(12.7)).toBeCloseTo(0.5, 10)
      })

      it('should handle negative values', () => {
        expect(mmToInches(-25.4)).toBeCloseTo(-1, 10)
        expect(mmToInches(-12.7)).toBeCloseTo(-0.5, 10)
      })

      it('should handle very small values', () => {
        expect(mmToInches(0.0254)).toBeCloseTo(0.001, 10)
        expect(mmToInches(0.00254)).toBeCloseTo(0.0001, 10)
      })

      it('should handle very large values', () => {
        expect(mmToInches(2540)).toBeCloseTo(100, 10)
        expect(mmToInches(25400)).toBeCloseTo(1000, 10)
      })
    })

    describe('inchesToMm', () => {
      it('should convert inches to millimeters correctly', () => {
        expect(inchesToMm(1)).toBeCloseTo(25.4, 10)
        expect(inchesToMm(0)).toBe(0)
        expect(inchesToMm(10)).toBeCloseTo(254, 10)
        expect(inchesToMm(0.5)).toBeCloseTo(12.7, 10)
      })

      it('should handle negative values', () => {
        expect(inchesToMm(-1)).toBeCloseTo(-25.4, 10)
        expect(inchesToMm(-0.5)).toBeCloseTo(-12.7, 10)
      })

      it('should be inverse of mmToInches', () => {
        const values = [0, 1, 25.4, 100, 0.001, -50]
        values.forEach(mm => {
          expect(inchesToMm(mmToInches(mm))).toBeCloseTo(mm, 10)
        })
      })
    })
  })

  describe('Power conversions', () => {
    describe('kWToHP', () => {
      it('should convert kilowatts to horsepower correctly', () => {
        expect(kWToHP(0.7457)).toBeCloseTo(1, 4)
        expect(kWToHP(0)).toBe(0)
        expect(kWToHP(7.457)).toBeCloseTo(10, 4)
        expect(kWToHP(1)).toBeCloseTo(1.341, 3)
      })

      it('should handle negative values', () => {
        expect(kWToHP(-0.7457)).toBeCloseTo(-1, 4)
      })

      it('should handle very small values', () => {
        expect(kWToHP(0.0007457)).toBeCloseTo(0.001, 6)
      })
    })

    describe('hpToKW', () => {
      it('should convert horsepower to kilowatts correctly', () => {
        expect(hpToKW(1)).toBeCloseTo(0.7457, 4)
        expect(hpToKW(0)).toBe(0)
        expect(hpToKW(10)).toBeCloseTo(7.457, 4)
        expect(hpToKW(1.341)).toBeCloseTo(1, 3)
      })

      it('should be inverse of kWToHP', () => {
        const values = [0, 1, 0.7457, 10, 0.001, -5]
        values.forEach(kW => {
          expect(hpToKW(kWToHP(kW))).toBeCloseTo(kW, 10)
        })
      })
    })
  })

  describe('Surface speed conversions', () => {
    describe('mPerMinToSFM', () => {
      it('should convert meters per minute to surface feet per minute', () => {
        expect(mPerMinToSFM(1)).toBeCloseTo(3.28084, 5)
        expect(mPerMinToSFM(0)).toBe(0)
        expect(mPerMinToSFM(10)).toBeCloseTo(32.8084, 4)
        expect(mPerMinToSFM(0.3048)).toBeCloseTo(1, 4)
      })

      it('should handle negative values', () => {
        expect(mPerMinToSFM(-1)).toBeCloseTo(-3.28084, 5)
      })
    })

    describe('sfmToMPerMin', () => {
      it('should convert surface feet per minute to meters per minute', () => {
        expect(sfmToMPerMin(3.28084)).toBeCloseTo(1, 5)
        expect(sfmToMPerMin(0)).toBe(0)
        expect(sfmToMPerMin(1)).toBeCloseTo(0.3048, 4)
        expect(sfmToMPerMin(32.8084)).toBeCloseTo(10, 4)
      })

      it('should be inverse of mPerMinToSFM', () => {
        const values = [0, 1, 10, 100, 0.1, -5]
        values.forEach(mPerMin => {
          expect(sfmToMPerMin(mPerMinToSFM(mPerMin))).toBeCloseTo(mPerMin, 10)
        })
      })
    })
  })

  describe('Feed rate conversions', () => {
    describe('mmPerMinToInchesPerMin', () => {
      it('should convert mm per minute to inches per minute', () => {
        expect(mmPerMinToInchesPerMin(25.4)).toBeCloseTo(1, 10)
        expect(mmPerMinToInchesPerMin(0)).toBe(0)
        expect(mmPerMinToInchesPerMin(254)).toBeCloseTo(10, 10)
      })

      it('should handle negative values', () => {
        expect(mmPerMinToInchesPerMin(-25.4)).toBeCloseTo(-1, 10)
      })
    })

    describe('inchesPerMinToMmPerMin', () => {
      it('should convert inches per minute to mm per minute', () => {
        expect(inchesPerMinToMmPerMin(1)).toBeCloseTo(25.4, 10)
        expect(inchesPerMinToMmPerMin(0)).toBe(0)
        expect(inchesPerMinToMmPerMin(10)).toBeCloseTo(254, 10)
      })

      it('should be inverse of mmPerMinToInchesPerMin', () => {
        const values = [0, 25.4, 100, 1000, 0.1, -50]
        values.forEach(mmPerMin => {
          expect(inchesPerMinToMmPerMin(mmPerMinToInchesPerMin(mmPerMin))).toBeCloseTo(mmPerMin, 10)
        })
      })
    })
  })

  describe('Angle conversions', () => {
    describe('degreesToRadians', () => {
      it('should convert degrees to radians correctly', () => {
        expect(degreesToRadians(0)).toBe(0)
        expect(degreesToRadians(180)).toBeCloseTo(Math.PI, 10)
        expect(degreesToRadians(90)).toBeCloseTo(Math.PI / 2, 10)
        expect(degreesToRadians(360)).toBeCloseTo(2 * Math.PI, 10)
        expect(degreesToRadians(45)).toBeCloseTo(Math.PI / 4, 10)
      })

      it('should handle negative angles', () => {
        expect(degreesToRadians(-180)).toBeCloseTo(-Math.PI, 10)
        expect(degreesToRadians(-90)).toBeCloseTo(-Math.PI / 2, 10)
      })

      it('should handle angles greater than 360', () => {
        expect(degreesToRadians(720)).toBeCloseTo(4 * Math.PI, 10)
        expect(degreesToRadians(450)).toBeCloseTo(2.5 * Math.PI, 10)
      })
    })

    describe('radiansToDegrees', () => {
      it('should convert radians to degrees correctly', () => {
        expect(radiansToDegrees(0)).toBe(0)
        expect(radiansToDegrees(Math.PI)).toBeCloseTo(180, 10)
        expect(radiansToDegrees(Math.PI / 2)).toBeCloseTo(90, 10)
        expect(radiansToDegrees(2 * Math.PI)).toBeCloseTo(360, 10)
        expect(radiansToDegrees(Math.PI / 4)).toBeCloseTo(45, 10)
      })

      it('should be inverse of degreesToRadians', () => {
        const values = [0, 30, 45, 90, 180, 270, 360, -90, -180]
        values.forEach(degrees => {
          expect(radiansToDegrees(degreesToRadians(degrees))).toBeCloseTo(degrees, 10)
        })
      })
    })
  })

  describe('Chipload conversions', () => {
    describe('mmPerToothToInchesPerTooth', () => {
      it('should convert mm per tooth to inches per tooth', () => {
        expect(mmPerToothToInchesPerTooth(0.254)).toBeCloseTo(0.01, 10)
        expect(mmPerToothToInchesPerTooth(0)).toBe(0)
        expect(mmPerToothToInchesPerTooth(2.54)).toBeCloseTo(0.1, 10)
      })

      it('should handle very small chiploads', () => {
        expect(mmPerToothToInchesPerTooth(0.0254)).toBeCloseTo(0.001, 10)
        expect(mmPerToothToInchesPerTooth(0.00254)).toBeCloseTo(0.0001, 10)
      })
    })

    describe('inchesPerToothToMmPerTooth', () => {
      it('should convert inches per tooth to mm per tooth', () => {
        expect(inchesPerToothToMmPerTooth(0.01)).toBeCloseTo(0.254, 10)
        expect(inchesPerToothToMmPerTooth(0)).toBe(0)
        expect(inchesPerToothToMmPerTooth(0.1)).toBeCloseTo(2.54, 10)
      })

      it('should be inverse of mmPerToothToInchesPerTooth', () => {
        const values = [0, 0.1, 0.254, 1, 0.01, -0.05]
        values.forEach(mmPerTooth => {
          expect(inchesPerToothToMmPerTooth(mmPerToothToInchesPerTooth(mmPerTooth))).toBeCloseTo(mmPerTooth, 10)
        })
      })
    })
  })

  describe('Force conversions', () => {
    describe('newtonsToPounds', () => {
      it('should convert newtons to pounds correctly', () => {
        expect(newtonsToPounds(4.448222)).toBeCloseTo(1, 6)
        expect(newtonsToPounds(0)).toBe(0)
        expect(newtonsToPounds(44.48222)).toBeCloseTo(10, 5)
      })

      it('should handle negative forces', () => {
        expect(newtonsToPounds(-4.448222)).toBeCloseTo(-1, 6)
      })
    })

    describe('poundsToNewtons', () => {
      it('should convert pounds to newtons correctly', () => {
        expect(poundsToNewtons(1)).toBeCloseTo(4.448222, 6)
        expect(poundsToNewtons(0)).toBe(0)
        expect(poundsToNewtons(10)).toBeCloseTo(44.48222, 5)
      })

      it('should be inverse of newtonsToPounds', () => {
        const values = [0, 1, 4.448222, 100, 0.1, -50]
        values.forEach(newtons => {
          expect(poundsToNewtons(newtonsToPounds(newtons))).toBeCloseTo(newtons, 10)
        })
      })
    })
  })

  describe('Torque conversions', () => {
    describe('newtonMetersToInchPounds', () => {
      it('should convert newton-meters to inch-pounds correctly', () => {
        expect(newtonMetersToInchPounds(1)).toBeCloseTo(8.850746, 6)
        expect(newtonMetersToInchPounds(0)).toBe(0)
        expect(newtonMetersToInchPounds(0.1129848)).toBeCloseTo(1, 5)
      })

      it('should handle negative torque', () => {
        expect(newtonMetersToInchPounds(-1)).toBeCloseTo(-8.850746, 6)
      })
    })

    describe('inchPoundsToNewtonMeters', () => {
      it('should convert inch-pounds to newton-meters correctly', () => {
        expect(inchPoundsToNewtonMeters(8.850746)).toBeCloseTo(1, 6)
        expect(inchPoundsToNewtonMeters(0)).toBe(0)
        expect(inchPoundsToNewtonMeters(1)).toBeCloseTo(0.1129848, 6)
      })

      it('should be inverse of newtonMetersToInchPounds', () => {
        const values = [0, 1, 10, 0.1, -5]
        values.forEach(newtonMeters => {
          expect(inchPoundsToNewtonMeters(newtonMetersToInchPounds(newtonMeters))).toBeCloseTo(newtonMeters, 10)
        })
      })
    })

    describe('newtonMetersToFootPounds', () => {
      it('should convert newton-meters to foot-pounds correctly', () => {
        expect(newtonMetersToFootPounds(1.355818)).toBeCloseTo(1, 6)
        expect(newtonMetersToFootPounds(0)).toBe(0)
        expect(newtonMetersToFootPounds(13.55818)).toBeCloseTo(10, 5)
      })

      it('should handle negative torque', () => {
        expect(newtonMetersToFootPounds(-1.355818)).toBeCloseTo(-1, 6)
      })
    })

    describe('footPoundsToNewtonMeters', () => {
      it('should convert foot-pounds to newton-meters correctly', () => {
        expect(footPoundsToNewtonMeters(1)).toBeCloseTo(1.355818, 6)
        expect(footPoundsToNewtonMeters(0)).toBe(0)
        expect(footPoundsToNewtonMeters(10)).toBeCloseTo(13.55818, 5)
      })

      it('should be inverse of newtonMetersToFootPounds', () => {
        const values = [0, 1, 1.355818, 10, 0.1, -5]
        values.forEach(newtonMeters => {
          expect(footPoundsToNewtonMeters(newtonMetersToFootPounds(newtonMeters))).toBeCloseTo(newtonMeters, 10)
        })
      })
    })
  })

  describe('Edge cases and numeric stability', () => {
    it('should handle zero values correctly', () => {
      expect(mmToInches(0)).toBe(0)
      expect(kWToHP(0)).toBe(0)
      expect(degreesToRadians(0)).toBe(0)
      expect(newtonsToPounds(0)).toBe(0)
    })

    it('should handle very small positive values', () => {
      const smallValue = Number.MIN_VALUE
      expect(mmToInches(smallValue)).toBeCloseTo(smallValue / 25.4, 10)
      expect(kWToHP(smallValue)).toBeCloseTo(smallValue / 0.7457, 10)
    })

    it('should handle very large values', () => {
      const largeValue = 1e6
      expect(mmToInches(largeValue)).toBeCloseTo(largeValue / 25.4, 5)
      expect(kWToHP(largeValue)).toBeCloseTo(largeValue / 0.7457, 5)
    })

    it('should handle Infinity values', () => {
      expect(mmToInches(Infinity)).toBe(Infinity)
      expect(mmToInches(-Infinity)).toBe(-Infinity)
      expect(kWToHP(Infinity)).toBe(Infinity)
      expect(degreesToRadians(Infinity)).toBe(Infinity)
    })

    it('should handle NaN values', () => {
      expect(mmToInches(NaN)).toBeNaN()
      expect(kWToHP(NaN)).toBeNaN()
      expect(degreesToRadians(NaN)).toBeNaN()
      expect(newtonsToPounds(NaN)).toBeNaN()
    })

    it('should maintain precision for typical CNC values', () => {
      // Typical tool diameter conversion
      expect(inchesToMm(mmToInches(6.35))).toBeCloseTo(6.35, 10)
      
      // Typical spindle power conversion
      expect(hpToKW(kWToHP(3.7))).toBeCloseTo(3.7, 10)
      
      // Typical cutting speed conversion
      expect(sfmToMPerMin(mPerMinToSFM(100))).toBeCloseTo(100, 10)
      
      // Typical feed rate conversion
      expect(inchesPerMinToMmPerMin(mmPerMinToInchesPerMin(1000))).toBeCloseTo(1000, 10)
    })
  })
})