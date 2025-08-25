import { clamp } from '../utils/math.js'

/**
 * Frame construction types for rigidity estimation
 */
export type FrameConstructionType = 
  | 'aluminum_extrusion'    // 3018 CNC style
  | 'steel_welded'          // PrintNC style
  | 'cast_iron'             // Traditional mill style
  | 'aluminum_machined'     // CNC machined frame
  | 'steel_fabricated'      // Heavy steel fabrication
  | 'composite'             // Epoxy granite or similar
  | 'torsion_box'           // Lowrider v3 style

/**
 * Linear motion system types
 */
export type MotionSystemType = 
  | 'belt_drive'            // Belt and pulley
  | 'leadscrew'             // Acme or metric leadscrew
  | 'ballscrew'             // Precision ballscrew
  | 'rack_pinion'           // Rack and pinion
  | 'linear_motor'          // Direct drive linear motor

/**
 * Spindle mounting types
 */
export type SpindleMountType = 
  | 'router_clamp'          // Router clamp mount
  | 'fixed_mount'           // Fixed spindle mount
  | 'cartridge_spindle'     // Cartridge style
  | 'integrated_spindle'    // Integrated into structure

/**
 * Input parameters for custom machine rigidity estimation
 */
export interface MachineRigidityInputs {
  // Physical characteristics
  weightKg: number                          // Total machine weight
  workingVolumeMm3: number                  // X * Y * Z working volume
  frameConstructionType: FrameConstructionType
  
  // Motion system
  motionSystemType: MotionSystemType
  
  // Spindle integration
  spindleMountType: SpindleMountType
  
  // Optional detailed parameters
  frameThicknessMm?: number                 // Frame member thickness
  baseWeightKg?: number                     // Base/table weight specifically
  gantryWeightKg?: number                   // Moving gantry weight
  
  // Geometric factors
  maxSpanMm?: number                        // Largest unsupported span
  heightToWidthRatio?: number               // H/W ratio for stability
}

/**
 * Result of rigidity estimation with breakdown
 */
export interface RigidityEstimationResult {
  estimatedRigidityFactor: number           // Final rigidity factor (0.1-1.0)
  confidence: number                        // Confidence in estimation (0-1)
  
  // Component factors
  frameRigidityFactor: number               // Frame contribution
  motionSystemFactor: number                // Motion system contribution  
  spindleMountFactor: number               // Spindle mount contribution
  sizePenaltyFactor: number                // Size/weight penalty
  
  // Analysis
  breakdown: {
    frameType: string                       // Description of frame assessment
    motionSystem: string                    // Motion system assessment
    spindleMount: string                    // Spindle mount assessment
    sizeAnalysis: string                    // Size/weight analysis
  }
  
  // Validation
  nearestKnownMachines: Array<{
    machineId: string
    rigidityFactor: number
    similarity: number                      // 0-1 similarity score
    reason: string                          // Why it's similar
  }>
  
  warnings: string[]                        // Estimation warnings
}

/**
 * Known machine data for validation and comparison
 */
interface KnownMachineData {
  id: string
  rigidityFactor: number
  weightKg: number
  frameType: FrameConstructionType
  motionType: MotionSystemType
  spindleMount: SpindleMountType
  workingVolumeMm3: number
  description: string
}

/**
 * Database of known machines for validation
 */
const knownMachines: KnownMachineData[] = [
  {
    id: '3018_cnc',
    rigidityFactor: 0.15,
    weightKg: 8,
    frameType: 'aluminum_extrusion',
    motionType: 'leadscrew',
    spindleMount: 'router_clamp',
    workingVolumeMm3: 300 * 180 * 45,
    description: 'Small hobby CNC with aluminum extrusion frame'
  },
  {
    id: 'lowrider_v3',
    rigidityFactor: 0.25,
    weightKg: 25,
    frameType: 'torsion_box',
    motionType: 'belt_drive',
    spindleMount: 'router_clamp',
    workingVolumeMm3: 1220 * 2440 * 89, // 4x8 table
    description: 'Torsion box table CNC with belt drive'
  },
  {
    id: 'queenbee_pro',
    rigidityFactor: 0.35,
    weightKg: 45,
    frameType: 'aluminum_machined',
    motionType: 'ballscrew',
    spindleMount: 'fixed_mount',
    workingVolumeMm3: 790 * 790 * 80,
    description: 'Machined aluminum frame with linear rails'
  },
  {
    id: 'printnc',
    rigidityFactor: 0.6,
    weightKg: 150,
    frameType: 'steel_welded',
    motionType: 'ballscrew',
    spindleMount: 'fixed_mount',
    workingVolumeMm3: 500 * 500 * 300,
    description: 'Welded steel frame CNC'
  },
  {
    id: 'benchtop_mill',
    rigidityFactor: 0.45,
    weightKg: 80,
    frameType: 'cast_iron',
    motionType: 'leadscrew',
    spindleMount: 'integrated_spindle',
    workingVolumeMm3: 400 * 200 * 300,
    description: 'Small cast iron benchtop mill'
  },
  {
    id: 'entry_vmc',
    rigidityFactor: 0.8,
    weightKg: 2500,
    frameType: 'cast_iron',
    motionType: 'ballscrew',
    spindleMount: 'integrated_spindle',
    workingVolumeMm3: 600 * 400 * 500,
    description: 'Entry-level VMC with cast iron construction'
  }
]

