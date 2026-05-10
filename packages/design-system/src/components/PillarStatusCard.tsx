type PillarStatus = 'idle' | 'running' | 'pending_info' | 'passed' | 'failed' | 'escalated'

interface PillarStatusCardProps {
  pillar: string
  label: string
  description?: string
  status: PillarStatus
  progress?: number
  eta?: string
  actionLabel?: string
  onAction?: () => void
}

const STATUS_LABELS: Record<PillarStatus, string> = {
  idle: 'Not started',
  running: 'In progress',
  pending_info: 'Action needed',
  passed: 'Verified',
  failed: 'Not passed',
  escalated: 'Under review',
}

export function PillarStatusCard({
  pillar,
  label,
  description,
  status,
  progress,
  eta,
  actionLabel,
  onAction,
}: PillarStatusCardProps) {
  return (
    <div className={`pillar-card pillar-card--${status}`}>
      <div className="pillar-card__header">
        <div>
          <div className="pillar-card__title">{label}</div>
          {description && <div className="pillar-card__desc">{description}</div>}
        </div>
        <div className="pillar-card__status-label">{STATUS_LABELS[status]}</div>
      </div>
      {typeof progress === 'number' && status === 'running' && (
        <div className="pillar-card__progress">
          <div className="pillar-card__progress-bar" style={{ width: `${progress}%` }} />
        </div>
      )}
      {eta && status === 'running' && (
        <div className="pillar-card__eta">Estimated: {eta}</div>
      )}
      {status === 'pending_info' && actionLabel && (
        <button className="btn btn-primary btn-sm pillar-card__action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}
