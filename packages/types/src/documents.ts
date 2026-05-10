export type DocumentType =
  | 'trade_license'
  | 'moa'
  | 'board_resolution'
  | 'emirates_id'
  | 'passport'
  | 'proof_of_address'
  | 'powers_of_attorney'
  | 'shareholder_register'
  | 'audited_financials'
  | 'edd_response'
  | 'other'

export type DocumentSource = 'applicant_upload' | 'registry_api' | 'internal'

export type DocumentValidationVerdict = 'pass' | 'flag' | 'fail'

export interface Document {
  id: string
  application_id: string
  type: DocumentType
  storage_url: string
  uploaded_by_person_id: string
  source: DocumentSource
  is_valid?: boolean
  extraction?: Record<string, unknown>
  validation_verdict?: DocumentValidationVerdict
  agent_run_id?: string
  uploaded_at: string
  expires_at?: string
}
