import { useState } from 'react'
import { Button, Badge, Input } from '@wio/design-system/src/components'
import { ApplicationLayout } from '../components'
import { useApplication } from '../hooks'
import type { Shareholder } from '../store/types'

const KYC_STATUS_LABEL: Record<Shareholder['kycStatus'], string> = {
  pending: 'Pending invite',
  invited: 'Invite sent',
  in_progress: 'In progress',
  passed: 'Verified',
  failed: 'Failed',
}

const KYC_STATUS_BADGE: Record<Shareholder['kycStatus'], 'default' | 'info' | 'warning' | 'success' | 'danger'> = {
  pending: 'default',
  invited: 'info',
  in_progress: 'warning',
  passed: 'success',
  failed: 'danger',
}

const ROLE_LABELS: Record<Shareholder['role'], string> = {
  owner: 'Owner',
  shareholder: 'Shareholder',
  signatory: 'Signatory',
  authorized_signatory: 'Authorized Signatory',
}

export function Shareholders() {
  const { state, dispatch, goTo } = useApplication()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState<Shareholder['role']>('signatory')

  function sendInvite(id: string) {
    dispatch({ type: 'UPDATE_SHAREHOLDER_STATUS', id, status: 'invited' })
  }

  function addPerson() {
    if (!newName.trim()) return
    dispatch({
      type: 'ADD_SHAREHOLDER',
      shareholder: {
        id: `p-${Date.now()}`,
        fullName: newName,
        role: newRole,
        nationality: '',
        kycStatus: 'pending',
        email: newEmail,
      },
    })
    setNewName('')
    setNewEmail('')
    setShowAddForm(false)
  }

  return (
    <ApplicationLayout
      currentStep="shareholders"
      title="Shareholders & Signatories"
      subtitle="Each person linked to your license needs to complete identity verification. We've added those found on your Trade License."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {state.shareholders.map(person => (
          <div key={person.id} className="person-card">
            <div className="person-card__avatar">
              {person.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div className="person-card__info">
              <div className="person-card__name">{person.fullName}</div>
              <div className="person-card__meta">
                {ROLE_LABELS[person.role]}
                {person.ownership != null && <span> · {person.ownership}% ownership</span>}
                {person.nationality && <span> · {person.nationality}</span>}
              </div>
            </div>
            <div className="person-card__status">
              <Badge variant={KYC_STATUS_BADGE[person.kycStatus]}>
                {KYC_STATUS_LABEL[person.kycStatus]}
              </Badge>
              {person.kycStatus === 'pending' && (
                <Button variant="secondary" size="sm" style={{ marginTop: 8 }} onClick={() => sendInvite(person.id)}>
                  Send KYC invite
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showAddForm ? (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 className="section-label">Add person</h3>
          <div className="form-grid" style={{ marginBottom: 16 }}>
            <Input label="Full name" value={newName} onChange={e => setNewName(e.target.value)} required />
            <Input label="Email address" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} helper="KYC invite will be sent here" />
            <div className="input-group">
              <label className="input-label">Role</label>
              <select className="input select" value={newRole} onChange={e => setNewRole(e.target.value as Shareholder['role'])}>
                <option value="owner">Owner</option>
                <option value="shareholder">Shareholder</option>
                <option value="signatory">Signatory</option>
                <option value="authorized_signatory">Authorized Signatory</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button type="button" onClick={addPerson} disabled={!newName.trim()}>Add person</Button>
            <Button variant="ghost" type="button" onClick={() => setShowAddForm(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button variant="secondary" style={{ marginBottom: 24 }} onClick={() => setShowAddForm(true)}>
          + Add another person
        </Button>
      )}

      <div className="card" style={{ marginBottom: 24, background: 'rgba(124,58,237,0.06)' }}>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text-secondary)' }}>How KYC works:</strong> Each person receives a secure link to verify their Emirates ID and complete a brief liveness check. This usually takes under 5 minutes and can be done on any device.
        </p>
      </div>

      <div className="form-actions">
        <Button variant="ghost" onClick={() => goTo('business')}>Back</Button>
        <Button onClick={() => goTo('documents')}>Continue to Documents</Button>
      </div>
    </ApplicationLayout>
  )
}
