import { useState } from 'react'

interface ToolConfigProps {
  units: 'metric' | 'imperial'
}

export default function ToolConfig({ units }: ToolConfigProps) {
  const [tool, setTool] = useState({
    type: 'flat-endmill' as 'flat-endmill' | 'ball-endmill' | 'insert-endmill' | 'drill' | 'threadmill' | 'vbit' | 'chamfer',
    diameter: 6,
    flutes: 2,
    stickout: 15,
    material: 'carbide' as 'hss' | 'carbide' | 'ceramic' | 'diamond',
    coating: 'tin' as 'none' | 'tin' | 'ticn' | 'tialn' | 'dlc' | 'diamond'
  })

  const updateTool = (field: string, value: string | number) => {
    setTool(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="card">
      <h2>Tool Configuration</h2>
      
      <div className="form-group">
        <label>Tool Type</label>
        <select
          value={tool.type}
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
            value={tool.diameter}
            onChange={(e) => updateTool('diameter', parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="form-group">
          <label>Number of Flutes</label>
          <input
            type="number"
            min="1"
            value={tool.flutes}
            onChange={(e) => updateTool('flutes', parseInt(e.target.value) || 1)}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Stick Out ({units === 'metric' ? 'mm' : 'in'})</label>
        <input
          type="number"
          step={units === 'metric' ? '0.1' : '0.01'}
          value={tool.stickout}
          onChange={(e) => updateTool('stickout', parseFloat(e.target.value) || 0)}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Tool Material</label>
          <select
            value={tool.material}
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
            value={tool.coating}
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
    </div>
  )
}