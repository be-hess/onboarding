import { createContext, useContext, useReducer } from 'react'
import type { ReactNode } from 'react'
import type { ApplicationState, ApplicationAction, DocumentSlot, PillarState } from './types'

const INITIAL_DOCUMENTS: DocumentSlot[] = [
  { id: 'trade_license', name: 'Trade License', description: 'Current valid trade license', required: true, status: 'verified' },
  { id: 'moa', name: 'Memorandum of Association', description: 'MOA or Articles of Association', required: true, status: 'pending' },
  { id: 'emirates_id', name: 'Emirates ID (Owner)', description: 'Front and back of Emirates ID', required: true, status: 'pending' },
  { id: 'passport', name: 'Passport (Owner)', description: 'Bio page of passport', required: true, status: 'pending' },
  { id: 'proof_address', name: 'Proof of Address', description: 'Utility bill or tenancy contract (last 3 months)', required: false, status: 'pending' },
  { id: 'bank_statement', name: 'Bank Statement', description: 'Last 3 months from existing bank', required: false, status: 'pending' },
]

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
  tlScanned: false,
  business: null,
  expectedActivities: '',
  expectedMonthlyTurnover: '',
  expectedCounterparties: '',
  shareholders: [],
  documents: INITIAL_DOCUMENTS,
  pillars: INITIAL_PILLARS,
  submitting: false,
  submitted: false,
  error: null,
}

function reducer(state: ApplicationState, action: ApplicationAction): ApplicationState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.step }
    case 'SET_TL_SCANNED':
      return { ...state, tlScanned: true }
    case 'SET_EXTRACTED_BUSINESS':
      return { ...state, business: action.business, tier: action.tier }
    case 'UPDATE_BUSINESS_FIELD':
      if (!state.business) return state
      return { ...state, business: { ...state.business, [action.field]: action.value } }
    case 'UPDATE_ACTIVITY_QUESTIONS':
      return { ...state, [action.field]: action.value }
    case 'ADD_SHAREHOLDER':
      return { ...state, shareholders: [...state.shareholders, action.shareholder] }
    case 'UPDATE_SHAREHOLDER_STATUS':
      return {
        ...state,
        shareholders: state.shareholders.map(s =>
          s.id === action.id ? { ...s, kycStatus: action.status } : s
        ),
      }
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
