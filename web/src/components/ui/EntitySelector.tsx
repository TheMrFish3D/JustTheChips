
interface EntityOption {
  id: string
  label: string
  description?: string
}

interface EntitySelectorProps {
  id: string
  label: string
  value?: string
  options: EntityOption[]
  placeholder?: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  ariaDescribedBy?: string
}

export function EntitySelector({
  id,
  label,
  value = '',
  options,
  placeholder = 'Select an option',
  onChange,
  error,
  required = false,
  ariaDescribedBy
}: EntitySelectorProps) {
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [ariaDescribedBy, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div>
      <label 
        htmlFor={id} 
        style={{ 
          display: 'block', 
          marginBottom: '4px', 
          fontWeight: 'bold',
          color: error ? '#dc2626' : 'inherit'
        }}
      >
        {label}
        {required && <span aria-label="required" style={{ color: '#dc2626' }}>*</span>}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        aria-describedby={describedBy}
        aria-invalid={error ? 'true' : 'false'}
        style={{
          width: '100%',
          padding: '8px',
          border: `1px solid ${error ? '#dc2626' : '#ddd'}`,
          borderRadius: '4px',
          backgroundColor: 'white',
          fontSize: '14px',
          cursor: 'pointer'
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id} title={option.description}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <div 
          id={errorId}
          role="alert"
          style={{ 
            marginTop: '4px', 
            fontSize: '12px', 
            color: '#dc2626' 
          }}
        >
          {error}
        </div>
      )}
    </div>
  )
}