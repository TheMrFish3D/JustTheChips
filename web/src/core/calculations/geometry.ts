import type { Tool } from '../data/schemas/tool.js'

/**
 * Calculate effective diameter for a tool based on its type and parameters
 * Different tool types have different effective diameter calculations
 */
export function getEffectiveDiameter(tool: Tool, doc?: number): number {
  switch (tool.type) {
    case 'endmill_flat':
    case 'drill':
      return tool.diameter_mm

    case 'vbit': {
      if (!tool.metadata?.angle_deg) {
        throw new Error('V-bit tools require angle_deg in metadata')
      }
      if (doc === undefined) {
        throw new Error('V-bit effective diameter calculation requires depth of cut (doc)')
      }
      // tipDiameter + 2 * tan(angle/2) * doc
      // For v-bits, diameter_mm represents the tip diameter
      const halfAngleRad = (tool.metadata.angle_deg / 2) * (Math.PI / 180)
      return tool.diameter_mm + 2 * Math.tan(halfAngleRad) * doc
    }

    case 'facemill':
      if (!tool.metadata?.body_diameter_mm) {
        throw new Error('Facemill tools require body_diameter_mm in metadata')
      }
      return tool.metadata.body_diameter_mm

    case 'slitting':
      // For slitting saws, diameter_mm represents the disk diameter
      return tool.diameter_mm

    case 'boring': {
      if (!tool.metadata?.body_diameter_mm) {
        throw new Error('Boring tools require body_diameter_mm in metadata (bit diameter)')
      }
      // For boring: 2 * (offset + bit_diameter/2)
      // Assuming diameter_mm is the offset and body_diameter_mm is the bit diameter
      const offset = tool.diameter_mm
      const bitDiameter = tool.metadata.body_diameter_mm
      return 2 * (offset + bitDiameter / 2)
    }

    default:
      throw new Error(`Unknown tool type: ${tool.type as string}`)
  }
}

/**
 * Calculate effective flute count for a tool based on its type
 * Some tool types have reduced effective flute count
 */
export function getEffectiveFlutes(tool: Tool): number {
  switch (tool.type) {
    case 'endmill_flat':
    case 'drill':
    case 'vbit':
      // Standard flute count
      return tool.flutes

    case 'facemill':
    case 'slitting':
      // Facemills and slitting saws may have reduced effective flutes
      // For now, use the full flute count - this could be adjusted with factors
      return tool.flutes

    case 'boring':
      // Boring tools typically have 1 effective flute
      return 1

    default:
      throw new Error(`Unknown tool type: ${tool.type as string}`)
  }
}