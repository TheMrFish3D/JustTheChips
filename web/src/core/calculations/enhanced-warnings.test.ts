import { describe, it, expect } from 'vitest'

import { assembleOutput } from './output.js'
import type { OutputAssemblyInput } from './output.js'

describe('Enhanced warning display functionality', () => {
  it('should preserve severity information in output warnings', () => {
    const mockInput: OutputAssemblyInput = {
      tool: {
        id: 'test_tool',
        type: 'endmill_flat',
        diameter_mm: 6,
        flutes: 4,
        coating: 'uncoated',
        stickout_mm: 20,
        material: 'carbide',
        default_doc_mm: 3,
        default_woc_mm: 1.5
      },
      effectiveDiameter: 6.0,
      userDocOverride: false,
      speedResult: {
        rpmActual: 8542.123,
        vcActual: 161.234,
        vcTarget: 160.0,
        rpmTheoretical: 8542.123,
        warnings: [
          { type: 'rpm_limited', message: 'RPM clamped to spindle limit', severity: 'warning' as const }
        ]
      },
      chiploadResult: {
        fzBase: 0.02345,
        fzAdjusted: 0.02180,
        vfTheoretical: 1876.432,
        vfActual: 1850.567,
        chipThinningApplied: true,
        warnings: []
      },
      engagementResult: {
        aeMm: 1.8,
        apMm: 3.2,
        mrrMm3Min: 1123.456,
        warnings: []
      },
      powerResult: {
        cuttingPowerW: 850.234,
        powerWithToolW: 977.769,
        spindleLossesW: 127.535,
        totalPowerRequiredW: 977.769,
        powerAvailableW: 2200.0,
        powerAvailableDeratedW: 2200.0,
        temperatureDeratingFactor: 1.0,
        powerLimited: false,
        warnings: []
      },
      forceResult: {
        chipAreaMm2: 3.456,
        baseForceMaterialN: 245.678,
        toolForceMultiplier: 1.0,
        totalForceN: 245.678,
        warnings: []
      },
      deflectionResult: {
        staticDeflection: {
          bendingDeflectionMm: 0.0123,
          shearDeflectionMm: 0.0045,
          holderDeflectionMm: 0.0089,
          totalStaticDeflectionMm: 0.0257
        },
        dynamicAmplification: {
          naturalFrequencyHz: 1250.0,
          operatingFrequencyHz: 456.78,
          frequencyRatio: 0.365,
          amplificationFactor: 1.037
        },
        totalDeflectionMm: 0.02665,
        warnings: [
          { type: 'deflection_danger', message: 'Dangerous tool deflection (0.027 mm > 0.05 mm). Risk of poor accuracy and tool breakage.', severity: 'danger' as const }
        ]
      },
      validationWarnings: [
        { type: 'chipload_warning', message: 'Chipload very high. Risk of tool breakage.', severity: 'warning' as const }
      ]
    }

    const output = assembleOutput(mockInput)

    // Check that warnings preserve severity information
    expect(output.warnings).toHaveLength(3)
    
    // Check for danger warning
    const dangerWarning = output.warnings.find(w => w.severity === 'danger')
    expect(dangerWarning).toBeDefined()
    expect(dangerWarning?.type).toBe('deflection_danger')
    
    // Check for warning level warnings
    const warningLevelWarnings = output.warnings.filter(w => w.severity === 'warning')
    expect(warningLevelWarnings).toHaveLength(2)
    expect(warningLevelWarnings.map(w => w.type)).toContain('rpm_limited')
    expect(warningLevelWarnings.map(w => w.type)).toContain('chipload_warning')

    // Verify the enhanced UI can categorize warnings by severity
    const dangerWarnings = output.warnings.filter(w => w.severity === 'danger')
    const regularWarnings = output.warnings.filter(w => w.severity !== 'danger')
    
    expect(dangerWarnings).toHaveLength(1)
    expect(regularWarnings).toHaveLength(2)
  })
})