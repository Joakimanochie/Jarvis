import { useEffect, useState } from 'react'
import { useNewsStore, ALL_TOPICS, TOPIC_META } from '@/store/newsStore'
import { isNewsConfigured } from '@/integrations/news'
import StoryCard from '@/components/news/StoryCard'
import type { NewsTopic } from '@/types'

export default function NewsView() {
  const { stories, saved, loading, fetchTop, fetchTopic } = useNewsStore()
  const [activeTopic, setActiveTopic] = useState<NewsTopic | 'saved'>('ai')
  const [topicStories, setTopicStories] = useState<typeof stories>([])

  useEffect(() => {
    fetchTop()
  }, [fetchTop])

  useEffect(() => {
    if (activeTopic === 'saved') return
    fetchTopic(activeTopic).then(setTopicStories)
  }, [activeTopic, fetchTopic])

  const shown = activeTopic === 'saved' ? saved : topicStories.length > 0 ? topicStories : stories.filter((s) => s.topic === activeTopic)

  return (
    <div>
      <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
        News Intelligence
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '4px' }}>
        Live headlines across your watchlist. Ask Jarvis "what's happening in AI today?" for a briefing.
      </p>
      {!isNewsConfigured() && (
        <p style={{ color: 'var(--status-amber)', fontSize: '12px', marginBottom: '16px' }}>
          ⚠️ VITE_NEWS_API_KEY not set — showing sample headlines. Get a free key at newsapi.org.
        </p>
      )}

      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {ALL_TOPICS.map((topic) => {
          const meta = TOPIC_META[topic]
          const active = activeTopic === topic
          return (
            <button
              key={topic}
              onClick={() => setActiveTopic(topic)}
              style={{
                background: active ? 'var(--bg-elevated)' : 'transparent',
                border: `1px solid ${active ? 'var(--border-strong)' : 'var(--border-default)'}`,
                borderRadius: '999px',
                padding: '6px 12px',
                fontSize: '12px',
                color: active ? meta.color : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              {meta.emoji} {meta.label}
            </button>
          )
        })}
        <button
          onClick={() => setActiveTopic('saved')}
          style={{
            background: activeTopic === 'saved' ? 'var(--bg-elevated)' : 'transparent',
            border: `1px solid ${activeTopic === 'saved' ? 'var(--border-strong)' : 'var(--border-default)'}`,
            borderRadius: '999px',
            padding: '6px 12px',
            fontSize: '12px',
            color: activeTopic === 'saved' ? 'var(--accent)' : 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          🔖 Saved ({saved.length})
        </button>
      </div>

      {loading && stories.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading headlines…</p>
      ) : shown.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Nothing here yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {shown.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </div>
  )
}
