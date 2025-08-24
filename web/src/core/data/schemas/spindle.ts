import { z } from 'zod'

/**
 * Schema for spindle power curve point
 */
export const PowerCurvePointSchema = z.object({
  rpm: z.number().positive('RPM must be positive'),
  power_kw: z.number().nonnegative('Power must be non-negative')
})

/**
 * Schema for spindle capabilities and power characteristics
 * Defines rated power, RPM range, and power curve
 */
export const SpindleSchema = z.object({
  id: z.string().min(1, 'Spindle ID is required'),
  rated_power_kw: z.number().positive('Rated power must be positive'),
  rpm_min: z.number().positive('Minimum RPM must be positive'),
  rpm_max: z.number().positive('Maximum RPM must be positive'),
  base_rpm: z.number().positive('Base RPM must be positive'),
  power_curve: z.array(PowerCurvePointSchema).min(1, 'Power curve must have at least one point')
}).refine((data) => data.rpm_min <= data.rpm_max, {
  message: 'Minimum RPM must be <= maximum RPM',
  path: ['rpm_min']
}).refine((data) => data.base_rpm >= data.rpm_min && data.base_rpm <= data.rpm_max, {
  message: 'Base RPM must be within min/max RPM range',
  path: ['base_rpm']
})

export type PowerCurvePoint = z.infer<typeof PowerCurvePointSchema>
export type Spindle = z.infer<typeof SpindleSchema>

/**
 * Validates spindle data and returns parsed result
 */
export const validateSpindle = (data: unknown) => SpindleSchema.parse(data)

/**
 * Safely validates spindle data and returns result with error handling
 */
export const safeParseSpindle = (data: unknown) => SpindleSchema.safeParse(data)