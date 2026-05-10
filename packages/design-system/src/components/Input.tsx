import type { InputHTMLAttributes, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
  extracted?: boolean
  suffix?: ReactNode
}

export function Input({
  label,
  error,
  helper,
  extracted = false,
  suffix,
  id,
  className = '',
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="input-group">
      {label && (
        <label className="input-label" htmlFor={inputId}>
          {label}
          {extracted && <span className="badge badge--extracted" style={{ marginLeft: 6, fontSize: 10 }}>AI extracted</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <input
          id={inputId}
          className={`input ${error ? 'input--error' : ''} ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helper ? `${inputId}-helper` : undefined}
          {...props}
        />
        {suffix && (
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="input-error">{error}</p>
      )}
      {helper && !error && (
        <p id={`${inputId}-helper`} className="input-helper">{helper}</p>
      )}
    </div>
  )
}
