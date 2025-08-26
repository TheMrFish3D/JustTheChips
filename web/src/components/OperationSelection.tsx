import { useAppContext } from '../context/AppContext'
import type { OperationConfig } from '../data/calculations'

export default function OperationSelection() {
  const { state, setSelectedOperations } = useAppContext()
  const { selectedOperations } = state
  
  // Extract current finish setting from first operation, or default to roughing
  const currentFinish = selectedOperations.length > 0 ? selectedOperations[0].finish : 'roughing'
  
  // Extract current operation types
  const selectedOperationTypes = selectedOperations.map(op => op.type)

  const operations = [
    { id: 'slotting', name: 'Slotting', description: 'Full width cuts' },
    { id: 'facing', name: 'Facing', description: 'Surface facing operations' },
    { id: 'contour', name: 'Contour', description: 'Profile milling' },
    { id: 'adaptive', name: 'Adaptive', description: 'Adaptive clearing' },
    { id: 'pocketing', name: 'Pocketing', description: 'Pocket clearing' },
    { id: 'drilling', name: 'Drilling', description: 'Hole drilling' },
    { id: 'threading', name: 'Threading', description: 'Thread milling' }
  ]

  const toggleOperation = (operationId: string) => {
    const isValidOperationType = (id: string): id is OperationConfig['type'] => {
      return ['slotting', 'facing', 'contour', 'adaptive', 'pocketing', 'drilling', 'threading'].includes(id)
    }
    
    if (!isValidOperationType(operationId)) return
    
    const newOperationTypes = selectedOperationTypes.includes(operationId) 
      ? selectedOperationTypes.filter(id => id !== operationId)
      : [...selectedOperationTypes, operationId]
    
    // Update the operations list with the new types, maintaining current finish
    const newOperations = newOperationTypes.map(type => ({
      type: type as OperationConfig['type'],
      finish: currentFinish
    }))
    
    setSelectedOperations(newOperations)
  }

  const setTargetFinish = (finish: 'roughing' | 'finishing') => {
    // Update all operations with the new finish
    const newOperations = selectedOperationTypes.map(type => ({
      type: type as OperationConfig['type'],
      finish
    }))
    
    setSelectedOperations(newOperations)
  }

  return (
    <div className="card">
      <h2>Operation/Cut Type</h2>
      
      <h3>Operations</h3>
      <p>Select the operations you want to generate optimal cutting parameters for:</p>
      
      <div className="checkbox-group">
        {operations.map(operation => (
          <div key={operation.id} className="checkbox-item">
            <input
              type="checkbox"
              id={operation.id}
              checked={selectedOperationTypes.includes(operation.id as OperationConfig['type'])}
              onChange={() => toggleOperation(operation.id)}
            />
            <label htmlFor={operation.id} title={operation.description}>
              {operation.name}
            </label>
          </div>
        ))}
      </div>

      <h3>Target Finish</h3>
      <div className="form-group">
        <label>
          <input
            type="radio"
            name="targetFinish"
            value="roughing"
            checked={currentFinish === 'roughing'}
            onChange={(e) => setTargetFinish(e.target.value as 'roughing' | 'finishing')}
          />
          Roughing
        </label>
        <label>
          <input
            type="radio"
            name="targetFinish"
            value="finishing"
            checked={currentFinish === 'finishing'}
            onChange={(e) => setTargetFinish(e.target.value as 'roughing' | 'finishing')}
          />
          Finishing
        </label>
      </div>

      {selectedOperationTypes.length === 0 && (
        <div className="warning">
          Please select at least one operation to generate cutting parameters.
        </div>
      )}
    </div>
  )
}