// Core calculation engine orchestrator
// Orchestrates all calculation modules to produce final results

import {
  assembleOutput,
  calculateChiploadAndFeed,
  calculateCuttingForce,
  calculateDeflection,
  calculateEngagementAndMRR,
  calculatePower,
  calculateSpeedAndRPM,
  getEffectiveDiameter,
  getEffectiveFlutes,
  validateInputs,
  type OutputAssemblyInput,
  type ValidationWarning
} from './calculations/index.js'
import type { CalculationOutput } from './calculations/output.js'
import { materials, machines, tools, spindles } from './data/index.js'
import type { Inputs } from './data/schemas/inputs.js'
import { createToolFromConfiguration, type ToolConfiguration } from './utils/toolConfiguration.js'

// Using the proper output type from calculations module
export type CalculationInputs = Inputs
export type CalculationResults = CalculationOutput

/**
 * Main calculation function that orchestrates all calculation modules
 * to produce final CNC machining parameters and warnings
 */
export function calculate(inputs: Inputs): CalculationResults {
  // Find data entities by ID
  const material = materials.find(m => m.id === inputs.materialId)
  const machine = machines.find(m => m.id === inputs.machineId)
  const spindle = spindles.find(s => s.id === inputs.spindleId)
  const tool = tools.find(t => t.id === inputs.toolId)

  // Validate that all required entities were found
  if (!material) {
    throw new Error(`Material not found: ${inputs.materialId}`)
  }
  if (!machine) {
    throw new Error(`Machine not found: ${inputs.machineId}`)
  }
  if (!spindle) {
    throw new Error(`Spindle not found: ${inputs.spindleId}`)
  }
  if (!tool) {
    throw new Error(`Tool not found: ${inputs.toolId}`)
  }

  // Use provided DOC/WOC or fall back to tool defaults
  const finalDocMm = inputs.user_doc_mm ?? tool.default_doc_mm
  const finalWocMm = inputs.user_woc_mm ?? tool.default_woc_mm

  // Get effective diameter and flutes
  const effectiveDiameter = tool.type === 'vbit' 
    ? getEffectiveDiameter(tool, finalDocMm)
    : getEffectiveDiameter(tool)
  const effectiveFlutes = getEffectiveFlutes(tool)

  // Validate inputs (skip for vbits as they require special handling)
  let validationWarnings: ValidationWarning[] = []
  if (tool.type !== 'vbit') {
    const validationResult = validateInputs(
      inputs,
      [material],
      [machine],
      [tool],
      [spindle]
    )
    
    if (!validationResult.isValid) {
      throw new Error(`Validation failed: ${validationResult.errors?.map(e => e.message).join(', ')}`)
    }
    validationWarnings = validationResult.warnings
  }

  // Run calculation pipeline in proper order
  const speedResult = calculateSpeedAndRPM(
    material, 
    spindle, 
    effectiveDiameter, 
    inputs.cutType, 
    inputs.aggressiveness ?? 1.0,
    tool  // Pass tool for material-specific speed adjustments
  )

  const chiploadResult = calculateChiploadAndFeed(
    material,
    machine,
    tool,
    effectiveDiameter,
    effectiveFlutes,
    speedResult.rpmActual,
    finalWocMm,
    inputs.aggressiveness ?? 1.0
  )

  const engagementResult = calculateEngagementAndMRR(
    material,
    tool,
    effectiveDiameter,
    chiploadResult.vfActual,
    finalDocMm,
    finalWocMm
  )

  const powerResult = calculatePower(
    material,
    machine,
    spindle,
    tool,
    engagementResult.mrrMm3Min,
    speedResult.rpmActual
  )

  const forceResult = calculateCuttingForce(
    material,
    tool,
    engagementResult.aeMm,
    chiploadResult.fzAdjusted
  )

  const deflectionResult = calculateDeflection(
    tool,
    forceResult.totalForceN,
    speedResult.rpmActual,
    effectiveFlutes
  )

  // Assemble final output
  const assemblyInput: OutputAssemblyInput = {
    tool,
    effectiveDiameter,
    userDocOverride: Boolean(inputs.user_doc_mm),
    speedResult,
    chiploadResult,
    engagementResult,
    powerResult,
    forceResult,
    deflectionResult,
    validationWarnings
  }

  return assembleOutput(assemblyInput)
}

