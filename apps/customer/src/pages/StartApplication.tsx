import { useState } from 'react'
import { Button, Spinner } from '@wio/design-system/src/components'
import { useApplication } from '../hooks'

export function StartApplication() {
  const { state, handleUaePassAuth } = useApplication()
  const [loading, setLoading] = useState(false)

  async function signIn() {
    setLoading(true)
    await handleUaePassAuth()
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="app-shell" style={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div className="orb orb--1" /><div className="orb orb--2" />
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Spinner size={48} label="Connecting to UAE Pass…" />
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell" style={{ minHeight: '100vh', justifyContent: 'center', padding: '24px 20px' }}>
      <div className="orb orb--1" /><div className="orb orb--2" />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 380, margin: '0 auto', textAlign: 'center' }}>

        <div style={{ marginBottom: 20 }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="14" fill="var(--primary)" />
            <path d="M12 16l7 16 5-10 5 10 7-16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="start-title" style={{ marginBottom: 12 }}>Open your<br />Wio Business account</h1>
        <p className="start-subtitle" style={{ marginBottom: 36 }}>
          Sign in with UAE Pass to get started. We'll use your verified identity to speed up your application.
        </p>

        {state.error && (
          <div className="alert alert--danger" style={{ marginBottom: 20, textAlign: 'left' }}>{state.error}</div>
        )}

        <Button onClick={signIn} style={{ width: '100%' }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect width="18" height="18" rx="4" fill="white" fillOpacity={0.25} />
              <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="6" fontWeight="700">UAE</text>
            </svg>
            Sign in with UAE Pass
          </span>
        </Button>

        <p style={{ marginTop: 24, fontSize: 12, color: 'var(--text-subtle)', lineHeight: 1.6 }}>
          UAE Pass provides high-assurance identity verification for UAE residents and residents. Your information is verified by the UAE government and shared securely.
        </p>
      </div>
    </div>
  )
}
