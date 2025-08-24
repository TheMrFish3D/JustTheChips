import { useMemo } from 'react'

import { validateInputs } from '../core/calculations/validation.js'
import { materials, machines, tools, spindles } from '../core/data/index.js'

import { useCalculatorStore } from './index.js'

export function useInputValidation() {
  const store = useCalculatorStore()
  
  const validation = useMemo(() => {
    const inputs = store.getInputs()
    
    // Skip validation if inputs are empty
    if (!inputs.machineId && !inputs.spindleId && !inputs.toolId && !inputs.materialId) {
      return {
        errors: [],
        warnings: [],
        isValid: true
      }
    }
    
    try {
      return validateInputs(inputs, materials, machines, tools, spindles)
    } catch (error) {
      console.error('Validation error:', error)
      return {
        errors: [],
        warnings: [],
        isValid: true
      }
    }
  }, [store])
  
  // Helper to get error for specific field
  const getFieldError = (fieldName: string) => {
    return validation.errors.find(error => error.field === fieldName)?.message
  }
  
  // Helper to get warnings for specific field
  const getFieldWarnings = (fieldName: string) => {
    return validation.warnings.filter(warning => 
      warning.type.includes(fieldName) || 
      (fieldName === 'user_doc_mm' && warning.type.includes('doc')) ||
      (fieldName === 'user_woc_mm' && warning.type.includes('woc')) ||
      (fieldName === 'aggressiveness' && warning.type.includes('aggressiveness')) ||
      (fieldName === 'override_flutes' && warning.type.includes('flutes'))
    )
  }
  
  return {
    validation,
    getFieldError,
    getFieldWarnings
  }
}