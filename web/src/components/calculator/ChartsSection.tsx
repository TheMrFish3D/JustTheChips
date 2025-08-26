import { useMemo } from 'react'

import { spindles, tools } from '../../core/data/index.js'
import { useCalculatorStore } from '../../store/index.js'
import { RPMPowerChart, DeflectionStickoutChart } from '../charts/index.js'

export function ChartsSection() {
  const store = useCalculatorStore()
  
  // Get current selections
  const selectedSpindle = useMemo(() => {
    if (!store.spindleId) return null
    return spindles.find(s => s.id === store.spindleId) || null
  }, [store.spindleId])
  
  const selectedTool = useMemo(() => {
    if (!store.toolId) return null
    return tools.find(t => t.id === store.toolId) || null
  }, [store.toolId])
  
  // Only show charts if we have the required data
  const showCharts = selectedSpindle && selectedTool
  
  if (!showCharts) {
    return (
      <div style={{ 
        padding: '24px', 
        textAlign: 'center',
        color: '#666',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
          What-If Analysis Charts
        </h3>
        <p style={{ margin: 0, fontSize: '14px' }}>
          Select a spindle and tool to view performance charts
        </p>
      </div>
    )
  }
  
  // Calculate estimated force for deflection chart
  // This is a simplified estimate - in a full implementation this would come from the calculation results
  const estimatedForceN = 300 // Default estimate for demonstration
  const estimatedRPM = 12000 // Default estimate
  const toolFlutes = selectedTool.flutes
  
  return (
    <div style={{ marginTop: '32px' }}>
      <h3 style={{ 
        margin: '0 0 16px 0', 
        fontSize: '18px', 
        fontWeight: 'bold',
        color: '#333'
      }}>
        What-If Analysis Charts
      </h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
        {/* RPM vs Power Chart */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h4 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '16px', 
            fontWeight: '600',
            color: '#333'
          }}>
            Spindle Power Curve
          </h4>
          <p style={{ 
            margin: '0 0 16px 0', 
            fontSize: '14px', 
            color: '#6b7280' 
          }}>
            Power available vs RPM for {selectedSpindle.id}
          </p>
          <RPMPowerChart 
            spindle={selectedSpindle}
            width={450}
            height={300}
          />
        </div>
        
        {/* Deflection vs Stickout Chart */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h4 style={{ 
            margin: '0 0 16px 0', 
            fontSize: '16px', 
            fontWeight: '600',
            color: '#333'
          }}>
            Tool Deflection Analysis
          </h4>
          <p style={{ 
            margin: '0 0 16px 0', 
            fontSize: '14px', 
            color: '#6b7280' 
          }}>
            Deflection vs stickout for {selectedTool.id} (ø{selectedTool.diameter_mm}mm)
          </p>
          <DeflectionStickoutChart
            tool={selectedTool}
            forceN={estimatedForceN}
            rpm={estimatedRPM}
            flutes={toolFlutes}
            currentStickoutMm={store.override_stickout_mm || selectedTool.stickout_mm}
            width={450}
            height={300}
          />
          <div style={{
            marginTop: '12px',
            fontSize: '12px',
            color: '#9ca3af',
            fontStyle: 'italic'
          }}>
            * Chart uses estimated force of {estimatedForceN}N. Actual force depends on cutting conditions.
          </div>
        </div>
      </div>
      
      {/* Chart usage information */}
      <div style={{
        backgroundColor: '#eff6ff',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #bfdbfe'
      }}>
        <h5 style={{ 
          margin: '0 0 8px 0', 
          fontSize: '14px', 
          fontWeight: '600',
          color: '#1e40af'
        }}>
          Chart Features
        </h5>
        <ul style={{ 
          margin: 0, 
          paddingLeft: '16px',
          fontSize: '14px',
          color: '#1e40af'
        }}>
          <li>Hover over data points to see detailed values with units</li>
          <li>Red markers show your current operating point</li>
          <li>Dashed lines indicate warning and danger zones for deflection</li>
          <li>Charts automatically update when you change tool or spindle selections</li>
        </ul>
      </div>
    </div>
  )
}