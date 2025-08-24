// Data loaders and validation with zod schemas
// Exports all domain entities with runtime validation

// Re-export all schemas and types
export * from './schemas/index.js'

// Import types for the data arrays
import type { Material, Machine, Tool, Spindle } from './schemas/index.js'

// Placeholder exports for future implementation
// These will be populated with curated JSON datasets in future iterations
export const materials: Material[] = []
export const machines: Machine[] = []
export const tools: Tool[] = []
export const spindles: Spindle[] = []