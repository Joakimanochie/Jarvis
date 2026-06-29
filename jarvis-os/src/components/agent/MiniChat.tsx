import { useCallback, useEffect, useRef, useState } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { usePushToTalk } from '@/hooks/usePushToTalk'
import { useFileAttachment, buildAttachedInput } from '@/hooks/useFileAttachment'
import MicButton from '@/components/ui/MicButton'
import AttachButton from '@/components/ui/AttachButton'
import FileChip from '@/components/ui/FileChip'

interface Exchange {
  id: string
  input: string
  response: string
  streaming: boolean
}

interface MiniChatProps {
  runner: (input: string, onToken: (fullText: string) => void, signal?: AbortSignal) => Promise<string>
  color: string
  placeholder: string
  examples: string[]
}

export default function MiniChat({ runner, color, placeholder, examples }: MiniChatProps) {
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const [exchanges, setExchanges] = useState<Exchange[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileAttach = useFileAttachment()

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [exchanges])

  const submit = useCallback(
    async (input: string) => {
      const enriched = buildAttachedInput(input, fileAttach.attachedFile, fileAttach.attachedText, fileAttach.fileType)
      const trimmed = enriched.trim()
      if (!trimmed || busy) return
      setValue('')
      fileAttach.clearFile()
      setBusy(true)

      const id = `ex_${Date.now()}`
      setExchanges((prev) => [...prev, { id, input: trimmed, response: '', streaming: true }])

      try {
        await runner(trimmed, (fullText) => {
          setExchanges((prev) => prev.map((ex) => (ex.id === id ? { ...ex, response: fullText } : ex)))
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setExchanges((prev) => prev.map((ex) => (ex.id === id ? { ...ex, response: `⚠️ ${message}` } : ex)))
      } finally {
        setExchanges((prev) => prev.map((ex) => (ex.id === id ? { ...ex, streaming: false } : ex)))
        setBusy(false)
      }
    },
    [busy, runner]
  )

  const { state: pttState, interimTranscript, toggle: toggleMic, supported: micSupported } = usePushToTalk({
    onTranscript: (text) => submit(text),
  })

  useEffect(() => {
    if (interimTranscript) setValue(interimTranscript)
  }, [interimTranscript])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submit(value)
  }

  const isRecording = pttState === 'recording'

  return (
    <div>
      {exchanges.length === 0 ? (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: '12px',
            padding: '32px 20px',
            textAlign: 'center',
            marginBottom: '16px',
          }}
        >
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '6px' }}>
            Try one of these:
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>
            {examples.map((ex, i) => (
              <span key={ex}>
                "{ex}"{i < examples.length - 1 ? ' · ' : ''}
              </span>
            ))}
          </p>
        </div>
      ) : (
        <div
          ref={scrollRef}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: '12px',
            marginBottom: '16px',
            maxHeight: '520px',
            overflowY: 'auto',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {exchanges.map((ex) => (
            <div key={ex.id}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                <div
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '10px 10px 2px 10px',
                    padding: '8px 14px',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    maxWidth: '70%',
                  }}
                >
                  {ex.input}
                </div>
              </div>
              <div
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderLeft: `2px solid ${color}`,
                  borderRadius: '2px 10px 10px 10px',
                  padding: '12px 16px',
                  fontSize: '13.5px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.65',
                  whiteSpace: 'pre-wrap',
                  maxWidth: '90%',
                }}
              >
                {ex.response || (
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    style={{ color: 'var(--text-muted)' }}
                  >
                    ●●●
                  </motion.span>
                )}
                {ex.streaming && ex.response && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6 }}
                    style={{ color: 'var(--accent)' }}
                  >
                    ▋
                  </motion.span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--bg-elevated)',
            border: `1px solid ${isRecording ? '#ef4444' : 'var(--border-default)'}`,
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: isRecording ? '0 0 0 3px rgba(239,68,68,0.12)' : 'none',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          }}
        >
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={
              isRecording
                ? 'Listening…'
                : pttState === 'transcribing'
                  ? 'Transcribing…'
                  : busy
                    ? 'Thinking…'
                    : placeholder
            }
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
          <MicButton state={pttState} supported={micSupported} onToggle={toggleMic} color={color} />
          {busy ? (
            <Loader2 size={15} color={color} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <button
              type="submit"
              disabled={!value.trim() || isRecording}
              style={{
                background: value.trim() && !isRecording ? color : 'var(--bg-hover)',
                border: 'none',
                borderRadius: '6px',
                padding: '5px 8px',
                cursor: value.trim() && !isRecording ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Send size={13} color={value.trim() && !isRecording ? '#000' : 'var(--text-muted)'} />
            </button>
          )}
        </div>
        <input ref={fileAttach.inputRef} type="file" accept={fileAttach.accept} onChange={fileAttach.onFileChange} style={{ display: 'none' }} />
        {fileAttach.attachedFile && (
          <FileChip file={fileAttach.attachedFile} isProcessing={fileAttach.isProcessing} onClear={fileAttach.clearFile} />
        )}
      </form>
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
