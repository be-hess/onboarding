import type { Application, ApplicationTier } from '@wio/types'

// Classifies an application into express / standard / complex
// based on entity type, ownership structure, and risk signals
export function classifyTier(_application: Partial<Application>): ApplicationTier {
  throw new Error('Not implemented')
}