/**
 * Get base rigidity factor for frame construction type
 */
function getFrameRigidityFactor(frameType: FrameConstructionType): number {
  switch (frameType) {
    case 'aluminum_extrusion':
      return 0.2   // Lowest rigidity
    case 'torsion_box':
      return 0.3   // Low-medium
    case 'aluminum_machined':
      return 0.4   // Medium
    case 'steel_fabricated':
      return 0.5   // Medium-high
    case 'steel_welded':
      return 0.6   // High
    case 'cast_iron':
      return 0.8   // Very high
    case 'composite':
      return 0.85  // Highest
    default:
      return 0.4   // Default fallback
  }
}

/**
 * Get motion system rigidity multiplier
 */
function getMotionSystemFactor(motionType: MotionSystemType): number {
  switch (motionType) {
    case 'belt_drive':
      return 0.7   // Belts have compliance
    case 'leadscrew':
      return 0.9   // Good rigidity
    case 'ballscrew':
      return 1.0   // Excellent rigidity
    case 'rack_pinion':
      return 0.8   // Good but some backlash
    case 'linear_motor':
      return 1.1   // Highest rigidity
    default:
      return 0.9   // Default
  }
}

/**
 * Get spindle mount rigidity multiplier
 */
function getSpindleMountFactor(mountType: SpindleMountType): number {
  switch (mountType) {
    case 'router_clamp':
      return 0.8   // Clamps have some compliance
    case 'fixed_mount':
      return 0.95  // Good fixed mounting
    case 'cartridge_spindle':
      return 1.0   // Precision cartridge
    case 'integrated_spindle':
      return 1.1   // Highest rigidity
    default:
      return 0.9   // Default
  }
}

/**
 * Calculate size penalty factor based on weight and volume
 */
function calculateSizePenalty(weightKg: number, workingVolumeMm3: number): number {
  // Weight density (kg per liter of working volume)
  const volumeLiters = workingVolumeMm3 / 1_000_000
  const density = weightKg / volumeLiters
  
  // Higher density = better rigidity
  // Typical ranges: hobby ~0.5-2 kg/L, professional ~5-20 kg/L
  
  if (density >= 10) return 1.0      // Very dense - professional
  if (density >= 5) return 0.95      // Dense - good hobby
  if (density >= 2) return 0.9       // Medium density
  if (density >= 1) return 0.8       // Low density
  if (density >= 0.5) return 0.7     // Very low density
  return 0.6                         // Extremely low density
}

/**
 * Find similar known machines for validation
 */
function findSimilarMachines(inputs: MachineRigidityInputs): Array<{
  machineId: string
  rigidityFactor: number
  similarity: number
  reason: string
}> {
  const results: Array<{
    machineId: string
    rigidityFactor: number
    similarity: number
    reason: string
  }> = []
  
  for (const known of knownMachines) {
    let similarity = 0
    const reasons: string[] = []
    
    // Frame type match (high weight)
    if (known.frameType === inputs.frameConstructionType) {
      similarity += 0.4
      reasons.push('same frame construction')
    }
    
    // Motion system match (medium weight)
    if (known.motionType === inputs.motionSystemType) {
      similarity += 0.3
      reasons.push('same motion system')
    }
    
    // Spindle mount match (medium weight)
    if (known.spindleMount === inputs.spindleMountType) {
      similarity += 0.2
      reasons.push('same spindle mount')
    }
    
    // Weight similarity (low weight)
    const weightRatio = Math.min(inputs.weightKg, known.weightKg) / Math.max(inputs.weightKg, known.weightKg)
    if (weightRatio > 0.5) {
      similarity += 0.1 * weightRatio
      reasons.push('similar weight')
    }
    
    if (similarity > 0.2) { // Lowered threshold to include more similar machines
      results.push({
        machineId: known.id,
        rigidityFactor: known.rigidityFactor,
        similarity,
        reason: reasons.join(', ')
      })
    }
  }
  
  // Sort by similarity descending
  return results.sort((a, b) => b.similarity - a.similarity).slice(0, 3)
}

