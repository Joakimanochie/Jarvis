import { useState, useEffect, useRef } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { runJarvis } from '@/agents/orchestrator'
import { useAgentStore } from '@/store/agentStore'

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
    const input = value.trim()
    if (!input || busy) return

    setHistory((h) => [input, ...h].slice(0, 20))
    setHistoryIndex(-1)
    setValue('')
    runJarvis(input) // fire and stream — AgentPanel renders the response
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(historyIndex + 1, history.length - 1)
      if (history[next]) {
        setHistoryIndex(next)
        setValue(history[next])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = historyIndex - 1
      if (next < 0) {
        setHistoryIndex(-1)
        setValue('')
      } else {
        setHistoryIndex(next)
        setValue(history[next])
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'var(--bg-elevated)',
          border: `1px solid ${focused ? 'var(--accent)' : 'var(--border-default)'}`,
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: focused ? '0 0 0 3px var(--accent-glow)' : 'none',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        }}
      >
        <span style={{ color: 'var(--accent)', fontSize: '15px', fontWeight: 600, flexShrink: 0 }}>
          ⌘
        </span>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={busy ? 'Jarvis is thinking…' : placeholder}
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
          <Loader2
            size={15}
            color="var(--accent)"
            style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }}
          />
        ) : value ? (
          <button
            type="submit"
            style={{
              background: 'var(--accent)',
              border: 'none',
              borderRadius: '6px',
              padding: '5px 8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Send size={13} color="#000" />
          </button>
        ) : (
          <span
            style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '11px',
              color: 'var(--text-muted)',
              flexShrink: 0,
            }}
          >
            ⌘K
          </span>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </form>
  )
}
