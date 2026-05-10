import type { AgentContract, AgentInput, AgentOutput } from '../../../contracts'

// Maps TL business activities against the compliance list; prompts primary activity selection
export const businessActivityAgent: AgentContract = {
  name: 'business_activity',
  pillar: 'kyb',
  async run(_input: AgentInput): Promise<AgentOutput> {
    throw new Error('Not implemented')
  },
}
