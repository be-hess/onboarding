import type { FormEvent } from 'react'
import { Input, Badge, Button } from '@wio/design-system/src/components'
import { ApplicationLayout } from '../components'
import { useApplication } from '../hooks'
import type { EditableBusinessField } from '../store/types'

const TIER_CONFIG = {
  express: {
    variant: 'express' as const,
    label: 'Express',
    eta: 'Under 1 hour',
    description: 'Your application is fully automated. No manual review needed if all checks pass.',
  },
  standard: {
    variant: 'standard' as const,
    label: 'Standard',
    eta: 'Under 24 hours',
    description: 'Automated checks with a specialist review of your documents.',
  },
  complex: {
    variant: 'complex' as const,
    label: 'Complex review',
    eta: 'Under 72 hours',
    description: 'Your structure requires a specialist review. We\'ll keep you updated.',
  },
}

export function LicenseDetails() {
  const { state, dispatch, goTo } = useApplication()
  const { business, tier } = state

  if (!business) { goTo('start'); return null }

  function field(f: EditableBusinessField) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      dispatch({ type: 'UPDATE_BUSINESS_FIELD', field: f, value: e.target.value })
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    goTo('activities')
  }

  const tierInfo = tier ? TIER_CONFIG[tier] : null

  return (
    <ApplicationLayout currentStep="license" title="License Details" subtitle="Confirm the details we extracted from your document.">
      <form onSubmit={handleSubmit}>

        {/* Tier tile */}
        {tierInfo && (
          <div className="card" style={{ marginBottom: 20, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Badge variant={tierInfo.variant}>{tierInfo.label}</Badge>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{tierInfo.eta}</span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {tierInfo.description}
              </p>
            </div>
          </div>
        )}

        {/* License fields */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 className="section-label" style={{ marginBottom: 16 }}>Extracted from your document</h3>
          <div className="form-grid">
            <Input
              label="Trade Name / Company Name"
              extracted
              value={business.tradeName}
              onChange={field('tradeName')}
              required
            />
            <Input
              label="Legal Type / Form"
              extracted
              value={business.legalType}
              onChange={field('legalType')}
              required
            />
            <Input
              label="Licensing Authority"
              extracted
              value={business.licensingAuthority}
              onChange={field('licensingAuthority')}
              required
              helper="e.g. DET, ADGM, DIFC, MOEC, twofour54"
            />
            <Input
              label="License Number"
              extracted
              value={business.licenseNumber}
              onChange={field('licenseNumber')}
              required
            />
            <Input
              label="Issue Date"
              extracted
              type="date"
              value={business.issueDate}
              onChange={field('issueDate')}
              required
            />
            <Input
              label="Expiry Date"
              extracted
              type="date"
              value={business.licenseExpiry}
              onChange={field('licenseExpiry')}
              required
            />
            <div style={{ gridColumn: '1 / -1' }}>
              <Input
                label="Registered Address"
                extracted
                value={business.registeredAddress}
                onChange={field('registeredAddress')}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <Button variant="ghost" type="button" onClick={() => goTo('start')}>Back</Button>
          <Button type="submit">Confirm & Continue</Button>
        </div>
      </form>
    </ApplicationLayout>
  )
}
