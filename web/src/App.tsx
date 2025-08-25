import './App.css'
import { TabbedCalculatorLayout } from './components/layout/TabbedCalculatorLayout'

export default function App() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header with title */}
      <header style={{ 
        background: '#2563eb', 
        color: 'white', 
        padding: '12px 24px',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>
          ⚙️ JustTheChip CNC Calculator
        </h1>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
          Educational hobbyist CNC machining calculator with physics-based modeling
        </p>
      </header>
      
      {/* Main calculator interface */}
      <main style={{ flex: 1, overflow: 'hidden' }}>
        <TabbedCalculatorLayout />
      </main>
    </div>
  )
}
