export type WizardStep =
  | 'start'
  | 'license'         // License fields confirmation
  | 'activities'      // Business activities — select primary, edit/add/remove
  | 'ownership'       // Ownership structure + KYC invites
  | 'business-model'  // AI business model summary + turnover + countries
  | 'documents'
  | 'review'
  | 'status'

export type DocStatus = 'pending' | 'uploading' | 'uploaded' | 'verified' | 'rejected'

export type DocumentKind = 'business_license' | 'freelancer_permit'

export interface ExtractedOwner {
  name: string
  ownership: number
  nationality?: string
}

export interface ExtractedBusiness {
  documentKind: DocumentKind
  licensingAuthority: string
  licenseNumber: string
  legalType: string
  tradeName: string
  issueDate: string
  licenseExpiry: string
  registeredAddress: string
  commercialActivities: string[]
  owners: ExtractedOwner[]
}

// Scalar fields the user can edit inline on the License Details screen
export type EditableBusinessField =
  | 'licensingAuthority'
  | 'licenseNumber'
  | 'legalType'
  | 'tradeName'
  | 'issueDate'
  | 'licenseExpiry'
  | 'registeredAddress'

export interface Shareholder {
  id: string
  fullName: string
  role: 'owner' | 'shareholder' | 'signatory' | 'authorized_signatory'
  ownership?: number
  nationality: string
  emiratesId?: string
  kycStatus: 'pending' | 'invited' | 'in_progress' | 'passed' | 'failed'
  email?: string
}

export interface DocumentSlot {
  id: string
  name: string
  description?: string
  required: boolean
  status: DocStatus
  fileName?: string
}

export type PillarRunStatus = 'idle' | 'running' | 'pending_info' | 'passed' | 'failed' | 'escalated'

export interface PillarState {
  id: string
  label: string
  description: string
  status: PillarRunStatus
  progress?: number
  eta?: string
}

export interface ApplicationState {
  applicationId: string | null
  step: WizardStep
  tier: 'express' | 'standard' | 'complex' | null
  documentKind: DocumentKind | null
  requiresMoa: boolean
  tlScanned: boolean
  business: ExtractedBusiness | null
  // Mutable activities list — may differ from business.commercialActivities after user edits
  activities: string[]
  primaryActivityIndex: number
  // Business model screen
  businessModelSummary: string | null
  businessModelLoading: boolean
  expectedMonthlyTurnover: string
  countriesOfOperation: string
  shareholders: Shareholder[]
  documents: DocumentSlot[]
  pillars: PillarState[]
  submitting: boolean
  submitted: boolean
  error: string | null
}

export type ApplicationAction =
  | { type: 'SET_STEP'; step: WizardStep }
  | { type: 'SET_DOCUMENT_KIND'; documentKind: DocumentKind }
  | { type: 'SET_TL_SCANNED' }
  | { type: 'SET_EXTRACTED_BUSINESS'; business: ExtractedBusiness; tier: 'express' | 'standard' | 'complex'; requiresMoa: boolean }
  | { type: 'UPDATE_BUSINESS_FIELD'; field: EditableBusinessField; value: string }
  // Activity actions
  | { type: 'SET_PRIMARY_ACTIVITY'; index: number }
  | { type: 'UPDATE_ACTIVITY'; index: number; value: string }
  | { type: 'ADD_ACTIVITY'; activity: string }
  | { type: 'REMOVE_ACTIVITY'; index: number }
  // Business model actions
  | { type: 'SET_BUSINESS_MODEL_LOADING'; loading: boolean }
  | { type: 'SET_BUSINESS_MODEL_SUMMARY'; summary: string }
  | { type: 'UPDATE_BUSINESS_MODEL_SUMMARY'; summary: string }
  | { type: 'UPDATE_TURNOVER'; value: string }
  | { type: 'UPDATE_COUNTRIES'; value: string }
  // Shareholder actions
  | { type: 'ADD_SHAREHOLDER'; shareholder: Shareholder }
  | { type: 'UPDATE_SHAREHOLDER'; id: string; updates: Partial<Shareholder> }
  | { type: 'UPDATE_SHAREHOLDER_STATUS'; id: string; status: Shareholder['kycStatus'] }
  | { type: 'REMOVE_SHAREHOLDER'; id: string }
  // Document actions
  | { type: 'UPDATE_DOCUMENT_STATUS'; id: string; status: DocStatus; fileName?: string }
  // Submission
  | { type: 'SET_SUBMITTING'; submitting: boolean }
  | { type: 'SET_SUBMITTED'; applicationId: string }
  | { type: 'SET_PILLAR_STATE'; id: string; state: Partial<PillarState> }
  | { type: 'SET_ERROR'; error: string | null }
