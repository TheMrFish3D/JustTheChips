import { useAppContext } from '../hooks/useAppContext'

export default function ToolConfig() {
  const { state, updateToolConfig } = useAppContext()
  const { toolConfig, units } = state

  const updateTool = (field: string, value: string | number | null) => {
    updateToolConfig({ [field]: value })
  }

  return (
    <div className="card">
      <h2>Tool Configuration</h2>
      
      <div className="form-group">
        <label>Tool Type</label>
        <select
          value={toolConfig.type}
          onChange={(e) => updateTool('type', e.target.value)}
        >
          <option value="flat-endmill">Flat End Mill</option>
          <option value="ball-endmill">Ball End Mill</option>
          <option value="insert-endmill">Insert End Mill (e.g. BAP300)</option>
          <option value="drill">Drill</option>
          <option value="threadmill">Thread Mill</option>
          <option value="vbit">V-Bit</option>
          <option value="chamfer">Chamfer Bit</option>
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Diameter ({units === 'metric' ? 'mm' : 'in'})</label>
          <input
            type="number"
            step={units === 'metric' ? '0.1' : '0.01'}
            value={toolConfig.diameter}
            onChange={(e) => updateTool('diameter', parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="form-group">
          <label>Number of Flutes</label>
          <input
            type="number"
            min="1"
            value={toolConfig.flutes}
            onChange={(e) => updateTool('flutes', parseInt(e.target.value) || 1)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Stick Out ({units === 'metric' ? 'mm' : 'in'})</label>
          <input
            type="number"
            step={units === 'metric' ? '0.1' : '0.01'}
            value={toolConfig.stickout}
            onChange={(e) => updateTool('stickout', parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="form-group">
          <label>Projection Length ({units === 'metric' ? 'mm' : 'in'})</label>
          <input
            type="number"
            step={units === 'metric' ? '0.1' : '0.01'}
            value={toolConfig.projectionLength}
            onChange={(e) => updateTool('projectionLength', parseFloat(e.target.value) || 0)}
            title="Actual cutting tool projection beyond holder face"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Tool Holder Type</label>
        <select
          value={toolConfig.holderType}
          onChange={(e) => updateTool('holderType', e.target.value)}
          title="Tool holder type affects clamping stiffness"
        >
          <option value="collet">Collet (ER20, ER25, etc.)</option>
          <option value="shrink-fit">Shrink Fit (Heated assembly)</option>
          <option value="hydraulic">Hydraulic (TENDO, etc.)</option>
          <option value="side-lock">Side Lock (Weldon flat)</option>
          <option value="end-mill-holder">End Mill Holder (Set screw)</option>
          <option value="drill-chuck">Drill Chuck (Keyless/keyed)</option>
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Tool Material</label>
          <select
            value={toolConfig.material}
            onChange={(e) => updateTool('material', e.target.value)}
          >
            <option value="hss">HSS (High Speed Steel)</option>
            <option value="carbide">Carbide</option>
            <option value="ceramic">Ceramic</option>
            <option value="diamond">Diamond</option>
          </select>
        </div>
        <div className="form-group">
          <label>Tool Coating</label>
          <select
            value={toolConfig.coating}
            onChange={(e) => updateTool('coating', e.target.value)}
          >
            <option value="none">None</option>
            <option value="tin">TiN (Titanium Nitride)</option>
            <option value="ticn">TiCN (Titanium Carbo-Nitride)</option>
            <option value="tialn">TiAlN (Titanium Aluminum Nitride)</option>
            <option value="dlc">DLC (Diamond-Like Carbon)</option>
            <option value="diamond">Diamond</option>
          </select>
        </div>
      </div>

      {/* Advanced Tool Geometry */}
      <details style={{ marginTop: '15px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>
          Advanced Tool Geometry (Optional)
        </summary>
        
        <div className="form-row">
          <div className="form-group">
            <label>Core Diameter ({units === 'metric' ? 'mm' : 'in'})</label>
            <input
              type="number"
              step={units === 'metric' ? '0.1' : '0.01'}
              value={toolConfig.coreDiameter || ''}
              onChange={(e) => updateTool('coreDiameter', parseFloat(e.target.value) || null)}
              placeholder="Auto-calculated if empty"
              title="Tool core diameter after flute machining"
            />
          </div>
          <div className="form-group">
            <label>Helix Angle (degrees)</label>
            <input
              type="number"
              step="1"
              min="0"
              max="60"
              value={toolConfig.helixAngle || ''}
              onChange={(e) => updateTool('helixAngle', parseFloat(e.target.value) || null)}
              placeholder="30"
              title="Tool helix angle affects cutting forces"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Runout Tolerance ({units === 'metric' ? 'mm' : 'in'})</label>
          <input
            type="number"
            step={units === 'metric' ? '0.001' : '0.0001'}
            value={toolConfig.runoutTolerance || ''}
            onChange={(e) => updateTool('runoutTolerance', parseFloat(e.target.value) || null)}
            placeholder={units === 'metric' ? '0.005' : '0.0002'}
            title="Tool runout affects cutting force uniformity"
          />
        </div>
      </details>
    </div>
  )
}