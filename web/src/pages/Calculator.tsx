
import { InputsSection } from '../components/calculator/InputsSection.js'
import { ResultsSection } from '../components/calculator/ResultsSection.js'
import { useCalculation } from '../store/useCalculation.js'

export default function Calculator() {
  // Hook up debounced calculations
  const calculation = useCalculation()
  
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h2>CNC Calculator</h2>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        Enter your machine, spindle, tool, and material parameters to calculate speeds, feeds, and cutting conditions.
      </p>
      
      <InputsSection />
      
      <ResultsSection 
        results={calculation.results}
        isCalculating={calculation.isCalculating}
        error={calculation.error}
      />
      
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
  )
}
