import { useState } from 'react'
import { Button, Badge } from '@wio/design-system/src/components'
import { ApplicationLayout } from '../components'
import { useApplication } from '../hooks'

export function ReviewSubmit() {
  const { state, goTo, handleSubmit } = useApplication()
  const [termsAccepted, setTermsAccepted] = useState(false)
  const { business, shareholders, documents, tier } = state

  if (!business) {
    goTo('start')
    return null
  }

  const TIER_VARIANT = { express: 'express', standard: 'standard', complex: 'complex' } as const

  return (
    <ApplicationLayout
      currentStep="review"
      title="Review & Submit"
      subtitle="Review your application before submitting. You can go back to make changes."
    >
      {/* Business summary */}
      <div className="review-panel" style={{ marginBottom: 16 }}>
        <div className="review-panel__header">
          <span>Business Details</span>
          <button className="btn btn-ghost btn-sm" onClick={() => goTo('license')}>Edit</button>
        </div>
        <div className="check-row">
          <span className="check-row__label">Trade Name</span>
          <span className="check-row__value">{business.tradeName}</span>
        </div>
        <div className="check-row">
          <span className="check-row__label">License Number</span>
          <span className="check-row__value">{business.licenseNumber}</span>
        </div>
        <div className="check-row">
          <span className="check-row__label">Legal Type</span>
          <span className="check-row__value">{business.legalType}</span>
        </div>
        <div className="check-row">
          <span className="check-row__label">Licensing Authority</span>
          <span className="check-row__value">{business.licensingAuthority}</span>
        </div>
        <div className="check-row">
          <span className="check-row__label">Activities</span>
          <span className="check-row__value">{business.commercialActivities[0]}{business.commercialActivities.length > 1 ? ` +${business.commercialActivities.length - 1}` : ''}</span>
        </div>
        {tier && (
          <div className="check-row">
            <span className="check-row__label">Application Tier</span>
            <Badge variant={TIER_VARIANT[tier]}>{tier.charAt(0).toUpperCase() + tier.slice(1)}</Badge>
          </div>
        )}
      </div>

      {/* Shareholders summary */}
      <div className="review-panel" style={{ marginBottom: 16 }}>
        <div className="review-panel__header">
          <span>Shareholders & Signatories ({shareholders.length})</span>
          <button className="btn btn-ghost btn-sm" onClick={() => goTo('ownership')}>Edit</button>
        </div>
        {shareholders.map(person => (
          <div key={person.id} className="check-row">
            <span className="check-row__label">{person.fullName}</span>
            <span className="check-row__value" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {person.role.replace('_', ' ')}
              <Badge variant={person.kycStatus === 'passed' ? 'success' : person.kycStatus === 'invited' ? 'info' : 'default'}>
                {person.kycStatus === 'passed' ? 'Verified' : person.kycStatus === 'invited' ? 'Invited' : 'Pending'}
              </Badge>
            </span>
          </div>
        ))}
      </div>

      {/* Documents summary */}
      <div className="review-panel" style={{ marginBottom: 24 }}>
        <div className="review-panel__header">
          <span>Documents ({documents.filter(d => d.status === 'uploaded' || d.status === 'verified').length}/{documents.length} uploaded)</span>
          <button className="btn btn-ghost btn-sm" onClick={() => goTo('documents')}>Edit</button>
        </div>
        {documents.map(doc => (
          <div key={doc.id} className="check-row">
            <span className="check-row__label">
              {doc.name}
              {doc.required && <span style={{ color: 'var(--danger)', marginLeft: 4 }}>*</span>}
            </span>
            <Badge
              variant={doc.status === 'verified' ? 'success' : doc.status === 'uploaded' ? 'info' : doc.status === 'pending' ? 'default' : 'danger'}
            >
              {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
            </Badge>
          </div>
        ))}
      </div>

      {/* Terms */}
      <div className="card" style={{ marginBottom: 24 }}>
        <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={e => setTermsAccepted(e.target.checked)}
            style={{ marginTop: 3, accentColor: 'var(--primary)', width: 16, height: 16, flexShrink: 0 }}
          />
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            I confirm the information provided is accurate and complete. I authorise Wio Bank to verify the details provided and to conduct the required KYB/KYC checks in accordance with UAE Central Bank regulations.
          </span>
        </label>
      </div>

      {state.error && (
        <div className="card" style={{ marginBottom: 16, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <p style={{ margin: 0, color: 'var(--danger)', fontSize: 13 }}>{state.error}</p>
        </div>
      )}

      <div className="form-actions">
        <Button variant="ghost" onClick={() => goTo('documents')}>Back</Button>
        <Button
          onClick={handleSubmit}
          disabled={!termsAccepted || state.submitting}
          loading={state.submitting}
        >
          Submit Application
        </Button>
      </div>
    </ApplicationLayout>
  )
}
