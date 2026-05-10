import { useRef, useState } from 'react'
import { Button, Spinner } from '@wio/design-system/src/components'
import { useApplication } from '../hooks'
import type { DocumentKind } from '../store/types'

type StartPhase = 'type-select' | 'upload'

const SCAN_PHASES = [
  'Checking document validity…',
  'Extracting business details…',
  'Verifying with registry…',
]

export function StartApplication() {
  const { state, goTo, handleDocumentScan, handleMoaUpload } = useApplication()
  const [phase, setPhase] = useState<StartPhase>('type-select')
  const [selectedKind, setSelectedKind] = useState<DocumentKind | null>(null)
  const [scanning, setScanning] = useState(false)
  const [scanPhaseLabel, setScanPhaseLabel] = useState(SCAN_PHASES[0])
  const [tlFile, setTlFile] = useState<File | null>(null)
  const [moaFile, setMoaFile] = useState<File | null>(null)

  const tlRef = useRef<HTMLInputElement>(null)
  const moaRef = useRef<HTMLInputElement>(null)

  function selectKind(kind: DocumentKind) {
    setSelectedKind(kind)
    setTlFile(null)
    setMoaFile(null)
    setPhase('upload')
  }

  async function startScan(demoMode = false) {
    if (!selectedKind) return
    setScanning(true)
    setScanPhaseLabel(SCAN_PHASES[0])
    const t1 = setTimeout(() => setScanPhaseLabel(SCAN_PHASES[1]), 900)
    const t2 = setTimeout(() => setScanPhaseLabel(SCAN_PHASES[2]), 1900)

    await handleDocumentScan(demoMode ? undefined : tlFile ?? undefined, selectedKind)

    clearTimeout(t1)
    clearTimeout(t2)
    setScanning(false)

    if (!state.error) {
      if (moaFile) handleMoaUpload(moaFile.name)
      goTo('business')
    }
  }

  // ── Scanning overlay ───────────────────────────────────────────────────────
  if (scanning) {
    return (
      <div className="app-shell" style={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div className="orb orb--1" /><div className="orb orb--2" />
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Spinner size={48} label={scanPhaseLabel} />
        </div>
      </div>
    )
  }

  // ── Upload screen ──────────────────────────────────────────────────────────
  if (phase === 'upload' && selectedKind) {
    const isBusinessLicense = selectedKind === 'business_license'

    return (
      <div className="app-shell" style={{ minHeight: '100vh', justifyContent: 'center', padding: '24px 20px' }}>
        <div className="orb orb--1" /><div className="orb orb--2" />
        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420, margin: '0 auto' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="var(--primary)" />
              <path d="M7 9l4 10 3-6 3 6 4-10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>Wio Business</span>
          </div>

          <h1 className="page-title" style={{ marginBottom: 8 }}>
            {isBusinessLicense ? 'Upload your documents' : 'Upload your Freelancer Permit'}
          </h1>
          <p className="page-subtitle" style={{ marginBottom: 28 }}>
            {isBusinessLicense
              ? 'We need your Trade License and MOA to get started. We\'ll extract your business details automatically.'
              : 'We\'ll scan your permit and pre-fill your application details.'}
          </p>

          {/* Trade License upload */}
          <div style={{ marginBottom: isBusinessLicense ? 16 : 20 }}>
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-subtle)', marginBottom: 8 }}>
              {isBusinessLicense ? 'Trade License' : 'Freelancer Permit'} <span style={{ color: 'var(--danger)' }}>*</span>
            </p>
            <div
              className="scan-zone"
              style={{ maxWidth: '100%' }}
              onClick={() => tlRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && tlRef.current?.click()}
            >
              <div className="scan-zone__line" />
              <div className="scan-zone__content">
                {tlFile ? (
                  <>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>✓</div>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--success)', fontSize: 14 }}>{tlFile.name}</p>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>Click to replace</p>
                  </>
                ) : (
                  <>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--primary)' }}>
                      Upload {isBusinessLicense ? 'Trade License' : 'Freelancer Permit'}
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>PDF, JPG, or PNG · Max 10 MB</p>
                  </>
                )}
              </div>
            </div>
            <input ref={tlRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) setTlFile(f); e.target.value = '' }} />
          </div>

          {/* MOA upload — business license only */}
          {isBusinessLicense && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-subtle)', marginBottom: 8 }}>
                Memorandum of Association <span style={{ color: 'var(--text-subtle)', fontWeight: 400 }}>(optional — can upload later)</span>
              </p>
              <div
                className="scan-zone"
                style={{ maxWidth: '100%', opacity: 0.85 }}
                onClick={() => moaRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && moaRef.current?.click()}
              >
                <div className="scan-zone__content">
                  {moaFile ? (
                    <>
                      <div style={{ fontSize: 24, marginBottom: 6 }}>✓</div>
                      <p style={{ margin: 0, fontWeight: 600, color: 'var(--success)', fontSize: 14 }}>{moaFile.name}</p>
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>Click to replace</p>
                    </>
                  ) : (
                    <>
                      <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-muted)' }}>Upload MOA</p>
                      <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-subtle)' }}>PDF, JPG, or PNG · Max 10 MB</p>
                    </>
                  )}
                </div>
              </div>
              <input ref={moaRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) setMoaFile(f); e.target.value = '' }} />
            </div>
          )}

          {state.error && (
            <div className="alert alert--danger" style={{ marginBottom: 16 }}>{state.error}</div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Button onClick={() => startScan()} disabled={!tlFile}>
              {isBusinessLicense ? 'Scan documents' : 'Scan permit'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => startScan(true)}>
              Use demo data instead
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setPhase('type-select')}>
              ← Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── Document type selection ────────────────────────────────────────────────
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
          What type of license do you have?
        </p>

        <div style={{ textAlign: 'left' }}>
          {([
            { kind: 'business_license' as DocumentKind, icon: '🏢', label: 'Business License', desc: 'LLC, sole establishment, free zone company, or branch' },
            { kind: 'freelancer_permit' as DocumentKind, icon: '🧑‍💻', label: 'Freelancer Permit', desc: 'Freelance or professional license' },
          ]).map(({ kind, icon, label, desc }) => (
            <button key={kind} className="doc-type-card" onClick={() => selectKind(kind)}>
              <span className="doc-type-card__icon">{icon}</span>
              <div className="doc-type-card__body">
                <div className="doc-type-card__label">{label}</div>
                <div className="doc-type-card__desc">{desc}</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: 'var(--text-subtle)' }}>
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
