import { useRef } from 'react'
import { DocumentUploadCard, Button } from '@wio/design-system/src/components'
import { ApplicationLayout } from '../components'
import { useApplication } from '../hooks'

export function DocumentUpload() {
  const { state, dispatch, goTo } = useApplication()
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  function handleUploadClick(docId: string) {
    fileRefs.current[docId]?.click()
  }

  function handleFileChange(docId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    dispatch({ type: 'UPDATE_DOCUMENT_STATUS', id: docId, status: 'uploading' })

    // Simulate upload delay
    setTimeout(() => {
      dispatch({ type: 'UPDATE_DOCUMENT_STATUS', id: docId, status: 'uploaded', fileName: file.name })
    }, 1200)

    // Reset file input so same file can be re-uploaded
    e.target.value = ''
  }

  function handleRemove(docId: string) {
    dispatch({ type: 'UPDATE_DOCUMENT_STATUS', id: docId, status: 'pending', fileName: undefined })
  }

  const requiredDocs = state.documents.filter(d => d.required)
  const optionalDocs = state.documents.filter(d => !d.required)
  const allRequiredUploaded = requiredDocs.every(d => d.status === 'uploaded' || d.status === 'verified')

  return (
    <ApplicationLayout
      currentStep="documents"
      title="Document Upload"
      subtitle="Upload your supporting documents. Required documents must be uploaded before you can submit."
    >
      <div style={{ marginBottom: 24 }}>
        <h3 className="section-label" style={{ marginBottom: 12 }}>Required documents</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {requiredDocs.map(doc => (
            <div key={doc.id}>
              <DocumentUploadCard
                name={doc.name}
                description={doc.description}
                required
                status={doc.status}
                fileName={doc.fileName}
                onUpload={() => handleUploadClick(doc.id)}
                onRemove={() => handleRemove(doc.id)}
              />
              <input
                ref={el => { fileRefs.current[doc.id] = el }}
                type="file"
                accept="image/*,.pdf"
                style={{ display: 'none' }}
                onChange={e => handleFileChange(doc.id, e)}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h3 className="section-label" style={{ marginBottom: 4 }}>Optional documents</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
          Providing these may speed up your review and increase your initial credit limit.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {optionalDocs.map(doc => (
            <div key={doc.id}>
              <DocumentUploadCard
                name={doc.name}
                description={doc.description}
                required={false}
                status={doc.status}
                fileName={doc.fileName}
                onUpload={() => handleUploadClick(doc.id)}
                onRemove={() => handleRemove(doc.id)}
              />
              <input
                ref={el => { fileRefs.current[doc.id] = el }}
                type="file"
                accept="image/*,.pdf"
                style={{ display: 'none' }}
                onChange={e => handleFileChange(doc.id, e)}
              />
            </div>
          ))}
        </div>
      </div>

      {!allRequiredUploaded && (
        <div className="card" style={{ marginBottom: 20, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--warning)' }}>
            Please upload all required documents before continuing.
          </p>
        </div>
      )}

      <div className="form-actions">
        <Button variant="ghost" onClick={() => goTo('shareholders')}>Back</Button>
        <Button onClick={() => goTo('review')} disabled={!allRequiredUploaded}>
          Review & Submit
        </Button>
      </div>
    </ApplicationLayout>
  )
}
