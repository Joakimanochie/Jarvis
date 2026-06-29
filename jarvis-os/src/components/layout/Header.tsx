import { useState, useEffect, useCallback } from 'react'
import { useCommsStore, selectNextEvent } from '@/store/commsStore'
import { getWakeWordEnabled } from '@/store/wakeWordSettings'
import type { CalendarEvent } from '@/types'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDateTime() {
  const now = new Date()
  const day = now.toLocaleDateString('en-GB', { weekday: 'short' })
  const date = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return `${day}, ${date} · ${time}`
}

function nextMeetingLabel(next: CalendarEvent | null): string | null {
  if (!next) return null
  const minutes = Math.round((new Date(next.start).getTime() - Date.now()) / 60_000)
  if (minutes <= 0) return null
  if (minutes < 60) return `Next: "${next.title}" in ${minutes} min`
  const hours = Math.floor(minutes / 60)
  return `Next: "${next.title}" in ${hours}h ${minutes % 60}m`
}

export default function Header() {
  const [dateTime, setDateTime] = useState(formatDateTime())
  const { events, fetchAll } = useCommsStore()
  const [wakeActive, setWakeActive] = useState(getWakeWordEnabled)

  useEffect(() => {
    const interval = setInterval(() => setDateTime(formatDateTime()), 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  useEffect(() => {
    const handler = () => setWakeActive(getWakeWordEnabled())
    window.addEventListener('jarvis_wake_word_changed', handler)
    return () => window.removeEventListener('jarvis_wake_word_changed', handler)
  }, [])

  const [saving, setSaving] = useState(false)

  const endSession = useCallback(async () => {
    setSaving(true)
    const { runMemoryBuilder } = await import('@/memory/memoryBuilder')
    await runMemoryBuilder()
    setSaving(false)
  }, [])

  // Save memory on tab close
  useEffect(() => {
    const handler = () => {
      import('@/memory/memoryBuilder').then(({ runMemoryBuilder }) => runMemoryBuilder())
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])

  const meetingLabel = nextMeetingLabel(selectNextEvent(events))

  return (
    <header
      style={{
        height: '56px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span
          style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 600,
            fontSize: '15px',
            color: 'var(--text-primary)',
            letterSpacing: '-0.2px',
          }}
        >
          {getGreeting()}, Tobe
        </span>

        {/* Wake word active indicator */}
        {wakeActive && (
          <span
            title='Wake word active — say "Hey Jarvis"'
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid var(--accent-dim)',
              borderRadius: '999px',
              padding: '2px 8px',
              fontSize: '11px',
              color: 'var(--accent)',
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 500,
              cursor: 'default',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--accent)',
                animation: 'wakeWordPulse 2s ease-in-out infinite',
                flexShrink: 0,
              }}
            />
            Hey Jarvis
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={endSession}
          disabled={saving}
          title="Save session to memory"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '11px',
            color: saving ? 'var(--accent)' : 'var(--text-muted)',
            cursor: saving ? 'default' : 'pointer',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          {saving ? 'Saving…' : 'End Session'}
        </button>
        {meetingLabel && (
          <span
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '12px',
              color: 'var(--accent)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: '999px',
              padding: '4px 10px',
            }}
          >
            {meetingLabel}
          </span>
        )}
        <span
          style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '12px',
            color: 'var(--text-muted)',
            letterSpacing: '0.3px',
          }}
        >
          {dateTime}
        </span>
      </div>

      <style>{`
        @keyframes wakeWordPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
      `}</style>
    </header>
  )
}
