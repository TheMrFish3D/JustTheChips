import type { Material, Tool } from '../data/schemas/index.js'

/**
 * Warning types for engagement calculations
 */
export interface EngagementCalculationWarning {
  type: 'doc_limited' | 'woc_limited'
  message: string
  severity: 'warning'
}

/**
 * Result of engagement calculations
 */
export interface EngagementCalculationResult {
  aeMm: number  // Actual radial engagement (width of cut)
  apMm: number  // Actual axial engagement (depth of cut)
  mrrMm3Min: number  // Material removal rate
  warnings: EngagementCalculationWarning[]
}

/**
 * Calculate engagement values (ae/ap) with material-based limiting rules
 * and compute Material Removal Rate (MRR)
 * 
 * According to spec 3.2.4:
 * - ap = userDOC_mm or tool default; limit by material max_engagement_fraction × D_eff
 * - ae = userWOC_mm or tool default; same limiting rule
 * - MRR: Drilling: π(D_eff²/4) × vf; Others: ae × ap × vf
 */
export function calculateEngagementAndMRR(
  material: Material,
  tool: Tool,
  effectiveDiameter: number,
  feedRate: number,  // vf in mm/min
  userDocMm?: number,
  userWocMm?: number
): EngagementCalculationResult {
  // Validate inputs
  if (effectiveDiameter <= 0) {
    throw new Error('Effective diameter must be positive')
  }
  if (feedRate < 0) {
    throw new Error('Feed rate must be non-negative')
  }

  const warnings: EngagementCalculationWarning[] = []

  // Calculate maximum allowed engagement based on material properties
  const maxEngagement = material.max_engagement_fraction * effectiveDiameter

  // Calculate axial engagement (depth of cut)
  let apMm = userDocMm ?? tool.default_doc_mm
  const apLimited = Math.min(apMm, maxEngagement)
  
  if (apLimited < apMm) {
    warnings.push({
      type: 'doc_limited',
      message: `Depth of cut limited by material engagement fraction (${apLimited.toFixed(3)} mm < ${apMm.toFixed(3)} mm)`,
      severity: 'warning'
    })
    apMm = apLimited
  }

  // Calculate radial engagement (width of cut)
  let aeMm = userWocMm ?? tool.default_woc_mm
  const aeLimited = Math.min(aeMm, maxEngagement)
  
  if (aeLimited < aeMm) {
    warnings.push({
      type: 'woc_limited',
      message: `Width of cut limited by material engagement fraction (${aeLimited.toFixed(3)} mm < ${aeMm.toFixed(3)} mm)`,
      severity: 'warning'
    })
    aeMm = aeLimited
  }

  // Calculate Material Removal Rate (MRR)
  let mrrMm3Min: number
  
  if (tool.type === 'drill') {
    // For drilling: MRR = π(D_eff²/4) × vf
    mrrMm3Min = (Math.PI * Math.pow(effectiveDiameter, 2) / 4) * feedRate
  } else {
    // For all other operations: MRR = ae × ap × vf
    mrrMm3Min = aeMm * apMm * feedRate
  }

  return {
    aeMm,
    apMm,
    mrrMm3Min,
    warnings
  }
}