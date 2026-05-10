import { useRef, useState } from 'react'
import { Button, Spinner } from '@wio/design-system/src/components'
import { useApplication } from '../hooks'

export function StartApplication() {
  const { state, handleTLScan } = useApplication()
  const [scanning, setScanning] = useState(false)
  const [scanPhase, setScanPhase] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function startScan(file?: File) {
    setScanning(true)
    setScanPhase('Checking document validity…')
    setTimeout(() => setScanPhase('Extracting company details…'), 900)
    setTimeout(() => setScanPhase('Running registry verification…'), 1800)
    await handleTLScan(file)
    setScanning(false)
  }

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) startScan(file)
  }

  if (scanning) {
    return (
      <div className="app-shell" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="orb orb--1" />
        <div className="orb orb--2" />
        <div style={{ textAlign: 'center' }}>
          <Spinner size={48} label={scanPhase} />
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell start-screen">
      <div className="orb orb--1" />
      <div className="orb orb--2" />

      <div className="start-hero fade-in">
        <div style={{ marginBottom: 16 }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-label="Wio">
            <rect width="48" height="48" rx="14" fill="var(--primary)" />
            <path d="M12 16l7 16 5-10 5 10 7-16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="start-title">Open your<br />Wio Business account</h1>
        <p className="start-subtitle">
          It takes as little as 15 minutes. Start by scanning your Trade License — we'll pre-fill everything we can find.
        </p>

        <div className="start-features">
          {[
            { icon: '⚡', text: 'AI extracts your business details automatically' },
            { icon: '🔒', text: 'Bank-grade encryption on all your documents' },
            { icon: '📱', text: 'Save your progress and resume anytime' },
          ].map(f => (
            <div key={f.text} className="start-feature">
              <span className="start-feature__icon">{f.icon}</span>
              <span className="start-feature__text">{f.text}</span>
            </div>
          ))}
        </div>

        <div className="scan-zone" onClick={() => fileRef.current?.click()} role="button" tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
          aria-label="Upload Trade License">
          <div className="scan-zone__line" />
          <div className="scan-zone__content">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ marginBottom: 8 }}>
              <path d="M6 8h4V6H6a2 2 0 00-2 2v4h2V8z" fill="currentColor" />
              <path d="M26 8h-4V6h4a2 2 0 012 2v4h-2V8z" fill="currentColor" />
              <path d="M6 24h4v2H6a2 2 0 01-2-2v-4h2v4z" fill="currentColor" />
              <path d="M26 24h-4v2h4a2 2 0 002-2v-4h-2v4z" fill="currentColor" />
              <path d="M10 12h12v8H10z" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
            <p style={{ margin: 0, fontWeight: 600, color: 'var(--primary)' }}>Scan or upload Trade License</p>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>JPG, PNG, or PDF · Max 10 MB</p>
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*,.pdf"
          style={{ display: 'none' }}
          onChange={handleFilePick}
        />

        <Button variant="ghost" size="sm" style={{ marginTop: 8 }} onClick={() => startScan()}>
          Use demo data instead
        </Button>

        {state.error && (
          <div className="alert alert--danger" style={{ marginTop: 16 }}>
            {state.error}
          </div>
        )}
      </div>
    </div>
  )
}
