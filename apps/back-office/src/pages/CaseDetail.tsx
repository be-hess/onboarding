import { useState } from 'react'

type PillarId = 'kyb' | 'kyi' | 'wwma'
type PillarStatus = 'idle' | 'running' | 'pending_info' | 'passed' | 'failed' | 'escalated'

interface PillarCard {
  id: PillarId
  label: string
  description: string
  status: PillarStatus
  progress: number
  agentFindings: string[]
  pendingAction?: string
}

const MOCK_CASE = {
  ref: 'APP-K3X9P',
  tradeName: 'Wadiwave Trading LLC',
  legalType: 'Limited Liability Company (LLC)',
  licensingAuthority: 'Dubai Economy and Tourism (DET)',
  licenseNumber: 'DET-2024-087234',
  tier: 'standard' as const,
  cramScore: 'medium' as const,
  eddTriggered: false,
  submitted: '2026-05-18 09:14',
  applicantName: 'Ahmed Al Mansoori',
  assignedTo: 'Fatima Al Zaabi',
  aiSummary: 'General trading LLC with two owners (60/40 split, mixed UAE/Lebanese nationality). Turnover declared AED 200k–500k/month. Source of funds: business revenue. CRAM score: medium — elevated due to international trading activities. No sanctions matches. KYI pending for Sara Khalil (40% owner).',
}

const MOCK_PILLARS: PillarCard[] = [
  {
    id: 'kyb',
    label: 'Business Verification (KYB)',
    description: 'Registry data, trade licence, UBO structure',
    status: 'passed',
    progress: 100,
    agentFindings: ['License verified with DET registry', 'UBO structure resolved (2 owners)', 'No adverse media detected', 'AECB pre-check: clear'],
  },
  {
    id: 'kyi',
    label: 'Identity Verification (KYI)',
    description: 'Owner and signatory verification',
    status: 'pending_info',
    progress: 55,
    agentFindings: ['Ahmed Al Mansoori: UAE Pass verified', 'Sara Khalil: KYI invite sent 09:32 — awaiting response'],
    pendingAction: 'Waiting for Sara Khalil to complete identity verification via UAE Pass or Onfido.',
  },
  {
    id: 'wwma',
    label: 'Account Setup (WWMA)',
    description: 'Compliance checks, IBAN, activation',
    status: 'running',
    progress: 40,
    agentFindings: ['IBAN reserved: AE07 0331 XXXX XXXX XXXX 456', 'Sanctions screening: no match', 'PEP screening: no match'],
  },
]

const STATUS_COLOR: Record<PillarStatus, string> = {
  idle: 'var(--text-subtle)',
  running: 'var(--info, #6366f1)',
  pending_info: 'var(--warning, #f59e0b)',
  passed: 'var(--success)',
  failed: 'var(--danger)',
  escalated: 'var(--danger)',
}

const CRAM_COLOR = { low: 'var(--success)', medium: 'var(--warning, #f59e0b)', high: 'var(--danger)' }

