import type { ExtractedBusiness, DocumentKind, PillarState } from '../store/types'

export interface ScanResult {
  business: ExtractedBusiness
  tier: 'express' | 'standard' | 'complex'
  requiresMoa: boolean
}

const MOCK_BUSINESS_LICENSE: ScanResult = {
  tier: 'standard',
  requiresMoa: true,
  business: {
    documentKind: 'business_license',
    licensingAuthority: 'Dubai Economy and Tourism (DET)',
    licenseNumber: 'DET-2024-087234',
    legalType: 'Limited Liability Company (LLC)',
    tradeName: 'Wadiwave Trading LLC',
    issueDate: '2022-11-30',
    licenseExpiry: '2025-11-30',
    registeredAddress: 'Office 412, Al Quoz Industrial Area 3, Dubai, UAE',
    commercialActivities: [
      'General Trading',
      'Import and Export of Consumer Goods',
      'Wholesale of Household Products',
    ],
    owners: [
      { name: 'Ahmed Al Mansoori', ownership: 60, nationality: 'UAE National' },
      { name: 'Sara Khalil', ownership: 40, nationality: 'Lebanese' },
    ],
  },
}

const MOCK_FREELANCER_PERMIT: ScanResult = {
  tier: 'express',
  requiresMoa: false,
  business: {
    documentKind: 'freelancer_permit',
    licensingAuthority: 'twofour54 (Abu Dhabi Media Zone Authority)',
    licenseNumber: 'FL-2024-T54-3421',
    legalType: 'Freelancer Permit',
    tradeName: 'Mohammed Al Rashid',
    issueDate: '2024-01-15',
    licenseExpiry: '2025-01-15',
    registeredAddress: 'twofour54, Khalifa City, Abu Dhabi, UAE',
    commercialActivities: ['Media Production', 'Content Creation', 'Digital Marketing'],
    owners: [
      { name: 'Mohammed Al Rashid', ownership: 100, nationality: 'UAE National' },
    ],
  },
}

export async function scanDocument(_file: File | undefined, documentKind: DocumentKind): Promise<ScanResult> {
  await delay(2800)
  return documentKind === 'business_license' ? MOCK_BUSINESS_LICENSE : MOCK_FREELANCER_PERMIT
}

// Generates an AI business model summary from the extracted document data + activities
export async function generateBusinessModelSummary(
  business: ExtractedBusiness,
  activities: string[],
  primaryIndex: number
): Promise<string> {
  await delay(1800)

  const primary = activities[primaryIndex] ?? activities[0] ?? 'trading'
  const others = activities.filter((_, i) => i !== primaryIndex)

  if (business.documentKind === 'freelancer_permit') {
    return (
      `${business.tradeName} operates as a freelance professional licensed by ${business.licensingAuthority}. ` +
      `The primary service offering is ${primary.toLowerCase()}` +
      (others.length > 0 ? `, with additional services in ${others.map(a => a.toLowerCase()).join(' and ')}` : '') +
      `. As a sole operator, the business model is service-based with direct client engagements and project-based or retainer revenue. No corporate structure or co-investors are involved.`
    )
  }

  return (
    `${business.tradeName} is a ${business.legalType} licensed by ${business.licensingAuthority}, ` +
    `with ${business.owners.length} shareholder${business.owners.length > 1 ? 's' : ''}. ` +
    `The primary business activity is ${primary.toLowerCase()}` +
    (others.length > 0 ? `, supported by ${others.map(a => a.toLowerCase()).join(' and ')}` : '') +
    `. The business operates from ${business.registeredAddress}. ` +
    `Revenue is generated through commercial trade, with goods-based transactions as the core model.`
  )
}

export async function submitApplication(_payload: unknown): Promise<{ applicationId: string }> {
  await delay(1500)
  return { applicationId: `APP-${Date.now().toString(36).toUpperCase()}` }
}

export async function* watchPillarProgress(
  _applicationId: string,
  onUpdate: (id: string, state: Partial<PillarState>) => void
): AsyncGenerator<void> {
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
