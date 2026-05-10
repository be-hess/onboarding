import type { AgentContract, AgentInput, AgentOutput } from '../../../contracts'

// Checks TL validity with licensing authority, extracts company info, checks for duplicates
export const tlProcessingAgent: AgentContract = {
  name: 'tl_processing',
  pillar: 'kyb',
  async run(_input: AgentInput): Promise<AgentOutput> {
    throw new Error('Not implemented')
  },
}
