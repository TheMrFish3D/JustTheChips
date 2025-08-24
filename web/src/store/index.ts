import { create } from 'zustand'

interface InputsState {
  machineId?: string
  spindleId?: string
  toolId?: string
  materialId?: string
  cutType?: string
  aggressiveness?: number
  set<K extends keyof InputsState>(key: K, value: InputsState[K]): void
}

export const useInputsStore = create<InputsState>((set) => ({
  set: (key, value) => set((prev) => ({ ...prev, [key]: value })),
}))
