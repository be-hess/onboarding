import { useState } from 'react'
import { Button } from '@wio/design-system/src/components'
import { useApplication } from '../hooks'

const MOCK_IBAN = 'AE07 0331 2345 6789 0123 456'

export function Activate() {
  const { state } = useApplication()
  const { business, applicationId } = state
  const [agreed, setAgreed] = useState(false)
  const [activated, setActivated] = useState(false)

  if (activated) {
    return (
      <div className="app-shell" style={{ minHeight: '100vh', justifyContent: 'center', padding: '24px 20px' }}>
        <div className="orb orb--1" /><div className="orb orb--2" />
        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420, margin: '0 auto' }}>
          <div className="card" style={{ textAlign: 'center', padding: '48px 32px' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <h1 style={{ margin: '0 0 8px', color: 'var(--success)', fontSize: '1.5rem' }}>Account activated!</h1>
            <p style={{ color: 'var(--text-muted)', margin: '0 0 28px', lineHeight: 1.6 }}>
              Your Wio Business account is live. You can now make and receive payments.
            </p>

            <div style={{ marginBottom: 24, padding: '16px 20px', borderRadius: 12, background: 'var(--surface-2)', textAlign: 'left' }}>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Account IBAN
              </p>
              <p style={{ margin: 0, fontFamily: 'monospace', fontSize: 16, fontWeight: 600, letterSpacing: '0.05em', color: 'var(--text)' }}>
                {MOCK_IBAN}
              </p>
            </div>

            {applicationId && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>
                Application ref: <span style={{ fontFamily: 'monospace' }}>{applicationId}</span>
              </p>
            )}

            <a href="https://wio.io" className="btn btn-primary" style={{ display: 'inline-block', minWidth: 200 }}>
              Access your account
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell" style={{ minHeight: '100vh', justifyContent: 'center', padding: '24px 20px' }}>
      <div className="orb orb--1" /><div className="orb orb--2" />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420, margin: '0 auto' }}>

        <div style={{ marginBottom: 24 }}>
          <h1 className="page-title">Activate your account</h1>
          <p className="page-subtitle">Review the terms and sign digitally to go live.</p>
        </div>

        {business && (
          <div className="card" style={{ marginBottom: 16, padding: '14px 16px' }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{business.tradeName}</p>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>{business.licenseNumber}</p>
          </div>
        )}

        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 10, background: 'var(--surface-2)' }}>
            <p style={{ margin: '0 0 4px', fontSize: 12, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Your IBAN (reserved)
            </p>
            <p style={{ margin: 0, fontFamily: 'monospace', fontSize: 15, fontWeight: 600, letterSpacing: '0.04em', color: 'var(--text)' }}>
              {MOCK_IBAN}
            </p>
          </div>

          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, margin: '0 0 16px' }}>
            By activating, you confirm that all information provided is accurate and complete. Your account will be opened subject to Wio's Terms of Service, CBUAE regulations, and AML/CFT policies.
          </p>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              style={{ marginTop: 2, width: 16, height: 16, accentColor: 'var(--primary)' }}
            />
            <span style={{ fontSize: 14, color: 'var(--text)' }}>
              I confirm the above and agree to Wio's Terms of Service and Privacy Policy.
            </span>
          </label>
        </div>

        <Button
          onClick={() => setActivated(true)}
          disabled={!agreed}
          style={{ width: '100%' }}
        >
          Activate account
        </Button>
      </div>
    </div>
  )
}
