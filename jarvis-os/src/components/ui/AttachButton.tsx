import { Paperclip } from 'lucide-react'

interface AttachButtonProps {
  onPress: () => void
  hasFile: boolean
  disabled?: boolean
}

export default function AttachButton({ onPress, hasFile, disabled }: AttachButtonProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      disabled={disabled}
      title={hasFile ? 'Change attached file' : 'Attach a document'}
      style={{
        background: 'none',
        border: 'none',
        cursor: disabled ? 'default' : 'pointer',
        padding: '4px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        opacity: disabled ? 0.4 : 1,
        transition: 'opacity 0.15s ease',
      }}
    >
      <Paperclip
        size={15}
        strokeWidth={1.8}
        color={hasFile ? 'var(--accent)' : 'var(--text-muted)'}
      />
    </button>
  )
}
