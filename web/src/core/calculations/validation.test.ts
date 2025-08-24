import { describe, it, expect } from 'vitest'

import type { Material, Machine, Tool, Spindle } from '../data/schemas/index.js'

import { validateInputs, evaluateChipload, evaluateDeflection } from './validation.js'

// Test data
const testMaterial: Material = {
  id: 'test_material',
  category: 'aluminum',
  vc_range_m_min: [250, 600],
  fz_mm_per_tooth_by_diameter: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '3.0': [0.01, 0.04],
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '6.0': [0.02, 0.08],
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '10.0': [0.03, 0.12]
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  force_coeff_kn_mm2: 0.0012,
  specific_cutting_energy_j_mm3: 0.75,
  chip_thinning: {
    enable_below_fraction: 0.5,
    limit_factor: 2
  },
  max_engagement_fraction: 0.6
}

const testMachine: Machine = {
  id: 'test_machine',
  axis_max_feed_mm_min: 3000,
  rigidity_factor: 1.0,
  aggressiveness: {
    axial: 1.0,
    radial: 1.0,
    feed: 1.0
  }
}

const testTool: Tool = {
  id: 'test_tool',
  type: 'endmill_flat',
  diameter_mm: 6,
  flutes: 4,
  coating: 'uncoated',
  stickout_mm: 20,
  material: 'carbide',
  default_doc_mm: 3,
  default_woc_mm: 1.5
}

const testSpindle: Spindle = {
  id: 'test_spindle',
  rated_power_kw: 2.2,
  rpm_min: 6000,
  rpm_max: 24000,
  base_rpm: 10000,
  power_curve: [
    { rpm: 6000, power_kw: 1.1 },
    { rpm: 12000, power_kw: 2.2 },
    { rpm: 24000, power_kw: 2.0 }
  ]
}

const validInputs = {
  machineId: 'test_machine',
  spindleId: 'test_spindle',
  toolId: 'test_tool',
  materialId: 'test_material',
  cutType: 'slot' as const,
  aggressiveness: 1.0
}

