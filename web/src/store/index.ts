import { create } from 'zustand'

import type { CalculationOutput } from '../core/calculations/output.js'
import type { Inputs, CutType } from '../core/data/schemas/inputs.js'
import type { Tool } from '../core/data/schemas/tool.js'
import type { ToolConfiguration } from '../core/utils/toolConfiguration.js'

// Tool configuration interface for configurable tool parameters
// Moved to separate file
// import type { ToolConfiguration } from '../core/utils/toolConfiguration.js'

// Input state interface that matches the schema
interface InputsState {
  machineId?: string
  spindleId?: string
  toolId?: string
  materialId?: string
  cutType?: CutType
  aggressiveness?: number
  user_doc_mm?: number
  user_woc_mm?: number
  override_flutes?: number
  override_stickout_mm?: number
}

// Results state interface
interface ResultsState {
  results?: CalculationOutput
  isCalculating: boolean
  error?: string
  lastCalculationTime?: number
}

// Combined store interface
interface CalculatorStore extends InputsState, ResultsState, ToolConfiguration {
  // Input setters
  setInput<K extends keyof InputsState>(key: K, value: InputsState[K]): void
  setInputs(inputs: Partial<InputsState>): void
  
  // Tool configuration setters
  setToolConfig<K extends keyof ToolConfiguration>(key: K, value: ToolConfiguration[K]): void
  setToolConfigFromPreset(tool: Tool): void
  getToolConfig(): ToolConfiguration
  
  // Results setters
  setResults(results: CalculationOutput): void
  setCalculating(isCalculating: boolean): void
  setError(error?: string): void
  
  // Helper methods
  getInputs(): Partial<Inputs>
  clearResults(): void
}

export const useCalculatorStore = create<CalculatorStore>((set, get) => ({
  // Initial state
  aggressiveness: 1.0,
  isCalculating: false,
  
  // Default tool configuration (6mm carbide endmill)
  toolType: 'endmill_flat',
  toolDiameter: 6.0,
  toolFlutes: 2,
  toolLength: 50.0,
  toolStickout: 25.0,
  toolMaterial: 'carbide',
  toolCoating: 'TiAlN',
  defaultDoc: 3.0,
  defaultWoc: 1.8,
  
  // Input setters
  setInput: (key, value) => set((state) => ({ ...state, [key]: value })),
  setInputs: (inputs) => set((state) => ({ ...state, ...inputs })),
  
  // Tool configuration setters
  setToolConfig: (key, value) => set((state) => ({ ...state, [key]: value })),
  setToolConfigFromPreset: (tool) => set((state) => ({
    ...state,
    toolType: tool.type,
    toolDiameter: tool.diameter_mm,
    toolFlutes: tool.flutes,
    toolStickout: tool.stickout_mm,
    toolMaterial: tool.material,
    toolCoating: tool.coating,
    defaultDoc: tool.default_doc_mm,
    defaultWoc: tool.default_woc_mm,
    vbitAngle: tool.metadata?.angle_deg,
    bodyDiameter: tool.metadata?.body_diameter_mm,
    // Set reasonable defaults for missing length
    toolLength: tool.stickout_mm * 2
  })),
  getToolConfig: () => {
    const state = get()
    return {
      toolType: state.toolType,
      toolDiameter: state.toolDiameter,
      toolFlutes: state.toolFlutes,
      toolLength: state.toolLength,
      toolStickout: state.toolStickout,
      toolMaterial: state.toolMaterial,
      toolCoating: state.toolCoating,
      vbitAngle: state.vbitAngle,
      bodyDiameter: state.bodyDiameter,
      defaultDoc: state.defaultDoc,
      defaultWoc: state.defaultWoc
    }
  },
  
  // Results setters
  setResults: (results) => set({ 
    results, 
    isCalculating: false, 
    error: undefined,
    lastCalculationTime: Date.now()
  }),
  setCalculating: (isCalculating) => set({ isCalculating }),
  setError: (error) => set({ error, isCalculating: false }),
  
  // Helper methods
  getInputs: () => {
    const state = get()
    return {
      machineId: state.machineId,
      spindleId: state.spindleId,
      toolId: state.toolId,
      materialId: state.materialId,
      cutType: state.cutType,
      aggressiveness: state.aggressiveness,
      user_doc_mm: state.user_doc_mm,
      user_woc_mm: state.user_woc_mm,
      override_flutes: state.override_flutes,
      override_stickout_mm: state.override_stickout_mm
    }
  },
  clearResults: () => set({ 
    results: undefined, 
    error: undefined, 
    isCalculating: false 
  })
}))

// Export for backward compatibility  
export const useInputsStore = useCalculatorStore
