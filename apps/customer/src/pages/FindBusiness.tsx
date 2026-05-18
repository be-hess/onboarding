import { useState } from 'react'
import { Button, Spinner, Badge } from '@wio/design-system/src/components'
import { ApplicationLayout } from '../components'
import { useApplication } from '../hooks'

const LOAD_PHASES = [
  'Looking up trade license…',
  'Pulling registry data…',
  'Running pre-screen…',
]

export function FindBusiness() {
  const { state, dispatch, goTo, handlePreScreen } = useApplication()
  const { preScreenResult, preScreenLoading, business, tier, eddTriggered } = state

  const [licenseInput, setLicenseInput] = useState(state.licenseNumber || '')
  const [showResult, setShowResult] = useState(!!preScreenResult)
  const [phaseLabel, setPhaseLabel] = useState(LOAD_PHASES[0])

  async function lookup() {
    if (!licenseInput.trim()) return
    setPhaseLabel(LOAD_PHASES[0])
    const t1 = setTimeout(() => setPhaseLabel(LOAD_PHASES[1]), 700)
    const t2 = setTimeout(() => setPhaseLabel(LOAD_PHASES[2]), 1500)
    await handlePreScreen(licenseInput.trim())
    clearTimeout(t1)
    clearTimeout(t2)
    setShowResult(true)
  }

  if (preScreenLoading) {
    return (
      <div className="app-shell" style={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div className="orb orb--1" /><div className="orb orb--2" />
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Spinner size={48} label={phaseLabel} />
        </div>
      </div>
    )
  }

  return (
    <ApplicationLayout
      currentStep="find-business"
      title="Find your business"
      subtitle="Enter your trade license number and we'll pull your details from the registry."
    >
      {/* License input */}
      {!showResult && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Trade License Number</label>
            <input
              className="input"
              type="text"
              placeholder="e.g. DET-2024-087234 or ADDED-2024-091234"
              value={licenseInput}
              onChange={e => setLicenseInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') lookup() }}
              autoFocus
            />
            <span className="input-helper">Issued by DET, TAMM/ADDED, ADGM, DIFC, DMCC or other UAE authorities</span>
          </div>

          {state.error && (
            <div className="alert alert--danger" style={{ marginBottom: 12 }}>{state.error}</div>
          )}

          <Button onClick={lookup} disabled={!licenseInput.trim()} style={{ width: '100%' }}>
            Look up license
          </Button>
        </div>
      )}

      {/* Pre-screen result */}
      {showResult && preScreenResult && business && tier && (
        <>
          {/* Tier + timing */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Badge variant={tier as 'express' | 'standard' | 'complex'}>
                {tier.charAt(0).toUpperCase() + tier.slice(1)}
              </Badge>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {tier === 'express' ? 'Under 1 hour' : tier === 'standard' ? 'Under 24 hours' : 'Under 72 hours'}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {tier === 'express'
                ? 'Sole establishment — your application is fully automated. No manual review needed if all checks pass.'
                : tier === 'standard'
                ? 'Automated checks with a specialist review of your ownership structure.'
                : 'Your structure requires a specialist compliance review. We\'ll keep you updated.'}
            </p>
          </div>

          {/* Registry data */}
          <div className="card" style={{ marginBottom: eddTriggered ? 16 : 24 }}>
            <h3 className="section-label" style={{ marginBottom: 14 }}>Registry data</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Trade name', value: business.tradeName },
                { label: 'Legal type', value: business.legalType },
                { label: 'Licensing authority', value: business.licensingAuthority },
                { label: 'License number', value: business.licenseNumber },
                { label: 'Expiry', value: business.licenseExpiry },
                { label: 'Registered address', value: business.registeredAddress },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{label}</span>
                  <span style={{ color: 'var(--text)', textAlign: 'right' }}>{value}</span>
                </div>
              ))}
            </div>

            {business.owners.length > 0 && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-subtle)' }}>
                  Owners
                </p>
                {business.owners.map((owner, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text)' }}>{owner.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{owner.ownership}% · {owner.nationality}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* EDD disclosure */}
          {eddTriggered && (
            <div className="alert alert--warning" style={{ marginBottom: 24 }}>
              <strong>Enhanced Due Diligence required</strong>
              <p style={{ margin: '4px 0 0', fontSize: 13 }}>
                Your sector requires additional questions. These will appear in the next step.
              </p>
            </div>
          )}

          <div className="form-actions">
            <Button variant="ghost" type="button" onClick={() => {
              setShowResult(false)
              dispatch({ type: 'SET_LICENSE_NUMBER', value: '' })
              setLicenseInput('')
            }}>
              ← Different license
            </Button>
            <Button
              onClick={() => goTo('business-questions')}
              disabled={preScreenResult === 'cannot_proceed'}
            >
              {preScreenResult === 'cannot_proceed' ? 'Cannot proceed' : 'Confirm & continue'}
            </Button>
          </div>
        </>
      )}
    </ApplicationLayout>
  )
}
