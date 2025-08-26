// Shared application context for managing configuration state
import { createContext, useContext, useState, type ReactNode } from 'react'
import type { MachineConfig, ToolConfig, OperationConfig } from '../data/calculations'

interface AppState {
  machineConfig: MachineConfig
  toolConfig: ToolConfig
  selectedMaterials: string[]
  selectedOperations: OperationConfig[]
  units: 'metric' | 'imperial'
}

interface AppContextType {
  state: AppState
  updateMachineConfig: (config: Partial<MachineConfig>) => void
  updateToolConfig: (config: Partial<ToolConfig>) => void
  setSelectedMaterials: (materials: string[]) => void
  setSelectedOperations: (operations: OperationConfig[]) => void
  setUnits: (units: 'metric' | 'imperial') => void
}

const defaultState: AppState = {
  machineConfig: {
    spindle: {
      power: 2.2,
      frequency: 400,
      maxRpm: 24000
    },
    motors: {
      xTorque: 1.26,
      xCount: 1,
      yTorque: 1.26,
      yCount: 1,
      zTorque: 1.26,
      zCount: 1
    },
    coolant: 'mist'
  },
  toolConfig: {
    type: 'flat-endmill',
    diameter: 6,
    flutes: 2,
    stickout: 15,
    material: 'carbide',
    coating: 'tin'
  },
  selectedMaterials: ['aluminum-6061'],
  selectedOperations: [
    { type: 'slotting', finish: 'roughing' }
  ],
  units: 'metric'
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState)

  const updateMachineConfig = (config: Partial<MachineConfig>) => {
    setState(prev => ({
      ...prev,
      machineConfig: {
        ...prev.machineConfig,
        ...config,
        spindle: { ...prev.machineConfig.spindle, ...config.spindle },
        motors: { ...prev.machineConfig.motors, ...config.motors }
      }
    }))
  }

  const updateToolConfig = (config: Partial<ToolConfig>) => {
    setState(prev => ({
      ...prev,
      toolConfig: { ...prev.toolConfig, ...config }
    }))
  }

  const setSelectedMaterials = (materials: string[]) => {
    setState(prev => ({ ...prev, selectedMaterials: materials }))
  }

  const setSelectedOperations = (operations: OperationConfig[]) => {
    setState(prev => ({ ...prev, selectedOperations: operations }))
  }

  const setUnits = (units: 'metric' | 'imperial') => {
    setState(prev => ({ ...prev, units }))
  }

  return (
    <AppContext.Provider value={{
      state,
      updateMachineConfig,
      updateToolConfig,
      setSelectedMaterials,
      setSelectedOperations,
      setUnits
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}