export function CaseDetail() {
  const [activeTab, setActiveTab] = useState<'overview' | 'pillars' | 'audit'>('overview')
  const [makerNote, setMakerNote] = useState('')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #0f0f13)', color: 'var(--text, #f1f1f3)', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <header style={{ padding: '16px 24px', borderBottom: '1px solid var(--border, rgba(255,255,255,0.08))', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13 }}>← Queue</a>
          <span style={{ color: 'var(--border)' }}>/</span>
          <span style={{ fontFamily: 'monospace', fontSize: 14, color: 'var(--text)' }}>{MOCK_CASE.ref}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', padding: '6px 12px', borderRadius: 6, background: 'var(--surface-2, rgba(255,255,255,0.05))' }}>
            Assigned: {MOCK_CASE.assignedTo}
          </span>
        </div>
      </header>

      <main style={{ padding: '24px', maxWidth: 900, margin: '0 auto' }}>

        {/* Case header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: '0 0 4px', fontSize: '1.4rem' }}>{MOCK_CASE.tradeName}</h1>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
            {MOCK_CASE.legalType} · {MOCK_CASE.licensingAuthority} · {MOCK_CASE.licenseNumber}
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--info, #6366f1)', background: 'rgba(99,102,241,0.12)', borderRadius: 6, padding: '3px 10px' }}>
              {MOCK_CASE.tier}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: CRAM_COLOR[MOCK_CASE.cramScore], background: 'rgba(245,158,11,0.1)', borderRadius: 6, padding: '3px 10px' }}>
              CRAM: {MOCK_CASE.cramScore}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Submitted {MOCK_CASE.submitted}</span>
          </div>
        </div>

        {/* AI triage summary */}
        <div style={{ marginBottom: 20, padding: '16px 20px', borderRadius: 12, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--primary, #7c3aed)' }}>AI triage summary</span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{MOCK_CASE.aiSummary}</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border, rgba(255,255,255,0.08))' }}>
          {(['overview', 'pillars', 'audit'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? 'var(--primary, #7c3aed)' : 'var(--text-muted)',
                borderBottom: activeTab === tab ? '2px solid var(--primary, #7c3aed)' : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Applicant', value: MOCK_CASE.applicantName },
                { label: 'License', value: MOCK_CASE.licenseNumber },
                { label: 'CRAM score', value: MOCK_CASE.cramScore },
                { label: 'EDD triggered', value: MOCK_CASE.eddTriggered ? 'Yes' : 'No' },
              ].map(({ label, value }) => (
                <div key={label} style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--surface-2, rgba(255,255,255,0.04))', border: '1px solid var(--border, rgba(255,255,255,0.08))' }}>
                  <p style={{ margin: '0 0 4px', fontSize: 11, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Maker action */}
            <div style={{ padding: '16px 20px', borderRadius: 12, border: '1px solid var(--border, rgba(255,255,255,0.08))', background: 'var(--surface-2, rgba(255,255,255,0.04))' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Maker decision</h3>
              <textarea
                value={makerNote}
                onChange={e => setMakerNote(e.target.value)}
                placeholder="Add a note before sending to checker…"
                rows={3}
                style={{ width: '100%', background: 'var(--surface-3, rgba(255,255,255,0.03))', border: '1px solid var(--border, rgba(255,255,255,0.1))', borderRadius: 8, color: 'var(--text)', fontSize: 13, padding: '10px 12px', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 10, justifyContent: 'flex-end' }}>
                <button style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: 'var(--danger)', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                  Flag for review
                </button>
                <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--primary, #7c3aed)', color: 'white', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                  Send to checker
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pillars tab */}
        {activeTab === 'pillars' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {MOCK_PILLARS.map(pillar => (
              <div key={pillar.id} style={{ padding: '16px 20px', borderRadius: 12, border: `1px solid var(--border, rgba(255,255,255,0.08))`, background: 'var(--surface-2, rgba(255,255,255,0.04))' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{pillar.label}</span>
                    <span style={{ marginLeft: 10, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: STATUS_COLOR[pillar.status] }}>
                      {pillar.status.replace('_', ' ')}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pillar.progress}%</span>
                </div>
                {/* Progress bar */}
                <div style={{ height: 4, borderRadius: 2, background: 'var(--border, rgba(255,255,255,0.08))', marginBottom: 12 }}>
                  <div style={{ height: '100%', borderRadius: 2, background: STATUS_COLOR[pillar.status], width: `${pillar.progress}%`, transition: 'width 0.4s ease' }} />
                </div>
                <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.8 }}>
                  {pillar.agentFindings.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
                {pillar.pendingAction && (
                  <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 8, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', fontSize: 13, color: 'var(--warning, #f59e0b)' }}>
                    {pillar.pendingAction}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Audit tab — link to full audit log */}
        {activeTab === 'audit' && (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
            <p style={{ marginBottom: 16 }}>Full immutable event log for this application.</p>
            <a href={`/cases/1/audit`} style={{ color: 'var(--primary, #7c3aed)', fontWeight: 600 }}>
              Open audit log →
            </a>
          </div>
        )}
      </main>
    </div>
  )
}
