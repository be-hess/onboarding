import type { Person } from '@wio/types'

export interface UAEPassVerifyOutput {
  person: Partial<Person>
  liveness_passed: boolean
  source: 'mock'
}

// Stub — returns mock verified identity
export async function uaePassVerify(): Promise<UAEPassVerifyOutput> {
  throw new Error('Not implemented')
}
