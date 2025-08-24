import type React from 'react'

interface NumericInputWithUnitsProps {
  id: string
  label: string
  value?: number | string
  unit?: string
  min?: number
  max?: number
  step?: number
  placeholder?: string
  onChange: (value: number | undefined) => void
  error?: string
  warning?: string
  required?: boolean
  ariaDescribedBy?: string
}

export function NumericInputWithUnits({
  id,
  label,
  value = '',
  unit,
  min,
  max,
  step = 0.1,
  placeholder,
  onChange,
  error,
  warning,
  required = false,
  ariaDescribedBy
}: NumericInputWithUnitsProps) {
  const errorId = error ? `${id}-error` : undefined
  const warningId = warning ? `${id}-warning` : undefined
  const unitId = unit ? `${id}-unit` : undefined
  const describedBy = [ariaDescribedBy, unitId, warningId, errorId].filter(Boolean).join(' ') || undefined

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    if (inputValue === '') {
      onChange(undefined)
    } else {
      const numValue = parseFloat(inputValue)
      if (!isNaN(numValue)) {
        onChange(numValue)
      }
    }
  }

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
        {unit && <span style={{ fontWeight: 'normal', color: '#666' }}> ({unit})</span>}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          type="number"
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          required={required}
          aria-describedby={describedBy}
          aria-invalid={error ? 'true' : 'false'}
          style={{
            width: '100%',
            padding: '8px',
            paddingRight: unit ? '40px' : '8px',
            border: `1px solid ${error ? '#dc2626' : warning ? '#f59e0b' : '#ddd'}`,
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
        {unit && (
          <span 
            id={unitId}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#666',
              fontSize: '12px',
              pointerEvents: 'none'
            }}
            aria-hidden="true"
          >
            {unit}
          </span>
        )}
      </div>
      {warning && !error && (
        <div 
          id={warningId}
          role="alert"
          style={{ 
            marginTop: '4px', 
            fontSize: '12px', 
            color: '#f59e0b' 
          }}
        >
          ⚠️ {warning}
        </div>
      )}
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
      {min !== undefined && max !== undefined && (
        <small style={{ color: '#666', fontSize: '11px' }}>
          Range: {min} to {max}
        </small>
      )}
    </div>
  )
}