/**
 * Extended calculation function that uses configurable tool parameters
 * instead of preset tool definitions
 */
export function calculateWithToolConfig(
  inputs: Inputs, 
  toolConfig: ToolConfiguration
): CalculationResults {
  // Find data entities by ID
  const material = materials.find(m => m.id === inputs.materialId)
  const machine = machines.find(m => m.id === inputs.machineId)
  const spindle = spindles.find(s => s.id === inputs.spindleId)

  // Validate that all required entities were found
  if (!material) {
    throw new Error(`Material not found: ${inputs.materialId}`)
  }
  if (!machine) {
    throw new Error(`Machine not found: ${inputs.machineId}`)
  }
  if (!spindle) {
    throw new Error(`Spindle not found: ${inputs.spindleId}`)
  }

  // Create tool from configuration
  const tool = createToolFromConfiguration(toolConfig, inputs.toolId || 'configured_tool')

  // Use provided DOC/WOC or fall back to tool configuration defaults
  const finalDocMm = inputs.user_doc_mm ?? tool.default_doc_mm
  const finalWocMm = inputs.user_woc_mm ?? tool.default_woc_mm

  // Get effective diameter and flutes (override if provided)
  const effectiveDiameter = tool.type === 'vbit' 
    ? getEffectiveDiameter(tool, finalDocMm)
    : getEffectiveDiameter(tool)
  const effectiveFlutes = inputs.override_flutes ?? getEffectiveFlutes(tool)

  // Update tool stickout if override is provided
  if (inputs.override_stickout_mm) {
    tool.stickout_mm = inputs.override_stickout_mm
  }

  // Validate inputs (skip for vbits as they require special handling)
  let validationWarnings: ValidationWarning[] = []
  if (tool.type !== 'vbit') {
    const validationResult = validateInputs(
      inputs,
      [material],
      [machine],
      [tool],
      [spindle]
    )
    
    if (!validationResult.isValid) {
      throw new Error(`Validation failed: ${validationResult.errors?.map(e => e.message).join(', ')}`)
    }
    validationWarnings = validationResult.warnings
  }

  // Run calculation pipeline in proper order
  const speedResult = calculateSpeedAndRPM(
    material, 
    spindle, 
    effectiveDiameter, 
    inputs.cutType, 
    inputs.aggressiveness ?? 1.0,
    tool  // Pass tool for material-specific speed adjustments
  )

  const chiploadResult = calculateChiploadAndFeed(
    material,
    machine,
    tool,
    effectiveDiameter,
    effectiveFlutes,
    speedResult.rpmActual,
    finalWocMm,
    inputs.aggressiveness ?? 1.0
  )

  const engagementResult = calculateEngagementAndMRR(
    material,
    tool,
    effectiveDiameter,
    chiploadResult.vfActual,
    finalDocMm,
    finalWocMm
  )

  const powerResult = calculatePower(
    material,
    machine,
    spindle,
    tool,
    engagementResult.mrrMm3Min,
    speedResult.rpmActual
  )

  const forceResult = calculateCuttingForce(
    material,
    tool,
    engagementResult.aeMm,
    chiploadResult.fzAdjusted
  )

  const deflectionResult = calculateDeflection(
    tool,
    forceResult.totalForceN,
    speedResult.rpmActual,
    effectiveFlutes
  )

  // Assemble final output
  const assemblyInput: OutputAssemblyInput = {
    tool,
    effectiveDiameter,
    userDocOverride: Boolean(inputs.user_doc_mm),
    speedResult,
    chiploadResult,
    engagementResult,
    powerResult,
    forceResult,
    deflectionResult,
    validationWarnings
  }

  return assembleOutput(assemblyInput)
}