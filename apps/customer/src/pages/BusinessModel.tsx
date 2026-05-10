import { useEffect, useState } from 'react'
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

export function BusinessModel() {
  const { state, dispatch, goTo, loadBusinessModelSummary } = useApplication()
  const { business, businessModelSummary, businessModelLoading, expectedMonthlyTurnover, countriesOfOperation } = state

  const [editing, setEditing] = useState(false)
  const [editedSummary, setEditedSummary] = useState('')

  useEffect(() => {
    loadBusinessModelSummary()
  }, [])

  if (!business) { goTo('start'); return null }

  function startEdit() {
    setEditedSummary(businessModelSummary ?? '')
    setEditing(true)
  }

  function saveEdit() {
    const trimmed = editedSummary.trim()
    if (trimmed) {
      dispatch({ type: 'UPDATE_BUSINESS_MODEL_SUMMARY', summary: trimmed })
    }
    setEditing(false)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    goTo('documents')
  }

  return (
    <ApplicationLayout
      currentStep="business-model"
      title="Business Model"
      subtitle="We've summarised your business based on your documents and activities."
    >
      <form onSubmit={handleSubmit}>

        {/* AI summary card */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 className="section-label" style={{ margin: 0 }}>Business summary</h3>
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--primary)',
              background: 'rgba(124,58,237,0.1)',
              borderRadius: 6,
              padding: '3px 8px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              AI generated
            </span>
          </div>

          {businessModelLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 0', color: 'var(--text-muted)', fontSize: 14 }}>
              <Spinner size={20} />
              <span>Analysing your documents and activities…</span>
            </div>
          ) : editing ? (
            <div>
              <textarea
                autoFocus
                value={editedSummary}
                onChange={e => setEditedSummary(e.target.value)}
                rows={6}
                style={{
                  width: '100%',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--primary)',
                  borderRadius: 10,
                  color: 'var(--text)',
                  fontSize: 14,
                  lineHeight: 1.7,
                  padding: '12px 14px',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                <Button variant="ghost" type="button" onClick={() => setEditing(false)}>Cancel</Button>
                <Button type="button" onClick={saveEdit}>Save</Button>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ margin: '0 0 14px', fontSize: 14, color: 'var(--text)', lineHeight: 1.7 }}>
                {businessModelSummary}
              </p>
              <button
                type="button"
                onClick={startEdit}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  fontSize: 13,
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                Edit summary
              </button>
            </div>
          )}
        </div>

        {/* Financial profile */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 className="section-label" style={{ marginBottom: 16 }}>Financial profile</h3>
          <div className="form-grid">

            {/* Turnover select */}
            <div className="form-group">
              <label className="form-label">Expected monthly turnover</label>
              <div className="select-wrapper">
                <select
                  className="select"
                  value={expectedMonthlyTurnover}
                  onChange={e => dispatch({ type: 'UPDATE_TURNOVER', value: e.target.value })}
                  required
                >
                  {TURNOVER_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Countries of operation */}
            <div className="form-group">
              <label className="form-label">Countries of doing business</label>
              <input
                className="input"
                type="text"
                placeholder="e.g. UAE, Saudi Arabia, India"
                value={countriesOfOperation}
                onChange={e => dispatch({ type: 'UPDATE_COUNTRIES', value: e.target.value })}
                required
              />
              <span className="input-helper">List the countries you transact with or operate in</span>
            </div>

          </div>
        </div>

        <div className="form-actions">
          <Button variant="ghost" type="button" onClick={() => goTo('ownership')}>Back</Button>
          <Button
            type="submit"
            disabled={businessModelLoading || !businessModelSummary || !expectedMonthlyTurnover || !countriesOfOperation.trim()}
          >
            Continue
          </Button>
        </div>
      </form>
    </ApplicationLayout>
  )
}