/**
 * Estimate machine rigidity factor based on construction parameters
 */
export function estimateMachineRigidity(inputs: MachineRigidityInputs): RigidityEstimationResult {
  const warnings: string[] = []
  
  // Validate inputs
  if (inputs.weightKg <= 0) {
    throw new Error('Machine weight must be positive')
  }
  if (inputs.workingVolumeMm3 <= 0) {
    throw new Error('Working volume must be positive')
  }
  
  // Calculate component factors
  const frameRigidityFactor = getFrameRigidityFactor(inputs.frameConstructionType)
  const motionSystemFactor = getMotionSystemFactor(inputs.motionSystemType)
  const spindleMountFactor = getSpindleMountFactor(inputs.spindleMountType)
  const sizePenaltyFactor = calculateSizePenalty(inputs.weightKg, inputs.workingVolumeMm3)
  
  // Calculate base rigidity
  let estimatedRigidity = frameRigidityFactor * motionSystemFactor * spindleMountFactor * sizePenaltyFactor
  
  // Apply geometric penalties if provided
  if (inputs.heightToWidthRatio && inputs.heightToWidthRatio > 1.5) {
    estimatedRigidity *= 0.9 // Tall machines are less stable
    warnings.push('High height-to-width ratio may reduce stability')
  }
  
  if (inputs.maxSpanMm && inputs.maxSpanMm > 1000) {
    const spanPenalty = Math.max(0.7, 1 - (inputs.maxSpanMm - 1000) / 5000)
    estimatedRigidity *= spanPenalty
    warnings.push('Large unsupported spans reduce rigidity')
  }
  
  // Clamp final result to reasonable range
  estimatedRigidity = clamp(estimatedRigidity, 0.1, 1.0)
  
  // Calculate confidence based on how well inputs match known patterns
  let confidence = 0.7 // Base confidence
  
  // Higher confidence for well-known construction types
  if (['cast_iron', 'steel_welded', 'aluminum_extrusion'].includes(inputs.frameConstructionType)) {
    confidence += 0.2
  }
  
  // Lower confidence for extreme parameters
  if (inputs.weightKg < 5 || inputs.weightKg > 5000) {
    confidence -= 0.1
    warnings.push('Machine weight is outside typical range')
  }
  
  confidence = clamp(confidence, 0.3, 0.95)
  
  // Find similar machines for validation
  const nearestKnownMachines = findSimilarMachines(inputs)
  
  // Create breakdown descriptions
  const breakdown = {
    frameType: `${inputs.frameConstructionType.replace('_', ' ')} construction (factor: ${frameRigidityFactor.toFixed(2)})`,
    motionSystem: `${inputs.motionSystemType.replace('_', ' ')} motion system (factor: ${motionSystemFactor.toFixed(2)})`,
    spindleMount: `${inputs.spindleMountType.replace('_', ' ')} spindle mount (factor: ${spindleMountFactor.toFixed(2)})`,
    sizeAnalysis: `Weight: ${inputs.weightKg}kg, Volume: ${(inputs.workingVolumeMm3/1000000).toFixed(1)}L (factor: ${sizePenaltyFactor.toFixed(2)})`
  }
  
  return {
    estimatedRigidityFactor: estimatedRigidity,
    confidence,
    frameRigidityFactor,
    motionSystemFactor,
    spindleMountFactor,
    sizePenaltyFactor,
    breakdown,
    nearestKnownMachines,
    warnings
  }
}

/**
 * Validate estimation against known machine data
 * Returns accuracy metrics for the estimation framework
 */
export function validateEstimationFramework(): {
  averageError: number
  maxError: number
  predictions: Array<{
    machineId: string
    actualRigidity: number
    estimatedRigidity: number
    error: number
  }>
} {
  const predictions: Array<{
    machineId: string
    actualRigidity: number
    estimatedRigidity: number
    error: number
  }> = []
  
  for (const known of knownMachines) {
    const inputs: MachineRigidityInputs = {
      weightKg: known.weightKg,
      workingVolumeMm3: known.workingVolumeMm3,
      frameConstructionType: known.frameType,
      motionSystemType: known.motionType,
      spindleMountType: known.spindleMount
    }
    
    const result = estimateMachineRigidity(inputs)
    const error = Math.abs(result.estimatedRigidityFactor - known.rigidityFactor)
    
    predictions.push({
      machineId: known.id,
      actualRigidity: known.rigidityFactor,
      estimatedRigidity: result.estimatedRigidityFactor,
      error
    })
  }
  
  const totalError = predictions.reduce((sum, p) => sum + p.error, 0)
  const averageError = totalError / predictions.length
  const maxError = Math.max(...predictions.map(p => p.error))
  
  return {
    averageError,
    maxError,
    predictions
  }
}