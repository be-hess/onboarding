import type { AgentName, AgentVerdict, PillarName } from '@wio/types'

export interface AgentInput {
  application_id: string
  [key: string]: unknown
}

export interface AgentOutput {
  verdict: AgentVerdict
  confidence?: number
  reasoning: string
  data: Record<string, unknown>
}

export interface AgentContract {
  name: AgentName
  pillar: PillarName
  run(input: AgentInput): Promise<AgentOutput>
}
