import type { ApplicationTier, PillarName } from '@wio/types'

// Returns the set of pillars to activate for a given tier,
// and whether they can run in parallel
export function getPillarSequence(
  _tier: ApplicationTier,
): Array<{ pillar: PillarName; parallel: boolean }> {
  throw new Error('Not implemented')
}
