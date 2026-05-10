import type { Business } from '@wio/types'

export interface RegistryLookupInput {
  trade_license_number: string
  authority: string
}

export interface RegistryLookupOutput {
  business: Partial<Business>
  is_valid: boolean
  source: 'mock'
}

// Stub — returns mock data for any input
export async function registryLookup(_input: RegistryLookupInput): Promise<RegistryLookupOutput> {
  throw new Error('Not implemented')
}
