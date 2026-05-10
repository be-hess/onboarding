import type { ApplicationStatus, PillarStatus } from '@wio/types'

// Application and pillar state machine transitions
export function nextApplicationStatus(_current: ApplicationStatus): ApplicationStatus {
  throw new Error('Not implemented')
}

export function nextPillarStatus(_current: PillarStatus): PillarStatus {
  throw new Error('Not implemented')
}
