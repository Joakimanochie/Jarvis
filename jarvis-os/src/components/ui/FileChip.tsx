import { useState } from 'react'
import { Paperclip, X, Upload, Loader2 } from 'lucide-react'
import { isGoogleConnected } from '@/integrations/googleAuth'

interface FileChipProps {
  file: File
  isProcessing: boolean
  onClear: () => void
}

export default function FileChip({ file, isProcessing, onClear }: FileChipProps) {
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)

  const saveToDrive = async () => {
    setUploading(true)
    try {
      const { uploadFile } = await import('@/integrations/drive')
      await uploadFile(file)
      setUploaded(true)
    } catch {
      // silently fail
    } finally {
      setUploading(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginTop: '6px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: '8px',
        padding: '5px 10px',
        fontSize: '12px',
        color: 'var(--text-secondary)',
      }}
    >
      {isProcessing ? (
        <Loader2 size={12} color="var(--accent)" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
      ) : (
        <Paperclip size={12} color="var(--accent)" style={{ flexShrink: 0 }} />
      )}

      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
        {isProcessing ? `Parsing ${file.name}…` : file.name}
      </span>

      {!isProcessing && isGoogleConnected() && !uploaded && (
        <button
          type="button"
          onClick={saveToDrive}
          disabled={uploading}
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: '6px',
            padding: '2px 8px',
            fontSize: '11px',
            color: 'var(--text-muted)',
            cursor: uploading ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            flexShrink: 0,
          }}
        >
          {uploading ? (
            <Loader2 size={10} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <Upload size={10} />
          )}
          Save to Drive
        </button>
      )}

      {uploaded && (
        <span style={{ fontSize: '11px', color: 'var(--status-green)', flexShrink: 0 }}>
          ✓ Saved
        </span>
      )}

      <button
        type="button"
        onClick={onClear}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          marginLeft: 'auto',
        }}
      >
        <X size={12} color="var(--text-muted)" />
      </button>
    </div>
  )
}
