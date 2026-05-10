export interface FraudSignalInput {
  applicant_id: string
  device_fingerprint?: string
  ip_address?: string
  behavioural_signals?: Record<string, unknown>
}

export interface FraudSignalOutput {
  fraud_score: number
  signals: string[]
  recommendation: 'pass' | 'step_up' | 'block'
  source: 'mock'
}

// Stub — always returns score 0.05 (pass)
export async function evaluateFraud(_input: FraudSignalInput): Promise<FraudSignalOutput> {
  throw new Error('Not implemented')
}
