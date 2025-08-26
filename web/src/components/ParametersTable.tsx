import { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { calculateParameters, type CalculationResult } from '../data/calculations'

export default function ParametersTable() {
  const { state } = useAppContext()
  const { machineConfig, toolConfig, selectedMaterials, selectedOperations, units } = state
  const [calculations, setCalculations] = useState<CalculationResult[]>([])
  const [showCalculations, setShowCalculations] = useState(false)

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
      [`Surface Speed (${units === 'metric' ? 'm/min' : 'ft/min'})`]: calc.surfaceSpeed
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
                  <tr key={index} className={calc.warnings.length > 0 ? 'warning' : ''}>
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