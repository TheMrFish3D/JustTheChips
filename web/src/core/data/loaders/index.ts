import type { ZodIssue } from 'zod'

import type { Material, Machine, Tool, Spindle } from '../schemas/index.js'
import { safeParseMaterial, safeParseMachine, safeParseTool, safeParseSpindle } from '../schemas/index.js'

/**
 * Result of a data loading operation
 */
export interface LoadResult<T> {
  success: boolean
  data?: T[]
  errors?: string[]
}

/**
 * Format zod validation errors into user-friendly messages
 */
function formatValidationErrors(errors: ZodIssue[]): string[] {
  return errors.map((error) => {
    const path = error.path.length > 0 ? ` at ${error.path.join('.')}` : ''
    return `${error.message}${path}`
  })
}

/**
 * Load and validate materials from JSON data
 */
export function loadMaterials(jsonData: unknown): LoadResult<Material> {
  if (!Array.isArray(jsonData)) {
    return {
      success: false,
      errors: ['Expected an array of materials']
    }
  }

  const materials: Material[] = []
  const errors: string[] = []

  jsonData.forEach((item, index) => {
    const result = safeParseMaterial(item)
    if (result.success) {
      materials.push(result.data)
    } else {
      const itemErrors = formatValidationErrors(result.error.issues)
      errors.push(`Material at index ${index}: ${itemErrors.join(', ')}`)
    }
  })

  return {
    success: errors.length === 0,
    data: materials,
    errors: errors.length > 0 ? errors : undefined
  }
}

/**
 * Load and validate machines from JSON data
 */
export function loadMachines(jsonData: unknown): LoadResult<Machine> {
  if (!Array.isArray(jsonData)) {
    return {
      success: false,
      errors: ['Expected an array of machines']
    }
  }

  const machines: Machine[] = []
  const errors: string[] = []

  jsonData.forEach((item, index) => {
    const result = safeParseMachine(item)
    if (result.success) {
      machines.push(result.data)
    } else {
      const itemErrors = formatValidationErrors(result.error.issues)
      errors.push(`Machine at index ${index}: ${itemErrors.join(', ')}`)
    }
  })

  return {
    success: errors.length === 0,
    data: machines,
    errors: errors.length > 0 ? errors : undefined
  }
}

/**
 * Load and validate tools from JSON data
 */
export function loadTools(jsonData: unknown): LoadResult<Tool> {
  if (!Array.isArray(jsonData)) {
    return {
      success: false,
      errors: ['Expected an array of tools']
    }
  }

  const tools: Tool[] = []
  const errors: string[] = []

  jsonData.forEach((item, index) => {
    const result = safeParseTool(item)
    if (result.success) {
      tools.push(result.data)
    } else {
      const itemErrors = formatValidationErrors(result.error.issues)
      errors.push(`Tool at index ${index}: ${itemErrors.join(', ')}`)
    }
  })

  return {
    success: errors.length === 0,
    data: tools,
    errors: errors.length > 0 ? errors : undefined
  }
}

/**
 * Load and validate spindles from JSON data
 */
export function loadSpindles(jsonData: unknown): LoadResult<Spindle> {
  if (!Array.isArray(jsonData)) {
    return {
      success: false,
      errors: ['Expected an array of spindles']
    }
  }

  const spindles: Spindle[] = []
  const errors: string[] = []

  jsonData.forEach((item, index) => {
    const result = safeParseSpindle(item)
    if (result.success) {
      spindles.push(result.data)
    } else {
      const itemErrors = formatValidationErrors(result.error.issues)
      errors.push(`Spindle at index ${index}: ${itemErrors.join(', ')}`)
    }
  })

  return {
    success: errors.length === 0,
    data: spindles,
    errors: errors.length > 0 ? errors : undefined
  }
}

/**
 * Load all domain data from JSON objects
 */
export function loadAllData(data: {
  materials?: unknown
  machines?: unknown
  tools?: unknown
  spindles?: unknown
}): {
  materials: LoadResult<Material>
  machines: LoadResult<Machine>
  tools: LoadResult<Tool>
  spindles: LoadResult<Spindle>
} {
  return {
    materials: data.materials ? loadMaterials(data.materials) : { success: true, data: [] },
    machines: data.machines ? loadMachines(data.machines) : { success: true, data: [] },
    tools: data.tools ? loadTools(data.tools) : { success: true, data: [] },
    spindles: data.spindles ? loadSpindles(data.spindles) : { success: true, data: [] }
  }
}