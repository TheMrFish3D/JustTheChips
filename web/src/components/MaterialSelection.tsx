import { useAppContext } from '../hooks/useAppContext'

export default function MaterialSelection() {
  const { state, setSelectedMaterials } = useAppContext()
  const { selectedMaterials } = state

  const materials = [
    { id: 'hardwood', name: 'Hardwood', category: 'Wood' },
    { id: 'softwood', name: 'Softwood', category: 'Wood' },
    { id: 'plywood', name: 'Plywood', category: 'Wood' },
    { id: 'mdf', name: 'MDF', category: 'Wood' },
    { id: 'acrylic', name: 'Acrylic', category: 'Plastic' },
    { id: 'delrin', name: 'Delrin (POM)', category: 'Plastic' },
    { id: 'nylon', name: 'Nylon', category: 'Plastic' },
    { id: 'aluminum-6061', name: 'Aluminum 6061', category: 'Aluminum' },
    { id: 'aluminum-7075', name: 'Aluminum 7075', category: 'Aluminum' },
    { id: 'aluminum-2024', name: 'Aluminum 2024', category: 'Aluminum' },
    { id: 'mild-steel', name: 'Mild Steel', category: 'Steel' },
    { id: 'stainless-304', name: 'Stainless Steel 304', category: 'Steel' },
    { id: 'stainless-316', name: 'Stainless Steel 316', category: 'Steel' },
    { id: 'brass', name: 'Brass', category: 'Copper Alloy' },
    { id: 'copper', name: 'Copper', category: 'Copper Alloy' }
  ]

  const toggleMaterial = (materialId: string) => {
    const newMaterials = selectedMaterials.includes(materialId) 
      ? selectedMaterials.filter(id => id !== materialId)
      : [...selectedMaterials, materialId]
    setSelectedMaterials(newMaterials)
  }

  const groupedMaterials = materials.reduce((acc, material) => {
    if (!acc[material.category]) {
      acc[material.category] = []
    }
    acc[material.category].push(material)
    return acc
  }, {} as Record<string, typeof materials>)

  return (
    <div className="card">
      <h2>Material Selection</h2>
      <p>Select materials to generate cutting parameters for:</p>
      
      {Object.entries(groupedMaterials).map(([category, categoryMaterials]) => (
        <div key={category}>
          <h3>{category}</h3>
          <div className="checkbox-group">
            {categoryMaterials.map(material => (
              <div key={material.id} className="checkbox-item">
                <input
                  type="checkbox"
                  id={material.id}
                  checked={selectedMaterials.includes(material.id)}
                  onChange={() => toggleMaterial(material.id)}
                />
                <label htmlFor={material.id}>{material.name}</label>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {selectedMaterials.length === 0 && (
        <div className="warning">
          Please select at least one material to generate cutting parameters.
        </div>
      )}
    </div>
  )
}