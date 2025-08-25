import { useState } from 'react'

interface MachineConfigModalProps {
  onClose: () => void
}

interface AxisConfig {
  motorType: string
  numMotors: number
  driveType: string
  pitch: number
  gearReduction: number
}

export function MachineConfigModal({ onClose }: MachineConfigModalProps) {
  const [xAxis, setXAxis] = useState<AxisConfig>({
    motorType: 'NEMA23',
    numMotors: 1,
    driveType: 'Ballscrew',
    pitch: 5,
    gearReduction: 1
  })
  
  const [yAxis, setYAxis] = useState<AxisConfig>({
    motorType: 'NEMA23',
    numMotors: 2,
    driveType: 'Ballscrew',
    pitch: 5,
    gearReduction: 1
  })
  
  const [zAxis, setZAxis] = useState<AxisConfig>({
    motorType: 'NEMA23',
    numMotors: 1,
    driveType: 'Ballscrew',
    pitch: 5,
    gearReduction: 1
  })
  
  const [rigidityEstimate, setRigidityEstimate] = useState('Medium (Steel frame, supported rails)')

  const motorTypes = ['NEMA17', 'NEMA23', 'NEMA34', 'Servo']
  const driveTypes = ['Ballscrew', 'Leadscrew', 'Belt', 'Rack & Pinion']
  const rigidityOptions = [
    'Low (Aluminum extrusion, unsupported)',
    'Medium (Steel frame, supported rails)', 
    'High (Cast iron, precision rails)',
    'Very High (Granite/Polymer concrete)'
  ]

  const AxisConfigSection = ({ 
    title, 
    config, 
    onChange 
  }: { 
    title: string
    config: AxisConfig
    onChange: (config: AxisConfig) => void 
  }) => (
    <div style={{ 
      border: '1px solid #e5e5e5',
      borderRadius: '6px',
      padding: '16px',
      marginBottom: '16px',
      background: '#fafafa'
    }}>
      <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>{title}</h4>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '12px' 
      }}>
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '4px', 
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151'
          }}>
            Motor Type
          </label>
          <select
            value={config.motorType}
            onChange={(e) => onChange({ ...config, motorType: e.target.value })}
            style={{ 
              width: '100%', 
              padding: '6px 8px', 
              border: '1px solid #d1d5db', 
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            {motorTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '4px', 
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151'
          }}>
            # Motors
          </label>
          <input
            type="number"
            min="1"
            max="4"
            value={config.numMotors}
            onChange={(e) => onChange({ ...config, numMotors: parseInt(e.target.value) })}
            style={{ 
              width: '100%', 
              padding: '6px 8px', 
              border: '1px solid #d1d5db', 
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>
        
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '4px', 
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151'
          }}>
            Drive Type
          </label>
          <select
            value={config.driveType}
            onChange={(e) => onChange({ ...config, driveType: e.target.value })}
            style={{ 
              width: '100%', 
              padding: '6px 8px', 
              border: '1px solid #d1d5db', 
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            {driveTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '4px', 
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151'
          }}>
            Pitch (mm)
          </label>
          <input
            type="number"
            min="1"
            max="20"
            step="0.5"
            value={config.pitch}
            onChange={(e) => onChange({ ...config, pitch: parseFloat(e.target.value) })}
            style={{ 
              width: '100%', 
              padding: '6px 8px', 
              border: '1px solid #d1d5db', 
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>
        
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '4px', 
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151'
          }}>
            Gear Reduction
          </label>
          <input
            type="number"
            min="0.1"
            max="10"
            step="0.1"
            value={config.gearReduction}
            onChange={(e) => onChange({ ...config, gearReduction: parseFloat(e.target.value) })}
            style={{ 
              width: '100%', 
              padding: '6px 8px', 
              border: '1px solid #d1d5db', 
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>
      </div>
    </div>
  )

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative'
      }}>
        
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid #e5e5e5',
          paddingBottom: '16px'
        }}>
          <h2 style={{ margin: 0, color: '#1f2937' }}>Machine Configuration</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        {/* Axis Configurations */}
        <AxisConfigSection 
          title="X Axis"
          config={xAxis}
          onChange={setXAxis}
        />
        
        <AxisConfigSection 
          title="Y Axis"
          config={yAxis}
          onChange={setYAxis}
        />
        
        <AxisConfigSection 
          title="Z Axis"
          config={zAxis}
          onChange={setZAxis}
        />

        {/* Machine Rigidity Estimate */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontSize: '16px',
            fontWeight: '600',
            color: '#374151'
          }}>
            Machine Rigidity Estimate
          </label>
          <select
            value={rigidityEstimate}
            onChange={(e) => setRigidityEstimate(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '8px 12px', 
              border: '1px solid #d1d5db', 
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            {rigidityOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '12px',
          borderTop: '1px solid #e5e5e5',
          paddingTop: '16px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              background: 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // TODO: Save configuration
              onClose()
            }}
            style={{
              padding: '8px 16px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  )
}