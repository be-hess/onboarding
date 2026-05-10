import type { PillarName } from './pillars'

export type AgentName =
  // Group 1 — MVP
  | 'is_doc'
  | 'tl_processing'
  | 'business_activity'
  | 'personal_ocr'
  // Group 2 — Phase 2
  | 'moa_digestion'
  | 'powers_resolution'
  | 'edd_agent'
  | 'public_domain_search'
  | 'reask_agent'
  // Group 3 — Phase 3
  | 'corporate_structure'
  | 'shareholders_kyc'
  | 'signing_powers_kyc'
  | 'mandates'
  | 'ai_rm'
  | 'maker_agent'
  | 'checker_agent'
  | 'edd_maker'
  | 'edd_checker'
  | 'quality_agent'
  | 'escalations_agent'

export type AgentDeliveryGroup = 'group_1' | 'group_2' | 'group_3'

export type AgentRunStatus = 'pending' | 'running' | 'completed' | 'failed'

export type AgentVerdict = 'pass' | 'flag' | 'fail' | 'requires_input'

export interface AgentRun {
  id: string
  application_id: string
  agent_name: AgentName
  pillar: PillarName
  delivery_group: AgentDeliveryGroup
  status: AgentRunStatus
  input: Record<string, unknown>
  output: Record<string, unknown>
  verdict?: AgentVerdict
  confidence?: number
  reasoning?: string
  started_at: string
  completed_at?: string
  error?: string
}
