import { useEffect, useRef } from 'react'

import { safeParseInputs } from '../core/data/schemas/inputs.js'
import { calculateWithToolConfig } from '../core/index.js'
import { validateToolConfiguration } from '../core/utils/toolConfiguration.js'

import { useCalculatorStore } from './index.js'

// Debounce delay in milliseconds
const calculationDebounceMs = 300

/**
 * Custom hook that handles debounced calculations when inputs change
 */
export function useCalculation() {
  const store = useCalculatorStore()
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined)
  
  // Track previous inputs to detect changes
  const prevInputsRef = useRef<string | undefined>(undefined)
  
  const performCalculation = (
    inputs: ReturnType<typeof store.getInputs>,
    toolConfig: ReturnType<typeof store.getToolConfig>
  ) => {
    try {
      // Validate inputs first
      const parseResult = safeParseInputs(inputs)
      
      if (!parseResult.success) {
        // Don't show validation errors as calculation errors - these are expected
        // when user is still filling out the form
        return
      }
      
      // Check if we have the minimum required inputs
      const validatedInputs = parseResult.data
      if (!validatedInputs.machineId || !validatedInputs.spindleId || 
          !validatedInputs.toolId || !validatedInputs.materialId || 
          !validatedInputs.cutType) {
        // Missing required fields - don't calculate yet
        return
      }
      
      // Validate tool configuration
      const toolValidation = validateToolConfiguration(toolConfig)
      if (!toolValidation.isValid) {
        // Missing tool configuration - don't calculate yet
        return
      }
      
      store.setCalculating(true)
      store.setError(undefined)
      
      // Perform the calculation using configurable tool parameters
      const results = calculateWithToolConfig(validatedInputs, toolConfig)
      store.setResults(results)
      
    } catch (error) {
      console.error('Calculation error:', error)
      store.setError(error instanceof Error ? error.message : 'Unknown calculation error')
    } finally {
      store.setCalculating(false)
    }
  }
  
  useEffect(() => {
    // Get current inputs and tool config, serialize them to detect changes
    const currentInputs = store.getInputs()
    const currentToolConfig = store.getToolConfig()
    const currentStateStr = JSON.stringify({ inputs: currentInputs, toolConfig: currentToolConfig })
    
    // Only proceed if state has changed
    if (prevInputsRef.current === currentStateStr) {
      return
    }
    
    prevInputsRef.current = currentStateStr
    
    // Clear any existing debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    
    // Clear results while we wait for new calculation
    store.clearResults()
    
    // Set up debounced calculation
    debounceRef.current = setTimeout(() => {
      performCalculation(currentInputs, currentToolConfig)
    }, calculationDebounceMs)
    
    // Cleanup function
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // Input dependencies
    store.machineId,
    store.spindleId, 
    store.toolId,
    store.materialId,
    store.cutType,
    store.aggressiveness,
    store.user_doc_mm,
    store.user_woc_mm,
    store.override_flutes,
    store.override_stickout_mm,
    // Tool configuration dependencies
    store.toolType,
    store.toolDiameter,
    store.toolFlutes,
    store.toolStickout,
    store.toolMaterial,
    store.toolCoating,
    store.vbitAngle,
    store.bodyDiameter,
    store.defaultDoc,
    store.defaultWoc
  ])
  
  return {
    isCalculating: store.isCalculating,
    results: store.results,
    error: store.error,
    lastCalculationTime: store.lastCalculationTime
  }
}