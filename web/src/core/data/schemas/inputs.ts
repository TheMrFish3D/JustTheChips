import { z } from 'zod'

/**
 * Schema for cutting operation types
 */
export const CutTypeSchema = z.enum(['slot', 'profile', 'adaptive', 'facing', 'drilling', 'boring'])

/**
 * Schema for calculator inputs
 * Defines all input parameters needed for calculations
 */
export const InputsSchema = z.object({
  machineId: z.string().min(1, 'Machine ID is required'),
  spindleId: z.string().min(1, 'Spindle ID is required'),
  toolId: z.string().min(1, 'Tool ID is required'),
  materialId: z.string().min(1, 'Material ID is required'),
  cutType: CutTypeSchema,
  aggressiveness: z.number().positive('Aggressiveness must be positive').default(1.0),
  user_doc_mm: z.number().positive('User DOC must be positive').optional(),
  user_woc_mm: z.number().positive('User WOC must be positive').optional(),
  override_flutes: z.number().int().positive('Override flutes must be a positive integer').optional(),
  override_stickout_mm: z.number().positive('Override stickout must be positive').optional()
})

export type CutType = z.infer<typeof CutTypeSchema>
export type Inputs = z.infer<typeof InputsSchema>

/**
 * Validates inputs data and returns parsed result
 */
export const validateInputs = (data: unknown) => InputsSchema.parse(data)

/**
 * Safely validates inputs data and returns result with error handling
 */
export const safeParseInputs = (data: unknown) => InputsSchema.safeParse(data)