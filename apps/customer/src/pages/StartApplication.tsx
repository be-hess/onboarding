import { useRef, useState } from 'react'
import { Button, Spinner } from '@wio/design-system/src/components'
import { useApplication } from '../hooks'
import type { DocumentKind } from '../store/types'

type StartPhase = 'type-select' | 'upload' | 'scanning' | 'moa-upload'

const KIND_CONFIG: Record<DocumentKind, { label: string; scanLabel: string; icon: string; description: string }> = {
  business_license: {
    label: 'Business License',
    scanLabel: 'Trade License / Business License',
    icon: '🏢',
    description: 'For LLCs, sole establishments, free zone companies, and branches',
  },
  freelancer_permit: {
    label: 'Freelancer Permit',
    icon: '🧑‍💻',
    scanLabel: 'Freelancer Permit',
    description: 'For individuals operating under a freelance or professional license',
  },
}

const SCAN_PHASES = [
  'Checking document validity…',
  'Extracting business details…',
  'Verifying with registry…',
]

export function StartApplication() {
  const { state, goTo, handleDocumentScan, handleMoaUpload, skipMoa } = useApplication()
  const [phase, setPhase] = useState<StartPhase>('type-select')
  const [selectedKind, setSelectedKind] = useState<DocumentKind | null>(null)
  const [scanPhaseLabel, setScanPhaseLabel] = useState(SCAN_PHASES[0])
  const [moaFile, setMoaFile] = useState<File | null>(null)
  const docFileRef = useRef<HTMLInputElement>(null)
  const moaFileRef = useRef<HTMLInputElement>(null)

  function selectKind(kind: DocumentKind) {
    setSelectedKind(kind)
    setPhase('upload')
  }

  async function startScan(file?: File) {
    if (!selectedKind) return
    setPhase('scanning')
    setScanPhaseLabel(SCAN_PHASES[0])
    const t1 = setTimeout(() => setScanPhaseLabel(SCAN_PHASES[1]), 900)
    const t2 = setTimeout(() => setScanPhaseLabel(SCAN_PHASES[2]), 1900)

    const { requiresMoa } = await handleDocumentScan(file, selectedKind)

    clearTimeout(t1)
    clearTimeout(t2)

    if (state.error) {
      setPhase('upload')
      return
    }

    if (requiresMoa) {
      setPhase('moa-upload')
    } else {
      goTo('business')
    }
  }

  function handleDocFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) startScan(file)
    e.target.value = ''
  }

  function handleMoaFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setMoaFile(file)
    e.target.value = ''
  }

  function submitMoa() {
    if (moaFile) handleMoaUpload(moaFile.name)
    goTo('business')
  }

  function handleSkipMoa() {
    skipMoa()
    goTo('business')
  }

  // ── Scanning ───────────────────────────────────────────────────────────────
  if (phase === 'scanning') {
    return (
      <div className="app-shell" style={{ minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div className="orb orb--1" /><div className="orb orb--2" />
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Spinner size={48} label={scanPhaseLabel} />
        </div>
      </div>
    )
  }

  // ── MOA Upload ─────────────────────────────────────────────────────────────
  if (phase === 'moa-upload') {
    return (
      <div className="app-shell" style={{ minHeight: '100vh', justifyContent: 'center', padding: '24px 20px' }}>
        <div className="orb orb--1" /><div className="orb orb--2" />
        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420, margin: '0 auto' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="var(--primary)" />
              <path d="M7 9l4 10 3-6 3 6 4-10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>Wio Business</span>
          </div>

          <div style={{ marginBottom: 8 }}>
            <div className="badge badge--success" style={{ marginBottom: 12 }}>
              ✓ Trade License scanned
            </div>
          </div>
          <h1 className="page-title" style={{ marginBottom: 8 }}>One more document</h1>
          <p className="page-subtitle" style={{ marginBottom: 28 }}>
            LLCs require a Memorandum of Association (MOA) to confirm the company structure and ownership. You can upload it now or add it later.
          </p>

          <div
            className="scan-zone"
            style={{ maxWidth: '100%', marginBottom: 20 }}
            onClick={() => moaFileRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && moaFileRef.current?.click()}
            aria-label="Upload MOA"
          >
            <div className="scan-zone__content" style={{ padding: '8px 0' }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ marginBottom: 8 }}>
                <path d="M6 6h10l6 6v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
                <path d="M16 6v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
              {moaFile ? (
                <>
                  <p style={{ margin: 0, fontWeight: 600, color: 'var(--success)' }}>✓ {moaFile.name}</p>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>Click to replace</p>
                </>
              ) : (
                <>
                  <p style={{ margin: 0, fontWeight: 600, color: 'var(--primary)' }}>Upload Memorandum of Association</p>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>PDF, JPG, or PNG · Max 10 MB</p>
                </>
              )}
            </div>
          </div>

          <input
            ref={moaFileRef}
            type="file"
            accept="image/*,.pdf"
            style={{ display: 'none' }}
            onChange={handleMoaFileChange}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Button onClick={submitMoa} disabled={!moaFile}>
              Continue with MOA
            </Button>
            <Button variant="ghost" onClick={handleSkipMoa}>
              I'll upload this later
            </Button>
          </div>

          <p style={{ fontSize: 12, color: 'var(--text-subtle)', marginTop: 16, textAlign: 'center', lineHeight: 1.6 }}>
            You can also upload the MOA in the Documents step before submitting your application.
          </p>
        </div>
      </div>
    )
  }

  // ── Document Upload ────────────────────────────────────────────────────────
  if (phase === 'upload' && selectedKind) {
    const config = KIND_CONFIG[selectedKind]
    return (
      <div className="app-shell" style={{ minHeight: '100vh', justifyContent: 'center', padding: '24px 20px' }}>
        <div className="orb orb--1" /><div className="orb orb--2" />
        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420, margin: '0 auto' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="var(--primary)" />
              <path d="M7 9l4 10 3-6 3 6 4-10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>Wio Business</span>
          </div>

          <h1 className="page-title" style={{ marginBottom: 8 }}>Upload your {config.label}</h1>
          <p className="page-subtitle" style={{ marginBottom: 28 }}>
            We'll scan it and extract your business details automatically — no manual typing needed.
          </p>

          <div
            className="scan-zone"
            style={{ maxWidth: '100%', marginBottom: 16 }}
            onClick={() => docFileRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && docFileRef.current?.click()}
            aria-label={`Upload ${config.scanLabel}`}
          >
            <div className="scan-zone__line" />
            <div className="scan-zone__content">
              <div style={{ fontSize: 32, marginBottom: 8 }}>{config.icon}</div>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--primary)' }}>Scan or upload {config.scanLabel}</p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>JPG, PNG, or PDF · Max 10 MB</p>
            </div>
          </div>

          <input
            ref={docFileRef}
            type="file"
            accept="image/*,.pdf"
            style={{ display: 'none' }}
            onChange={handleDocFileChange}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Button variant="ghost" size="sm" onClick={() => startScan()}>
              Use demo data instead
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setPhase('type-select')}>
              ← Choose different document type
            </Button>
          </div>

          {state.error && (
            <div className="alert alert--danger" style={{ marginTop: 16 }}>{state.error}</div>
          )}
        </div>
      </div>
    )
  }

  // ── Document Type Selection (default) ──────────────────────────────────────
  return (
    <div className="app-shell start-screen">
      <div className="orb orb--1" /><div className="orb orb--2" />
      <div className="start-hero fade-in">
        <div style={{ marginBottom: 16 }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="14" fill="var(--primary)" />
            <path d="M12 16l7 16 5-10 5 10 7-16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="start-title">Open your<br />Wio Business account</h1>
        <p className="start-subtitle">
          Start by selecting your license type. We'll scan it and pre-fill your application.
        </p>

        <div style={{ width: '100%', maxWidth: 360, marginBottom: 32 }}>
          <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-subtle)', marginBottom: 12 }}>
            What type of license do you have?
          </p>
          {(Object.entries(KIND_CONFIG) as [DocumentKind, typeof KIND_CONFIG[DocumentKind]][]).map(([kind, config]) => (
            <button
              key={kind}
              className="doc-type-card"
              onClick={() => selectKind(kind)}
              aria-label={`Select ${config.label}`}
            >
              <span className="doc-type-card__icon">{config.icon}</span>
              <div className="doc-type-card__body">
                <div className="doc-type-card__label">{config.label}</div>
                <div className="doc-type-card__desc">{config.description}</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, color: 'var(--text-subtle)' }}>
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>

        <div className="start-features">
          {[
            { icon: '⚡', text: 'AI extracts your details from the document' },
            { icon: '🔒', text: 'Bank-grade encryption on all your documents' },
            { icon: '📱', text: 'Save progress and resume anytime' },
          ].map(f => (
            <div key={f.text} className="start-feature">
              <span className="start-feature__icon">{f.icon}</span>
              <span className="start-feature__text">{f.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
