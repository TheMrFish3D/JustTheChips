import { useState } from 'react'
import './App.css'
import MachineConfig from './components/MachineConfig'
import ToolConfig from './components/ToolConfig'
import MaterialSelection from './components/MaterialSelection'
import OperationSelection from './components/OperationSelection'
import ParametersTable from './components/ParametersTable'

function App() {
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric')

  return (
    <div className="app">
      <header className="app-header">
        <h1>Just the Chip</h1>
        <p>Spindle Calculator - Feeds and Speeds Calculator</p>
        <div className="units-toggle">
          <label>
            <input
              type="radio"
              name="units"
              value="metric"
              checked={units === 'metric'}
              onChange={(e) => setUnits(e.target.value as 'metric' | 'imperial')}
            />
            Metric
          </label>
          <label>
            <input
              type="radio"
              name="units"
              value="imperial"
              checked={units === 'imperial'}
              onChange={(e) => setUnits(e.target.value as 'metric' | 'imperial')}
            />
            Imperial
          </label>
        </div>
      </header>

      <main className="app-main">
        <div className="config-section">
          <MachineConfig units={units} />
          <ToolConfig units={units} />
          <MaterialSelection />
          <OperationSelection />
        </div>
        
        <div className="results-section">
          <ParametersTable units={units} />
        </div>
      </main>
    </div>
  )
}

export default App
