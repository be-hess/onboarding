import type { ExtractedBusiness, Shareholder, PillarState } from '../store/types'

// Simulates Trade License OCR extraction — returns Wadiwave LLC mock data
export async function scanTradeLicense(_file?: File): Promise<{
  business: ExtractedBusiness
  shareholders: Shareholder[]
  tier: 'express' | 'standard' | 'complex'
}> {
  await delay(2800)
  return {
    tier: 'standard',
    business: {
      tradeName: 'Wadiwave Trading LLC',
      legalName: 'WADIWAVE TRADING LLC',
      licenseNumber: 'DED-2024-087234',
      licenseExpiry: '2025-11-30',
      entityType: 'LLC',
      jurisdiction: 'UAE Mainland (DED)',
      registeredAddress: 'Office 412, Al Quoz Industrial Area 3, Dubai, UAE',
      primaryActivity: 'General Trading',
      secondaryActivity: 'Import & Export of Consumer Goods',
    },
    shareholders: [
      {
        id: 'p1',
        fullName: 'Ahmed Al Mansoori',
        role: 'owner',
        ownership: 60,
        nationality: 'UAE National',
        kycStatus: 'pending',
        email: 'ahmed@wadiwave.ae',
      },
      {
        id: 'p2',
        fullName: 'Sara Khalil',
        role: 'shareholder',
        ownership: 40,
        nationality: 'Lebanese',
        kycStatus: 'pending',
        email: 'sara@wadiwave.ae',
      },
    ],
  }
}

// Simulates application submission
export async function submitApplication(_payload: unknown): Promise<{ applicationId: string }> {
  await delay(1500)
  return { applicationId: `APP-${Date.now().toString(36).toUpperCase()}` }
}

// Simulates async pillar processing — returns snapshots over time
export async function* watchPillarProgress(
  _applicationId: string,
  onUpdate: (id: string, state: Partial<PillarState>) => void
): AsyncGenerator<void> {
  // KYB starts immediately
  await delay(800)
  onUpdate('kyb', { status: 'running', progress: 20, eta: '~2 minutes' })
  yield

  await delay(1200)
  onUpdate('kyb', { status: 'running', progress: 55, eta: '~1 minute' })
  onUpdate('kyc', { status: 'running', progress: 10, eta: '~5 minutes' })
  yield

  await delay(1500)
  onUpdate('kyb', { status: 'passed', progress: 100 })
  onUpdate('kyc', { status: 'running', progress: 40, eta: '~3 minutes' })
  onUpdate('compliance', { status: 'running', progress: 15, eta: '~10 minutes' })
  yield

  await delay(2000)
  onUpdate('kyc', { status: 'running', progress: 75, eta: '~1 minute' })
  onUpdate('compliance', { status: 'running', progress: 50, eta: '~5 minutes' })
  yield

  await delay(1500)
  onUpdate('kyc', { status: 'passed', progress: 100 })
  onUpdate('compliance', { status: 'running', progress: 80, eta: '~2 minutes' })
  yield

  await delay(2000)
  onUpdate('compliance', { status: 'passed', progress: 100 })
  onUpdate('account', { status: 'running', progress: 30, eta: '~1 minute' })
  yield

  await delay(1200)
  onUpdate('account', { status: 'passed', progress: 100 })
  yield
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
