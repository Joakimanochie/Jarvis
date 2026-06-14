import { useEffect, useState, type CSSProperties } from 'react'
import { Mail, AlertCircle, MessageCircleReply, Info, Archive } from 'lucide-react'
import { useCommsStore } from '@/store/commsStore'
import { runJarvis } from '@/agents/orchestrator'
import type { EmailThread, TriageBucket } from '@/types'

const BUCKETS: { key: TriageBucket; label: string; icon: typeof AlertCircle; color: string }[] = [
  { key: 'urgent', label: 'Urgent', icon: AlertCircle, color: '#ef4444' },
  { key: 'reply', label: 'Reply', icon: MessageCircleReply, color: '#f59e0b' },
  { key: 'fyi', label: 'FYI', icon: Info, color: '#3b82f6' },
  { key: 'archive', label: 'Archive', icon: Archive, color: '#6b7280' },
]

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 1) return 'just now'
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function InboxPanel() {
  const { emails, loading, fetchAll } = useCommsStore()

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const [activeBucket, setActiveBucket] = useState<TriageBucket | 'all'>('all')

  const filtered = activeBucket === 'all' ? emails : emails.filter((e) => e.triage === activeBucket)

  function handleClick(email: EmailThread) {
    runJarvis(`Summarise the thread from ${email.sender}`)
  }

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mail size={14} color="var(--accent)" />
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
            Inbox
          </span>
          {loading && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>syncing…</span>}
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setActiveBucket('all')}
            style={tabStyle(activeBucket === 'all')}
          >
            All ({emails.length})
          </button>
          {BUCKETS.map((b) => {
            const count = emails.filter((e) => e.triage === b.key).length
            return (
              <button
                key={b.key}
                onClick={() => setActiveBucket(b.key)}
                style={tabStyle(activeBucket === b.key)}
              >
                <b.icon size={11} color={b.color} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
                {b.label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '260px', overflowY: 'auto' }}>
        {filtered.length === 0 && (
          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', padding: '8px 0' }}>Nothing here.</div>
        )}
        {filtered.map((email) => {
          const bucket = BUCKETS.find((b) => b.key === email.triage)
          return (
            <div
              key={email.id}
              onClick={() => handleClick(email)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '8px 10px',
                borderRadius: '8px',
                cursor: 'pointer',
                border: '1px solid transparent',
                transition: 'background 0.15s ease, border-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement
                el.style.background = 'var(--bg-elevated)'
                el.style.borderColor = 'var(--border-default)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement
                el.style.background = 'transparent'
                el.style.borderColor = 'transparent'
              }}
            >
              {bucket && (
                <bucket.icon size={13} color={bucket.color} style={{ marginTop: '2px', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '12.5px',
                      fontWeight: email.unread ? 600 : 400,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {email.sender}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {timeAgo(email.date)}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {email.subject} — <span style={{ color: 'var(--text-muted)' }}>{email.snippet}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function tabStyle(active: boolean): CSSProperties {
  return {
    background: active ? 'var(--bg-elevated)' : 'transparent',
    border: `1px solid ${active ? 'var(--border-strong)' : 'transparent'}`,
    borderRadius: '6px',
    padding: '4px 8px',
    fontSize: '11px',
    color: active ? 'var(--text-primary)' : 'var(--text-muted)',
    cursor: 'pointer',
  }
}
