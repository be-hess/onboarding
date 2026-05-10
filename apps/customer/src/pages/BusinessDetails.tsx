import type { FormEvent } from 'react'
import { Input, Select, Badge, Button } from '@wio/design-system/src/components'
import { ApplicationLayout } from '../components'
import { useApplication } from '../hooks'

const MONTHLY_TURNOVER_OPTIONS = [
  { value: 'under_50k', label: 'Under AED 50,000' },
  { value: '50k_250k', label: 'AED 50,000 – 250,000' },
  { value: '250k_1m', label: 'AED 250,000 – 1,000,000' },
  { value: '1m_5m', label: 'AED 1,000,000 – 5,000,000' },
  { value: 'over_5m', label: 'Over AED 5,000,000' },
]

const COUNTERPARTY_OPTIONS = [
  { value: 'local_only', label: 'UAE only' },
  { value: 'gcc', label: 'UAE + GCC' },
  { value: 'mena', label: 'UAE + MENA' },
  { value: 'international', label: 'International (incl. high-risk jurisdictions)' },
]

const TIER_LABELS = {
  express: { label: 'Express', variant: 'express' as const, eta: 'Typically under 1 hour' },
  standard: { label: 'Standard', variant: 'standard' as const, eta: 'Typically under 24 hours' },
  complex: { label: 'Complex', variant: 'complex' as const, eta: 'Typically under 72 hours' },
}

export function BusinessDetails() {
  const { state, dispatch, goTo } = useApplication()
  const { business, tier } = state

  if (!business) {
    goTo('start')
    return null
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    goTo('shareholders')
  }

  const tierInfo = tier ? TIER_LABELS[tier] : null

  return (
    <ApplicationLayout currentStep="business" title="Business Details" subtitle="We've pre-filled what we found on your Trade License. Review and correct anything that's wrong.">
      <form onSubmit={handleSubmit}>
        {tierInfo && (
          <div className="card" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Badge variant={tierInfo.variant}>{tierInfo.label}</Badge>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Application tier assigned</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{tierInfo.eta}</div>
            </div>
          </div>
        )}

        <div className="card" style={{ marginBottom: 20 }}>
          <h3 className="section-label">Extracted from Trade License</h3>
          <div className="form-grid">
            <Input
              label="Trade Name"
              extracted
              value={business.tradeName}
              onChange={e => dispatch({ type: 'UPDATE_BUSINESS_FIELD', field: 'tradeName', value: e.target.value })}
              required
            />
            <Input
              label="Legal Name"
              extracted
              value={business.legalName}
              onChange={e => dispatch({ type: 'UPDATE_BUSINESS_FIELD', field: 'legalName', value: e.target.value })}
              required
            />
            <Input
              label="License Number"
              extracted
              value={business.licenseNumber}
              onChange={e => dispatch({ type: 'UPDATE_BUSINESS_FIELD', field: 'licenseNumber', value: e.target.value })}
              required
            />
            <Input
              label="License Expiry"
              extracted
              type="date"
              value={business.licenseExpiry}
              onChange={e => dispatch({ type: 'UPDATE_BUSINESS_FIELD', field: 'licenseExpiry', value: e.target.value })}
              required
            />
            <Input
              label="Entity Type"
              extracted
              value={business.entityType}
              onChange={e => dispatch({ type: 'UPDATE_BUSINESS_FIELD', field: 'entityType', value: e.target.value })}
              required
            />
            <Input
              label="Jurisdiction"
              extracted
              value={business.jurisdiction}
              onChange={e => dispatch({ type: 'UPDATE_BUSINESS_FIELD', field: 'jurisdiction', value: e.target.value })}
              required
            />
            <Input
              label="Primary Activity"
              extracted
              value={business.primaryActivity}
              onChange={e => dispatch({ type: 'UPDATE_BUSINESS_FIELD', field: 'primaryActivity', value: e.target.value })}
              required
            />
            <Input
              label="Registered Address"
              extracted
              value={business.registeredAddress}
              onChange={e => dispatch({ type: 'UPDATE_BUSINESS_FIELD', field: 'registeredAddress', value: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <h3 className="section-label">A few quick questions</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
            These help us set up the right account features for your business.
          </p>
          <div className="form-grid">
            <Input
              label="Describe your main business activities"
              placeholder="e.g. Importing consumer electronics from Asia for resale in UAE"
              value={state.expectedActivities}
              onChange={e => dispatch({ type: 'UPDATE_ACTIVITY_QUESTIONS', field: 'expectedActivities', value: e.target.value })}
              helper="Be specific — vague descriptions may delay your application"
              required
            />
            <Select
              label="Expected monthly turnover"
              options={MONTHLY_TURNOVER_OPTIONS}
              placeholder="Select range"
              value={state.expectedMonthlyTurnover}
              onChange={e => dispatch({ type: 'UPDATE_ACTIVITY_QUESTIONS', field: 'expectedMonthlyTurnover', value: e.target.value })}
              required
            />
            <Select
              label="Where will you transact?"
              options={COUNTERPARTY_OPTIONS}
              placeholder="Select regions"
              value={state.expectedCounterparties}
              onChange={e => dispatch({ type: 'UPDATE_ACTIVITY_QUESTIONS', field: 'expectedCounterparties', value: e.target.value })}
              helper="Select the broadest region that applies"
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <Button variant="ghost" type="button" onClick={() => goTo('start')}>Back</Button>
          <Button type="submit">Continue to Shareholders</Button>
        </div>
      </form>
    </ApplicationLayout>
  )
}
