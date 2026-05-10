import { PillarStatusCard, Badge } from '@wio/design-system/src/components'
import { useApplication } from '../hooks'

export function ApplicationStatus() {
  const { state } = useApplication()
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
    approved: 'Application approved',
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
              Application reference: <strong style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{applicationId}</strong>
            </p>
          )}

          {business && (
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginTop: 4 }}>{business.tradeName}</p>
          )}

          {tier && (
            <div style={{ marginTop: 8 }}>
              <Badge variant={tier}>{tier.charAt(0).toUpperCase() + tier.slice(1)} application</Badge>
            </div>
          )}
        </div>

        {allPassed ? (
          <div className="card slide-up" style={{ marginBottom: 24, textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <h2 style={{ margin: '0 0 8px', color: 'var(--success)' }}>Your account is ready</h2>
            <p style={{ color: 'var(--text-muted)', margin: '0 0 24px' }}>
              Congratulations! Your Wio Business account has been approved. Check your email for next steps.
            </p>
            <a href="https://wio.io" className="btn btn-primary">
              Access your account
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
        )}

        {!allPassed && (
          <div className="card" style={{ marginTop: 24 }}>
            <h3 className="section-label">What happens next?</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { step: '1', text: 'Our AI agents are running automated checks on your application.' },
                { step: '2', text: 'If any documents or information need clarification, we\'ll notify you by email.' },
                { step: '3', text: 'A Wio specialist will review your application. You\'ll be notified of the outcome.' },
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
