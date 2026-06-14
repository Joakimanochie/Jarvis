import { useEffect } from 'react'
import { CalendarDays, Video, MapPin } from 'lucide-react'
import { useCommsStore } from '@/store/commsStore'

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export default function CalendarTimeline() {
  const { events, loading, fetchAll } = useCommsStore()

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const sorted = [...events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <CalendarDays size={14} color="var(--accent)" />
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
          Today's Schedule
        </span>
        {loading && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>syncing…</span>}
      </div>

      {sorted.length === 0 ? (
        <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>No events scheduled today.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sorted.map((event) => {
            const past = new Date(event.end).getTime() < Date.now()
            return (
              <div
                key={event.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  opacity: past ? 0.5 : 1,
                }}
              >
                <div
                  style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    minWidth: '92px',
                  }}
                >
                  {fmtTime(event.start)}–{fmtTime(event.end)}
                </div>
                <div style={{ flex: 1, fontSize: '13px', color: 'var(--text-primary)' }}>{event.title}</div>
                {event.location && (
                  <span title={event.location} style={{ display: 'flex' }}>
                    <MapPin size={13} color="var(--text-muted)" />
                  </span>
                )}
                {event.videoLink && (
                  <a
                    href={event.videoLink}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'flex', color: 'var(--status-blue)' }}
                  >
                    <Video size={13} />
                  </a>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
