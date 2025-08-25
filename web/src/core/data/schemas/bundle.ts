import { z } from 'zod'

import { InputsSchema } from './inputs.js'
import { MaterialSchema } from './material.js'
import { MachineSchema } from './machine.js'
import { ToolSchema } from './tool.js'
import { SpindleSchema } from './spindle.js'

/**
 * Schema for application settings that can be exported/imported
 */
export const SettingsSchema = z.object({
  // Calculator inputs state
  machineId: z.string().optional(),
  spindleId: z.string().optional(),
  toolId: z.string().optional(),
  materialId: z.string().optional(),
  cutType: InputsSchema.shape.cutType.optional(),
  aggressiveness: z.number().min(0.1).max(5.0).optional(),
  user_doc_mm: z.number().positive().optional(),
  user_woc_mm: z.number().positive().optional(),
  override_flutes: z.number().int().positive().optional(),
  override_stickout_mm: z.number().positive().optional(),
})

/**
 * Schema for custom library data that can be exported/imported
 */
export const LibrariesSchema = z.object({
  materials: z.array(MaterialSchema).optional(),
  machines: z.array(MachineSchema).optional(),
  tools: z.array(ToolSchema).optional(),
  spindles: z.array(SpindleSchema).optional(),
})

/**
 * Schema for the complete export bundle
 */
export const BundleSchema = z.object({
  version: z.literal('1.0'),
  timestamp: z.string(),
  settings: SettingsSchema,
  libraries: LibrariesSchema,
})

// Export types
export type Settings = z.infer<typeof SettingsSchema>
export type Libraries = z.infer<typeof LibrariesSchema>
export type Bundle = z.infer<typeof BundleSchema>

// Export validation functions
export function validateSettings(data: unknown): Settings {
  return SettingsSchema.parse(data)
}

export function validateLibraries(data: unknown): Libraries {
  return LibrariesSchema.parse(data)
}

export function validateBundle(data: unknown): Bundle {
  return BundleSchema.parse(data)
}

// Safe parsing functions
export function safeParseSettings(data: unknown) {
  return SettingsSchema.safeParse(data)
}

export function safeParseLibraries(data: unknown) {
  return LibrariesSchema.safeParse(data)
}

export function safeParseBundle(data: unknown) {
  return BundleSchema.safeParse(data)
}