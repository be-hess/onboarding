import type { RegistryBusiness, PillarState, PillarId, CramScore } from '../store/types'

// ── Mock UAE Pass ─────────────────────────────────────────────────────────────

export interface UaePassResult {
  uaePassId: string
  emiratesId: string
  fullNameEn: string
  fullNameAr: string
  nationality: string
  assuranceLevel: 'high'
}

export async function authenticateUaePass(): Promise<UaePassResult> {
  await delay(1500)
  return {
    uaePassId: 'uap-784-1990-1234567',
    emiratesId: '784-1990-1234567-1',
    fullNameEn: 'Mohammed Al Rashid',
    fullNameAr: 'محمد الراشد',
    nationality: 'UAE National',
    assuranceLevel: 'high',
  }
}

// ── Mock Pre-Screen (registry pull + screening) ───────────────────────────────

export interface PreScreenResult {
  result: 'eligible' | 'needs_review' | 'cannot_proceed'
  tier: 'express' | 'standard' | 'complex'
  business: RegistryBusiness
  estimatedT2ft: string
}

const MOCK_LLC_BUSINESS: RegistryBusiness = {
  licensingAuthority: 'Dubai Economy and Tourism (DET)',
  licenseNumber: 'DET-2024-087234',
  legalType: 'Limited Liability Company (LLC)',
  tradeName: 'Wadiwave Trading LLC',
  legalNameAr: 'وادي ويف للتجارة ذ.م.م',
  issueDate: '2022-11-30',
  licenseExpiry: '2026-11-30',
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
  entityType: 'llc',
  jurisdiction: 'uae_mainland',
}

const MOCK_SOLE_EST_BUSINESS: RegistryBusiness = {
  licensingAuthority: 'TAMM (Abu Dhabi Department of Economic Development)',
  licenseNumber: 'ADDED-2024-091234',
  legalType: 'Sole Establishment',
  tradeName: 'Mohammed Al Rashid Tech Solutions',
  legalNameAr: 'محمد الراشد لحلول التقنية',
  issueDate: '2024-01-15',
  licenseExpiry: '2026-01-15',
  registeredAddress: 'Office 201, Al Muroor Road, Abu Dhabi, UAE',
  commercialActivities: ['IT Consulting', 'Software Development', 'Digital Marketing'],
  owners: [
    { name: 'Mohammed Al Rashid', ownership: 100, nationality: 'UAE National' },
  ],
  entityType: 'sole_establishment',
  jurisdiction: 'uae_mainland',
}

export async function runPreScreen(licenseNumber: string): Promise<PreScreenResult> {
  await delay(2200)
  // Demo: sole establishment pattern → express tier
  const isSoleEst = licenseNumber.toLowerCase().startsWith('added') || licenseNumber.endsWith('1')
  if (isSoleEst) {
    return {
      result: 'eligible',
      tier: 'express',
      business: MOCK_SOLE_EST_BUSINESS,
      estimatedT2ft: 'Under 1 hour',
    }
  }
  return {
    result: 'eligible',
    tier: 'standard',
    business: MOCK_LLC_BUSINESS,
    estimatedT2ft: 'Under 24 hours',
  }
}

// ── Mock CRAM (Step 03) ───────────────────────────────────────────────────────

export interface CramResult {
  score: CramScore
  eddTriggered: boolean
  policyVersion: string
}

export async function computeCram(
  primaryActivity: string,
  turnover: string,
  sourceOfFunds: string
): Promise<CramResult> {
  await delay(800)
  const highRiskKeywords = ['crypto', 'gold', 'real estate', 'charity', 'msb', 'gaming', 'oil']
  const isHighRisk = highRiskKeywords.some(k => primaryActivity.toLowerCase().includes(k))
  const isHighTurnover = turnover === 'over_1m'
  return {
    score: isHighRisk ? 'high' : isHighTurnover ? 'medium' : 'low',
    eddTriggered: isHighRisk,
    policyVersion: 'cram-v2.1.0',
  }
}

// ── Mock submission ───────────────────────────────────────────────────────────

export async function submitApplication(_payload: unknown): Promise<{ applicationId: string }> {
  await delay(1200)
  return { applicationId: `APP-${Date.now().toString(36).toUpperCase()}` }
}

// ── Mock pillar progress (3-lane: KYB · KYI · WWMA) ─────────────────────────

export async function* watchPillarProgress(
  _applicationId: string,
  onUpdate: (id: PillarId, state: Partial<PillarState>) => void
): AsyncGenerator<void> {
  await delay(600)
  onUpdate('kyb', { status: 'running', progress: 25, eta: '~2 min' })
  yield

  await delay(1000)
  onUpdate('kyb', { status: 'running', progress: 60, eta: '~1 min' })
  onUpdate('kyi', { status: 'running', progress: 15, eta: '~4 min' })
  yield

  await delay(1200)
  onUpdate('kyb', { status: 'passed', progress: 100 })
  onUpdate('kyi', { status: 'running', progress: 45, eta: '~2 min' })
  onUpdate('wwma', { status: 'running', progress: 20, eta: '~5 min' })
  yield

  await delay(1500)
  onUpdate('kyi', { status: 'running', progress: 80, eta: '~1 min' })
  onUpdate('wwma', { status: 'running', progress: 55, eta: '~3 min' })
  yield

  await delay(1000)
  onUpdate('kyi', { status: 'passed', progress: 100 })
  onUpdate('wwma', { status: 'running', progress: 80, eta: '~1 min' })
  yield

  await delay(1200)
  onUpdate('wwma', { status: 'passed', progress: 100 })
  yield
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
