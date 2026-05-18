import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button, Spinner } from '@wio/design-system/src/components'
import { ApplicationLayout } from '../components'
import { useApplication } from '../hooks'

const TURNOVER_OPTIONS = [
  { value: '', label: 'Select range…' },
  { value: 'under_50k', label: 'Under AED 50,000' },
  { value: '50k_200k', label: 'AED 50,000 – 200,000' },
  { value: '200k_500k', label: 'AED 200,000 – 500,000' },
  { value: '500k_1m', label: 'AED 500,000 – 1,000,000' },
  { value: 'over_1m', label: 'Over AED 1,000,000' },
]

const SOURCE_OPTIONS = [
  { value: '', label: 'Select source…' },
  { value: 'revenue', label: 'Business revenue' },
  { value: 'investment', label: 'Investment / capital' },
  { value: 'loan', label: 'Bank loan / financing' },
  { value: 'personal', label: 'Personal savings' },
  { value: 'grant', label: 'Government grant' },
]

const CRAM_CONFIG = {
  low: { color: 'var(--success)', label: 'Low risk', description: 'Standard automated onboarding applies.' },
  medium: { color: 'var(--warning, #f59e0b)', label: 'Medium risk', description: 'A specialist will review your application alongside the automated checks.' },
  high: { color: 'var(--danger)', label: 'High risk', description: 'Enhanced Due Diligence applies. A case officer will be assigned.' },
}

export function BusinessQuestions() {
  const { state, dispatch, goTo, handleCramCompute } = useApplication()
  const { primaryActivity, expectedMonthlyTurnover, sourceOfFunds, cramScore, eddTriggered, business } = state
  const [computing, setComputing] = useState(false)
  const [cramDone, setCramDone] = useState(!!cramScore)

  if (!business) { goTo('uae-pass'); return null }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (cramDone) {
      goTo('who-needs-access')
      return
    }
    setComputing(true)
    const result = await handleCramCompute()
    setComputing(false)
    if (result) setCramDone(true)
  }

  const canProceed = !!primaryActivity.trim() && !!expectedMonthlyTurnover && !!sourceOfFunds
  const cramInfo = cramScore ? CRAM_CONFIG[cramScore] : null

  return (
    <ApplicationLayout
      currentStep="business-questions"
      title="Business questions"
      subtitle="Three quick questions to personalise your account and complete your risk profile."
    >
      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: 20 }}>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">
              Primary business activity <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              className="input"
              type="text"
              placeholder="e.g. General Trading"
              value={primaryActivity}
              onChange={e => dispatch({ type: 'UPDATE_PRIMARY_ACTIVITY', value: e.target.value })}
              required
              disabled={cramDone}
            />
            <span className="input-helper">Pre-filled from your registry data — edit if needed</span>
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">
              Expected monthly turnover <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <div className="select-wrapper">
              <select
                className="select"
                value={expectedMonthlyTurnover}
                onChange={e => dispatch({ type: 'UPDATE_TURNOVER', value: e.target.value })}
                required
                disabled={cramDone}
              >
                {TURNOVER_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Primary source of funds <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <div className="select-wrapper">
              <select
                className="select"
                value={sourceOfFunds}
                onChange={e => dispatch({ type: 'UPDATE_SOURCE_OF_FUNDS', value: e.target.value })}
                required
                disabled={cramDone}
              >
                {SOURCE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* CRAM result */}
        {cramDone && cramInfo && (
          <div className="card slide-up" style={{ marginBottom: 20, borderLeft: `3px solid ${cramInfo.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: cramInfo.color }}>
                {cramInfo.label}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {cramInfo.description}
            </p>
            {eddTriggered && (
              <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--warning, #f59e0b)', lineHeight: 1.6 }}>
                Your sector triggers Enhanced Due Diligence. A case officer may send additional questions after submission.
              </p>
            )}
          </div>
        )}

        {state.error && (
          <div className="alert alert--danger" style={{ marginBottom: 16 }}>{state.error}</div>
        )}

        <div className="form-actions">
          <Button variant="ghost" type="button" onClick={() => goTo('find-business')}>Back</Button>
          <Button type="submit" disabled={!canProceed || computing}>
            {computing ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Spinner size={16} /> Assessing risk…
              </span>
            ) : cramDone ? 'Continue' : 'Assess & continue'}
          </Button>
        </div>
      </form>
    </ApplicationLayout>
  )
}
