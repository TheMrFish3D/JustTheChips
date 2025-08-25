import { useState } from 'react'

import { materials, machines, tools, spindles } from '../../core/data/index.js'
import { useCalculatorStore } from '../../store/index.js'
import { useInputValidation } from '../../store/useInputValidation.js'
import { EntitySelector, EducationalTooltip } from '../ui/index.js'

import { MachineConfigModal } from './MachineConfigModal.js'

export function LeftSidebar() {
  const store = useCalculatorStore()
  const { getFieldError } = useInputValidation()
  const [showMachineConfig, setShowMachineConfig] = useState(false)
  
  // Create user-friendly labels for machines
  const getMachineLabel = (id: string): string => {
    const labels = new Map([
      ['3018_basic', '3018 Basic'],
      ['3018_pro', '3018 Pro'],
      ['3018_pro_max', '3018 Pro Max'],
      ['3018_steel', '3018 Steel Frame'],
      ['lowrider_v3', 'Lowrider v3'],
      ['queenbee_pro', 'Queenbee Pro'],
      ['printnc', 'PrintNC'],
      ['benchtop_mill', 'Benchtop Mill'],
      ['rigid_hobby_mill', 'Rigid Hobby Mill'],
      ['entry_vmc', 'Entry VMC'],
      ['custom', 'Custom']
    ])
    return labels.get(id) || id
  }

  // Create user-friendly labels for spindles  
  const getSpindleLabel = (id: string): string => {
    const labels: Record<string, string> = {
      dewalt_router_1_25hp: 'Dewalt Router (1.25HP)',
      makita_router_1_25hp: 'Makita Router (1.25HP)', 
      vfd_spindle_0_8kw: 'VFD Spindle 0.8kW',
      vfd_spindle_1_5kw: 'VFD Spindle 1.5kW',
      vfd_spindle_2_2kw: 'VFD Spindle 2.2kW',
      vfd_spindle_3_2kw: 'VFD Spindle 3.2kW'
    }
    return labels[id] || id
  }
  
  // Transform data for EntitySelector
  const machineOptions = machines.map(machine => ({
    id: machine.id,
    label: getMachineLabel(machine.id),
    description: `Max feed: ${machine.axis_max_feed_mm_min} mm/min, Rigidity: ${machine.rigidity_factor}`
  }))
  
  const spindleOptions = spindles.map(spindle => ({
    id: spindle.id,
    label: getSpindleLabel(spindle.id),
    description: `${spindle.rated_power_kw}kW, ${spindle.rpm_min}-${spindle.rpm_max} RPM`
  }))
  
  const toolOptions = tools.map(tool => ({
    id: tool.id,
    label: tool.id,
    description: `${tool.diameter_mm}mm ${tool.type}, ${tool.flutes} flutes, ${tool.coating}`
  }))
  
  const materialOptions = materials.map(material => ({
    id: material.id,
    label: `${material.id} (${material.category})`,
    description: `Vc: ${material.vc_range_m_min[0]}-${material.vc_range_m_min[1]} m/min`
  }))

  return (
    <>
      <div style={{ 
        width: '320px',
        background: 'white',
        borderRight: '1px solid #e5e5e5',
        padding: '16px',
        overflowY: 'auto'
      }}>
        
        {/* Machine Setup Section */}
        <div style={{ 
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
          background: '#fafafa'
        }}>
          <EducationalTooltip contentKey="machineRigidity" position="right">
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold' }}>
              Machine Setup
            </h3>
          </EducationalTooltip>
          
          <EntitySelector
            id="machineId"
            label="Machine Type"
            value={store.machineId}
            options={machineOptions}
            placeholder="Select machine"
            onChange={(value) => store.setInput('machineId', value)}
            error={getFieldError('machineId')}
            required
          />
          
          <button
            onClick={() => setShowMachineConfig(true)}
            style={{
              width: '100%',
              marginTop: '12px',
              padding: '8px 16px',
              background: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Configure Machine Details
          </button>
          
          <div style={{ marginTop: '12px' }}>
            <EntitySelector
              id="spindleId"
              label="Spindle Type"
              value={store.spindleId}
              options={spindleOptions}
              placeholder="Select spindle"
              onChange={(value) => store.setInput('spindleId', value)}
              error={getFieldError('spindleId')}
              required
            />
          </div>
        </div>
        
        {/* Tool Setup Section */}
        <div style={{ 
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
          background: '#fafafa'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold' }}>
            Tool Setup
          </h3>
          
          <EntitySelector
            id="toolId"
            label="Tool Type"
            value={store.toolId}
            options={toolOptions}
            placeholder="Select tool"
            onChange={(value) => store.setInput('toolId', value)}
            error={getFieldError('toolId')}
            required
          />
        </div>
        
        {/* Material Section */}
        <div style={{ 
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
          background: '#fafafa'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold' }}>
            Material
          </h3>
          
          <EntitySelector
            id="materialId"
            label="Material Type"
            value={store.materialId}
            options={materialOptions}
            placeholder="Select material"
            onChange={(value) => store.setInput('materialId', value)}
            error={getFieldError('materialId')}
            required
          />
        </div>
        
      </div>
      
      {/* Machine Configuration Modal */}
      {showMachineConfig && (
        <MachineConfigModal 
          onClose={() => setShowMachineConfig(false)}
        />
      )}
    </>
  )
}