import { create } from 'zustand'

import type { CalculationOutput } from '../core/calculations/output.js'
import type { Inputs, CutType } from '../core/data/schemas/inputs.js'

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
interface CalculatorStore extends InputsState, ResultsState {
  // Input setters
  setInput<K extends keyof InputsState>(key: K, value: InputsState[K]): void
  setInputs(inputs: Partial<InputsState>): void
  
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
  
  // Input setters
  setInput: (key, value) => set((state) => ({ ...state, [key]: value })),
  setInputs: (inputs) => set((state) => ({ ...state, ...inputs })),
  
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
