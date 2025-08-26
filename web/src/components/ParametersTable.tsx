import { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { calculateParameters, type CalculationResult } from '../data/calculations'

export default function ParametersTable() {
  const { state } = useAppContext()
  const { machineConfig, toolConfig, selectedMaterials, selectedOperations, units } = state
  const [calculations, setCalculations] = useState<CalculationResult[]>([])
  const [showCalculations, setShowCalculations] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

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

  return (
    <div className="card">
      <h2>Calculated Parameters</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button className="button" onClick={calculate}>
          Calculate Parameters
        </button>
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
                  <th>RPM</th>
                  <th>Feed Rate<br />({units === 'metric' ? 'mm/min' : 'in/min'})</th>
                  <th>Feed/Tooth<br />({units === 'metric' ? 'mm' : 'in'})</th>
                  <th>Depth of Cut<br />({units === 'metric' ? 'mm' : 'in'})</th>
                  <th>Stepover<br />({units === 'metric' ? 'mm' : 'in'})</th>
                  <th>MRR<br />({units === 'metric' ? 'cm³/min' : 'in³/min'})</th>
                  <th>Spindle Power<br />(%)</th>
                  <th>Cutting Force<br />({units === 'metric' ? 'N' : 'lbf'})</th>
                  <th>Surface Speed<br />({units === 'metric' ? 'm/min' : 'ft/min'})</th>
                </tr>
              </thead>
              <tbody>
                {calculations.map((calc, index) => (
                  <>
                    <tr key={index} className={calc.warnings.length > 0 ? 'warning' : ''}>
                      <td>
                        <button 
                          className="button" 
                          onClick={() => toggleRow(index)}
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          {expandedRows.has(index) ? '−' : '+'}
                        </button>
                      </td>
                      <td>{calc.material}</td>
                      <td>{calc.operation}</td>
                      <td>{calc.rpm}</td>
                      <td>{calc.feedRate}</td>
                      <td>{calc.feedPerTooth}</td>
                      <td>{calc.depthOfCut}</td>
                      <td>{calc.stepover}</td>
                      <td>{calc.materialRemovalRate}</td>
                      <td style={{ backgroundColor: calc.spindlePower > 80 ? '#4a3800' : 'transparent' }}>
                        {calc.spindlePower}%
                      </td>
                      <td>{calc.cuttingForce}</td>
                      <td>{calc.surfaceSpeed}</td>
                    </tr>
                    {expandedRows.has(index) && (
                      <tr key={`${index}-expanded`} className="expanded-row">
                        <td colSpan={12}>
                          <div style={{ padding: '15px', backgroundColor: '#1a1a1a', border: '1px solid #333' }}>
                            <h4>📊 Advanced Analysis</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                              <div>
                                <strong>🔧 Tool Analysis</strong>
                                <div>Chip Thickness: {calc.chipThickness} {units === 'metric' ? 'mm' : 'in'}</div>
                                <div>Tool Deflection: {calc.toolDeflection} {units === 'metric' ? 'mm' : 'in'}</div>
                                <div>Tool Life: {calc.toolLife} minutes</div>
                              </div>
                              <div>
                                <strong>🎯 Quality & Performance</strong>
                                <div>Surface Finish: {calc.surfaceFinish} {units === 'metric' ? 'μm' : 'μin'} Ra</div>
                                <div>Machining Time: {calc.machiningTime} minutes</div>
                                <div>Cost per Part: ${calc.costPerPart}</div>
                              </div>
                              <div>
                                <strong>🌡️ Thermal & Vibration</strong>
                                <div>Heat Generation: {calc.heatGeneration} W</div>
                                <div>Chatter Frequency: {calc.chatterFrequency} Hz</div>
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
                  </>
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

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button className="button" onClick={() => exportData('csv')}>
              Export CSV
            </button>
            <button className="button" onClick={() => exportData('json')}>
              Export JSON
            </button>
          </div>

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