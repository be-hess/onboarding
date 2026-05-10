export interface ScreeningInput {
  name: string
  nationality?: string
  date_of_birth?: string
  entity_type: 'person' | 'business'
}

export interface ScreeningOutput {
  pep_match: boolean
  sanctions_match: boolean
  adverse_media_hits: string[]
  risk_level: 'low' | 'medium' | 'high'
  source: 'mock'
}

// Stub — returns clean result by default
export async function screen(_input: ScreeningInput): Promise<ScreeningOutput> {
  throw new Error('Not implemented')
}
