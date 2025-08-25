import { useState } from 'react'

import { 
  suggestToolsForTargetDeflection, 
  optimizeToolConfiguration,
  type DeflectionOptimizationResult,
  type ToolDeflectionSuggestion
} from '../../core/calculations/deflection.js'
import type { Tool } from '../../core/data/schemas/index.js'
import { useCalculatorStore } from '../../store/index.js'

interface DeflectionOptimizationSectionProps {
  currentTool?: Tool
  currentForce?: number
  currentRPM?: number
  currentFlutes?: number
}

function SuggestionCard({ 
  suggestion, 
  onApply 
}: { 
  suggestion: ToolDeflectionSuggestion
  onApply: (diameter: number, stickout: number) => void
}) {
  const isGoodMatch = suggestion.isWithinTolerance
  const errorLevel = suggestion.relativeError > 25 ? 'high' : suggestion.relativeError > 10 ? 'medium' : 'low'
  
  return (
    <div style={{ 
      border: `1px solid ${isGoodMatch ? '#4CAF50' : '#ddd'}`, 
      borderRadius: '6px', 
      padding: '12px',
      backgroundColor: isGoodMatch ? '#f1f8e9' : '#f9f9f9',
      marginBottom: '8px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            ⌀{suggestion.diameterMm}mm × {suggestion.stickoutMm}mm stickout
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Predicted deflection: {suggestion.predictedDeflectionMm.toFixed(3)}mm
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: errorLevel === 'low' ? '#4CAF50' : errorLevel === 'medium' ? '#ff9800' : '#f44336' 
          }}>
            Error: {suggestion.relativeError.toFixed(1)}% 
            {isGoodMatch && ' ✓'}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Rigidity: {suggestion.rigidityScore.toLocaleString()} N/mm
          </div>
        </div>
        <button
          onClick={() => onApply(suggestion.diameterMm, suggestion.stickoutMm)}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            border: '1px solid #2196F3',
            borderRadius: '4px',
            backgroundColor: '#2196F3',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Apply
        </button>
      </div>
    </div>
  )
}

