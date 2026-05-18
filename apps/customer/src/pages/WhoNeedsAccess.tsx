import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Button, Input, Spinner } from '@wio/design-system/src/components'
import { ApplicationLayout } from '../components'
import { useApplication } from '../hooks'
import type { Signatory } from '../store/types'

const KYI_STATUS_LABEL: Record<Signatory['kyiStatus'], string> = {
  pending: 'Not started',
  invited: 'Invite sent',
  in_progress: 'In progress',
  passed: 'Verified',
  failed: 'Failed',
}

const KYI_STATUS_COLOR: Record<Signatory['kyiStatus'], string> = {
  pending: 'var(--text-muted)',
  invited: 'var(--warning, #f59e0b)',
  in_progress: 'var(--info, #6366f1)',
  passed: 'var(--success)',
  failed: 'var(--danger)',
}

export function WhoNeedsAccess() {
  const { state, dispatch, goTo, handleSubmit } = useApplication()
  const { signatories, business, tier, submitting } = state

  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newNationality, setNewNationality] = useState('')

  // Tier 1 express: skip this step and submit directly
  useEffect(() => {
    if (tier === 'express' && !state.submitted && !submitting) {
      handleSubmit()
    }
  }, [tier])

  if (!business) { goTo('uae-pass'); return null }

  if (tier === 'express') {
    return (
      <div className="app-shell" style={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div className="orb orb--1" /><div className="orb orb--2" />
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Spinner size={48} label="Submitting your application…" />
        </div>
      </div>
    )
  }

  function inviteForKyi(id: string) {
    dispatch({ type: 'UPDATE_SIGNATORY_STATUS', id, status: 'invited' })
  }

  function addSignatory() {
    const name = newName.trim()
    if (!name) return
    dispatch({
      type: 'ADD_SIGNATORY',
      signatory: {
        id: `s-manual-${Date.now()}`,
        fullName: name,
        role: 'authorized_user',
        nationality: newNationality.trim(),
        kyiStatus: 'pending',
      },
    })
    setNewName('')
    setNewNationality('')
    setShowAddForm(false)
  }

  async function handleFormSubmit(e: FormEvent) {
    e.preventDefault()
    await handleSubmit()
  }

  const totalOwnership = signatories
    .filter(s => s.ownership != null)
    .reduce((sum, s) => sum + (s.ownership ?? 0), 0)

  return (
    <ApplicationLayout
      currentStep="who-needs-access"
      title="Who needs access?"
      subtitle="Review owners pre-filled from the registry and invite anyone who needs to verify their identity."
    >
      <form onSubmit={handleFormSubmit}>

        {/* Ownership bar */}
        {signatories.some(s => s.ownership != null) && (
          <div className="card" style={{ marginBottom: 16, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Ownership accounted for</span>
            <span style={{
              fontSize: 15, fontWeight: 600,
              color: totalOwnership === 100 ? 'var(--success)' : 'var(--warning, #f59e0b)',
            }}>
              {totalOwnership}%
            </span>
          </div>
        )}

        <div className="card" style={{ marginBottom: 24 }}>
          <h3 className="section-label" style={{ marginBottom: 16 }}>Owners &amp; signatories</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {signatories.map(s => (
              <div
                key={s.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface-2)',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: 'rgba(124,58,237,0.15)',
                  color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, flexShrink: 0,
                }}>
                  {s.fullName.charAt(0).toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{s.fullName}</span>
                    {s.ownership != null && (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--surface-3, rgba(255,255,255,0.05))', borderRadius: 6, padding: '1px 8px' }}>
                        {s.ownership}%
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {s.role.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    {s.nationality && (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.nationality}</span>
                    )}
                    <span style={{ fontSize: 12, color: KYI_STATUS_COLOR[s.kyiStatus] }}>
                      · KYI: {KYI_STATUS_LABEL[s.kyiStatus]}
                    </span>
                  </div>
                </div>

                {s.kyiStatus === 'pending' && (
                  <button
                    type="button"
                    onClick={() => inviteForKyi(s.id)}
                    style={{
                      fontSize: 12, fontWeight: 600, color: 'var(--primary)',
                      background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)',
                      borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
                      flexShrink: 0, whiteSpace: 'nowrap',
                    }}
                  >
                    Invite for KYI
                  </button>
                )}
                {s.kyiStatus === 'invited' && (
                  <span style={{ fontSize: 12, color: 'var(--warning, #f59e0b)', flexShrink: 0 }}>Invite sent</span>
                )}
              </div>
            ))}
          </div>

          {!showAddForm ? (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              style={{
                marginTop: 16, width: '100%', padding: '10px', borderRadius: 10,
                border: '1px dashed var(--border)', background: 'transparent',
                color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              + Add authorized user
            </button>
          ) : (
            <div style={{ marginTop: 16, padding: '14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface-2)' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                New person
              </h4>
              <div className="form-grid" style={{ marginBottom: 12 }}>
                <Input label="Full Name" value={newName} onChange={e => setNewName(e.target.value)} required />
                <Input label="Nationality" value={newNationality} onChange={e => setNewNationality(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <Button variant="ghost" type="button" onClick={() => setShowAddForm(false)}>Cancel</Button>
                <Button type="button" onClick={addSignatory} disabled={!newName.trim()}>Add</Button>
              </div>
            </div>
          )}
        </div>

        {state.error && (
          <div className="alert alert--danger" style={{ marginBottom: 16 }}>{state.error}</div>
        )}

        <div className="form-actions">
          <Button variant="ghost" type="button" onClick={() => goTo('business-questions')}>Back</Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit application'}
          </Button>
        </div>
      </form>
    </ApplicationLayout>
  )
}
