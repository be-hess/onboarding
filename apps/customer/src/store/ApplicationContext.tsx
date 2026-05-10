import { createContext, useContext, useReducer } from 'react'
import type { ReactNode } from 'react'
import type { ApplicationState, ApplicationAction, DocumentSlot, PillarState } from './types'

const BASE_DOCUMENTS: DocumentSlot[] = [
  { id: 'trade_license', name: 'Trade License / Freelancer Permit', description: 'Scanned in the previous step', required: true, status: 'uploaded' },
  { id: 'emirates_id', name: 'Emirates ID (Owner)', description: 'Front and back of Emirates ID', required: true, status: 'pending' },
  { id: 'passport', name: 'Passport (Owner)', description: 'Bio page of passport', required: true, status: 'pending' },
  { id: 'proof_address', name: 'Proof of Address', description: 'Utility bill or tenancy contract (last 3 months)', required: false, status: 'pending' },
  { id: 'bank_statement', name: 'Bank Statement', description: 'Last 3 months from existing bank', required: false, status: 'pending' },
]

const MOA_SLOT: DocumentSlot = {
  id: 'moa',
  name: 'Memorandum of Association',
  description: 'MOA or Articles of Association',
  required: true,
  status: 'pending',
}

const INITIAL_PILLARS: PillarState[] = [
  { id: 'kyb', label: 'Business Verification', description: 'Trade license and registry checks', status: 'idle' },
  { id: 'kyc', label: 'Identity Verification', description: 'Owner and signatory KYC', status: 'idle' },
  { id: 'compliance', label: 'Compliance & Risk', description: 'AML, sanctions, and fraud checks', status: 'idle' },
  { id: 'account', label: 'Account Setup', description: 'Account configuration and activation', status: 'idle' },
]

const INITIAL_STATE: ApplicationState = {
  applicationId: null,
  step: 'start',
  tier: null,
  documentKind: null,
  requiresMoa: false,
  tlScanned: false,
  business: null,
  activities: [],
  primaryActivityIndex: 0,
  businessModelSummary: null,
  businessModelLoading: false,
  expectedMonthlyTurnover: '',
  countriesOfOperation: '',
  shareholders: [],
  documents: [],
  pillars: INITIAL_PILLARS,
  submitting: false,
  submitted: false,
  error: null,
}

function buildDocumentList(requiresMoa: boolean): DocumentSlot[] {
  if (!requiresMoa) return BASE_DOCUMENTS
  return [BASE_DOCUMENTS[0], { ...MOA_SLOT }, ...BASE_DOCUMENTS.slice(1)]
}

function reducer(state: ApplicationState, action: ApplicationAction): ApplicationState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.step }

    case 'SET_DOCUMENT_KIND':
      return { ...state, documentKind: action.documentKind }

    case 'SET_TL_SCANNED':
      return { ...state, tlScanned: true }

    case 'SET_EXTRACTED_BUSINESS':
      return {
        ...state,
        business: action.business,
        tier: action.tier,
        requiresMoa: action.requiresMoa,
        activities: [...action.business.commercialActivities],
        primaryActivityIndex: 0,
        documents: buildDocumentList(action.requiresMoa),
      }

    case 'UPDATE_BUSINESS_FIELD':
      if (!state.business) return state
      return { ...state, business: { ...state.business, [action.field]: action.value } }

    // ── Activity actions ────────────────────────────────────────────
    case 'SET_PRIMARY_ACTIVITY':
      return { ...state, primaryActivityIndex: action.index }

    case 'UPDATE_ACTIVITY': {
      const updated = [...state.activities]
      updated[action.index] = action.value
      return { ...state, activities: updated }
    }

    case 'ADD_ACTIVITY':
      return { ...state, activities: [...state.activities, action.activity] }

    case 'REMOVE_ACTIVITY': {
      const filtered = state.activities.filter((_, i) => i !== action.index)
      const newPrimary = state.primaryActivityIndex >= filtered.length
        ? Math.max(0, filtered.length - 1)
        : action.index < state.primaryActivityIndex
          ? state.primaryActivityIndex - 1
          : state.primaryActivityIndex === action.index
            ? 0
            : state.primaryActivityIndex
      return { ...state, activities: filtered, primaryActivityIndex: newPrimary }
    }

    // ── Business model actions ──────────────────────────────────────
    case 'SET_BUSINESS_MODEL_LOADING':
      return { ...state, businessModelLoading: action.loading }

    case 'SET_BUSINESS_MODEL_SUMMARY':
      return { ...state, businessModelSummary: action.summary, businessModelLoading: false }

    case 'UPDATE_BUSINESS_MODEL_SUMMARY':
      return { ...state, businessModelSummary: action.summary }

    case 'UPDATE_TURNOVER':
      return { ...state, expectedMonthlyTurnover: action.value }

    case 'UPDATE_COUNTRIES':
      return { ...state, countriesOfOperation: action.value }

    // ── Shareholder actions ─────────────────────────────────────────
    case 'ADD_SHAREHOLDER':
      return { ...state, shareholders: [...state.shareholders, action.shareholder] }

    case 'UPDATE_SHAREHOLDER':
      return {
        ...state,
        shareholders: state.shareholders.map(s =>
          s.id === action.id ? { ...s, ...action.updates } : s
        ),
      }

    case 'UPDATE_SHAREHOLDER_STATUS':
      return {
        ...state,
        shareholders: state.shareholders.map(s =>
          s.id === action.id ? { ...s, kycStatus: action.status } : s
        ),
      }

    case 'REMOVE_SHAREHOLDER':
      return { ...state, shareholders: state.shareholders.filter(s => s.id !== action.id) }

    // ── Document actions ────────────────────────────────────────────
    case 'UPDATE_DOCUMENT_STATUS':
      return {
        ...state,
        documents: state.documents.map(d =>
          d.id === action.id ? { ...d, status: action.status, fileName: action.fileName ?? d.fileName } : d
        ),
      }

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
