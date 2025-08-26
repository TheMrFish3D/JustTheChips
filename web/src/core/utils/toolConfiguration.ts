import type { Tool } from '../data/schemas/tool.js'

/**
 * Tool configuration interface that matches store state
 */
export interface ToolConfiguration {
  toolType?: Tool['type']
  toolDiameter?: number       // mm
  toolFlutes?: number
  toolLength?: number         // mm (total length for reference)
  toolStickout?: number       // mm (stickout/engagement length)
  toolMaterial?: string       // 'carbide' | 'HSS' | 'high_speed_steel' | etc
  toolCoating?: string        // 'TiAlN' | 'AlCrN' | 'TiN' | 'uncoated' | etc
  vbitAngle?: number          // degrees, for vbit tools
  bodyDiameter?: number       // mm, for facemill tools
  defaultDoc?: number         // mm
  defaultWoc?: number         // mm
}

/**
 * Convert tool configuration from store to a Tool object for calculations
 * This allows using configurable parameters instead of preset tool definitions
 */
export function createToolFromConfiguration(
  config: ToolConfiguration,
  fallbackId: string = 'custom_tool'
): Tool {
  // Validate required fields
  if (!config.toolType) {
    throw new Error('Tool type is required')
  }
  if (!config.toolDiameter || config.toolDiameter <= 0) {
    throw new Error('Tool diameter must be positive')
  }
  if (!config.toolFlutes || config.toolFlutes < 1) {
    throw new Error('Tool flutes must be at least 1')
  }
  if (!config.toolStickout || config.toolStickout <= 0) {
    throw new Error('Tool stickout must be positive')
  }
  if (!config.toolMaterial) {
    throw new Error('Tool material is required')
  }
  if (!config.toolCoating) {
    throw new Error('Tool coating is required')
  }

  // Create base tool object
  const tool: Tool = {
    id: fallbackId,
    type: config.toolType,
    diameter_mm: config.toolDiameter,
    flutes: config.toolFlutes,
    coating: config.toolCoating,
    stickout_mm: config.toolStickout,
    material: config.toolMaterial,
    default_doc_mm: config.defaultDoc || config.toolDiameter * 0.5,
    default_woc_mm: config.defaultWoc || config.toolDiameter * 0.3
  }

  // Add metadata for special tool types
  if (config.toolType === 'vbit' && config.vbitAngle) {
    tool.metadata = {
      angle_deg: config.vbitAngle
    }
  } else if (config.toolType === 'facemill' && config.bodyDiameter) {
    tool.metadata = {
      body_diameter_mm: config.bodyDiameter
    }
  }

  return tool
}

/**
 * Get default tool configuration values
 */
export function getDefaultToolConfiguration(): ToolConfiguration {
  return {
    toolType: 'endmill_flat',
    toolDiameter: 6.0,
    toolFlutes: 2,
    toolLength: 50.0,
    toolStickout: 25.0,
    toolMaterial: 'carbide',
    toolCoating: 'TiAlN',
    defaultDoc: 3.0,
    defaultWoc: 1.8
  }
}

/**
 * Validate tool configuration completeness
 */
export function validateToolConfiguration(config: ToolConfiguration): {
  isValid: boolean
  missingFields: string[]
} {
  const missingFields: string[] = []
  
  if (!config.toolType) missingFields.push('toolType')
  if (!config.toolDiameter) missingFields.push('toolDiameter')
  if (!config.toolFlutes) missingFields.push('toolFlutes')
  if (!config.toolStickout) missingFields.push('toolStickout')
  if (!config.toolMaterial) missingFields.push('toolMaterial')
  if (!config.toolCoating) missingFields.push('toolCoating')
  
  // Special validation for v-bits
  if (config.toolType === 'vbit' && !config.vbitAngle) {
    missingFields.push('vbitAngle')
  }
  
  // Special validation for face mills
  if (config.toolType === 'facemill' && !config.bodyDiameter) {
    missingFields.push('bodyDiameter')
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  }
}