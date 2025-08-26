import { materials, machines, tools, spindles } from '../../core/data/index.js'
import type { CutType } from '../../core/data/schemas/inputs.js'
import { useCalculatorStore } from '../../store/index.js'
import { useInputValidation } from '../../store/useInputValidation.js'
import { EntitySelector, NumericInputWithUnits } from '../ui/index.js'

const cutTypes: { value: CutType; label: string }[] = [
  { value: 'slot', label: 'Slot' },
  { value: 'profile', label: 'Profile' },
  { value: 'adaptive', label: 'Adaptive' },
  { value: 'facing', label: 'Facing' },
  { value: 'drilling', label: 'Drilling' },
  { value: 'boring', label: 'Boring' }
]

export function InputsSection() {
  const store = useCalculatorStore()
  const { getFieldError, getFieldWarnings } = useInputValidation()
  
  // Transform data for EntitySelector
  const machineOptions = machines.map(machine => ({
    id: machine.id,
    label: machine.id,
    description: `Max feed: ${machine.axis_max_feed_mm_min} mm/min, Rigidity: ${machine.rigidity_factor}`
  }))
  
  const spindleOptions = spindles.map(spindle => ({
    id: spindle.id,
    label: spindle.id,
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
    <div style={{ 
      border: '1px solid #ccc', 
      borderRadius: '8px', 
      padding: '16px', 
      marginBottom: '16px' 
    }}>
      <h3 style={{ color: '#333', margin: '0 0 16px 0' }}>Inputs</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '16px' 
      }}>
        
        {/* Machine Selection */}
        <EntitySelector
          id="machineId"
          label="Machine"
          value={store.machineId}
          options={machineOptions}
          placeholder="Select machine"
          onChange={(value) => store.setInput('machineId', value)}
          error={getFieldError('machineId')}
          required
        />
        
        {/* Spindle Selection */}
        <EntitySelector
          id="spindleId"
          label="Spindle"
          value={store.spindleId}
          options={spindleOptions}
          placeholder="Select spindle"
          onChange={(value) => store.setInput('spindleId', value)}
          error={getFieldError('spindleId')}
          required
        />
        
        {/* Tool Selection */}
        <EntitySelector
          id="toolId"
          label="Tool Preset"
          value={store.toolId}
          options={toolOptions}
          placeholder="Select tool preset"
          onChange={(value) => {
            store.setInput('toolId', value)
            // Auto-populate tool configuration from preset
            if (value) {
              const selectedTool = tools.find(t => t.id === value)
              if (selectedTool) {
                store.setToolConfigFromPreset(selectedTool)
              }
            }
          }}
          error={getFieldError('toolId')}
          required
        />
        
        {/* Material Selection */}
        <EntitySelector
          id="materialId"
          label="Material"
          value={store.materialId}
          options={materialOptions}
          placeholder="Select material"
          onChange={(value) => store.setInput('materialId', value)}
          error={getFieldError('materialId')}
          required
        />
        
        {/* Cut Type Selection */}
        <div>
          <label htmlFor="cutType" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333' }}>
            Cut Type:
          </label>
          <select
            id="cutType"
            value={store.cutType || ''}
            onChange={(e) => store.setInput('cutType', e.target.value as CutType)}
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: 'white', color: '#333' }}
          >
            <option value="">Select cut type</option>
            {cutTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Aggressiveness */}
        <NumericInputWithUnits
          id="aggressiveness"
          label="Aggressiveness"
          value={store.aggressiveness}
          min={0.1}
          max={3.0}
          step={0.1}
          placeholder="1.0"
          onChange={(value) => store.setInput('aggressiveness', value)}
          error={getFieldError('aggressiveness')}
          warning={getFieldWarnings('aggressiveness')[0]?.message}
        />
        
      </div>
      
      {/* Tool Configuration */}
      <details style={{ marginTop: '16px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#333' }}>Tool Configuration</summary>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px',
          marginTop: '12px' 
        }}>
          
          {/* Tool Type */}
          <div>
            <label htmlFor="toolType" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333' }}>
              Tool Type:
            </label>
            <select
              id="toolType"
              value={store.toolType || ''}
              onChange={(e) => store.setToolConfig('toolType', e.target.value as typeof store.toolType)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: 'white', color: '#333' }}
            >
              <option value="">Select tool type</option>
              <option value="endmill_flat">Flat Endmill</option>
              <option value="drill">Drill</option>
              <option value="vbit">V-Bit</option>
              <option value="facemill">Face Mill</option>
              <option value="boring">Boring Tool</option>
              <option value="slitting">Slitting Saw</option>
            </select>
          </div>
          
          {/* Tool Diameter */}
          <NumericInputWithUnits
            id="toolDiameter"
            label="Diameter"
            unit="mm"
            value={store.toolDiameter}
            min={0.1}
            step={0.1}
            placeholder="6.0"
            onChange={(value) => store.setToolConfig('toolDiameter', value)}
          />
          
          {/* Tool Flutes */}
          <NumericInputWithUnits
            id="toolFlutes"
            label="Flutes"
            value={store.toolFlutes}
            min={1}
            step={1}
            placeholder="2"
            onChange={(value) => store.setToolConfig('toolFlutes', value)}
          />
          
          {/* Tool Stickout */}
          <NumericInputWithUnits
            id="toolStickout"
            label="Stickout"
            unit="mm"
            value={store.toolStickout}
            min={1}
            step={0.1}
            placeholder="25.0"
            onChange={(value) => store.setToolConfig('toolStickout', value)}
          />
          
          {/* Tool Material */}
          <div>
            <label htmlFor="toolMaterial" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333' }}>
              Material:
            </label>
            <select
              id="toolMaterial"
              value={store.toolMaterial || ''}
              onChange={(e) => store.setToolConfig('toolMaterial', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: 'white', color: '#333' }}
            >
              <option value="">Select material</option>
              <option value="carbide">Carbide</option>
              <option value="HSS">High Speed Steel (HSS)</option>
              <option value="high_speed_steel">High Speed Steel</option>
              <option value="steel">Steel</option>
            </select>
          </div>
          
          {/* Tool Coating */}
          <div>
            <label htmlFor="toolCoating" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#333' }}>
              Coating:
            </label>
            <select
              id="toolCoating"
              value={store.toolCoating || ''}
              onChange={(e) => store.setToolConfig('toolCoating', e.target.value)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: 'white', color: '#333' }}
            >
              <option value="">Select coating</option>
              <option value="uncoated">Uncoated</option>
              <option value="TiN">TiN (Titanium Nitride)</option>
              <option value="TiAlN">TiAlN (Titanium Aluminum Nitride)</option>
              <option value="AlCrN">AlCrN (Aluminum Chromium Nitride)</option>
              <option value="PVD">PVD Coating</option>
              <option value="CVD">CVD Coating</option>
              <option value="DLC">DLC (Diamond-Like Carbon)</option>
            </select>
          </div>
          
          {/* V-bit Angle (conditional) */}
          {store.toolType === 'vbit' && (
            <NumericInputWithUnits
              id="vbitAngle"
              label="V-Bit Angle"
              unit="°"
              value={store.vbitAngle}
              min={10}
              max={180}
              step={1}
              placeholder="90"
              onChange={(value) => store.setToolConfig('vbitAngle', value)}
            />
          )}
          
          {/* Body Diameter for Face Mills (conditional) */}
          {store.toolType === 'facemill' && (
            <NumericInputWithUnits
              id="bodyDiameter"
              label="Body Diameter"
              unit="mm"
              value={store.bodyDiameter}
              min={0.1}
              step={0.1}
              placeholder="63.0"
              onChange={(value) => store.setToolConfig('bodyDiameter', value)}
            />
          )}
          
        </div>
      </details>
      
      {/* Optional Parameters */}
      <details style={{ marginTop: '16px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Optional Parameters</summary>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px',
          marginTop: '12px' 
        }}>
          
          {/* User DOC */}
          <NumericInputWithUnits
            id="user_doc_mm"
            label="DOC"
            unit="mm"
            value={store.user_doc_mm}
            min={0}
            step={0.1}
            placeholder="Auto"
            onChange={(value) => store.setInput('user_doc_mm', value)}
            error={getFieldError('user_doc_mm')}
            warning={getFieldWarnings('user_doc_mm')[0]?.message}
          />
          
          {/* User WOC */}
          <NumericInputWithUnits
            id="user_woc_mm"
            label="WOC"
            unit="mm"
            value={store.user_woc_mm}
            min={0}
            step={0.1}
            placeholder="Auto"
            onChange={(value) => store.setInput('user_woc_mm', value)}
            error={getFieldError('user_woc_mm')}
            warning={getFieldWarnings('user_woc_mm')[0]?.message}
          />
          
          {/* Override Flutes */}
          <NumericInputWithUnits
            id="override_flutes"
            label="Flutes Override"
            value={store.override_flutes}
            min={1}
            step={1}
            placeholder="Auto"
            onChange={(value) => store.setInput('override_flutes', value)}
            error={getFieldError('override_flutes')}
            warning={getFieldWarnings('override_flutes')[0]?.message}
          />
          
          {/* Override Stickout */}
          <NumericInputWithUnits
            id="override_stickout_mm"
            label="Stickout"
            unit="mm"
            value={store.override_stickout_mm}
            min={0}
            step={0.1}
            placeholder="Auto"
            onChange={(value) => store.setInput('override_stickout_mm', value)}
            error={getFieldError('override_stickout_mm')}
            warning={getFieldWarnings('override_stickout_mm')[0]?.message}
          />
          
        </div>
      </details>
    </div>
  )
}