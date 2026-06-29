import { useState, useEffect } from 'react'
import { Brain } from 'lucide-react'
import { getMemorySummary } from '@/memory/contextInjector'
import { getStoredMemories } from '@/memory/memoryStore'

export default function MemoryCard() {
  const [summary, setSummary] = useState(getMemorySummary)

  useEffect(() => {
    setSummary(getMemorySummary())
  }, [])

  const memories = getStoredMemories()
  const recent = memories.slice(0, 3)

  if (memories.length === 0) return null

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <Brain size={15} color="var(--accent)" />
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: 'Syne, sans-serif' }}>
          Jarvis Remembers
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'DM Mono, monospace' }}>
          {summary.memoryCount} session{summary.memoryCount !== 1 ? 's' : ''}
        </span>
      </div>

      {summary.lastSession && (
        <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: '0 0 12px 0', lineHeight: '1.5' }}>
          Last session: {summary.lastSession}
        </p>
      )}

      {recent.length > 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {recent.slice(1).map((m, i) => {
            const date = new Date(m.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
            return (
              <div key={i} style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '8px' }}>
                <span style={{ fontFamily: 'DM Mono, monospace', flexShrink: 0 }}>{date}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.summary}</span>
              </div>
            )
          })}
        </div>
      )}

      {recent.length > 0 && recent[0].decisions.length > 0 && (
        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>Recent decisions: </span>
          <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
            {recent[0].decisions.slice(0, 2).join(' · ')}
          </span>
        </div>
      )}
    </div>
  )
}
