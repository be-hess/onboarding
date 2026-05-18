import { useState } from 'react'

type Tier = 'express' | 'standard' | 'complex' | 'all'
type PillarId = 'kyb' | 'kyi' | 'wwma'
type PillarStatus = 'idle' | 'running' | 'pending_info' | 'passed' | 'failed' | 'escalated'

interface CaseRow {
  id: string
  ref: string
  tradeName: string
  tier: 'express' | 'standard' | 'complex'
  submitted: string
  slaHours: number
  pillars: Record<PillarId, PillarStatus>
  assignedTo: string | null
}

const MOCK_CASES: CaseRow[] = [
  {
    id: '1', ref: 'APP-K3X9P', tradeName: 'Wadiwave Trading LLC', tier: 'standard',
    submitted: '2026-05-18 09:14', slaHours: 14,
    pillars: { kyb: 'passed', kyi: 'pending_info', wwma: 'running' },
    assignedTo: 'Fatima Al Zaabi',
  },
  {
    id: '2', ref: 'APP-M7Q2R', tradeName: 'Mohammed Al Rashid Tech Solutions', tier: 'express',
    submitted: '2026-05-18 10:02', slaHours: 0.5,
    pillars: { kyb: 'passed', kyi: 'passed', wwma: 'running' },
    assignedTo: null,
  },
  {
    id: '3', ref: 'APP-B4F1N', tradeName: 'Gulf Star General Trading LLC', tier: 'standard',
    submitted: '2026-05-17 16:45', slaHours: 6,
    pillars: { kyb: 'escalated', kyi: 'running', wwma: 'idle' },
    assignedTo: 'Ahmed Khalil',
  },
  {
    id: '4', ref: 'APP-C9W5T', tradeName: 'Emirates Luxury Goods DMCC', tier: 'complex',
    submitted: '2026-05-17 11:30', slaHours: 2,
    pillars: { kyb: 'running', kyi: 'pending_info', wwma: 'idle' },
    assignedTo: 'Fatima Al Zaabi',
  },
]

const PILLAR_LABEL: Record<PillarId, string> = { kyb: 'KYB', kyi: 'KYI', wwma: 'WWMA' }

const STATUS_COLOR: Record<PillarStatus, string> = {
  idle: 'var(--text-subtle)',
  running: 'var(--info, #6366f1)',
  pending_info: 'var(--warning, #f59e0b)',
  passed: 'var(--success)',
  failed: 'var(--danger)',
  escalated: 'var(--danger)',
}

const TIER_COLOR = {
  express: 'var(--success)',
  standard: 'var(--info, #6366f1)',
  complex: 'var(--warning, #f59e0b)',
}

export function CaseQueue() {
  const [tierFilter, setTierFilter] = useState<Tier>('all')
  const [search, setSearch] = useState('')

  const filtered = MOCK_CASES.filter(c => {
    if (tierFilter !== 'all' && c.tier !== tierFilter) return false
    if (search && !c.tradeName.toLowerCase().includes(search.toLowerCase()) && !c.ref.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #0f0f13)', color: 'var(--text, #f1f1f3)', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <header style={{ padding: '16px 24px', borderBottom: '1px solid var(--border, rgba(255,255,255,0.08))', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="var(--primary, #7c3aed)" />
            <path d="M7 9l4 10 3-6 3 6 4-10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Wio Business — Case Queue</span>
        </div>
        <nav style={{ display: 'flex', gap: 20, fontSize: 13 }}>
          <span style={{ color: 'var(--primary, #7c3aed)', fontWeight: 600 }}>Queue</span>
          <a href="/cases/1/audit" style={{ color: 'var(--text-muted, #888)', textDecoration: 'none' }}>Audit Log</a>
        </nav>
      </header>

      <main style={{ padding: '24px', maxWidth: 960, margin: '0 auto' }}>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <input
            style={{ flex: 1, minWidth: 200, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border, rgba(255,255,255,0.12))', background: 'var(--surface-2, rgba(255,255,255,0.05))', color: 'var(--text)', fontSize: 13 }}
            placeholder="Search by name or ref…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {(['all', 'express', 'standard', 'complex'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              style={{
                padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border, rgba(255,255,255,0.12))',
                background: tierFilter === t ? 'var(--primary, #7c3aed)' : 'var(--surface-2, rgba(255,255,255,0.05))',
                color: tierFilter === t ? 'white' : 'var(--text-muted)',
                fontSize: 13, cursor: 'pointer', fontWeight: tierFilter === t ? 600 : 400,
              }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ borderRadius: 12, border: '1px solid var(--border, rgba(255,255,255,0.08))', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--surface-2, rgba(255,255,255,0.04))', textAlign: 'left' }}>
                {['Ref', 'Business', 'Tier', 'SLA', 'KYB', 'KYI', 'WWMA', 'Assigned', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} style={{ borderTop: i > 0 ? '1px solid var(--border, rgba(255,255,255,0.06))' : undefined }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{c.ref}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{c.tradeName}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: TIER_COLOR[c.tier], textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {c.tier}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: c.slaHours < 2 ? 'var(--danger)' : c.slaHours < 6 ? 'var(--warning, #f59e0b)' : 'var(--text-muted)' }}>
                    {c.slaHours < 1 ? `${Math.round(c.slaHours * 60)}m` : `${c.slaHours}h`} left
                  </td>
                  {(['kyb', 'kyi', 'wwma'] as PillarId[]).map(p => (
                    <td key={p} style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: STATUS_COLOR[c.pillars[p]], textTransform: 'uppercase' }}>
                        {c.pillars[p].replace('_', ' ')}
                      </span>
                    </td>
                  ))}
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                    {c.assignedTo ?? <span style={{ color: 'var(--warning, #f59e0b)' }}>Unassigned</span>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <a href={`/cases/${c.id}`} style={{ fontSize: 12, color: 'var(--primary, #7c3aed)', textDecoration: 'none', fontWeight: 600 }}>
                      Review →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No cases match the current filters.
            </div>
          )}
        </div>

        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--text-subtle)' }}>
          {filtered.length} case{filtered.length !== 1 ? 's' : ''} · Pillar status refreshes every 30 seconds
        </p>
      </main>
    </div>
  )
}
