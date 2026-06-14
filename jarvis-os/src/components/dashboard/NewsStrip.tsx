import { useEffect, useRef } from 'react'
import { Rss, ChevronRight } from 'lucide-react'
import { useNewsStore, TOPIC_META } from '@/store/newsStore'
import { runJarvis } from '@/agents/orchestrator'

export default function NewsStrip() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { stories, fetchTop } = useNewsStore()

  useEffect(() => {
    fetchTop()
  }, [fetchTop])

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '10px',
        }}
      >
        <Rss size={13} color="var(--text-muted)" />
        <span
          style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
          }}
        >
          Live News
        </span>
        <span
          style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
          }}
        >
          Refreshes every 30m
        </span>
      </div>

      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'thin',
        }}
      >
        {stories.slice(0, 8).map((story) => {
          const meta = TOPIC_META[story.topic]
          return (
            <div
              key={story.id}
              onClick={() => runJarvis(`Tell me more about: ${story.headline}`)}
              style={{
                flexShrink: 0,
                width: '260px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: '10px',
                padding: '12px 14px',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-strong)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-default)'
              }}
            >
              <div style={{ marginBottom: '6px' }}>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    color: meta.color,
                    background: `${meta.color}18`,
                    padding: '2px 7px',
                    borderRadius: '4px',
                  }}
                >
                  {meta.emoji} {meta.label}
                </span>
              </div>
              <p
                style={{
                  fontSize: '12.5px',
                  color: 'var(--text-primary)',
                  lineHeight: '1.45',
                  marginBottom: '6px',
                }}
              >
                {story.headline}
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{story.source}</span>
                <ChevronRight size={12} color="var(--text-muted)" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
