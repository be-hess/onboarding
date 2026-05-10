export type PillarName = 'kyb' | 'kyc' | 'compliance' | 'account'

export type PillarStatus =
  | 'not_started'
  | 'in_progress'
  | 'passed'
  | 'flagged'
  | 'failed'
  | 'awaiting_input'
  | 'expired'

export interface Pillar {
  id: string
  application_id: string
  pillar: PillarName
  status: PillarStatus
  started_at?: string
  completed_at?: string
  expires_at?: string
  assigned_to?: string
  last_agent_run_id?: string
  notes?: string
  updated_at: string
}
