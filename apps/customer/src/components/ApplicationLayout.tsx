import type { ReactNode } from 'react'
import { StepProgress } from '@wio/design-system/src/components'
import type { WizardStep } from '../store/types'

const STEPS = [
  { label: 'License', sublabel: 'Details' },
  { label: 'Activities', sublabel: '& Model' },
  { label: 'Ownership', sublabel: 'Structure' },
  { label: 'Documents', sublabel: 'Upload' },
  { label: 'Review', sublabel: '& Submit' },
]

const STEP_INDEX: Record<WizardStep, number> = {
  start: -1,
  license: 0,
  activities: 1,
  ownership: 2,
  'business-model': 2,
  documents: 3,
  review: 4,
  status: 5,
}

interface ApplicationLayoutProps {
  currentStep: WizardStep
  title: string
  subtitle?: string
  children: ReactNode
}

export function ApplicationLayout({ currentStep, title, subtitle, children }: ApplicationLayoutProps) {
  const stepIndex = STEP_INDEX[currentStep]
  const showProgress = stepIndex >= 0 && currentStep !== 'status'

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
        <div className="app-header__help">
          <a href="mailto:support@wio.io" style={{ color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none' }}>Need help?</a>
        </div>
      </header>

      <main className="app-main">
        {showProgress && (
          <div className="fade-in" style={{ marginBottom: 32 }}>
            <StepProgress steps={STEPS} currentStep={stepIndex} />
          </div>
        )}

        <div className="slide-up">
          <div style={{ marginBottom: 24 }}>
            <h1 className="page-title">{title}</h1>
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
