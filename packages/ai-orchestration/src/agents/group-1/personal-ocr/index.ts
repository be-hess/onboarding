import type { AgentContract, AgentInput, AgentOutput } from '../../../contracts'

// Extracts structured data from Emirates ID and passport documents
export const personalOcrAgent: AgentContract = {
  name: 'personal_ocr',
  pillar: 'kyc',
  async run(_input: AgentInput): Promise<AgentOutput> {
    throw new Error('Not implemented')
  },
}
