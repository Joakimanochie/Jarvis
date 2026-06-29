/**
 * Reusable push-to-talk mic button.
 * Renders idle / recording (pulsing ring) / transcribing (spinner) states.
 */

import { Mic, MicOff, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PTTState } from '@/hooks/usePushToTalk'

interface MicButtonProps {
  state: PTTState
  supported: boolean
  onToggle: () => void
  /** Accent colour for the recording ring. Pass `color` (agent accent) or leave unset for default red. */
  color?: string
}

export default function MicButton({ state, supported, onToggle, color = '#ef4444' }: MicButtonProps) {
  if (!supported) {
    return (
      <button
        type="button"
        disabled
        title="Voice input not supported in this browser (use Chrome)"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'not-allowed',
          color: 'var(--text-muted)',
          opacity: 0.4,
          display: 'flex',
          alignItems: 'center',
          padding: '4px',
          flexShrink: 0,
        }}
      >
        <MicOff size={15} />
      </button>
    )
  }

  const isRecording = state === 'recording'
  const isTranscribing = state === 'transcribing'

  return (
    <button
      type="button"
      onClick={onToggle}
      title={isRecording ? 'Stop recording' : 'Push to talk'}
      style={{
        background: isRecording ? `${color}18` : 'none',
        border: 'none',
        cursor: 'pointer',
        color: isRecording ? color : 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px',
        borderRadius: '6px',
        flexShrink: 0,
        position: 'relative',
        transition: 'color 0.15s ease, background 0.15s ease',
      }}
    >
      {/* Pulsing ring while recording */}
      <AnimatePresence>
        {isRecording && (
          <motion.span
            key="ring"
            initial={{ opacity: 0.7, scale: 1 }}
            animate={{ opacity: 0, scale: 2.2 }}
            exit={{ opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.1, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '6px',
              border: `1.5px solid ${color}`,
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      {isTranscribing ? (
        <Loader2 size={15} style={{ animation: 'spin 0.7s linear infinite' }} />
      ) : (
        <Mic size={15} />
      )}
    </button>
  )
}
