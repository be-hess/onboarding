interface SpinnerProps {
  size?: number
  label?: string
}

export function Spinner({ size = 32, label }: SpinnerProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }} role="status">
      <div
        className="spinner"
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
      {label && <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{label}</span>}
    </div>
  )
}
