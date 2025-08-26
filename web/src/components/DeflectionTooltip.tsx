import { useState } from 'react'
import type { ToolConfig } from '../data/calculations'
import type { MaterialProperties } from '../data/materials'

interface DeflectionTooltipProps {
  deflectionAnalysis: {
    lateralDeflection: number
    torsionalDeflection: number
    staticDeflection: number
    totalDeflection: number
    dynamicFactor: number
    naturalFrequency: number
    effectiveDiameter: number
    limitingFactor: string
  }
  maxDepthAnalysis: {
    powerLimit: number
    deflectionLimit: number
    strengthLimit: number
    stabilityLimit: number
    rigidityLimit: number
    overallLimit: number
    limitingFactor: string
  }
  toolConfig: ToolConfig
  material: MaterialProperties
  units: 'metric' | 'imperial'
  cuttingForce: number
}

export default function DeflectionTooltip({
  deflectionAnalysis,
  maxDepthAnalysis,
  toolConfig,
  material,
  units,
  cuttingForce
}: DeflectionTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const lengthUnit = units === 'metric' ? 'mm' : 'in'
  const forceUnit = units === 'metric' ? 'N' : 'lbf'
  const stiffnessUnit = units === 'metric' ? 'N/mm²' : 'psi'
  
  // Tool material properties for display
  const getToolMaterialName = (material: string) => {
    const names = {
      hss: 'High Speed Steel (HSS)',
      carbide: 'Tungsten Carbide',
      ceramic: 'Ceramic',
      diamond: 'Diamond/PCD'
    }
    return names[material as keyof typeof names] || material.toUpperCase()
  }

  const getToolMaterialStiffness = (material: string) => {
    const stiffness = {
      hss: units === 'metric' ? '215,000' : '31,200,000',
      carbide: units === 'metric' ? '640,000' : '92,800,000',
      ceramic: units === 'metric' ? '400,000' : '58,000,000',
      diamond: units === 'metric' ? '1,100,000' : '159,500,000'
    }
    return stiffness[material as keyof typeof stiffness] || 'Unknown'
  }

  const getFluteMaterialRemoval = (flutes: number) => {
    const removal = {
      1: '35%', 2: '27.5%', 3: '22.5%', 4: '17.5%', 5: '15%', 6: '12.5%'
    }
    return removal[flutes as keyof typeof removal] || '20%'
  }

  const getLimitingFactorExplanation = (factor: string) => {
    const explanations = {
      power: 'Spindle power cannot provide sufficient energy for deeper cuts',
      deflection: 'Tool would deflect beyond acceptable tolerance limits',
      strength: 'Tool would exceed safe stress limits and risk breakage',
      stability: 'Deeper cuts would cause chatter and vibration problems',
      rigidity: 'Machine structure limits deeper cuts for accuracy'
    }
    return explanations[factor as keyof typeof explanations] || 'Multiple factors limit depth'
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: '#4a90e2',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '18px',
          height: '18px',
          fontSize: '12px',
          cursor: 'pointer',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="Click for comprehensive deflection analysis"
      >
        ℹ️
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '25px',
            left: '0',
            background: '#1a1a1a',
            border: '2px solid #4a90e2',
            borderRadius: '8px',
            padding: '20px',
            width: '600px',
            maxHeight: '500px',
            overflowY: 'auto',
            zIndex: 1000,
            fontSize: '13px',
            lineHeight: '1.4',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            color: '#ffffff'
          }}
        >
          <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#4a90e2', fontSize: '16px' }}>
              🔧 Comprehensive Tool Deflection Analysis
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                color: '#ccc',
                border: '1px solid #666',
                borderRadius: '4px',
                padding: '2px 6px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ✕
            </button>
          </div>

          {/* Deflection Summary */}
          <div style={{ background: '#252525', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#f39c12' }}>📊 Deflection Summary</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div><strong>Total Deflection:</strong> <span style={{ color: deflectionAnalysis.totalDeflection > 0.02 ? '#e74c3c' : '#27ae60' }}>{deflectionAnalysis.totalDeflection} {lengthUnit}</span></div>
              <div><strong>Dynamic Factor:</strong> <span style={{ color: deflectionAnalysis.dynamicFactor > 2 ? '#e74c3c' : '#27ae60' }}>{deflectionAnalysis.dynamicFactor}x</span></div>
              <div><strong>Lateral Deflection:</strong> {deflectionAnalysis.lateralDeflection} {lengthUnit}</div>
              <div><strong>Torsional Deflection:</strong> {deflectionAnalysis.torsionalDeflection} {lengthUnit}</div>
            </div>
          </div>

          {/* Calculation Breakdown */}
          <div style={{ background: '#252525', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#9b59b6' }}>📐 Calculation Breakdown</h4>
            
            <div style={{ marginBottom: '10px' }}>
              <strong>1. Lateral Deflection (Cantilever Beam):</strong>
              <div style={{ marginLeft: '15px', fontFamily: 'monospace', background: '#1e1e1e', padding: '8px', borderRadius: '4px', marginTop: '4px' }}>
                δ_lateral = (F × L³) / (3 × E × I)<br/>
                δ_lateral = ({cuttingForce} {forceUnit} × {toolConfig.stickout}³ {lengthUnit}) / (3 × {getToolMaterialStiffness(toolConfig.material)} {stiffnessUnit} × π×d⁴/64)<br/>
                δ_lateral = <strong>{deflectionAnalysis.lateralDeflection} {lengthUnit}</strong>
              </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <strong>2. Effective Tool Diameter:</strong>
              <div style={{ marginLeft: '15px' }}>
                Core diameter considering {getFluteMaterialRemoval(toolConfig.flutes)} flute material removal<br/>
                D_effective = {toolConfig.diameter} × core_ratio = <strong>{deflectionAnalysis.effectiveDiameter} {lengthUnit}</strong>
              </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <strong>3. Natural Frequency:</strong>
              <div style={{ marginLeft: '15px', fontFamily: 'monospace', background: '#1e1e1e', padding: '8px', borderRadius: '4px', marginTop: '4px' }}>
                f_n = (λ₁² / 2π) × √(EI / ρAL⁴)<br/>
                f_n = <strong>{deflectionAnalysis.naturalFrequency} Hz</strong>
              </div>
            </div>

            <div>
              <strong>4. Dynamic Amplification:</strong>
              <div style={{ marginLeft: '15px' }}>
                {deflectionAnalysis.dynamicFactor > 1.5 ? 
                  `High dynamic amplification (${deflectionAnalysis.dynamicFactor}x) - consider speed adjustment` :
                  `Acceptable dynamic response (${deflectionAnalysis.dynamicFactor}x)`
                }
              </div>
            </div>
          </div>

          {/* Maximum Depth Analysis */}
          <div style={{ background: '#252525', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#e74c3c' }}>⚠️ Maximum Depth of Cut Analysis</h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
              <div><strong>Power Limited:</strong> {maxDepthAnalysis.powerLimit} {lengthUnit}</div>
              <div><strong>Deflection Limited:</strong> {maxDepthAnalysis.deflectionLimit} {lengthUnit}</div>
              <div><strong>Strength Limited:</strong> {maxDepthAnalysis.strengthLimit} {lengthUnit}</div>
              <div><strong>Stability Limited:</strong> {maxDepthAnalysis.stabilityLimit} {lengthUnit}</div>
            </div>
            
            <div style={{ 
              background: maxDepthAnalysis.limitingFactor === 'deflection' ? '#4a3800' : '#1e1e1e', 
              padding: '8px', 
              borderRadius: '4px',
              border: '1px solid #666'
            }}>
              <strong>Most Restrictive Limit:</strong> {maxDepthAnalysis.overallLimit} {lengthUnit}<br/>
              <strong>Limiting Factor:</strong> {maxDepthAnalysis.limitingFactor.charAt(0).toUpperCase() + maxDepthAnalysis.limitingFactor.slice(1)}<br/>
              <em>{getLimitingFactorExplanation(maxDepthAnalysis.limitingFactor)}</em>
            </div>
          </div>

          {/* Tool & Material Properties */}
          <div style={{ background: '#252525', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#3498db' }}>🔧 Tool & Material Properties</h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div><strong>Tool Material:</strong> {getToolMaterialName(toolConfig.material)}</div>
              <div><strong>Workpiece:</strong> {material.name}</div>
              <div><strong>Elastic Modulus:</strong> {getToolMaterialStiffness(toolConfig.material)} {stiffnessUnit}</div>
              <div><strong>Machinability:</strong> {material.machinabilityRating}/10</div>
              <div><strong>L/D Ratio:</strong> {Math.round((toolConfig.stickout / toolConfig.diameter) * 10) / 10}</div>
              <div><strong>Flute Count:</strong> {toolConfig.flutes} flutes</div>
            </div>
          </div>

          {/* Engineering References */}
          <div style={{ background: '#252525', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#27ae60' }}>📚 Engineering References</h4>
            
            <div style={{ fontSize: '11px', lineHeight: '1.3' }}>
              <div><strong>Beam Deflection Theory:</strong> Timoshenko & Gere, "Mechanics of Materials"</div>
              <div><strong>Tool Dynamics:</strong> Altintas, "Manufacturing Automation" (2012)</div>
              <div><strong>Cutting Forces:</strong> Kalpakjian & Schmid, "Manufacturing Engineering" (2014)</div>
              <div><strong>Material Properties:</strong> ASM Handbook Vol. 2, Tool Material Standards</div>
              <div><strong>Stability Analysis:</strong> Budak & Altintas, Journal of Dynamic Systems (1998)</div>
              <div><strong>Industry Standards:</strong> ISO 2768-1:1989 General Tolerances</div>
            </div>
          </div>

          {/* Professional Notes */}
          <div style={{ background: '#4a3800', padding: '12px', borderRadius: '6px', border: '1px solid #f39c12' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#f39c12' }}>⚠️ Professional Engineering Notes</h4>
            <div style={{ fontSize: '11px', lineHeight: '1.3' }}>
              <div>• Deflection calculations based on cantilever beam mechanics with dynamic amplification</div>
              <div>• Actual machine compliance may further increase total system deflection</div>
              <div>• Consider workpiece clamping rigidity and setup dynamics</div>
              <div>• Validate calculations with test cuts for critical applications</div>
              <div>• Temperature effects and tool wear will modify deflection over time</div>
              <div>• Always verify parameters are within machine and safety capabilities</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}