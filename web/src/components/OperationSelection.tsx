import { useState } from 'react'

export default function OperationSelection() {
  const [selectedOperations, setSelectedOperations] = useState<string[]>(['slotting'])
  const [targetFinish, setTargetFinish] = useState<'roughing' | 'finishing'>('roughing')

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
    setSelectedOperations(prev => 
      prev.includes(operationId) 
        ? prev.filter(id => id !== operationId)
        : [...prev, operationId]
    )
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
              checked={selectedOperations.includes(operation.id)}
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
            checked={targetFinish === 'roughing'}
            onChange={(e) => setTargetFinish(e.target.value as 'roughing' | 'finishing')}
          />
          Roughing
        </label>
        <label>
          <input
            type="radio"
            name="targetFinish"
            value="finishing"
            checked={targetFinish === 'finishing'}
            onChange={(e) => setTargetFinish(e.target.value as 'roughing' | 'finishing')}
          />
          Finishing
        </label>
      </div>

      {selectedOperations.length === 0 && (
        <div className="warning">
          Please select at least one operation to generate cutting parameters.
        </div>
      )}
    </div>
  )
}