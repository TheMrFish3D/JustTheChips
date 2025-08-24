import { useEffect, useRef } from 'react'

import { safeParseInputs } from '../core/data/schemas/inputs.js'
import { calculate } from '../core/index.js'

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
  
  const performCalculation = (inputs: ReturnType<typeof store.getInputs>) => {
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
      
      store.setCalculating(true)
      store.setError(undefined)
      
      // Perform the calculation
      // Note: calculate() is currently a placeholder that throws an error
      // For now, we'll catch this and show a message indicating it's not implemented
      try {
        const results = calculate()
        store.setResults(results)
      } catch (error) {
        // Expected error since calculate() is not implemented yet
        if (error instanceof Error && error.message.includes('not yet implemented')) {
          store.setError('Calculation engine not yet implemented - coming in future iterations')
        } else {
          throw error // Re-throw unexpected errors
        }
      }
      
    } catch (error) {
      console.error('Calculation error:', error)
      store.setError(error instanceof Error ? error.message : 'Unknown calculation error')
    } finally {
      store.setCalculating(false)
    }
  }
  
  useEffect(() => {
    // Get current inputs and serialize them to detect changes
    const currentInputs = store.getInputs()
    const currentInputsStr = JSON.stringify(currentInputs)
    
    // Only proceed if inputs have changed
    if (prevInputsRef.current === currentInputsStr) {
      return
    }
    
    prevInputsRef.current = currentInputsStr
    
    // Clear any existing debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    
    // Clear results while we wait for new calculation
    store.clearResults()
    
    // Set up debounced calculation
    debounceRef.current = setTimeout(() => {
      performCalculation(currentInputs)
    }, calculationDebounceMs)
    
    // Cleanup function
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    store.machineId,
    store.spindleId, 
    store.toolId,
    store.materialId,
    store.cutType,
    store.aggressiveness,
    store.user_doc_mm,
    store.user_woc_mm,
    store.override_flutes,
    store.override_stickout_mm
  ])
  
  return {
    isCalculating: store.isCalculating,
    results: store.results,
    error: store.error,
    lastCalculationTime: store.lastCalculationTime
  }
}