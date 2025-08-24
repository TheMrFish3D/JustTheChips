import type { CalculationOutput } from '../../core/calculations/output.js'

interface ResultsSectionProps {
  results?: CalculationOutput
  isCalculating: boolean
  error?: string
}

function ResultCard({ title, value, unit, precision = 0 }: { 
  title: string; 
  value: number | undefined; 
  unit: string; 
  precision?: number 
}) {
  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '6px', 
      padding: '12px',
      backgroundColor: '#f9f9f9' 
    }}>
      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>{title}</div>
      <div style={{ fontSize: '18px', fontWeight: 'bold', color: value !== undefined ? '#333' : '#999' }}>
        {value !== undefined ? value.toFixed(precision) : '—'} {unit}
      </div>
    </div>
  )
}

function WarningsList({ warnings }: { warnings: Array<{type: string, message: string}> }) {
  if (!warnings || warnings.length === 0) {
    return null
  }
  
  return (
    <div style={{ marginTop: '16px' }}>
      <h4 style={{ margin: '0 0 8px 0', color: '#d63384' }}>Warnings</h4>
      <ul style={{ margin: 0, paddingLeft: '20px' }}>
        {warnings.map((warning, index) => (
          <li key={index} style={{ color: '#d63384', marginBottom: '4px' }}>
            <strong>{warning.type}:</strong> {warning.message}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ResultsSection({ results, isCalculating, error }: ResultsSectionProps) {
  return (
    <div style={{ 
      border: '1px solid #ccc', 
      borderRadius: '8px', 
      padding: '16px' 
    }}>
      <h3>Results</h3>
      
      {error && (
        <div style={{ 
          backgroundColor: '#f8d7da', 
          border: '1px solid #f5c6cb', 
          borderRadius: '4px', 
          padding: '12px', 
          marginBottom: '16px',
          color: '#721c24'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {isCalculating && (
        <div style={{ 
          backgroundColor: '#d1ecf1', 
          border: '1px solid #bee5eb', 
          borderRadius: '4px', 
          padding: '12px', 
          marginBottom: '16px',
          color: '#0c5460'
        }}>
          Calculating...
        </div>
      )}
      
      {!results && !isCalculating && !error && (
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #dee2e6', 
          borderRadius: '4px', 
          padding: '12px', 
          color: '#6c757d',
          textAlign: 'center'
        }}>
          Enter machine, spindle, tool, material, and cut type to see results
        </div>
      )}
      
      {results && (
        <>
          {/* Speed and Feed Results */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 12px 0' }}>Speed & Feed</h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
              gap: '12px' 
            }}>
              <ResultCard title="RPM" value={results.rpm} unit="rpm" />
              <ResultCard title="Feed Rate" value={results.feed_mm_min} unit="mm/min" />
              <ResultCard title="Surface Speed" value={results.vc_m_min} unit="m/min" />
              <ResultCard title="Surface Speed" value={results.sfm} unit="SFM" />
            </div>
          </div>
          
          {/* Chipload Results */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 12px 0' }}>Chipload</h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
              gap: '12px' 
            }}>
              <ResultCard title="Chipload (Adjusted)" value={results.fz_mm} unit="mm" precision={3} />
              <ResultCard title="Chipload (Base)" value={results.fz_actual_mm} unit="mm" precision={3} />
            </div>
          </div>
          
          {/* Engagement Results */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 12px 0' }}>Engagement</h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
              gap: '12px' 
            }}>
              <ResultCard title="Radial (WOC)" value={results.ae_mm} unit="mm" precision={2} />
              <ResultCard title="Axial (DOC)" value={results.ap_mm} unit="mm" precision={2} />
              <ResultCard title="MRR" value={results.mrr_mm3_min} unit="mm³/min" precision={0} />
            </div>
          </div>
          
          {/* Power and Force Results */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 12px 0' }}>Power & Force</h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
              gap: '12px' 
            }}>
              <ResultCard title="Required Power" value={results.power_W} unit="W" precision={0} />
              <ResultCard title="Available Power" value={results.power_available_W} unit="W" precision={0} />
              <ResultCard title="Cutting Force" value={results.force_N} unit="N" precision={0} />
            </div>
          </div>
          
          {/* Deflection Results */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ margin: '0 0 12px 0' }}>Tool Deflection</h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
              gap: '12px' 
            }}>
              <ResultCard title="Total Deflection" value={results.deflection_mm} unit="mm" precision={4} />
              <ResultCard title="Effective Diameter" value={results.effectiveDiameter} unit="mm" precision={2} />
            </div>
          </div>
          
          {/* Tool Information */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 12px 0' }}>Tool Information</h4>
            <div style={{ fontSize: '14px', color: '#666' }}>
              <div>Tool Type: <strong>{results.toolType}</strong></div>
              <div>User DOC Override: <strong>{results.user_doc_override ? 'Yes' : 'No'}</strong></div>
            </div>
          </div>
          
          {/* Warnings */}
          <WarningsList warnings={results.warnings} />
        </>
      )}
    </div>
  )
}