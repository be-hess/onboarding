export type TradeLicenseAuthority =
  | 'ded_ad'
  | 'det_dubai'
  | 'adgm'
  | 'difc'
  | 'moec'
  | 'uaq_ftz'
  | 'rak_icc'
  | 'jafza'
  | 'dmcc'
  | 'other_free_zone'
  | 'other'

export type TradeLicenseStatus = 'active' | 'expired' | 'suspended'

export type RegistryDataSource = 'registry_api' | 'document_upload' | 'manual'

export interface UBONode {
  id: string
  name: string
  type: 'person' | 'entity'
  ownership_pct: number
  jurisdiction?: string
  person_id?: string
}

export interface Business {
  id: string
  trade_license_number: string
  trade_license_authority: TradeLicenseAuthority
  legal_name: string
  trade_name: string
  entity_type: string
  jurisdiction: string
  incorporated_at: string
  trade_license_expiry: string
  trade_license_status: TradeLicenseStatus
  primary_business_activity: string
  business_activities: string[]
  compliance_activity_category?: string
  ubo_graph?: UBONode[]
  registry_data_source: RegistryDataSource
  registry_data_fetched_at?: string
  created_at: string
  updated_at: string
}
