export type ApplicationTier = 'express' | 'standard' | 'complex'

export type ApplicationStatus =
  | 'draft'
  | 'in_progress'
  | 'pending_review'
  | 'approved'
  | 'declined'
  | 'cancelled'

export type EntityType =
  | 'sole_establishment'
  | 'llc'
  | 'free_zone_llc'
  | 'free_zone_est'
  | 'corporate_group'
  | 'branch'
  | 'ngo'

export type Jurisdiction = 'uae_mainland' | 'adgm' | 'difc' | 'rak_icc' | 'other'

export interface Application {
  id: string
  business_id: string
  applicant_person_id: string
  tier: ApplicationTier
  entity_type: EntityType
  status: ApplicationStatus
  jurisdiction: Jurisdiction
  submitted_at?: string
  decision_at?: string
  created_at: string
  updated_at: string
}
