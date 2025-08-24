// Data loaders and validation with zod schemas
// Exports all domain entities with runtime validation

// Import curated JSON datasets
import machinesData from './datasets/machines.json'
import materialsData from './datasets/materials.json'
import spindlesData from './datasets/spindles.json'
import toolsData from './datasets/tools.json'
// Import types and loaders
import { loadMaterials, loadMachines, loadTools, loadSpindles } from './loaders/index.js'
import type { Material, Machine, Tool, Spindle } from './schemas/index.js'

// Re-export all schemas and types
export * from './schemas/index.js'

// Re-export loader utilities
export * from './loaders/index.js'

// Load and validate datasets
const materialsResult = loadMaterials(materialsData)
const machinesResult = loadMachines(machinesData)
const toolsResult = loadTools(toolsData)
const spindlesResult = loadSpindles(spindlesData)

// Log any loading errors to console for debugging
if (!materialsResult.success) {
  console.error('Failed to load materials:', materialsResult.errors)
}
if (!machinesResult.success) {
  console.error('Failed to load machines:', machinesResult.errors)
}
if (!toolsResult.success) {
  console.error('Failed to load tools:', toolsResult.errors)
}
if (!spindlesResult.success) {
  console.error('Failed to load spindles:', spindlesResult.errors)
}

// Export validated datasets
export const materials: Material[] = materialsResult.data || []
export const machines: Machine[] = machinesResult.data || []
export const tools: Tool[] = toolsResult.data || []
export const spindles: Spindle[] = spindlesResult.data || []