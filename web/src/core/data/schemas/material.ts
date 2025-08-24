import { z } from 'zod'

/**
 * Schema for material properties and cutting coefficients
 * Defines material cutting-speed range, chipload ranges, force coefficients, etc.
 */
export const MaterialSchema = z.object({
  id: z.string().min(1, 'Material ID is required'),
  category: z.string().min(1, 'Material category is required'),
  vc_range_m_min: z.tuple([z.number().positive(), z.number().positive()])
    .refine(([min, max]) => min <= max, 'vc_range min must be <= max'),
  fz_mm_per_tooth_by_diameter: z.record(
    z.string(),
    z.tuple([z.number().positive(), z.number().positive()])
      .refine(([min, max]) => min <= max, 'fz_range min must be <= max')
  ),
  force_coeff_kn_mm2: z.number().positive('Force coefficient must be positive'),
  specific_cutting_energy_j_mm3: z.number().positive('Specific cutting energy must be positive'),
  chip_thinning: z.object({
    enable_below_fraction: z.number().positive().max(1, 'Enable below fraction must be <= 1'),
    limit_factor: z.number().positive('Limit factor must be positive')
  }),
  max_engagement_fraction: z.number().positive().max(1, 'Max engagement fraction must be <= 1')
})

export type Material = z.infer<typeof MaterialSchema>

/**
 * Validates material data and returns parsed result
 */
export const validateMaterial = (data: unknown) => MaterialSchema.parse(data)

/**
 * Safely validates material data and returns result with error handling
 */
export const safeParseMaterial = (data: unknown) => MaterialSchema.safeParse(data)