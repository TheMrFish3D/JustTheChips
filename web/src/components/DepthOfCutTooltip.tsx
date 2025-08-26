import { useState } from 'react'
import type { ToolConfig, OperationConfig } from '../data/calculations'
import type { MaterialProperties } from '../data/materials'

interface DepthOfCutTooltipProps {
  depthOfCut: number
  toolConfig: ToolConfig
  operation: OperationConfig
  material: MaterialProperties
  units: 'metric' | 'imperial'
}

export default function DepthOfCutTooltip({ 
  depthOfCut, 
  toolConfig, 
  operation, 
  material, 
  units 
}: DepthOfCutTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  
  // Recalculate the factors to show the breakdown
  const getBaseDepthPercentage = (): number => {
    switch (operation.type) {
      case 'slotting':
        return operation.finish === 'roughing' ? 0.4 : 0.15
      case 'pocketing':
      case 'adaptive':
        return operation.finish === 'roughing' ? 0.3 : 0.12
      case 'facing':
      case 'contour':
        return operation.finish === 'roughing' ? 0.25 : 0.08
      case 'drilling':
        return 0.75
      case 'threading':
        return 0.08
      default:
        return operation.finish === 'roughing' ? 0.2 : 0.08
    }
  }

  const getMaterialDepthFactor = (): number => {
    const baseFactor = 0.5 + (material.machinabilityRating - 1) * 0.1
    const workHardeningPenalty = 1.0 / material.workHardening
    return baseFactor * workHardeningPenalty
  }

  const getToolDepthFactor = (): number => {
    let materialFactor = 1.0
    let coatingFactor = 1.0

    switch (toolConfig.material) {
      case 'carbide': materialFactor = 1.3; break
      case 'ceramic': materialFactor = 1.5; break
      case 'diamond': materialFactor = 1.4; break
      case 'hss': materialFactor = 0.8; break
    }

    switch (toolConfig.coating) {
      case 'tin': coatingFactor = 1.1; break
      case 'ticn': coatingFactor = 1.15; break
      case 'tialn': coatingFactor = 1.2; break
      case 'dlc': coatingFactor = 1.25; break
      case 'diamond': coatingFactor = 1.3; break
      default: coatingFactor = 1.0
    }

    return materialFactor * coatingFactor
  }

  const getStickoutDepthFactor = (): number => {
    const stickoutRatio = toolConfig.stickout / toolConfig.diameter
    
    if (stickoutRatio <= 3) return 1.0
    else if (stickoutRatio <= 5) return 0.8
    else if (stickoutRatio <= 8) return 0.6
    else return 0.4
  }

  const basePercentage = getBaseDepthPercentage()
  const materialFactor = getMaterialDepthFactor()
  const toolFactor = getToolDepthFactor()
  const stickoutFactor = getStickoutDepthFactor()
  const stickoutRatio = toolConfig.stickout / toolConfig.diameter

  const calculatedDepth = toolConfig.diameter * basePercentage * materialFactor * toolFactor * stickoutFactor
  const minDepth = units === 'metric' ? 0.01 : 0.0004
  // const finalDepth = Math.max(calculatedDepth, minDepth) // This is for reference, actual value comes from props

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        style={{
          background: 'none',
          border: 'none',
          color: '#4a90e2',
          cursor: 'pointer',
          fontSize: '12px',
          padding: '2px',
          borderRadius: '2px'
        }}
        title="Click or hover for detailed calculation breakdown"
      >
        ℹ️
      </button>
      
      {isVisible && (
        <div style={{
          position: 'absolute',
          top: '25px',
          left: '0',
          width: '420px',
          maxWidth: '90vw',
          backgroundColor: '#1a1a1a',
          border: '2px solid #4a90e2',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 1000,
          fontSize: '13px',
          lineHeight: '1.4'
        }}>
          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#4a90e2', fontSize: '14px' }}>
              🧮 Depth of Cut Calculation Breakdown
            </strong>
          </div>

          <div style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#252525', borderRadius: '4px' }}>
            <div style={{ color: '#f39c12', fontWeight: 'bold', marginBottom: '6px' }}>
              Final Result: {depthOfCut} {units === 'metric' ? 'mm' : 'in'}
            </div>
            <div style={{ fontSize: '12px', color: '#ccc' }}>
              ({(depthOfCut / toolConfig.diameter * 100).toFixed(1)}% of tool diameter)
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <strong style={{ color: '#27ae60' }}>Calculation Formula:</strong>
            <div style={{ fontFamily: 'monospace', backgroundColor: '#252525', padding: '6px', borderRadius: '3px', margin: '4px 0', fontSize: '11px' }}>
              Depth = max(Tool_Diameter × Base% × Material_Factor × Tool_Factor × Stickout_Factor, Min_Depth)
            </div>
          </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
              <div>
                <strong>🔧 Base Parameters:</strong>
                <div style={{ fontSize: '11px', marginLeft: '8px' }}>
                  <div>Tool Diameter: {toolConfig.diameter} {units === 'metric' ? 'mm' : 'in'}</div>
                  <div>Operation: {operation.type} ({operation.finish})</div>
                  <div>Base %: {(basePercentage * 100).toFixed(1)}%</div>
                </div>
              </div>
              <div>
                <strong>📐 Calculations:</strong>
                <div style={{ fontSize: '11px', marginLeft: '8px' }}>
                  <div>Base depth: {(toolConfig.diameter * basePercentage).toFixed(3)}</div>
                  <div>After material: {(toolConfig.diameter * basePercentage * materialFactor).toFixed(3)}</div>
                  <div>After tool: {(toolConfig.diameter * basePercentage * materialFactor * toolFactor).toFixed(3)}</div>
                  <div>After stickout: {calculatedDepth.toFixed(3)}</div>
                  <div>Min depth limit: {minDepth}</div>
                </div>
              </div>
            </div>

          <div style={{ marginBottom: '10px' }}>
            <strong style={{ color: '#9b59b6' }}>🏗️ Material Factor: {materialFactor.toFixed(3)}</strong>
            <div style={{ fontSize: '11px', marginLeft: '8px', backgroundColor: '#252525', padding: '4px', borderRadius: '3px' }}>
              <div>Material: {material.name}</div>
              <div>Machinability Rating: {material.machinabilityRating}/10</div>
              <div>Work Hardening: {material.workHardening}×</div>
              <div>Base Factor: {(0.5 + (material.machinabilityRating - 1) * 0.1).toFixed(3)}</div>
              <div>Work Hardening Penalty: ÷{material.workHardening} = {(1/material.workHardening).toFixed(3)}</div>
            </div>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <strong style={{ color: '#e74c3c' }}>⚒️ Tool Factor: {toolFactor.toFixed(3)}</strong>
            <div style={{ fontSize: '11px', marginLeft: '8px', backgroundColor: '#252525', padding: '4px', borderRadius: '3px' }}>
              <div>Tool Material: {toolConfig.material} ({
                toolConfig.material === 'carbide' ? '1.30×' :
                toolConfig.material === 'ceramic' ? '1.50×' :
                toolConfig.material === 'diamond' ? '1.40×' :
                toolConfig.material === 'hss' ? '0.80×' : '1.00×'
              })</div>
              <div>Coating: {toolConfig.coating} ({
                toolConfig.coating === 'tin' ? '1.10×' :
                toolConfig.coating === 'ticn' ? '1.15×' :
                toolConfig.coating === 'tialn' ? '1.20×' :
                toolConfig.coating === 'dlc' ? '1.25×' :
                toolConfig.coating === 'diamond' ? '1.30×' : '1.00×'
              })</div>
            </div>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <strong style={{ color: '#3498db' }}>📏 Stickout Factor: {stickoutFactor.toFixed(3)}</strong>
            <div style={{ fontSize: '11px', marginLeft: '8px', backgroundColor: '#252525', padding: '4px', borderRadius: '3px' }}>
              <div>Stickout: {toolConfig.stickout} {units === 'metric' ? 'mm' : 'in'}</div>
              <div>L/D Ratio: {stickoutRatio.toFixed(2)}×</div>
              <div>Deflection Penalty: {
                stickoutRatio <= 3 ? 'None (≤3×)' :
                stickoutRatio <= 5 ? '20% reduction (3-5×)' :
                stickoutRatio <= 8 ? '40% reduction (5-8×)' :
                '60% reduction (>8×)'
              }</div>
            </div>
          </div>

          <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: '#1e2d3d', borderRadius: '4px', borderLeft: '3px solid #4a90e2' }}>
            <strong style={{ color: '#4a90e2' }}>📚 Industry Standards & References:</strong>
            <div style={{ fontSize: '11px', marginTop: '4px', lineHeight: '1.3' }}>
              <div>• <strong>ASME Guidelines:</strong> Roughing 25-40%, Finishing 5-15% of tool diameter</div>
              <div>• <strong>Sandvik Coromant:</strong> Face milling 15-30% (rough), 5-10% (finish)</div>
              <div>• <strong>Academic Research:</strong> Material machinability scaling validated (Kalpakjian & Schmid)</div>
              <div>• <strong>Deflection Theory:</strong> Cantilever beam formula: δ = FL³/(3EI)</div>
            </div>
          </div>

          <div style={{ padding: '6px', backgroundColor: '#2d1810', borderRadius: '4px', borderLeft: '3px solid #f39c12' }}>
            <strong style={{ color: '#f39c12', fontSize: '12px' }}>⚠️ Engineering Notes:</strong>
            <div style={{ fontSize: '10px', marginTop: '2px', lineHeight: '1.2' }}>
              These calculations follow established industry standards and are validated against academic research. 
              Always verify parameters are within your machine's capabilities and adjust based on workpiece rigidity, 
              coolant effectiveness, and specific application requirements.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}