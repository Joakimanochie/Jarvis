import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check } from 'lucide-react'
import { useAgentStore, AGENT_META } from '@/store/agentStore'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        })
      }}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: copied ? 'var(--status-green)' : 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '11px',
        padding: '3px 6px',
        borderRadius: '5px',
      }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export default function AgentPanel() {
  const { exchanges } = useAgentStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom as responses stream
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [exchanges])

  if (exchanges.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          marginBottom: '20px',
          overflow: 'hidden',
        }}
      >
        <div
          ref={scrollRef}
          style={{
            maxHeight: '420px',
            overflowY: 'auto',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {exchanges.map((ex) => {
            const meta = AGENT_META[ex.agent]
            return (
              <div key={ex.id}>
                {/* User input */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginBottom: '10px',
                  }}
                >
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

                {/* Agent response */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: meta.color,
                      }}
                    >
                      <span style={{ fontSize: '13px' }}>{meta.emoji}</span>
                      {meta.label}
                      {ex.streaming && (
                        <motion.span
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ repeat: Infinity, duration: 1.2 }}
                          style={{ color: 'var(--text-muted)', fontWeight: 400 }}
                        >
                          thinking…
                        </motion.span>
                      )}
                    </span>
                    {!ex.streaming && ex.response && <CopyButton text={ex.response} />}
                  </div>

                  <div
                    style={{
                      background: 'var(--bg-elevated)',
                      border: `1px solid var(--border-subtle)`,
                      borderLeft: `2px solid ${meta.color}`,
                      borderRadius: '2px 10px 10px 10px',
                      padding: '12px 16px',
                      fontSize: '13.5px',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.65',
                      whiteSpace: 'pre-wrap',
                      maxWidth: '85%',
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
              </div>
            )
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
