// Re-export all schemas and types for easy access
export {
  MaterialSchema,
  type Material,
  validateMaterial,
  safeParseMaterial
} from './material.js'

export {
  MachineSchema,
  type Machine,
  validateMachine,
  safeParseMachine
} from './machine.js'

export {
  ToolSchema,
  type Tool,
  validateTool,
  safeParseTool
} from './tool.js'

export {
  SpindleSchema,
  PowerCurvePointSchema,
  type Spindle,
  type PowerCurvePoint,
  validateSpindle,
  safeParseSpindle
} from './spindle.js'

export {
  InputsSchema,
  CutTypeSchema,
  type Inputs,
  type CutType,
  validateInputs,
  safeParseInputs
} from './inputs.js'

export {
  BundleSchema,
  SettingsSchema,
  LibrariesSchema,
  type Bundle,
  type Settings,
  type Libraries,
  validateBundle,
  validateSettings,
  validateLibraries,
  safeParseBundle,
  safeParseSettings,
  safeParseLibraries
} from './bundle.js'