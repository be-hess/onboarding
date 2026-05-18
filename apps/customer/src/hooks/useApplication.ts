import { useNavigate } from 'react-router-dom'
import { useApplicationContext } from '../store'
import { authenticateUaePass, runPreScreen, computeCram, submitApplication, watchPillarProgress } from '../services/mockApi'
import type { WizardStep } from '../store/types'

const STEP_ROUTES: Record<WizardStep, string> = {
  'uae-pass': '/',
  'find-business': '/application/find-business',
  'business-questions': '/application/business-questions',
  'who-needs-access': '/application/who-needs-access',
  'tracker': '/application/tracker',
  'activate': '/application/activate',
}

export function useApplication() {
  const { state, dispatch } = useApplicationContext()
  const navigate = useNavigate()

  function goTo(step: WizardStep) {
    dispatch({ type: 'SET_STEP', step })
    navigate(STEP_ROUTES[step])
  }

  async function handleUaePassAuth() {
    dispatch({ type: 'SET_ERROR', error: null })
    try {
      const result = await authenticateUaePass()
      dispatch({ type: 'SET_UAE_PASS_VERIFIED', name: result.fullNameEn })
      goTo('find-business')
    } catch {
      dispatch({ type: 'SET_ERROR', error: 'UAE Pass authentication failed. Please try again.' })
    }
  }

  async function handlePreScreen(licenseNumber: string) {
    dispatch({ type: 'SET_LICENSE_NUMBER', value: licenseNumber })
    dispatch({ type: 'SET_PRE_SCREEN_LOADING', loading: true })
    try {
      const result = await runPreScreen(licenseNumber)
      dispatch({
        type: 'SET_PRE_SCREEN_RESULT',
        result: result.result,
        business: result.business,
        tier: result.tier,
      })
    } catch {
      dispatch({ type: 'SET_PRE_SCREEN_LOADING', loading: false })
      dispatch({ type: 'SET_ERROR', error: 'Could not look up this license number. Please check and try again.' })
    }
  }

  async function handleCramCompute() {
    const { primaryActivity, expectedMonthlyTurnover, sourceOfFunds } = state
    dispatch({ type: 'SET_ERROR', error: null })
    try {
      const result = await computeCram(primaryActivity, expectedMonthlyTurnover, sourceOfFunds)
      dispatch({ type: 'SET_CRAM_RESULT', score: result.score, eddTriggered: result.eddTriggered })
      return result
    } catch {
      dispatch({ type: 'SET_ERROR', error: 'Risk assessment failed. Please try again.' })
      return null
    }
  }

  async function handleSubmit() {
    dispatch({ type: 'SET_SUBMITTING', submitting: true })
    try {
      const { applicationId } = await submitApplication({ state })
      dispatch({ type: 'SET_SUBMITTED', applicationId })
      goTo('tracker')
      setTimeout(() => runPillarSimulation(applicationId), 500)
    } catch {
      dispatch({ type: 'SET_ERROR', error: 'Submission failed. Please try again.' })
      dispatch({ type: 'SET_SUBMITTING', submitting: false })
    }
  }

  async function runPillarSimulation(applicationId: string) {
    const gen = watchPillarProgress(applicationId, (id, pillarState) => {
      dispatch({ type: 'SET_PILLAR_STATE', id, state: pillarState })
    })
    for await (const _ of gen) { /* each yield triggers onUpdate */ }
  }

  return {
    state,
    dispatch,
    goTo,
    handleUaePassAuth,
    handlePreScreen,
    handleCramCompute,
    handleSubmit,
  }
}
