import type { SelectHTMLAttributes } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helper?: string
  options: SelectOption[]
  placeholder?: string
}

export function Select({
  label,
  error,
  helper,
  options,
  placeholder,
  id,
  className = '',
  ...props
}: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="input-group">
      {label && (
        <label className="input-label" htmlFor={selectId}>{label}</label>
      )}
      <select
        id={selectId}
        className={`input select ${error ? 'input--error' : ''} ${className}`}
        aria-invalid={!!error}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="input-error">{error}</p>}
      {helper && !error && <p className="input-helper">{helper}</p>}
    </div>
  )
}
