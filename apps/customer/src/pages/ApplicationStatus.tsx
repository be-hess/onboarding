import { Button, PillarStatusCard, Badge } from '@wio/design-system/src/components'
import { useApplication } from '../hooks'

export function ApplicationTracker() {
  const { state, goTo } = useApplication()
  const { applicationId, pillars, business, tier } = state

  const allPassed = pillars.every(p => p.status === 'passed')
  const anyFailed = pillars.some(p => p.status === 'failed')
  const pendingInfo = pillars.some(p => p.status === 'pending_info')

  let overallStatus: 'processing' | 'approved' | 'action_needed' | 'declined' = 'processing'
  if (allPassed) overallStatus = 'approved'
  else if (anyFailed) overallStatus = 'declined'
  else if (pendingInfo) overallStatus = 'action_needed'

  const OVERALL_LABEL = {
    processing: 'Application in review',
    approved: 'All checks complete',
    action_needed: 'Action needed',
    declined: 'Application not approved',
  }

  const OVERALL_BADGE = {
    processing: 'info',
    approved: 'success',
    action_needed: 'warning',
    declined: 'danger',
  } as const

  return (
    <div className="app-shell">
      <div className="orb orb--1" />
      <div className="orb orb--2" />

      <header className="app-header">
        <div className="app-header__logo">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-label="Wio">
            <rect width="28" height="28" rx="8" fill="var(--primary)" />
            <path d="M7 9l4 10 3-6 3 6 4-10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="app-header__wordmark">Wio Business</span>
        </div>
      </header>

      <main className="app-main fade-in">
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <h1 className="page-title" style={{ margin: 0 }}>{OVERALL_LABEL[overallStatus]}</h1>
            <Badge variant={OVERALL_BADGE[overallStatus]}>
              {overallStatus.replace('_', ' ')}
            </Badge>
          </div>

          {applicationId && (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
              Ref: <strong style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{applicationId}</strong>
            </p>
          )}

          {business && (
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginTop: 4 }}>{business.tradeName}</p>
          )}

          {tier && (
            <div style={{ marginTop: 8 }}>
              <Badge variant={tier as 'express' | 'standard' | 'complex'}>{tier.charAt(0).toUpperCase() + tier.slice(1)}</Badge>
            </div>
          )}
        </div>

        {/* 3-lane pillar tracker: KYB · KYI · WWMA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {pillars.map(pillar => (
            <PillarStatusCard
              key={pillar.id}
              pillar={pillar.id}
              label={pillar.label}
              description={pillar.description}
              status={pillar.status}
              progress={pillar.progress}
              eta={pillar.eta}
            />
          ))}
        </div>

        {/* CTA when all passed */}
        {allPassed && (
          <div className="card slide-up" style={{ marginBottom: 24, textAlign: 'center', padding: '32px 24px' }}>
            <h2 style={{ margin: '0 0 8px', color: 'var(--success)' }}>All checks passed</h2>
            <p style={{ color: 'var(--text-muted)', margin: '0 0 24px' }}>
              Your application is approved. Complete the final step to activate your Wio Business account.
            </p>
            <Button onClick={() => goTo('activate')} style={{ minWidth: 200 }}>
              Activate your account →
            </Button>
          </div>
        )}

        {!allPassed && (
          <div className="card">
            <h3 className="section-label">What happens next?</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { step: '1', text: 'KYB · KYI · WWMA checks run simultaneously in three independent lanes.' },
                { step: '2', text: 'If any information needs clarification, we\'ll notify you here and by email.' },
                { step: '3', text: 'Once all three lanes pass, you\'ll be invited to activate your account.' },
              ].map(item => (
                <div key={item.step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, flexShrink: 0, color: 'white',
                  }}>
                    {item.step}
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
