import { Badge } from './Badge'
import { Button } from './Button'

type DocStatus = 'pending' | 'uploading' | 'uploaded' | 'verified' | 'rejected'

interface DocumentUploadCardProps {
  name: string
  description?: string
  required?: boolean
  status: DocStatus
  fileName?: string
  onUpload?: () => void
  onRemove?: () => void
}

const STATUS_LABELS: Record<DocStatus, string> = {
  pending: 'Required',
  uploading: 'Uploading…',
  uploaded: 'Uploaded',
  verified: 'Verified',
  rejected: 'Rejected',
}

const STATUS_BADGE: Record<DocStatus, 'default' | 'info' | 'success' | 'danger' | 'warning'> = {
  pending: 'default',
  uploading: 'info',
  uploaded: 'info',
  verified: 'success',
  rejected: 'danger',
}

export function DocumentUploadCard({
  name,
  description,
  required = false,
  status,
  fileName,
  onUpload,
  onRemove,
}: DocumentUploadCardProps) {
  return (
    <div className="doc-card">
      <div className="doc-card__icon">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M5 3h7l4 4v10a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M12 3v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="doc-card__body">
        <div className="doc-card__name">
          {name}
          {required && <span style={{ color: 'var(--danger)', marginLeft: 4 }}>*</span>}
        </div>
        {description && <div className="doc-card__meta">{description}</div>}
        {fileName && <div className="doc-card__meta" style={{ color: 'var(--text-secondary)' }}>{fileName}</div>}
      </div>
      <div className="doc-card__actions">
        <Badge variant={STATUS_BADGE[status]}>{STATUS_LABELS[status]}</Badge>
        {(status === 'pending' || status === 'rejected') && (
          <Button variant="secondary" size="sm" onClick={onUpload} style={{ marginLeft: 8 }}>
            Upload
          </Button>
        )}
        {status === 'uploaded' && onRemove && (
          <Button variant="ghost" size="sm" onClick={onRemove} style={{ marginLeft: 8 }}>
            Remove
          </Button>
        )}
      </div>
    </div>
  )
}
