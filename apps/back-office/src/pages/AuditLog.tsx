import { useState } from 'react'

type ActorType = 'system' | 'agent' | 'analyst' | 'applicant' | 'signatory'

interface AuditEvent {
  id: string
  timestamp: string
  eventType: string
  actorType: ActorType
  actorId: string
  summary: string
  pillar?: string
}

const MOCK_EVENTS: AuditEvent[] = [
  { id: '1', timestamp: '2026-05-18 09:14:02', eventType: 'auth.uae_pass.completed', actorType: 'applicant', actorId: 'uap-784-1990-1234567', summary: 'UAE Pass authentication completed — assurance level: high', pillar: undefined },
  { id: '2', timestamp: '2026-05-18 09:14:18', eventType: 'application.pre_screen.eligible', actorType: 'system', actorId: 'pre-screen-service', summary: 'Pre-screen result: eligible. Tier: standard. License DET-2024-087234 verified against DET registry.', pillar: undefined },
  { id: '3', timestamp: '2026-05-18 09:14:55', eventType: 'application.cram_computed', actorType: 'system', actorId: 'opa-engine', summary: 'CRAM computed: medium. Policy version: cram-v2.1.0. EDD not triggered.', pillar: undefined },
  { id: '4', timestamp: '2026-05-18 09:15:10', eventType: 'application.submitted', actorType: 'applicant', actorId: 'uap-784-1990-1234567', summary: 'Application submitted by Ahmed Al Mansoori.', pillar: undefined },
  { id: '5', timestamp: '2026-05-18 09:15:12', eventType: 'pillar.kyb.started', actorType: 'system', actorId: 'pillar-orchestrator', summary: 'KYB pillar started by Pillar Orchestrator.', pillar: 'kyb' },
  { id: '6', timestamp: '2026-05-18 09:15:13', eventType: 'pillar.kyi.started', actorType: 'system', actorId: 'pillar-orchestrator', summary: 'KYI pillar started by Pillar Orchestrator.', pillar: 'kyi' },
  { id: '7', timestamp: '2026-05-18 09:15:14', eventType: 'pillar.wwma.started', actorType: 'system', actorId: 'pillar-orchestrator', summary: 'WWMA pillar started. IBAN reserved: AE07 0331 XXXX XXXX XXXX 456 (pending_activation).', pillar: 'wwma' },
  { id: '8', timestamp: '2026-05-18 09:17:44', eventType: 'pillar.kyb.passed', actorType: 'agent', actorId: 'kyb-agent-v2', summary: 'KYB passed. UBO resolved, AECB clear, no adverse media.', pillar: 'kyb' },
  { id: '9', timestamp: '2026-05-18 09:18:02', eventType: 'pillar.kyi.pending_info', actorType: 'system', actorId: 'kyi-service', summary: 'KYI pending: Sara Khalil (40%) has not completed identity verification. Invite sent.', pillar: 'kyi' },
  { id: '10', timestamp: '2026-05-18 09:18:05', eventType: 'case.officer_assigned', actorType: 'system', actorId: 'case-router', summary: 'Case assigned to Fatima Al Zaabi (standard tier queue).', pillar: undefined },
]

const ACTOR_COLOR: Record<ActorType, string> = {
  system: 'var(--text-subtle)',
  agent: 'var(--info, #6366f1)',
  analyst: 'var(--primary, #7c3aed)',
  applicant: 'var(--success)',
  signatory: 'var(--warning, #f59e0b)',
}

const PILLAR_COLOR: Record<string, string> = {
  kyb: 'var(--info, #6366f1)',
  kyi: 'var(--primary, #7c3aed)',
  wwma: 'var(--success)',
}

export function AuditLog() {
  const [actorFilter, setActorFilter] = useState<ActorType | 'all'>('all')
  const [pillarFilter, setPillarFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const filtered = MOCK_EVENTS.filter(e => {
    if (actorFilter !== 'all' && e.actorType !== actorFilter) return false
    if (pillarFilter !== 'all' && e.pillar !== pillarFilter) return false
    if (search && !e.eventType.includes(search) && !e.summary.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #0f0f13)', color: 'var(--text, #f1f1f3)', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <header style={{ padding: '16px 24px', borderBottom: '1px solid var(--border, rgba(255,255,255,0.08))', display: 'flex', alignItems: 'center', gap: 12 }}>
        <a href="/cases/1" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13 }}>← Case</a>
        <span style={{ color: 'var(--border)' }}>/</span>
        <span style={{ fontWeight: 600 }}>Audit Log — APP-K3X9P</span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)', padding: '4px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          Append-only · No edit or delete
        </span>
      </header>

      <main style={{ padding: '24px', maxWidth: 900, margin: '0 auto' }}>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <input
            style={{ flex: 1, minWidth: 200, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border, rgba(255,255,255,0.12))', background: 'var(--surface-2, rgba(255,255,255,0.05))', color: 'var(--text)', fontSize: 13 }}
            placeholder="Search event type or summary…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            value={actorFilter}
            onChange={e => setActorFilter(e.target.value as ActorType | 'all')}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border, rgba(255,255,255,0.12))', background: 'var(--surface-2, rgba(255,255,255,0.05))', color: 'var(--text)', fontSize: 13 }}
          >
            {['all', 'system', 'agent', 'analyst', 'applicant', 'signatory'].map(a => (
              <option key={a} value={a}>{a === 'all' ? 'All actors' : a}</option>
            ))}
          </select>
          <select
            value={pillarFilter}
            onChange={e => setPillarFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border, rgba(255,255,255,0.12))', background: 'var(--surface-2, rgba(255,255,255,0.05))', color: 'var(--text)', fontSize: 13 }}
          >
            {['all', 'kyb', 'kyi', 'wwma'].map(p => (
              <option key={p} value={p}>{p === 'all' ? 'All pillars' : p.toUpperCase()}</option>
            ))}
          </select>
          <button
            style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border, rgba(255,255,255,0.12))', background: 'var(--surface-2, rgba(255,255,255,0.05))', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}
          >
            Export CSV
          </button>
        </div>

        {/* Event timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filtered.map(event => (
            <div
              key={event.id}
              style={{
                display: 'flex', gap: 16, padding: '12px 16px', borderRadius: 10,
                background: 'var(--surface-2, rgba(255,255,255,0.03))',
                border: '1px solid var(--border, rgba(255,255,255,0.06))',
                alignItems: 'flex-start',
              }}
            >
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)', flexShrink: 0, paddingTop: 1, minWidth: 132 }}>
                {event.timestamp}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{event.eventType}</span>
                  {event.pillar && (
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: PILLAR_COLOR[event.pillar] ?? 'var(--text-muted)', letterSpacing: '0.06em', background: 'rgba(255,255,255,0.06)', borderRadius: 4, padding: '1px 6px' }}>
                      {event.pillar.toUpperCase()}
                    </span>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{event.summary}</p>
              </div>
              <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: ACTOR_COLOR[event.actorType] }}>
                  {event.actorType}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-subtle)', fontFamily: 'monospace' }}>{event.actorId}</span>
              </div>
            </div>
          ))}
        </div>

        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--text-subtle)' }}>
          {filtered.length} event{filtered.length !== 1 ? 's' : ''} · Access to this log is itself audited
        </p>
      </main>
    </div>
  )
}
