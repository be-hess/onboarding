import type { AgentContract, AgentInput, AgentOutput } from '../../../contracts'

// Validates that an uploaded file is a genuine document of the correct requested type
export const isDocAgent: AgentContract = {
  name: 'is_doc',
  pillar: 'kyb',
  async run(_input: AgentInput): Promise<AgentOutput> {
    throw new Error('Not implemented')
  },
}
