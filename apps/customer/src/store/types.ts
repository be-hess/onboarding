// Six customer-visible steps per CLAUDE_BRIEFING.md:
// 01 uae-pass → 02 find-business → 03 business-questions → 04 who-needs-access
// → 05 tracker → 06 activate
// Step 04 is skipped entirely for Tier 1 (Sole Establishment).
export type WizardStep =
  | 'uae-pass'           // Step 01: UAE Pass sign-in
  | 'find-business'      // Step 02: TL number entry → registry pull → pre-screen result
  | 'business-questions' // Step 03: 3 mandatory CDD questions → CRAM
  | 'who-needs-access'   // Step 04: UBO/signatory management (Tier 2/3 only)
  | 'tracker'            // Step 05: 3-lane per-pillar progress tracker
  | 'activate'           // Step 06: e-sign + account activation

export type PreScreenResult = 'eligible' | 'needs_review' | 'cannot_proceed'

export type DocumentKind = 'business_license' | 'freelancer_permit'

export type CramScore = 'low' | 'medium' | 'high'

export interface RegistryBusiness {
  licensingAuthority: string
  licenseNumber: string
  legalType: string
  tradeName: string
  legalNameAr?: string
  issueDate: string
  licenseExpiry: string
  registeredAddress: string
  commercialActivities: string[]
  owners: RegistryOwner[]
  entityType: string
  jurisdiction: string
}

export interface RegistryOwner {
  name: string
  ownership: number
  nationality?: string
}

export interface Signatory {
  id: string
  fullName: string
  role: 'owner' | 'ubo' | 'signatory' | 'director' | 'authorized_user'
  ownership?: number
  nationality: string
  emiratesId?: string
  kyiStatus: 'pending' | 'invited' | 'in_progress' | 'passed' | 'failed'
  email?: string
}

export type PillarId = 'kyb' | 'kyi' | 'wwma'

export type PillarRunStatus = 'idle' | 'running' | 'pending_info' | 'passed' | 'failed' | 'escalated'

export interface PillarState {
  id: PillarId
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

  // Step 01 — UAE Pass
  uaePassVerified: boolean
  personName: string | null

  // Step 02 — Find business
  licenseNumber: string
  preScreenResult: PreScreenResult | null
  preScreenLoading: boolean
  business: RegistryBusiness | null

  // Step 03 — Business questions (3 mandatory CDD questions)
  primaryActivity: string
  expectedMonthlyTurnover: string
  sourceOfFunds: string
  cramScore: CramScore | null
  eddTriggered: boolean

  // Step 04 — Who needs access (Tier 2/3 only)
  signatories: Signatory[]

  // Step 05 — Tracker
  pillars: PillarState[]

  // Submission state
  submitting: boolean
  submitted: boolean
  error: string | null
}

export type ApplicationAction =
  | { type: 'SET_STEP'; step: WizardStep }
  // Step 01
  | { type: 'SET_UAE_PASS_VERIFIED'; name: string }
  // Step 02
  | { type: 'SET_LICENSE_NUMBER'; value: string }
  | { type: 'SET_PRE_SCREEN_LOADING'; loading: boolean }
  | { type: 'SET_PRE_SCREEN_RESULT'; result: PreScreenResult; business: RegistryBusiness; tier: 'express' | 'standard' | 'complex' }
  // Step 03
  | { type: 'UPDATE_PRIMARY_ACTIVITY'; value: string }
  | { type: 'UPDATE_TURNOVER'; value: string }
  | { type: 'UPDATE_SOURCE_OF_FUNDS'; value: string }
  | { type: 'SET_CRAM_RESULT'; score: CramScore; eddTriggered: boolean }
  // Step 04
  | { type: 'ADD_SIGNATORY'; signatory: Signatory }
  | { type: 'UPDATE_SIGNATORY_STATUS'; id: string; status: Signatory['kyiStatus'] }
  | { type: 'REMOVE_SIGNATORY'; id: string }
  // Submission / pillar tracking
  | { type: 'SET_SUBMITTING'; submitting: boolean }
  | { type: 'SET_SUBMITTED'; applicationId: string }
  | { type: 'SET_PILLAR_STATE'; id: PillarId; state: Partial<PillarState> }
  | { type: 'SET_ERROR'; error: string | null }
