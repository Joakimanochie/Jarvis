import { useState, useEffect } from 'react'
import { useCommsStore, selectNextEvent } from '@/store/commsStore'
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

  useEffect(() => {
    const interval = setInterval(() => setDateTime(formatDateTime()), 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

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

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
    </header>
  )
}
