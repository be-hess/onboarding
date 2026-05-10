interface Step {
  label: string
  sublabel?: string
}

interface StepProgressProps {
  steps: Step[]
  currentStep: number
}

export function StepProgress({ steps, currentStep }: StepProgressProps) {
  return (
    <div className="step-progress">
      {steps.map((step, i) => {
        const state = i < currentStep ? 'done' : i === currentStep ? 'active' : 'pending'
        return (
          <div key={i} className={`step step--${state}`}>
            <div className="step-indicator">
              {state === 'done' ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <span>{i + 1}</span>
              )}
            </div>
            <div className="step-label">
              <span>{step.label}</span>
              {step.sublabel && <span className="step-sublabel">{step.sublabel}</span>}
            </div>
            {i < steps.length - 1 && <div className="step-connector" />}
          </div>
        )
      })}
    </div>
  )
}