export function DeflectionOptimizationSection({ 
  currentTool, 
  currentForce = 300, 
  currentRPM = 12000, 
  currentFlutes = 3 
}: DeflectionOptimizationSectionProps) {
  const [targetDeflection, setTargetDeflection] = useState(0.02) // Default 0.02mm target
  const [searchMode, setSearchMode] = useState<'global' | 'optimize'>('global')
  const [optimizationResult, setOptimizationResult] = useState<DeflectionOptimizationResult | null>(null)
  const [isOptimizing, setIsOptimizing] = useState(false)
  
  const store = useCalculatorStore()

  const handleOptimize = () => {
    if (!currentTool && searchMode === 'optimize') {
      return
    }
    
    setIsOptimizing(true)
    
    try {
      let result: DeflectionOptimizationResult
      
      if (searchMode === 'optimize' && currentTool) {
        // Optimize current tool configuration
        result = optimizeToolConfiguration(
          currentTool,
          targetDeflection,
          currentForce,
          currentRPM,
          currentFlutes
        )
      } else {
        // Global search for optimal configurations
        result = suggestToolsForTargetDeflection({
          targetDeflectionMm: targetDeflection,
          forceN: currentForce,
          rpm: currentRPM,
          effectiveFlutes: currentFlutes,
          maxSuggestions: 5
        })
      }
      
      setOptimizationResult(result)
    } catch (error) {
      console.error('Optimization error:', error)
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleApplySuggestion = (diameter: number, stickout: number) => {
    // Apply the suggested configuration
    // Note: Currently only stickout can be overridden, diameter would require changing tool selection
    
    if (Math.abs(diameter - (currentTool?.diameter_mm || 0)) < 0.1) {
      // Same diameter - just update stickout
      store.setInput('override_stickout_mm', stickout)
      alert(`Applied: ${stickout}mm stickout`)
    } else {
      // Different diameter - show suggestion for manual tool change
      const confirmation = confirm(
        `To achieve optimal deflection:\n\n` +
        `• Change to ⌀${diameter}mm tool\n` +
        `• Set stickout to ${stickout}mm\n\n` +
        `I can only set the stickout automatically. ` +
        `You'll need to manually select a ${diameter}mm tool.\n\n` +
        `Apply stickout setting now?`
      )
      
      if (confirmation) {
        store.setInput('override_stickout_mm', stickout)
        alert(`Stickout set to ${stickout}mm. Please also select a ⌀${diameter}mm tool for optimal results.`)
      }
    }
  }

  const getDeflectionWarningLevel = (deflection: number) => {
    if (deflection > 0.05) return { level: 'danger', color: '#f44336', text: 'Dangerous' }
    if (deflection > 0.02) return { level: 'warning', color: '#ff9800', text: 'High' }
    return { level: 'safe', color: '#4CAF50', text: 'Acceptable' }
  }

  const warningLevel = getDeflectionWarningLevel(targetDeflection)

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      padding: '16px', 
      marginTop: '16px',
      backgroundColor: '#fff'
    }}>
      <h3 style={{ marginTop: '0', marginBottom: '16px', color: '#333' }}>
        🎯 Deflection Optimization
      </h3>
      
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Target Deflection (mm):
        </label>
        <input
          type="number"
          step="0.001"
          min="0.001"
          max="0.1"
          value={targetDeflection}
          onChange={(e) => setTargetDeflection(parseFloat(e.target.value) || 0.02)}
          style={{
            padding: '6px 8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            width: '120px',
            marginRight: '8px'
          }}
        />
        <span style={{ 
          fontSize: '12px', 
          color: warningLevel.color,
          fontWeight: 'bold' 
        }}>
          {warningLevel.text} deflection level
        </span>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Search Mode:
        </label>
        <div>
          <label style={{ marginRight: '16px', fontSize: '14px' }}>
            <input
              type="radio"
              value="global"
              checked={searchMode === 'global'}
              onChange={(e) => setSearchMode(e.target.value as 'global' | 'optimize')}
              style={{ marginRight: '4px' }}
            />
            Global search (all diameters)
          </label>
          <label style={{ fontSize: '14px' }}>
            <input
              type="radio"
              value="optimize"
              checked={searchMode === 'optimize'}
              onChange={(e) => setSearchMode(e.target.value as 'global' | 'optimize')}
              style={{ marginRight: '4px' }}
              disabled={!currentTool}
            />
            Optimize current tool
          </label>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={handleOptimize}
          disabled={isOptimizing || (searchMode === 'optimize' && !currentTool)}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            border: '1px solid #4CAF50',
            borderRadius: '4px',
            backgroundColor: isOptimizing ? '#ccc' : '#4CAF50',
            color: 'white',
            cursor: isOptimizing ? 'not-allowed' : 'pointer'
          }}
        >
          {isOptimizing ? 'Optimizing...' : 'Find Optimal Configuration'}
        </button>
      </div>

      {optimizationResult && (
        <div>
          <h4 style={{ marginBottom: '12px', color: '#333' }}>
            Suggested Configurations:
          </h4>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
            Target: {optimizationResult.targetDeflectionMm.toFixed(3)}mm deflection
            {searchMode === 'optimize' && (
              <span> • Searched near current tool configuration</span>
            )}
            {searchMode === 'global' && (
              <span> • Searched {optimizationResult.searchRanges.diameterMm[0]}-{optimizationResult.searchRanges.diameterMm[1]}mm diameter, {optimizationResult.searchRanges.stickoutMm[0]}-{optimizationResult.searchRanges.stickoutMm[1]}mm stickout</span>
            )}
          </div>
          
          {optimizationResult.suggestions.length === 0 ? (
            <div style={{ padding: '12px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '4px' }}>
              No suitable configurations found. Try adjusting the target deflection or force parameters.
            </div>
          ) : (
            <div>
              {optimizationResult.suggestions.map((suggestion, index) => (
                <SuggestionCard
                  key={index}
                  suggestion={suggestion}
                  onApply={handleApplySuggestion}
                />
              ))}
            </div>
          )}
          
          <div style={{ fontSize: '11px', color: '#999', marginTop: '8px' }}>
            Evaluated {optimizationResult.totalEvaluations} configurations
          </div>
        </div>
      )}
    </div>
  )
}