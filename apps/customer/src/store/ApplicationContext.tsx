import { createContext, useContext, useReducer } from 'react'
import type { ReactNode } from 'react'
import type { ApplicationState, ApplicationAction, PillarState } from './types'

// Three pillars per CLAUDE_BRIEFING: KYB · KYI · WWMA
const INITIAL_PILLARS: PillarState[] = [
  { id: 'kyb', label: 'Business Verification (KYB)', description: 'Registry data, trade licence, UBO structure', status: 'idle' },
  { id: 'kyi', label: 'Identity Verification (KYI)', description: 'Owner and signatory verification', status: 'idle' },
  { id: 'wwma', label: 'Account Setup (WWMA)', description: 'Compliance checks, IBAN, activation', status: 'idle' },
]

const INITIAL_STATE: ApplicationState = {
  applicationId: null,
  step: 'uae-pass',
  tier: null,

  // Step 01
  uaePassVerified: false,
  personName: null,

  // Step 02
  licenseNumber: '',
  preScreenResult: null,
  preScreenLoading: false,
  business: null,

  // Step 03
  primaryActivity: '',
  expectedMonthlyTurnover: '',
  sourceOfFunds: '',
  cramScore: null,
  eddTriggered: false,

  // Step 04
  signatories: [],

  // Step 05
  pillars: INITIAL_PILLARS,

  submitting: false,
  submitted: false,
  error: null,
}

function reducer(state: ApplicationState, action: ApplicationAction): ApplicationState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.step }

    // ── Step 01: UAE Pass ────────────────────────────────────────────
    case 'SET_UAE_PASS_VERIFIED':
      return { ...state, uaePassVerified: true, personName: action.name }

    // ── Step 02: Find business ───────────────────────────────────────
    case 'SET_LICENSE_NUMBER':
      return { ...state, licenseNumber: action.value }

    case 'SET_PRE_SCREEN_LOADING':
      return { ...state, preScreenLoading: action.loading, error: null }

    case 'SET_PRE_SCREEN_RESULT':
      return {
        ...state,
        preScreenLoading: false,
        preScreenResult: action.result,
        business: action.business,
        tier: action.tier,
        // Seed primary activity from registry data
        primaryActivity: action.business.commercialActivities[0] ?? '',
        // Seed signatories from registry owners for Tier 2/3
        signatories: action.tier !== 'express'
          ? action.business.owners.map((o, i) => ({
              id: `registry-${i}`,
              fullName: o.name,
              role: 'owner' as const,
              ownership: o.ownership,
              nationality: o.nationality ?? '',
              kyiStatus: 'pending' as const,
            }))
          : [],
      }

    // ── Step 03: Business questions ──────────────────────────────────
    case 'UPDATE_PRIMARY_ACTIVITY':
      return { ...state, primaryActivity: action.value }

    case 'UPDATE_TURNOVER':
      return { ...state, expectedMonthlyTurnover: action.value }

    case 'UPDATE_SOURCE_OF_FUNDS':
      return { ...state, sourceOfFunds: action.value }

    case 'SET_CRAM_RESULT':
      return { ...state, cramScore: action.score, eddTriggered: action.eddTriggered }

    // ── Step 04: Who needs access ────────────────────────────────────
    case 'ADD_SIGNATORY':
      return { ...state, signatories: [...state.signatories, action.signatory] }

    case 'UPDATE_SIGNATORY_STATUS':
      return {
        ...state,
        signatories: state.signatories.map(s =>
          s.id === action.id ? { ...s, kyiStatus: action.status } : s
        ),
      }

    case 'REMOVE_SIGNATORY':
      return { ...state, signatories: state.signatories.filter(s => s.id !== action.id) }

    // ── Submission / pillar tracking ─────────────────────────────────
    case 'SET_SUBMITTING':
      return { ...state, submitting: action.submitting }

    case 'SET_SUBMITTED':
      return { ...state, submitted: true, submitting: false, applicationId: action.applicationId }

    case 'SET_PILLAR_STATE':
      return {
        ...state,
        pillars: state.pillars.map(p =>
          p.id === action.id ? { ...p, ...action.state } : p
        ),
      }

    case 'SET_ERROR':
      return { ...state, error: action.error }

    default:
      return state
  }
}

interface ContextValue {
  state: ApplicationState
  dispatch: React.Dispatch<ApplicationAction>
}

const ApplicationContext = createContext<ContextValue | null>(null)

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  return (
    <ApplicationContext.Provider value={{ state, dispatch }}>
      {children}
    </ApplicationContext.Provider>
  )
}

export function useApplicationContext() {
  const ctx = useContext(ApplicationContext)
  if (!ctx) throw new Error('useApplicationContext must be used within ApplicationProvider')
  return ctx
}
