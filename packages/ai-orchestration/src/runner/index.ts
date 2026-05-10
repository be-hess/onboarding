import type { AgentName } from '@wio/types'
import type { AgentContract, AgentInput, AgentOutput } from '../contracts'

// Dispatches a named agent, persists the run, and returns the output
export async function runAgent(
  _agentName: AgentName,
  _input: AgentInput,
  _contract: AgentContract,
): Promise<AgentOutput> {
  throw new Error('Not implemented')
}
