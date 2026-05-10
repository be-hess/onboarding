export interface OCRInput {
  document_image_url: string
  document_type: string
}

export interface OCROutput {
  extracted_fields: Record<string, string>
  document_type: string
  is_authentic: boolean
  confidence: number
  source: 'mock'
}

// Stub — returns mock extracted fields
export async function ocrExtract(_input: OCRInput): Promise<OCROutput> {
  throw new Error('Not implemented')
}
