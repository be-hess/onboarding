import { useNavigate } from 'react-router-dom'
import { useApplicationContext } from '../store'
import { scanDocument, submitApplication, watchPillarProgress } from '../services'
import type { WizardStep, DocumentKind } from '../store/types'

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

  // Returns requiresMoa so the start screen can decide whether to show the MOA step
  async function handleDocumentScan(file: File | undefined, documentKind: DocumentKind): Promise<{ requiresMoa: boolean }> {
    dispatch({ type: 'SET_DOCUMENT_KIND', documentKind })
    dispatch({ type: 'SET_TL_SCANNED' })
    dispatch({ type: 'SET_ERROR', error: null })
    try {
      const { business, tier, requiresMoa } = await scanDocument(file, documentKind)
      dispatch({ type: 'SET_EXTRACTED_BUSINESS', business, tier, requiresMoa })
      // Map extracted owners to shareholders
      business.owners.forEach((owner, i) => {
        dispatch({
          type: 'ADD_SHAREHOLDER',
          shareholder: {
            id: `p-extracted-${i}`,
            fullName: owner.name,
            role: 'owner',
            ownership: owner.ownership,
            nationality: owner.nationality ?? '',
            kycStatus: 'pending',
          },
        })
      })
      return { requiresMoa }
    } catch {
      dispatch({ type: 'SET_ERROR', error: 'Could not read the document. Please try again with a clearer image.' })
      return { requiresMoa: false }
    }
  }

  function handleMoaUpload(fileName: string) {
    dispatch({ type: 'UPDATE_DOCUMENT_STATUS', id: 'moa', status: 'uploaded', fileName })
  }

  async function handleSubmit() {
    dispatch({ type: 'SET_SUBMITTING', submitting: true })
    try {
      const { applicationId } = await submitApplication({ state })
      dispatch({ type: 'SET_SUBMITTED', applicationId })
      goTo('status')
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
    for await (const _ of gen) {
      // each yield triggers the onUpdate callback
    }
  }

  return { state, dispatch, goTo, handleDocumentScan, handleMoaUpload, handleSubmit }
}
