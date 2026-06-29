import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { runJarvis } from '@/agents/orchestrator'
import { useAgentStore } from '@/store/agentStore'
import { usePushToTalk } from '@/hooks/usePushToTalk'
import { useWakeWord } from '@/hooks/useWakeWord'
import { useFileAttachment, buildAttachedInput } from '@/hooks/useFileAttachment'
import MicButton from '@/components/ui/MicButton'
import AttachButton from '@/components/ui/AttachButton'
import FileChip from '@/components/ui/FileChip'
import { getWakeWordEnabled, setWakeWordEnabled } from '@/store/wakeWordSettings'

export { getWakeWordEnabled, setWakeWordEnabled }

const PLACEHOLDERS = [
  'Ask Jarvis anything…',
  'Add a task…',
  "What's my focus today?",
  'What are my top 3 priorities?',
  'Update research goal to 75%…',
]

export default function CommandBar() {
  const [value, setValue] = useState('')
  const [placeholder, setPlaceholder] = useState(PLACEHOLDERS[0])
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const [focused, setFocused] = useState(false)
  const busy = useAgentStore((s) => s.busy)
  const fileAttach = useFileAttachment()

  // Wake word enabled state (persisted to localStorage)
  const [wakeEnabled, setWakeEnabled] = useState(getWakeWordEnabled)
  useEffect(() => {
    const handler = () => setWakeEnabled(getWakeWordEnabled())
    window.addEventListener('jarvis_wake_word_changed', handler)
    return () => window.removeEventListener('jarvis_wake_word_changed', handler)
  }, [])

  const submit = useCallback(
    (input: string) => {
      const enriched = buildAttachedInput(input, fileAttach.attachedFile, fileAttach.attachedText, fileAttach.fileType)
      const trimmed = enriched.trim()
      if (!trimmed || busy) return
      setHistory((h) => [input.trim(), ...h].slice(0, 20))
      setHistoryIndex(-1)
      setValue('')
      fileAttach.clearFile()
      runJarvis(trimmed)
    },
    [busy, fileAttach]
  )

  // Refs to break ordering/circular dependencies between PTT and wake word
  const wakePauseRef  = useRef<() => void>(() => {})
  const wakeResumeRef = useRef<() => void>(() => {})

  // PTT
  const {
    state: pttState,
    interimTranscript,
    toggle: toggleMic,
    supported: micSupported,
  } = usePushToTalk({
    onTranscript: useCallback((text: string) => {
      submit(text)
      wakeResumeRef.current()  // restart wake word after speech ends
    }, [submit]),
  })

  // Mic button handler — pause wake word FIRST so Chrome releases the mic,
  // then start PTT after a gap (Chrome needs ~200 ms to free the SR instance)
  const handleMicToggle = useCallback(() => {
    if (pttState === 'idle') {
      wakePauseRef.current()
      setTimeout(() => toggleMic(), 200)
    } else {
      toggleMic()
    }
  }, [pttState, toggleMic])

  // Stable onWake — wake word already paused itself before calling this
  const onWake = useCallback(() => {
    setValue('')
    inputRef.current?.focus()
    setTimeout(() => toggleMic(), 200)
  }, [toggleMic])

  // Wake word
  const wakeWord = useWakeWord({
    enabled: wakeEnabled && micSupported,
    onWake,
  })

  // Keep pause/resume refs in sync
  useEffect(() => { wakePauseRef.current  = wakeWord.pause  }, [wakeWord.pause])
  useEffect(() => { wakeResumeRef.current = wakeWord.resume }, [wakeWord.resume])

  // Show interim transcript live in input
  useEffect(() => {
    if (interimTranscript) setValue(interimTranscript)
  }, [interimTranscript])

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      i = (i + 1) % PLACEHOLDERS.length
      setPlaceholder(PLACEHOLDERS[i])
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submit(value)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(historyIndex + 1, history.length - 1)
      if (history[next]) { setHistoryIndex(next); setValue(history[next]) }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = historyIndex - 1
      if (next < 0) { setHistoryIndex(-1); setValue('') }
      else { setHistoryIndex(next); setValue(history[next]) }
    }
  }

  const isRecording = pttState === 'recording'
  const isWakeListening = wakeEnabled && wakeWord.state === 'listening'
  const showWakeDebug = wakeEnabled && wakeWord.lastHeard

  const placeholderText = isRecording
    ? 'Listening…'
    : pttState === 'transcribing'
      ? 'Transcribing…'
      : wakeWord.state === 'triggered'
        ? 'Wake word detected — listening…'
        : isWakeListening
          ? 'Listening for "Hey Jarvis"…'
          : busy
            ? 'Jarvis is thinking…'
            : placeholder

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'var(--bg-elevated)',
          border: `1px solid ${
            isRecording || wakeWord.state === 'triggered'
              ? '#ef4444'
              : isWakeListening
                ? 'var(--accent)'
                : focused
                  ? 'var(--accent)'
                  : 'var(--border-default)'
          }`,
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow:
            isRecording || wakeWord.state === 'triggered'
              ? '0 0 0 3px rgba(239,68,68,0.12)'
              : isWakeListening
                ? '0 0 0 3px var(--accent-glow)'
                : focused
                  ? '0 0 0 3px var(--accent-glow)'
                  : 'none',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        }}
      >
        <span style={{ color: 'var(--accent)', fontSize: '15px', fontWeight: 600, flexShrink: 0 }}>⌘</span>

        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholderText}
          disabled={busy || isRecording}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '14px',
            fontFamily: 'DM Sans, sans-serif',
            opacity: busy ? 0.6 : 1,
          }}
        />

        <AttachButton onPress={fileAttach.pickFile} hasFile={!!fileAttach.attachedFile} disabled={busy || isRecording} />
        <MicButton state={pttState} supported={micSupported} onToggle={handleMicToggle} />

        {busy ? (
          <Loader2 size={15} color="var(--accent)" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
        ) : value && !isRecording ? (
          <button
            type="submit"
            style={{
              background: 'var(--accent)', border: 'none', borderRadius: '6px',
              padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center',
            }}
          >
            <Send size={13} color="#000" />
          </button>
        ) : !isRecording ? (
          <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0 }}>
            ⌘K
          </span>
        ) : null}
      </div>
      <input
        ref={fileAttach.inputRef}
        type="file"
        accept={fileAttach.accept}
        onChange={fileAttach.onFileChange}
        style={{ display: 'none' }}
      />
      {fileAttach.attachedFile && (
        <FileChip file={fileAttach.attachedFile} isProcessing={fileAttach.isProcessing} onClear={fileAttach.clearFile} />
      )}
      {showWakeDebug && (
        <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '4px', paddingLeft: '4px', fontFamily: 'DM Mono, monospace' }}>
          heard: "{wakeWord.lastHeard}"
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </form>
  )
}
