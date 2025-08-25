import { useCalculatorStore } from '../../store/index.js'
import { useCalculation } from '../../store/useCalculation.js'
import { ChartsSection } from '../calculator/ChartsSection.js'
import { DeflectionOptimizationSection } from '../calculator/DeflectionOptimizationSection.js'
import { ResultsSection } from '../calculator/ResultsSection.js'

import { LeftSidebar } from './LeftSidebar.js'
import { MainParametersArea } from './MainParametersArea.js'

export function TabbedCalculatorLayout() {
  const calculation = useCalculation()
  const store = useCalculatorStore()
  
  // Get current parameters for deflection optimization
  const currentForce = calculation.results?.force_N
  const currentRPM = calculation.results?.rpm
  const currentFlutes = store.override_flutes

  return (
    <div style={{ 
      display: 'flex', 
      height: '100%', 
      background: '#f8f9fa'
    }}>
      
      {/* Left Sidebar with Machine Setup, Tool Setup, Material */}
      <LeftSidebar />
      
      {/* Main Area with Tabbed Parameters and Results */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'auto',
        padding: '16px'
      }}>
        
        {/* Main Parameters Area (Tabbed) */}
        <MainParametersArea />
        
        {/* Results Section */}
        <div style={{ marginTop: '16px' }}>
          <ResultsSection 
            results={calculation.results}
            isCalculating={calculation.isCalculating}
            error={calculation.error}
          />
        </div>
        
        {/* Charts Section */}
        <div style={{ marginTop: '16px' }}>
          <ChartsSection />
        </div>
        
        {/* Deflection Optimization Section */}
        <div style={{ marginTop: '16px' }}>
          <DeflectionOptimizationSection 
            currentForce={currentForce}
            currentRPM={currentRPM}
            currentFlutes={currentFlutes}
          />
        </div>
        
        {/* Last calculation time */}
        {calculation.lastCalculationTime && (
          <div style={{ 
            marginTop: '16px', 
            fontSize: '12px', 
            color: '#999', 
            textAlign: 'center' 
          }}>
            Last calculated: {new Date(calculation.lastCalculationTime).toLocaleTimeString()}
          </div>
        )}
        
      </div>
    </div>
  )
}