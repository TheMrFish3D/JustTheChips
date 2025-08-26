import { useState } from 'react'

interface ParametersTableProps {
  units: 'metric' | 'imperial'
}

export default function ParametersTable({ units }: ParametersTableProps) {
  const [showCalculations, setShowCalculations] = useState(false)

  // Mock calculation data - in a real app this would come from actual calculations
  const calculations = [
    {
      material: 'Aluminum 6061',
      operation: 'Slotting',
      rpm: 8000,
      feedRate: units === 'metric' ? 800 : 31.5,
      feedPerTooth: units === 'metric' ? 0.05 : 0.002,
      depthOfCut: units === 'metric' ? 2.0 : 0.079,
      stepover: units === 'metric' ? 4.0 : 0.157,
      materialRemovalRate: units === 'metric' ? 6.4 : 0.39,
      spindlePower: 65,
      cuttingForce: units === 'metric' ? 120 : 27,
      warning: false
    },
    {
      material: 'Aluminum 6061',
      operation: 'Pocketing',
      rpm: 10000,
      feedRate: units === 'metric' ? 1000 : 39.4,
      feedPerTooth: units === 'metric' ? 0.05 : 0.002,
      depthOfCut: units === 'metric' ? 1.5 : 0.059,
      stepover: units === 'metric' ? 3.0 : 0.118,
      materialRemovalRate: units === 'metric' ? 4.5 : 0.27,
      spindlePower: 45,
      cuttingForce: units === 'metric' ? 85 : 19,
      warning: false
    }
  ]

  const calculate = () => {
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
      [`Cutting Force (${units === 'metric' ? 'N' : 'lbf'})`]: calc.cuttingForce
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
                </tr>
              </thead>
              <tbody>
                {calculations.map((calc, index) => (
                  <tr key={index} className={calc.warning ? 'warning' : ''}>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button className="button" onClick={() => exportData('csv')}>
              Export CSV
            </button>
            <button className="button" onClick={() => exportData('json')}>
              Export JSON
            </button>
          </div>

          <div className="warning" style={{ marginTop: '20px' }}>
            <strong>Note:</strong> This is a basic implementation. The calculations shown are mock data for demonstration purposes. 
            A complete implementation would include proper machining calculations based on material properties, tool geometry, and machine capabilities.
          </div>
        </>
      )}
    </div>
  )
}