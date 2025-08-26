import './App.css'
import { AppProvider } from './context/AppContext'
import { useAppContext } from './hooks/useAppContext'
import MachineConfig from './components/MachineConfig'
import ToolConfig from './components/ToolConfig'
import MaterialSelection from './components/MaterialSelection'
import OperationSelection from './components/OperationSelection'
import ParametersTable from './components/ParametersTable'

function AppContent() {
  const { state, setUnits } = useAppContext()

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
              checked={state.units === 'metric'}
              onChange={(e) => setUnits(e.target.value as 'metric' | 'imperial')}
            />
            Metric
          </label>
          <label>
            <input
              type="radio"
              name="units"
              value="imperial"
              checked={state.units === 'imperial'}
              onChange={(e) => setUnits(e.target.value as 'metric' | 'imperial')}
            />
            Imperial
          </label>
        </div>
      </header>

      <main className="app-main">
        <div className="config-section">
          <MachineConfig />
          <ToolConfig />
          <MaterialSelection />
          <OperationSelection />
        </div>
        
        <div className="results-section">
          <ParametersTable />
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
