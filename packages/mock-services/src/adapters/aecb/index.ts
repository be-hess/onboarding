export interface AECBInput {
  emirates_id: string
}

export interface AECBOutput {
  credit_status: 'clear' | 'flagged' | 'blocked'
  score?: number
  source: 'mock'
}

// Stub — returns clear for all inputs
export async function aecbCheck(_input: AECBInput): Promise<AECBOutput> {
  throw new Error('Not implemented')
}
