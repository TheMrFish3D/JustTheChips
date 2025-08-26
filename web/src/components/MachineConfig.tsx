import { useState } from 'react'

interface MachineConfigProps {
  units: 'metric' | 'imperial'
}

export default function MachineConfig({ units }: MachineConfigProps) {
  const [config, setConfig] = useState({
    spindle: {
      power: 2.2,
      frequency: 400,
      maxRpm: 24000
    },
    motors: {
      xTorque: 1.26,
      xCount: 1,
      yTorque: 1.26,
      yCount: 1,
      zTorque: 1.26,
      zCount: 1
    },
    coolant: 'mist' as 'vacuum' | 'mist' | 'flood' | 'airblast'
  })

  const updateSpindle = (field: string, value: number) => {
    setConfig(prev => ({
      ...prev,
      spindle: { ...prev.spindle, [field]: value }
    }))
  }

  const updateMotors = (field: string, value: number) => {
    setConfig(prev => ({
      ...prev,
      motors: { ...prev.motors, [field]: value }
    }))
  }

  const updateCoolant = (value: string) => {
    setConfig(prev => ({
      ...prev,
      coolant: value as typeof config.coolant
    }))
  }

  return (
    <div className="card">
      <h2>Machine Configuration</h2>
      
      <h3>Spindle (VFD)</h3>
      <div className="form-group">
        <label>Power ({units === 'metric' ? 'kW' : 'HP'})</label>
        <input
          type="number"
          step="0.1"
          value={config.spindle.power}
          onChange={(e) => updateSpindle('power', parseFloat(e.target.value) || 0)}
        />
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Frequency (Hz)</label>
          <input
            type="number"
            value={config.spindle.frequency}
            onChange={(e) => updateSpindle('frequency', parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="form-group">
          <label>Max RPM</label>
          <input
            type="number"
            value={config.spindle.maxRpm}
            onChange={(e) => updateSpindle('maxRpm', parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      <h3>Motors</h3>
      <div className="form-row">
        <div className="form-group">
          <label>X Axis Torque ({units === 'metric' ? 'Nm' : 'lb-ft'})</label>
          <input
            type="number"
            step="0.01"
            value={config.motors.xTorque}
            onChange={(e) => updateMotors('xTorque', parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="form-group">
          <label># of X Motors</label>
          <input
            type="number"
            min="1"
            value={config.motors.xCount}
            onChange={(e) => updateMotors('xCount', parseInt(e.target.value) || 1)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Y Axis Torque ({units === 'metric' ? 'Nm' : 'lb-ft'})</label>
          <input
            type="number"
            step="0.01"
            value={config.motors.yTorque}
            onChange={(e) => updateMotors('yTorque', parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="form-group">
          <label># of Y Motors</label>
          <input
            type="number"
            min="1"
            value={config.motors.yCount}
            onChange={(e) => updateMotors('yCount', parseInt(e.target.value) || 1)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Z Axis Torque ({units === 'metric' ? 'Nm' : 'lb-ft'})</label>
          <input
            type="number"
            step="0.01"
            value={config.motors.zTorque}
            onChange={(e) => updateMotors('zTorque', parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="form-group">
          <label># of Z Motors</label>
          <input
            type="number"
            min="1"
            value={config.motors.zCount}
            onChange={(e) => updateMotors('zCount', parseInt(e.target.value) || 1)}
          />
        </div>
      </div>

      <h3>Coolant</h3>
      <div className="form-group">
        <label>Coolant Type</label>
        <select
          value={config.coolant}
          onChange={(e) => updateCoolant(e.target.value)}
        >
          <option value="vacuum">Vacuum</option>
          <option value="mist">Mist</option>
          <option value="flood">Flood</option>
          <option value="airblast">Air Blast</option>
        </select>
      </div>
    </div>
  )
}