import { useNavigate } from 'react-router-dom'
import { useApplicationContext } from '../store'
import { scanTradeLicense, submitApplication, watchPillarProgress } from '../services'
import type { WizardStep } from '../store/types'

const STEP_ROUTES: Record<WizardStep, string> = {
  start: '/',
  business: '/application/business',
  shareholders: '/application/shareholders',
  documents: '/application/documents',
  review: '/application/review',
  status: '/application/status',
}

export function useApplication() {
  const { state, dispatch } = useApplicationContext()
  const navigate = useNavigate()

  function goTo(step: WizardStep) {
    dispatch({ type: 'SET_STEP', step })
    navigate(STEP_ROUTES[step])
  }

  async function handleTLScan(file?: File) {
    dispatch({ type: 'SET_TL_SCANNED' })
    try {
      const { business, shareholders, tier } = await scanTradeLicense(file)
      dispatch({ type: 'SET_EXTRACTED_BUSINESS', business, tier })
      shareholders.forEach(s => dispatch({ type: 'ADD_SHAREHOLDER', shareholder: s }))
      goTo('business')
    } catch {
      dispatch({ type: 'SET_ERROR', error: 'Could not read the Trade License. Please try again with a clearer image.' })
    }
  }

  async function handleSubmit() {
    dispatch({ type: 'SET_SUBMITTING', submitting: true })
    try {
      const { applicationId } = await submitApplication({ state })
      dispatch({ type: 'SET_SUBMITTED', applicationId })
      goTo('status')

      // Kick off mock pillar progress simulation after navigation
      setTimeout(() => {
        runPillarSimulation(applicationId)
      }, 500)
    } catch {
      dispatch({ type: 'SET_ERROR', error: 'Submission failed. Please try again.' })
      dispatch({ type: 'SET_SUBMITTING', submitting: false })
    }
  }

  async function runPillarSimulation(applicationId: string) {
    const gen = watchPillarProgress(applicationId, (id, pillarState) => {
      dispatch({ type: 'SET_PILLAR_STATE', id, state: pillarState })
    })
    for await (const _ of gen) {
      // each yield triggers the onUpdate callback above
    }
  }

  return { state, dispatch, goTo, handleTLScan, handleSubmit }
}
