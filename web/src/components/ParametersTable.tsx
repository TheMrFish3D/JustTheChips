import React, { useState } from 'react'
import { useAppContext } from '../hooks/useAppContext'
import { calculateParameters, type CalculationResult, type OperationConfig } from '../data/calculations'
import { getMaterialById } from '../data/materials'
import DepthOfCutTooltip from './DepthOfCutTooltip'
import DeflectionTooltip from './DeflectionTooltip'

export default function ParametersTable() {
  const { state, toggleParameterLock } = useAppContext()
  const { machineConfig, toolConfig, selectedMaterials, selectedOperations, units, lockedParameters } = state
  const [calculations, setCalculations] = useState<CalculationResult[]>([])
  const [showCalculations, setShowCalculations] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  const getOperationConfig = (calc: CalculationResult) => {
    // Determine if this is a finishing operation based on the calculated values
    // Finishing operations typically have smaller depth of cut relative to tool diameter
    const depthRatio = calc.depthOfCut / toolConfig.diameter
    const isFinishing = depthRatio < 0.2 // Less than 20% of diameter suggests finishing
    
    return {
      type: calc.operation as OperationConfig['type'],
      finish: isFinishing ? 'finishing' as const : 'roughing' as const
    }
  }

  const getMaterialForCalculation = (calc: CalculationResult) => {
    const materialId = selectedMaterials.find(id => {
      const material = getMaterialById(id)
      return material?.name === calc.material
    })
    return getMaterialById(materialId || selectedMaterials[0])!
  }

  const calculate = () => {
    const results = calculateParameters(
      machineConfig,
      toolConfig,
      selectedMaterials,
      selectedOperations,
      units
    )
    setCalculations(results)
    setShowCalculations(true)
  }

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedRows(newExpanded)
  }

  const exportData = (format: 'csv' | 'json') => {
    const data = calculations.map(calc => ({
      Material: calc.material,
      Operation: calc.operation,
      'RPM': calc.rpm,
      [`Feed Rate (${units === 'metric' ? 'mm/min' : 'in/min'})`]: calc.feedRate,
      [`Feed per Tooth (${units === 'metric' ? 'mm' : 'in'})`]: calc.feedPerTooth,
      [`Depth of Cut (${units === 'metric' ? 'mm' : 'in'})`]: calc.depthOfCut,
      [`Stepover (${units === 'metric' ? 'mm' : 'in'})`]: calc.stepover,
      [`MRR (${units === 'metric' ? 'cm³/min' : 'in³/min'})`]: calc.materialRemovalRate,
      'Spindle Power (%)': calc.spindlePower,
      [`Cutting Force (${units === 'metric' ? 'N' : 'lbf'})`]: calc.cuttingForce,
      [`Surface Speed (${units === 'metric' ? 'm/min' : 'ft/min'})`]: calc.surfaceSpeed,
      [`Chip Thickness (${units === 'metric' ? 'mm' : 'in'})`]: calc.chipThickness,
      [`Tool Deflection (${units === 'metric' ? 'mm' : 'in'})`]: calc.toolDeflection,
      [`Surface Finish (${units === 'metric' ? 'μm' : 'μin'})`]: calc.surfaceFinish,
      'Tool Life (min)': calc.toolLife,
      'Machining Time (min)': calc.machiningTime,
      'Heat Generation (W)': calc.heatGeneration,
      'Chatter Frequency (Hz)': calc.chatterFrequency,
      'Cost per Part': calc.costPerPart
    }))

    if (format === 'csv') {
      const headers = Object.keys(data[0]).join(',')
      const rows = data.map(row => Object.values(row).join(','))
      const csv = [headers, ...rows].join('\n')
      
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'cutting-parameters.csv'
      a.click()
      URL.revokeObjectURL(url)
    } else {
      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'cutting-parameters.json'
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const generateSummaryReport = (calculations: CalculationResult[]): string => {
    const date = new Date().toLocaleDateString()
    const time = new Date().toLocaleTimeString()
    
    const totalWarnings = calculations.reduce((sum, calc) => sum + calc.warnings.length, 0)
    const avgRpm = Math.round(calculations.reduce((sum, calc) => sum + calc.rpm, 0) / calculations.length)
    const avgFeedRate = Math.round(calculations.reduce((sum, calc) => sum + calc.feedRate, 0) / calculations.length)
    const avgToolLife = Math.round(calculations.reduce((sum, calc) => sum + calc.toolLife, 0) / calculations.length)
    const totalCost = calculations.reduce((sum, calc) => sum + calc.costPerPart, 0)
    
    return `
PROFESSIONAL MACHINING PARAMETERS SUMMARY REPORT
Generated: ${date} at ${time}
JustTheChips Calculator - Industry-Standard Calculations

CONFIGURATION OVERVIEW:
═══════════════════════════════════════════════════════════════
Tool: ${toolConfig.diameter}${units === 'metric' ? 'mm' : 'in'} ${toolConfig.type} (${toolConfig.flutes} flutes)
Material: ${toolConfig.material} with ${toolConfig.coating} coating
Stickout: ${toolConfig.stickout}${units === 'metric' ? 'mm' : 'in'}
Machine: ${machineConfig.spindle.power}${units === 'metric' ? 'kW' : 'HP'} spindle, ${machineConfig.spindle.maxRpm} max RPM

CALCULATED PARAMETERS:
═══════════════════════════════════════════════════════════════
Total configurations calculated: ${calculations.length}
Average RPM: ${avgRpm}
Average feed rate: ${avgFeedRate} ${units === 'metric' ? 'mm/min' : 'in/min'}
Average tool life: ${avgToolLife} minutes
Total estimated cost: $${totalCost.toFixed(2)}

DETAILED RESULTS:
═══════════════════════════════════════════════════════════════
${calculations.map((calc, index) => `
${index + 1}. ${calc.material} - ${calc.operation}
   RPM: ${calc.rpm}
   Feed Rate: ${calc.feedRate} ${units === 'metric' ? 'mm/min' : 'in/min'}
   Depth of Cut: ${calc.depthOfCut} ${units === 'metric' ? 'mm' : 'in'}
   Stepover: ${calc.stepover} ${units === 'metric' ? 'mm' : 'in'}
   Tool Life: ${calc.toolLife} minutes
   Surface Finish: ${calc.surfaceFinish} ${units === 'metric' ? 'μm' : 'μin'} Ra
   Cost: $${calc.costPerPart}
   Warnings: ${calc.warnings.length > 0 ? calc.warnings.join('; ') : 'None'}
`).join('')}

SAFETY & RECOMMENDATIONS:
═══════════════════════════════════════════════════════════════
Total warnings issued: ${totalWarnings}
High power usage configs: ${calculations.filter(calc => calc.spindlePower > 80).length}
High deflection configs: ${calculations.filter(calc => calc.toolDeflection > 0.01).length}

IMPORTANT NOTES:
• These calculations are based on industry-standard formulas
• Always verify parameters are within your machine's capabilities
• Consider workpiece clamping and setup rigidity
• Monitor tool wear and adjust parameters as needed
• Use appropriate coolant for material and operation type

Generated by JustTheChips Professional Machining Calculator
Industry-validated calculations for CNC machining operations
`
  }

  return (
    <div className="card">
      <h2>Calculated Parameters</h2>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button className="button" onClick={calculate}>
          Calculate Parameters
        </button>
        <button 
          className="button" 
          onClick={calculate}
          style={{ backgroundColor: '#4a90e2', borderColor: '#4a90e2' }}
          title="Perform real-time calculation with current settings"
        >
          🔄 Refresh
        </button>
        <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#888' }}>
          {showCalculations && calculations.length > 0 && (
            <span>✅ {calculations.length} parameter set{calculations.length > 1 ? 's' : ''} calculated</span>
          )}
        </div>
      </div>

      {showCalculations && (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Details</th>
                  <th>Material</th>
                  <th>Operation</th>
                  <th>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span title="Spindle rotation speed - calculated from surface speed and tool diameter">RPM</span>
                      <button 
                        onClick={() => toggleParameterLock('rpm')}
                        style={{ 
                          padding: '2px 4px', 
                          fontSize: '10px', 
                          background: lockedParameters.rpm ? '#4a90e2' : 'transparent',
                          border: '1px solid #666',
                          color: lockedParameters.rpm ? 'white' : '#ccc',
                          cursor: 'pointer'
                        }}
                        title={lockedParameters.rpm ? 'Parameter locked - will not change when recalculating' : 'Click to lock this parameter'}
                      >
                        {lockedParameters.rpm ? '🔒' : '🔓'}
                      </button>
                    </div>
                  </th>
                  <th>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span title="Table feed rate - calculated from RPM, flutes, and chip load">Feed Rate<br />({units === 'metric' ? 'mm/min' : 'in/min'})</span>
                      <button 
                        onClick={() => toggleParameterLock('feedRate')}
                        style={{ 
                          padding: '2px 4px', 
                          fontSize: '10px', 
                          background: lockedParameters.feedRate ? '#4a90e2' : 'transparent',
                          border: '1px solid #666',
                          color: lockedParameters.feedRate ? 'white' : '#ccc',
                          cursor: 'pointer'
                        }}
                        title={lockedParameters.feedRate ? 'Parameter locked' : 'Click to lock this parameter'}
                      >
                        {lockedParameters.feedRate ? '🔒' : '🔓'}
                      </button>
                    </div>
                  </th>
                  <th title="Chip load per tooth - material-specific recommended value">Feed/Tooth<br />({units === 'metric' ? 'mm' : 'in'})</th>
                  <th>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span title="Axial depth of cut - how deep the tool cuts">Depth of Cut<br />({units === 'metric' ? 'mm' : 'in'})</span>
                      <button 
                        onClick={() => toggleParameterLock('depthOfCut')}
                        style={{ 
                          padding: '2px 4px', 
                          fontSize: '10px', 
                          background: lockedParameters.depthOfCut ? '#4a90e2' : 'transparent',
                          border: '1px solid #666',
                          color: lockedParameters.depthOfCut ? 'white' : '#ccc',
                          cursor: 'pointer'
                        }}
                        title={lockedParameters.depthOfCut ? 'Parameter locked' : 'Click to lock this parameter'}
                      >
                        {lockedParameters.depthOfCut ? '🔒' : '🔓'}
                      </button>
                    </div>
                  </th>
                  <th>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span title="Radial width of cut - how much material is removed per pass">Stepover<br />({units === 'metric' ? 'mm' : 'in'})</span>
                      <button 
                        onClick={() => toggleParameterLock('stepover')}
                        style={{ 
                          padding: '2px 4px', 
                          fontSize: '10px', 
                          background: lockedParameters.stepover ? '#4a90e2' : 'transparent',
                          border: '1px solid #666',
                          color: lockedParameters.stepover ? 'white' : '#ccc',
                          cursor: 'pointer'
                        }}
                        title={lockedParameters.stepover ? 'Parameter locked' : 'Click to lock this parameter'}
                      >
                        {lockedParameters.stepover ? '🔒' : '🔓'}
                      </button>
                    </div>
                  </th>
                  <th title="Material Removal Rate - volume of material removed per minute">MRR<br />({units === 'metric' ? 'cm³/min' : 'in³/min'})</th>
                  <th title="Percentage of spindle power being used">Spindle Power<br />(%)</th>
                  <th title="Cutting force required - affects tool deflection and machine loading">Cutting Force<br />({units === 'metric' ? 'N' : 'lbf'})</th>
                  <th title="Surface speed of the tool cutting edge">Surface Speed<br />({units === 'metric' ? 'm/min' : 'ft/min'})</th>
                  <th>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span title="Total tool deflection including dynamic effects">Tool Deflection<br />({units === 'metric' ? 'mm' : 'in'})</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {calculations.map((calc, index) => (
                  <React.Fragment key={`calc-${index}`}>
                    <tr className={calc.warnings.length > 0 ? 'warning' : ''}>
                      <td>
                        <button 
                          className="button" 
                          onClick={() => toggleRow(index)}
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                          title="Click to expand advanced analysis"
                        >
                          {expandedRows.has(index) ? '−' : '+'}
                        </button>
                      </td>
                      <td>{calc.material}</td>
                      <td>{calc.operation}</td>
                      <td>{calc.rpm}</td>
                      <td>{calc.feedRate}</td>
                      <td>{calc.feedPerTooth}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>{calc.depthOfCut}</span>
                          <DepthOfCutTooltip
                            depthOfCut={calc.depthOfCut}
                            toolConfig={toolConfig}
                            operation={getOperationConfig(calc)}
                            material={getMaterialForCalculation(calc)}
                            units={units}
                          />
                        </div>
                      </td>
                      <td>{calc.stepover}</td>
                      <td>{calc.materialRemovalRate}</td>
                      <td style={{ backgroundColor: calc.spindlePower > 80 ? '#4a3800' : 'transparent' }}>
                        {calc.spindlePower}%
                      </td>
                      <td>{calc.cuttingForce}</td>
                      <td>{calc.surfaceSpeed}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ color: calc.toolDeflection > (units === 'metric' ? 0.02 : 0.0008) ? '#e74c3c' : '#27ae60' }}>
                            {calc.toolDeflection}
                          </span>
                          <DeflectionTooltip
                            deflectionAnalysis={calc.deflectionAnalysis}
                            maxDepthAnalysis={calc.maxDepthAnalysis}
                            toolConfig={toolConfig}
                            material={getMaterialForCalculation(calc)}
                            units={units}
                            cuttingForce={calc.cuttingForce}
                          />
                        </div>
                      </td>
                    </tr>
                    {expandedRows.has(index) && (
                      <tr className="expanded-row">
                        <td colSpan={13}>
                          <div style={{ padding: '15px', backgroundColor: '#1a1a1a', border: '1px solid #333' }}>
                            <h4>📊 Professional Machining Analysis</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '15px' }}>
                              <div style={{ background: '#252525', padding: '12px', borderRadius: '4px', border: '1px solid #444' }}>
                                <strong>🔧 Tool Performance Analysis</strong>
                                <div style={{ marginTop: '8px', fontSize: '14px' }}>
                                  <div>Chip Thickness: <span style={{ color: '#4a90e2' }}>{calc.chipThickness} {units === 'metric' ? 'mm' : 'in'}</span></div>
                                  <div>Tool Deflection: <span style={{ color: calc.toolDeflection > 0.01 ? '#e74c3c' : '#27ae60' }}>{calc.toolDeflection} {units === 'metric' ? 'mm' : 'in'}</span></div>
                                  <div>Natural Frequency: <span style={{ color: '#9b59b6' }}>{calc.deflectionAnalysis.naturalFrequency} Hz</span></div>
                                  <div>Dynamic Factor: <span style={{ color: calc.deflectionAnalysis.dynamicFactor > 2 ? '#e74c3c' : '#27ae60' }}>{calc.deflectionAnalysis.dynamicFactor}x</span></div>
                                  <div>Estimated Tool Life: <span style={{ color: '#f39c12' }}>{calc.toolLife} minutes</span></div>
                                </div>
                              </div>
                              <div style={{ background: '#252525', padding: '12px', borderRadius: '4px', border: '1px solid #444' }}>
                                <strong>🎯 Quality & Productivity Metrics</strong>
                                <div style={{ marginTop: '8px', fontSize: '14px' }}>
                                  <div>Surface Finish: <span style={{ color: '#9b59b6' }}>{calc.surfaceFinish} {units === 'metric' ? 'μm' : 'μin'} Ra</span></div>
                                  <div>Machining Time: <span style={{ color: '#27ae60' }}>{calc.machiningTime} minutes</span></div>
                                  <div>Cost Estimate: <span style={{ color: '#f39c12' }}>${calc.costPerPart} per part</span></div>
                                </div>
                              </div>
                              <div style={{ background: '#252525', padding: '12px', borderRadius: '4px', border: '1px solid #444' }}>
                                <strong>🌡️ Thermal & Stability Analysis</strong>
                                <div style={{ marginTop: '8px', fontSize: '14px' }}>
                                  <div>Heat Generation: <span style={{ color: calc.heatGeneration > 100 ? '#e74c3c' : '#27ae60' }}>{calc.heatGeneration} W</span></div>
                                  <div>Chatter Frequency: <span style={{ color: '#3498db' }}>{calc.chatterFrequency} Hz</span></div>
                                  <div>Power Utilization: <span style={{ color: calc.spindlePower > 80 ? '#e74c3c' : '#27ae60' }}>{calc.spindlePower}%</span></div>
                                </div>
                              </div>
                              <div style={{ background: '#252525', padding: '12px', borderRadius: '4px', border: '1px solid #444' }}>
                                <strong>📏 Maximum Depth Analysis</strong>
                                <div style={{ marginTop: '8px', fontSize: '14px' }}>
                                  <div>Max Depth Limit: <span style={{ color: '#e74c3c' }}>{calc.maxDepthAnalysis.overallLimit} {units === 'metric' ? 'mm' : 'in'}</span></div>
                                  <div>Limiting Factor: <span style={{ color: '#f39c12' }}>{calc.maxDepthAnalysis.limitingFactor}</span></div>
                                  <div>Safety Margin: <span style={{ color: calc.depthOfCut / calc.maxDepthAnalysis.overallLimit > 0.8 ? '#e74c3c' : '#27ae60' }}>
                                    {Math.round((1 - calc.depthOfCut / calc.maxDepthAnalysis.overallLimit) * 100)}%
                                  </span></div>
                                </div>
                              </div>
                            </div>
                            {calc.optimization.length > 0 && (
                              <div>
                                <strong>💡 Optimization Recommendations:</strong>
                                <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                                  {calc.optimization.map((rec, rIndex) => (
                                    <li key={rIndex} style={{ marginBottom: '3px' }}>{rec}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Display warnings */}
          {calculations.some(calc => calc.warnings.length > 0) && (
            <div className="warnings-section" style={{ marginTop: '20px' }}>
              <h3>⚠️ Warnings</h3>
              {calculations.map((calc, index) => 
                calc.warnings.length > 0 && (
                  <div key={index} className="warning" style={{ marginBottom: '10px' }}>
                    <strong>{calc.material} - {calc.operation}:</strong>
                    <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                      {calc.warnings.map((warning, wIndex) => (
                        <li key={wIndex}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )
              )}
            </div>
          )}

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="button" onClick={() => exportData('csv')}>
              📄 Export CSV
            </button>
            <button className="button" onClick={() => exportData('json')}>
              💾 Export JSON
            </button>
            <button 
              className="button" 
              onClick={() => {
                const summaryText = generateSummaryReport(calculations)
                const blob = new Blob([summaryText], { type: 'text/plain' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'machining-summary-report.txt'
                a.click()
                URL.revokeObjectURL(url)
              }}
              style={{ backgroundColor: '#27ae60', borderColor: '#27ae60' }}
            >
              📋 Export Summary Report
            </button>
          </div>

          {/* Professional Summary Section */}
          {showCalculations && calculations.length > 0 && (
            <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#1e1e1e', border: '2px solid #333', borderRadius: '8px' }}>
              <h3 style={{ color: '#4a90e2', marginBottom: '15px' }}>🎯 Professional Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
                <div>
                  <strong>📊 Overview</strong>
                  <div style={{ fontSize: '14px', marginTop: '5px' }}>
                    <div>Total Configurations: {calculations.length}</div>
                    <div>Average RPM: {Math.round(calculations.reduce((sum, calc) => sum + calc.rpm, 0) / calculations.length)}</div>
                    <div>Average Feed Rate: {Math.round(calculations.reduce((sum, calc) => sum + calc.feedRate, 0) / calculations.length)} {units === 'metric' ? 'mm/min' : 'in/min'}</div>
                  </div>
                </div>
                <div>
                  <strong>⚠️ Critical Warnings</strong>
                  <div style={{ fontSize: '14px', marginTop: '5px' }}>
                    {(() => {
                      const totalWarnings = calculations.reduce((sum, calc) => sum + calc.warnings.length, 0)
                      const highPowerCount = calculations.filter(calc => calc.spindlePower > 80).length
                      const highDeflectionCount = calculations.filter(calc => calc.toolDeflection > 0.01).length
                      return (
                        <>
                          <div>Total Warnings: <span style={{ color: totalWarnings > 0 ? '#e74c3c' : '#27ae60' }}>{totalWarnings}</span></div>
                          <div>High Power Usage: <span style={{ color: highPowerCount > 0 ? '#e74c3c' : '#27ae60' }}>{highPowerCount} configs</span></div>
                          <div>Excessive Deflection: <span style={{ color: highDeflectionCount > 0 ? '#e74c3c' : '#27ae60' }}>{highDeflectionCount} configs</span></div>
                        </>
                      )
                    })()}
                  </div>
                </div>
                <div>
                  <strong>💰 Economic Analysis</strong>
                  <div style={{ fontSize: '14px', marginTop: '5px' }}>
                    <div>Cost Range: ${Math.min(...calculations.map(c => c.costPerPart))} - ${Math.max(...calculations.map(c => c.costPerPart))}</div>
                    <div>Avg. Tool Life: {Math.round(calculations.reduce((sum, calc) => sum + calc.toolLife, 0) / calculations.length)} min</div>
                    <div>Total Cycle Time: {Math.round(calculations.reduce((sum, calc) => sum + calc.machiningTime, 0) * 10) / 10} min</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="warning" style={{ marginTop: '20px' }}>
            <strong>Real Machining Calculations Active:</strong> This application now uses industry-standard 
            machining formulas based on material properties, tool specifications, and machine capabilities. 
            Always verify parameters are within safe operating limits for your specific setup.
          </div>
        </>
      )}
    </div>
  )
}