describe('validateInputs', () => {
  it('should pass validation with valid inputs and existing entities', () => {
    const result = validateInputs(
      validInputs,
      [testMaterial],
      [testMachine],
      [testTool],
      [testSpindle]
    )

    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should fail validation with invalid input structure', () => {
    const invalidInputs = {
      // Missing required fields
      machineId: 'test_machine'
      // spindleId, toolId, materialId, cutType are missing
    }

    const result = validateInputs(
      invalidInputs,
      [testMaterial],
      [testMachine],
      [testTool],
      [testSpindle]
    )

    expect(result.isValid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('should fail validation when referenced entities do not exist', () => {
    const inputsWithMissingRefs = {
      ...validInputs,
      materialId: 'nonexistent_material',
      machineId: 'nonexistent_machine'
    }

    const result = validateInputs(
      inputsWithMissingRefs,
      [testMaterial],
      [testMachine],
      [testTool],
      [testSpindle]
    )

    expect(result.isValid).toBe(false)
    expect(result.errors).toContainEqual({
      field: 'materialId',
      message: "Material with ID 'nonexistent_material' not found"
    })
    expect(result.errors).toContainEqual({
      field: 'machineId',
      message: "Machine with ID 'nonexistent_machine' not found"
    })
  })

  it('should warn about aggressiveness outside normal range', () => {
    const aggressiveInputs = {
      ...validInputs,
      aggressiveness: 5.0 // Very high
    }

    const result = validateInputs(
      aggressiveInputs,
      [testMaterial],
      [testMachine],
      [testTool],
      [testSpindle]
    )

    expect(result.isValid).toBe(true) // Still valid, just warning
    expect(result.warnings).toContainEqual({
      type: 'aggressiveness_warning',
      message: 'Aggressiveness factor 5 is outside normal range (0.1-3.0)',
      severity: 'warning'
    })
  })

  it('should warn about excessive user DOC override', () => {
    const docOverrideInputs = {
      ...validInputs,
      user_doc_mm: 10 // Much larger than tool diameter (6mm)
    }

    const result = validateInputs(
      docOverrideInputs,
      [testMaterial],
      [testMachine],
      [testTool],
      [testSpindle]
    )

    expect(result.isValid).toBe(true)
    expect(result.warnings).toContainEqual({
      type: 'doc_override_warning',
       
      message: expect.stringContaining('User DOC') as string,
      severity: 'warning'
    })
  })

  it('should warn about dangerous user DOC exceeding tool diameter', () => {
    const dangerousDocInputs = {
      ...validInputs,
      user_doc_mm: 8 // Larger than tool diameter (6mm)
    }

    const result = validateInputs(
      dangerousDocInputs,
      [testMaterial],
      [testMachine],
      [testTool],
      [testSpindle]
    )

    expect(result.isValid).toBe(true)
    expect(result.warnings).toContainEqual({
      type: 'doc_override_danger',
       
      message: expect.stringContaining('User DOC') as string,
      severity: 'danger'
    })
  })

  it('should warn about excessive user WOC override', () => {
    const wocOverrideInputs = {
      ...validInputs,
      user_woc_mm: 8 // Larger than tool diameter (6mm)
    }

    const result = validateInputs(
      wocOverrideInputs,
      [testMaterial],
      [testMachine],
      [testTool],
      [testSpindle]
    )

    expect(result.isValid).toBe(true)
    expect(result.warnings).toContainEqual({
      type: 'woc_override_warning',
       
      message: expect.stringContaining('User WOC') as string,
      severity: 'warning'
    })
  })

  it('should warn about high stickout to diameter ratio', () => {
    const highStickoutInputs = {
      ...validInputs,
      override_stickout_mm: 50 // High L/D ratio for 6mm tool
    }

    const result = validateInputs(
      highStickoutInputs,
      [testMaterial],
      [testMachine],
      [testTool],
      [testSpindle]
    )

    expect(result.isValid).toBe(true)
    expect(result.warnings).toContainEqual({
      type: 'stickout_override_warning',
       
      message: expect.stringContaining('Override stickout') as string,
      severity: 'warning'
    })
  })

  it('should warn about dangerous stickout to diameter ratio', () => {
    const dangerousStickoutInputs = {
      ...validInputs,
      override_stickout_mm: 80 // Very high L/D ratio for 6mm tool
    }

    const result = validateInputs(
      dangerousStickoutInputs,
      [testMaterial],
      [testMachine],
      [testTool],
      [testSpindle]
    )

    expect(result.isValid).toBe(true)
    expect(result.warnings).toContainEqual({
      type: 'stickout_override_danger',
       
      message: expect.stringContaining('Override stickout') as string,
      severity: 'danger'
    })
  })

  it('should warn about unusually high flute override', () => {
    const highFlutesInputs = {
      ...validInputs,
      override_flutes: 15 // Very high number of flutes
    }

    const result = validateInputs(
      highFlutesInputs,
      [testMaterial],
      [testMachine],
      [testTool],
      [testSpindle]
    )

    expect(result.isValid).toBe(true)
    expect(result.warnings.some(w => w.type === 'flutes_override_warning')).toBe(true)
  })
})

describe('evaluateChipload', () => {
  it('should generate danger warning for chipload too low', () => {
    const lowChipload = 0.005 // Below 0.5 * 0.02 = 0.01 threshold for 6mm tool
    const result = evaluateChipload(lowChipload, testMaterial, 6.0)

    expect(result.warnings).toContainEqual({
      type: 'chipload_danger',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      message: expect.stringContaining('Chipload too low'),
      severity: 'danger'
    })
  })

  it('should generate warning for chipload too high', () => {
    const highChipload = 0.15 // Above 1.5 * 0.08 = 0.12 threshold for 6mm tool
    const result = evaluateChipload(highChipload, testMaterial, 6.0)

    expect(result.warnings).toContainEqual({
      type: 'chipload_warning',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      message: expect.stringContaining('Chipload very high'),
      severity: 'warning'
    })
  })

  it('should generate no warnings for normal chipload', () => {
    const normalChipload = 0.05 // Within range for 6mm tool (0.02-0.08)
    const result = evaluateChipload(normalChipload, testMaterial, 6.0)

    expect(result.warnings).toHaveLength(0)
  })

  it('should handle errors when chipload range cannot be determined', () => {
    const materialWithoutData: Material = {
      ...testMaterial,
      fz_mm_per_tooth_by_diameter: {} // No data
    }

    const result = evaluateChipload(0.05, materialWithoutData, 6.0)

    expect(result.warnings).toContainEqual({
      type: 'chipload_error',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      message: expect.stringContaining('Could not evaluate chipload'),
      severity: 'warning'
    })
  })
})

describe('evaluateDeflection', () => {
  it('should generate danger warning for high deflection', () => {
    const highDeflection = 0.08 // Above 0.05 mm danger threshold
    const result = evaluateDeflection(highDeflection)

    expect(result.warnings).toContainEqual({
      type: 'deflection_danger',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      message: expect.stringContaining('Dangerous tool deflection'),
      severity: 'danger'
    })
  })

  it('should generate warning for moderate deflection', () => {
    const moderateDeflection = 0.03 // Above 0.02 mm warning threshold but below danger
    const result = evaluateDeflection(moderateDeflection)

    expect(result.warnings).toContainEqual({
      type: 'deflection_warning',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      message: expect.stringContaining('High tool deflection'),
      severity: 'warning'
    })
  })

  it('should generate no warnings for low deflection', () => {
    const lowDeflection = 0.01 // Below warning threshold
    const result = evaluateDeflection(lowDeflection)

    expect(result.warnings).toHaveLength(0)
  })

  it('should only generate danger warning when above danger threshold', () => {
    const dangerousDeflection = 0.1 // Well above danger threshold
    const result = evaluateDeflection(dangerousDeflection)

    // Should only have danger warning, not both danger and warning
    expect(result.warnings).toHaveLength(1)
    expect(result.warnings[0].severity).toBe('danger')
  })
})