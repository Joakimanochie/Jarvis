import { ExternalLink, BookmarkPlus, Megaphone, Sparkles } from 'lucide-react'
import type { NewsStory } from '@/types'
import { useNewsStore, TOPIC_META } from '@/store/newsStore'
import { runJarvis } from '@/agents/orchestrator'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 1) return 'just now'
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function StoryCard({ story }: { story: NewsStory }) {
  const { saveStory } = useNewsStore()
  const meta = TOPIC_META[story.topic]

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: '10px',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{timeAgo(story.publishedAt)}</span>
      </div>
      <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: '1.45' }}>{story.headline}</p>
      {story.summary && <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{story.summary}</p>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{story.source}</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => runJarvis(`Tell me more about: ${story.headline}`)} style={iconBtn()} title="Deep dive">
            <Sparkles size={12} />
          </button>
          <button onClick={() => saveStory(story)} style={iconBtn()} title="Save to reading list">
            <BookmarkPlus size={12} />
          </button>
          <button
            onClick={() => runJarvis(`Write a LinkedIn post about this story: "${story.headline}" — ${story.summary}`)}
            style={iconBtn()}
            title="Write a post about this"
          >
            <Megaphone size={12} />
          </button>
          <a href={story.url} target="_blank" rel="noreferrer" style={iconBtn()} title="Open source">
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  )
}

function iconBtn() {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  } as const
}
