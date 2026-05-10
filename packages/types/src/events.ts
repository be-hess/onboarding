import type { PillarName } from './pillars'

export type ActorType = 'system' | 'agent' | 'analyst' | 'applicant' | 'signatory' | 'manager'

export interface AuditEvent {
  id: string
  application_id: string
  pillar?: PillarName
  actor_type: ActorType
  actor_id: string
  actor_name: string
  event_type: string
  payload: Record<string, unknown>
  created_at: string
}
