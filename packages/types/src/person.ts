export type KYCStatus = 'pending' | 'verified' | 'failed' | 'expired'

export type PersonRole =
  | 'owner'
  | 'director'
  | 'ubo'
  | 'signatory'
  | 'representative'
  | 'preparer'
  | 'authorized_user'

export type InvitationStatus =
  | 'not_required'
  | 'pending'
  | 'sent'
  | 'accepted'
  | 'completed'
  | 'expired'

export interface Person {
  id: string
  uae_pass_id?: string
  emirates_id?: string
  passport_number?: string
  passport_country?: string
  full_name: string
  date_of_birth: string
  nationality: string
  kyc_status: KYCStatus
  kyc_verified_at?: string
  kyc_expires_at?: string
  liveness_verified: boolean
  liveness_verified_at?: string
  is_pep?: boolean
  is_sanctioned?: boolean
  screening_last_run_at?: string
  created_at: string
  updated_at: string
}

export interface PersonBusinessRole {
  id: string
  person_id: string
  business_id: string
  application_id: string
  role: PersonRole
  ownership_pct?: number
  signing_authority: boolean
  invitation_status: InvitationStatus
  invitation_sent_at?: string
  invitation_token?: string
  invitation_expires_at?: string
  completed_at?: string
}
