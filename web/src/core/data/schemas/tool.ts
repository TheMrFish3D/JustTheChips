import { z } from 'zod'

/**
 * Schema for cutting tool properties
 * Defines tool type, geometry, material, coating, and defaults
 */
export const ToolSchema = z.object({
  id: z.string().min(1, 'Tool ID is required'),
  type: z.enum(['endmill_flat', 'drill', 'vbit', 'facemill', 'boring', 'slitting']),
  diameter_mm: z.number().positive('Tool diameter must be positive'),
  flutes: z.number().int().positive('Flute count must be a positive integer'),
  coating: z.string().min(1, 'Coating is required'),
  stickout_mm: z.number().positive('Stickout must be positive'),
  material: z.string().min(1, 'Tool material is required'),
  default_doc_mm: z.number().positive('Default DOC must be positive'),
  default_woc_mm: z.number().positive('Default WOC must be positive'),
  metadata: z.object({
    angle_deg: z.number().optional(),
    body_diameter_mm: z.number().positive().optional()
  }).optional()
})

export type Tool = z.infer<typeof ToolSchema>

/**
 * Validates tool data and returns parsed result
 */
export const validateTool = (data: unknown) => ToolSchema.parse(data)

/**
 * Safely validates tool data and returns result with error handling
 */
export const safeParseTool = (data: unknown) => ToolSchema.safeParse(data)