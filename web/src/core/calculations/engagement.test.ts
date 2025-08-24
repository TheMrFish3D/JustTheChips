import { describe, it, expect } from 'vitest'

import type { Material, Tool } from '../data/schemas/index.js'

import { calculateEngagementAndMRR } from './engagement.js'

// Test fixtures
const testMaterial: Material = {
  id: 'aluminum-6061',
  category: 'aluminum',
  vc_range_m_min: [200, 400],
  fz_mm_per_tooth_by_diameter: {
    '3': [0.02, 0.05],
    '6': [0.04, 0.08],
    '12': [0.06, 0.12]
  },
  force_coeff_kn_mm2: 1.2,
  specific_cutting_energy_j_mm3: 0.8,
  chip_thinning: {
    enable_below_fraction: 0.3,
    limit_factor: 2.0
  },
  max_engagement_fraction: 0.5  // 50% of diameter max
}

const testTool: Tool = {
  id: 'endmill-6mm',
  type: 'endmill_flat',
  diameter_mm: 6,
  flutes: 3,
  coating: 'TiAlN',
  stickout_mm: 20,
  material: 'carbide',
  default_doc_mm: 1.5,
  default_woc_mm: 3.0
}

const testDrill: Tool = {
  id: 'drill-6mm',
  type: 'drill',
  diameter_mm: 6,
  flutes: 2,
  coating: 'TiN',
  stickout_mm: 25,
  material: 'carbide',
  default_doc_mm: 6.0,
  default_woc_mm: 6.0
}

describe('calculateEngagementAndMRR', () => {
  it('should calculate engagement using tool defaults when no user input', () => {
    const result = calculateEngagementAndMRR(
      testMaterial,
      testTool,
      6.0,  // effectiveDiameter
      1200  // feedRate
    )

    expect(result.aeMm).toBe(3.0)  // tool.default_woc_mm
    expect(result.apMm).toBe(1.5)  // tool.default_doc_mm
    expect(result.warnings).toHaveLength(0)
  })

  it('should use user-provided engagement values when given', () => {
    const result = calculateEngagementAndMRR(
      testMaterial,
      testTool,
      6.0,  // effectiveDiameter
      1200, // feedRate
      2.0,  // userDOC_mm
      2.5   // userWOC_mm
    )

    expect(result.aeMm).toBe(2.5)
    expect(result.apMm).toBe(2.0)
    expect(result.warnings).toHaveLength(0)
  })

  it('should limit engagement by material max_engagement_fraction', () => {
    // Material allows max 50% of diameter = 3.0mm for 6mm tool
    const result = calculateEngagementAndMRR(
      testMaterial,
      testTool,
      6.0,  // effectiveDiameter
      1200, // feedRate
      4.0,  // userDOC_mm - exceeds limit
      5.0   // userWOC_mm - exceeds limit
    )

    expect(result.aeMm).toBe(3.0)  // Limited to 50% of 6mm
    expect(result.apMm).toBe(3.0)  // Limited to 50% of 6mm
    expect(result.warnings).toHaveLength(2)
    expect(result.warnings[0].type).toBe('doc_limited')
    expect(result.warnings[1].type).toBe('woc_limited')
  })

  it('should warn when DOC is limited', () => {
    const result = calculateEngagementAndMRR(
      testMaterial,
      testTool,
      6.0,  // effectiveDiameter
      1200, // feedRate
      4.0   // userDOC_mm - exceeds limit of 3.0mm
    )

    expect(result.apMm).toBe(3.0)
    expect(result.warnings).toHaveLength(1)
    expect(result.warnings[0].type).toBe('doc_limited')
    expect(result.warnings[0].message).toContain('Depth of cut limited')
  })

  it('should warn when WOC is limited', () => {
    const result = calculateEngagementAndMRR(
      testMaterial,
      testTool,
      6.0,  // effectiveDiameter
      1200, // feedRate
      undefined, // Use default DOC
      4.0   // userWOC_mm - exceeds limit of 3.0mm
    )

    expect(result.aeMm).toBe(3.0)
    expect(result.warnings).toHaveLength(1)
    expect(result.warnings[0].type).toBe('woc_limited')
    expect(result.warnings[0].message).toContain('Width of cut limited')
  })

  it('should calculate MRR for endmill operations', () => {
    const result = calculateEngagementAndMRR(
      testMaterial,
      testTool,
      6.0,  // effectiveDiameter
      1200, // feedRate
      2.0,  // userDOC_mm
      3.0   // userWOC_mm
    )

    // MRR = ae × ap × vf = 3.0 × 2.0 × 1200 = 7200 mm³/min
    expect(result.mrrMm3Min).toBe(7200)
  })

  it('should calculate MRR for drilling operations', () => {
    const result = calculateEngagementAndMRR(
      testMaterial,
      testDrill,
      6.0,  // effectiveDiameter
      800   // feedRate
    )

    // MRR = π(D_eff²/4) × vf = π(6²/4) × 800 = π × 9 × 800 ≈ 22,619.5 mm³/min
    const expectedMRR = Math.PI * Math.pow(6, 2) / 4 * 800
    expect(result.mrrMm3Min).toBeCloseTo(expectedMRR, 5)
  })

  it('should handle zero feed rate', () => {
    const result = calculateEngagementAndMRR(
      testMaterial,
      testTool,
      6.0,  // effectiveDiameter
      0     // feedRate
    )

    expect(result.mrrMm3Min).toBe(0)
    expect(result.warnings).toHaveLength(0)
  })

  it('should throw error for invalid effective diameter', () => {
    expect(() => {
      calculateEngagementAndMRR(
        testMaterial,
        testTool,
        0,    // Invalid diameter
        1200
      )
    }).toThrow('Effective diameter must be positive')
  })

  it('should throw error for negative feed rate', () => {
    expect(() => {
      calculateEngagementAndMRR(
        testMaterial,
        testTool,
        6.0,
        -100  // Invalid negative feed rate
      )
    }).toThrow('Feed rate must be non-negative')
  })

  it('should handle very small engagement limits', () => {
    const restrictiveMaterial = {
      ...testMaterial,
      max_engagement_fraction: 0.1  // Very restrictive 10%
    }

    const result = calculateEngagementAndMRR(
      restrictiveMaterial,
      testTool,
      6.0,  // effectiveDiameter
      1200  // feedRate
    )

    // Both default engagements exceed 0.6mm limit (10% of 6mm)
    expect(result.aeMm).toBeCloseTo(0.6, 5)
    expect(result.apMm).toBeCloseTo(0.6, 5)
    expect(result.warnings).toHaveLength(2)
  })

  it('should calculate MRR correctly for different tool types', () => {
    const facemillTool: Tool = {
      ...testTool,
      type: 'facemill'
    }

    const result = calculateEngagementAndMRR(
      testMaterial,
      facemillTool,
      6.0,  // effectiveDiameter
      1200, // feedRate
      1.0,  // userDOC_mm
      4.0   // userWOC_mm (will be limited to 3.0)
    )

    // Should use ae × ap × vf formula for non-drill tools
    expect(result.mrrMm3Min).toBe(3.0 * 1.0 * 1200)  // 3600 mm³/min
  })
})