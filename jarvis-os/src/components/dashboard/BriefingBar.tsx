import { Sparkles, RefreshCw, Loader2, Volume2, VolumeX } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useMorningBrief } from '@/hooks/useMorningBrief'

// ─── Speech synthesis hook ───────────────────────────────────────────────────

function useSpeech() {
  const [speaking, setSpeaking] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // voiceschanged fires asynchronously in most browsers
  const getVoice = useCallback((): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices()
    return (
      voices.find((v) => v.lang.startsWith('en') && v.localService) ??
      voices.find((v) => v.lang.startsWith('en')) ??
      voices[0] ??
      null
    )
  }, [])

  const speak = useCallback(
    (text: string) => {
      if (!('speechSynthesis' in window)) return

      window.speechSynthesis.cancel()
      const utter = new SpeechSynthesisUtterance(text)
      utter.rate = 0.95
      utter.pitch = 1.0

      const assign = () => {
        const voice = getVoice()
        if (voice) utter.voice = voice
      }

      // voices may not be loaded yet — wait for voiceschanged with a timeout fallback
      if (window.speechSynthesis.getVoices().length > 0) {
        assign()
        window.speechSynthesis.speak(utter)
      } else {
        const handler = () => {
          assign()
          window.speechSynthesis.speak(utter)
          window.speechSynthesis.removeEventListener('voiceschanged', handler)
        }
        window.speechSynthesis.addEventListener('voiceschanged', handler)
        // fallback: speak without a specific voice after 300 ms
        setTimeout(() => {
          if (!speaking) window.speechSynthesis.speak(utter)
        }, 300)
      }

      utter.onstart = () => setSpeaking(true)
      utter.onend = () => setSpeaking(false)
      utter.onerror = () => setSpeaking(false)
      utteranceRef.current = utter
    },
    [getVoice, speaking]
  )

  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [])

  // Stop on unmount
  useEffect(() => () => { window.speechSynthesis.cancel() }, [])

  return { speak, stop, speaking, supported: 'speechSynthesis' in window }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BriefingBar() {
  const { brief, loading, error, regenerate } = useMorningBrief()
  const { speak, stop, speaking, supported } = useSpeech()

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={14} color="var(--accent)" />
          <span
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--accent)',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            Morning Brief
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {supported && brief && (
            <button
              onClick={() => (speaking ? stop() : speak(brief))}
              title={speaking ? 'Stop speaking' : 'Speak briefing'}
              style={{
                background: speaking ? 'rgba(245,158,11,0.12)' : 'none',
                border: 'none',
                cursor: 'pointer',
                color: speaking ? 'var(--accent)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                padding: '4px 8px',
                borderRadius: '6px',
                transition: 'color 0.15s ease',
              }}
            >
              {speaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
              {speaking ? 'Stop' : 'Speak'}
            </button>
          )}
          <button
            onClick={regenerate}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              cursor: loading ? 'default' : 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              padding: '4px 8px',
              borderRadius: '6px',
              transition: 'color 0.15s ease',
            }}
          >
            {loading ? <Loader2 size={12} className="spin" /> : <RefreshCw size={12} />}
            Regenerate
          </button>
        </div>
      </div>

      <p
        style={{
          color: 'var(--text-secondary)',
          fontSize: '13.5px',
          lineHeight: '1.6',
          fontStyle: 'italic',
        }}
      >
        {error
          ? `⚠️ ${error}`
          : loading && !brief
            ? 'Generating your brief…'
            : brief}
      </p>
    </div>
  )
}
