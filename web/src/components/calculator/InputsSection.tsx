import type { CutType } from '../../core/data/schemas/inputs.js'
import { useCalculatorStore } from '../../store/index.js'

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
  
  return (
    <div style={{ 
      border: '1px solid #ccc', 
      borderRadius: '8px', 
      padding: '16px', 
      marginBottom: '16px' 
    }}>
      <h3>Inputs</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '16px' 
      }}>
        
        {/* Machine Selection */}
        <div>
          <label htmlFor="machineId" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Machine:
          </label>
          <input
            id="machineId"
            type="text"
            placeholder="Select or enter machine ID"
            value={store.machineId || ''}
            onChange={(e) => store.setInput('machineId', e.target.value)}
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        
        {/* Spindle Selection */}
        <div>
          <label htmlFor="spindleId" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Spindle:
          </label>
          <input
            id="spindleId"
            type="text"
            placeholder="Select or enter spindle ID"
            value={store.spindleId || ''}
            onChange={(e) => store.setInput('spindleId', e.target.value)}
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        
        {/* Tool Selection */}
        <div>
          <label htmlFor="toolId" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Tool:
          </label>
          <input
            id="toolId"
            type="text"
            placeholder="Select or enter tool ID"
            value={store.toolId || ''}
            onChange={(e) => store.setInput('toolId', e.target.value)}
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        
        {/* Material Selection */}
        <div>
          <label htmlFor="materialId" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Material:
          </label>
          <input
            id="materialId"
            type="text"
            placeholder="Select or enter material ID"
            value={store.materialId || ''}
            onChange={(e) => store.setInput('materialId', e.target.value)}
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        
        {/* Cut Type Selection */}
        <div>
          <label htmlFor="cutType" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Cut Type:
          </label>
          <select
            id="cutType"
            value={store.cutType || ''}
            onChange={(e) => store.setInput('cutType', e.target.value as CutType)}
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
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
        <div>
          <label htmlFor="aggressiveness" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Aggressiveness:
          </label>
          <input
            id="aggressiveness"
            type="number"
            min="0.1"
            max="3.0"
            step="0.1"
            placeholder="1.0"
            value={store.aggressiveness || ''}
            onChange={(e) => store.setInput('aggressiveness', parseFloat(e.target.value) || undefined)}
            style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <small style={{ color: '#666' }}>Range: 0.1 to 3.0 (1.0 = normal)</small>
        </div>
        
      </div>
      
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
          <div>
            <label htmlFor="user_doc_mm" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              DOC (mm):
            </label>
            <input
              id="user_doc_mm"
              type="number"
              min="0"
              step="0.1"
              placeholder="Auto"
              value={store.user_doc_mm || ''}
              onChange={(e) => store.setInput('user_doc_mm', parseFloat(e.target.value) || undefined)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          
          {/* User WOC */}
          <div>
            <label htmlFor="user_woc_mm" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              WOC (mm):
            </label>
            <input
              id="user_woc_mm"
              type="number"
              min="0"
              step="0.1"
              placeholder="Auto"
              value={store.user_woc_mm || ''}
              onChange={(e) => store.setInput('user_woc_mm', parseFloat(e.target.value) || undefined)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          
          {/* Override Flutes */}
          <div>
            <label htmlFor="override_flutes" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Flutes Override:
            </label>
            <input
              id="override_flutes"
              type="number"
              min="1"
              step="1"
              placeholder="Auto"
              value={store.override_flutes || ''}
              onChange={(e) => store.setInput('override_flutes', parseInt(e.target.value) || undefined)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          
          {/* Override Stickout */}
          <div>
            <label htmlFor="override_stickout_mm" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Stickout (mm):
            </label>
            <input
              id="override_stickout_mm"
              type="number"
              min="0"
              step="0.1"
              placeholder="Auto"
              value={store.override_stickout_mm || ''}
              onChange={(e) => store.setInput('override_stickout_mm', parseFloat(e.target.value) || undefined)}
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
          </div>
          
        </div>
      </details>
    </div>
  )
}