import type { DocumentType } from './documents'
import type { PillarName } from './pillars'

export type CaseReviewStatus =
  | 'maker_in_progress'
  | 'awaiting_checker'
  | 'approved'
  | 'declined'
  | 'escalated'

export type CaseDecision = 'approve' | 'decline' | 'escalate'

export type ReAskInitiatedBy = 'agent' | 'analyst'

export type ReAskStatus = 'pending' | 'sent' | 'responded' | 'resolved' | 'expired'

export interface CaseReview {
  id: string
  application_id: string
  maker_id: string
  checker_id?: string
  status: CaseReviewStatus
  decision?: CaseDecision
  decision_reason?: string
  ai_summary_acknowledged: boolean
  maker_started_at: string
  maker_completed_at?: string
  checker_completed_at?: string
  escalated_to_id?: string
  escalation_reason?: string
}

export interface ReAskItem {
  field: string
  reason: string
  document_type_required?: DocumentType
}

export interface ReAsk {
  id: string
  application_id: string
  pillar: PillarName
  initiated_by: ReAskInitiatedBy
  initiated_by_id: string
  items: ReAskItem[]
  status: ReAskStatus
  sent_at?: string
  responded_at?: string
  resolved_at?: string
  expires_at?: string
}
