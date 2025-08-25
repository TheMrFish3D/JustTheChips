import type { ZodIssue } from 'zod'

import { loadAllData } from '../data/loaders/index.js'
import type { Bundle, Settings, Libraries } from '../data/schemas/bundle.js'
import { safeParseBundle } from '../data/schemas/bundle.js'

/**
 * Result of an import operation
 */
export interface ImportResult {
  success: boolean
  data?: {
    settings: Settings
    libraries: Libraries
  }
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
 * Export application settings and libraries to JSON bundle
 */
export function exportBundle(settings: Settings, libraries: Libraries): Bundle {
  return {
    version: '1.0',
    timestamp: new Date().toISOString(),
    settings,
    libraries
  }
}

/**
 * Export bundle as downloadable JSON file
 */
export function downloadBundle(bundle: Bundle, filename?: string): void {
  const dataStr = JSON.stringify(bundle, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename || `justthechips-settings-${new Date().toISOString().split('T')[0]}.json`
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Import and validate settings bundle from JSON data
 */
export function importBundle(jsonData: unknown): ImportResult {
  // First validate the overall bundle structure
  const bundleResult = safeParseBundle(jsonData)
  if (!bundleResult.success) {
    const errors = formatValidationErrors(bundleResult.error.issues)
    return {
      success: false,
      errors: ['Invalid bundle format:', ...errors]
    }
  }

  const bundle = bundleResult.data
  const errors: string[] = []

  // Validate libraries data using existing loaders
  const libraryResults = loadAllData({
    materials: bundle.libraries.materials,
    machines: bundle.libraries.machines,
    tools: bundle.libraries.tools,
    spindles: bundle.libraries.spindles
  })

  // Collect any library validation errors
  if (!libraryResults.materials.success && libraryResults.materials.errors) {
    errors.push(...libraryResults.materials.errors.map((e: string) => `Materials: ${e}`))
  }
  if (!libraryResults.machines.success && libraryResults.machines.errors) {
    errors.push(...libraryResults.machines.errors.map((e: string) => `Machines: ${e}`))
  }
  if (!libraryResults.tools.success && libraryResults.tools.errors) {
    errors.push(...libraryResults.tools.errors.map((e: string) => `Tools: ${e}`))
  }
  if (!libraryResults.spindles.success && libraryResults.spindles.errors) {
    errors.push(...libraryResults.spindles.errors.map((e: string) => `Spindles: ${e}`))
  }

  if (errors.length > 0) {
    return {
      success: false,
      errors
    }
  }

  return {
    success: true,
    data: {
      settings: bundle.settings,
      libraries: bundle.libraries
    }
  }
}

/**
 * Create a file input element for importing bundles
 */
export function createFileImportInput(
  onImport: (result: ImportResult) => void,
  onError?: (error: string) => void
): HTMLInputElement {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.style.display = 'none'

  input.addEventListener('change', (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const data: unknown = JSON.parse(content)
        const result = importBundle(data)
        onImport(result)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to parse JSON file'
        if (onError) {
          onError(errorMessage)
        } else {
          onImport({
            success: false,
            errors: [errorMessage]
          })
        }
      }
    }

    reader.onerror = () => {
      const errorMessage = 'Failed to read file'
      if (onError) {
        onError(errorMessage)
      } else {
        onImport({
          success: false,
          errors: [errorMessage]
        })
      }
    }

    reader.readAsText(file)
  })

  return input
}