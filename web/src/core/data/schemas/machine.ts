import { z } from 'zod'

/**
 * Schema for machine configuration and capabilities
 * Defines axis feed limits, rigidity factor, aggressiveness multipliers
 */
export const MachineSchema = z.object({
  id: z.string().min(1, 'Machine ID is required'),
  axis_max_feed_mm_min: z.number().positive('Axis max feed must be positive'),
  rigidity_factor: z.number().positive('Rigidity factor must be positive'),
  aggressiveness: z.object({
    axial: z.number().positive('Axial aggressiveness must be positive'),
    radial: z.number().positive('Radial aggressiveness must be positive'),
    feed: z.number().positive('Feed aggressiveness must be positive')
  })
})

export type Machine = z.infer<typeof MachineSchema>

/**
 * Validates machine data and returns parsed result
 */
export const validateMachine = (data: unknown) => MachineSchema.parse(data)

/**
 * Safely validates machine data and returns result with error handling
 */
export const safeParseMachine = (data: unknown) => MachineSchema.safeParse(data)