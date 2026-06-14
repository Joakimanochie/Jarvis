import { useState, useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

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

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [exchanges])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const input = value.trim()
    if (!input || busy) return
    setValue('')
    setBusy(true)

    const id = `ex_${Date.now()}`
    setExchanges((prev) => [...prev, { id, input, response: '', streaming: true }])

    try {
      await runner(input, (fullText) => {
        setExchanges((prev) => prev.map((ex) => (ex.id === id ? { ...ex, response: fullText } : ex)))
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setExchanges((prev) => prev.map((ex) => (ex.id === id ? { ...ex, response: `⚠️ ${message}` } : ex)))
    } finally {
      setExchanges((prev) => prev.map((ex) => (ex.id === id ? { ...ex, streaming: false } : ex)))
      setBusy(false)
    }
  }

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
            border: '1px solid var(--border-default)',
            borderRadius: '12px',
            padding: '12px 16px',
          }}
        >
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={busy ? 'Thinking…' : placeholder}
            disabled={busy}
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
          {busy ? (
            <Loader2 size={15} color={color} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <button
              type="submit"
              disabled={!value.trim()}
              style={{
                background: value.trim() ? color : 'var(--bg-hover)',
                border: 'none',
                borderRadius: '6px',
                padding: '5px 8px',
                cursor: value.trim() ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Send size={13} color={value.trim() ? '#000' : 'var(--text-muted)'} />
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
