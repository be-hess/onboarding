export type WizardStep = 'start' | 'business' | 'shareholders' | 'documents' | 'review' | 'status'

export type DocStatus = 'pending' | 'uploading' | 'uploaded' | 'verified' | 'rejected'

export interface ExtractedBusiness {
  tradeName: string
  legalName: string
  licenseNumber: string
  licenseExpiry: string
  entityType: string
  jurisdiction: string
  registeredAddress: string
  primaryActivity: string
  secondaryActivity?: string
}

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
  tlScanned: boolean
  business: ExtractedBusiness | null
  expectedActivities: string
  expectedMonthlyTurnover: string
  expectedCounterparties: string
  shareholders: Shareholder[]
  documents: DocumentSlot[]
  pillars: PillarState[]
  submitting: boolean
  submitted: boolean
  error: string | null
}

export type ApplicationAction =
  | { type: 'SET_STEP'; step: WizardStep }
  | { type: 'SET_TL_SCANNED' }
  | { type: 'SET_EXTRACTED_BUSINESS'; business: ExtractedBusiness; tier: 'express' | 'standard' | 'complex' }
  | { type: 'UPDATE_BUSINESS_FIELD'; field: keyof ExtractedBusiness; value: string }
  | { type: 'UPDATE_ACTIVITY_QUESTIONS'; field: 'expectedActivities' | 'expectedMonthlyTurnover' | 'expectedCounterparties'; value: string }
  | { type: 'ADD_SHAREHOLDER'; shareholder: Shareholder }
  | { type: 'UPDATE_SHAREHOLDER_STATUS'; id: string; status: Shareholder['kycStatus'] }
  | { type: 'UPDATE_DOCUMENT_STATUS'; id: string; status: DocStatus; fileName?: string }
  | { type: 'SET_SUBMITTING'; submitting: boolean }
  | { type: 'SET_SUBMITTED'; applicationId: string }
  | { type: 'SET_PILLAR_STATE'; id: string; state: Partial<PillarState> }
  | { type: 'SET_ERROR'; error: string | null }
