import { create } from 'zustand'
import type { NewsStory, NewsTopic } from '@/types'
import { fetchTopStories, fetchHeadlines } from '@/integrations/news'

export const ALL_TOPICS: NewsTopic[] = ['ai', 'tech', 'nigeria', 'world', 'policy', 'finance', 'science']

export const TOPIC_META: Record<NewsTopic, { label: string; emoji: string; color: string }> = {
  ai: { label: 'AI', emoji: '🤖', color: '#818cf8' },
  tech: { label: 'Tech', emoji: '💻', color: '#f472b6' },
  nigeria: { label: 'Nigeria', emoji: '🇳🇬', color: '#34d399' },
  world: { label: 'World', emoji: '🌍', color: '#60a5fa' },
  policy: { label: 'Policy', emoji: '📋', color: '#f59e0b' },
  finance: { label: 'Finance', emoji: '💰', color: '#34d399' },
  science: { label: 'Science', emoji: '🔬', color: '#a78bfa' },
}

interface NewsState {
  stories: NewsStory[]
  saved: NewsStory[]
  loading: boolean
  lastFetched: number | null

  fetchTop: () => Promise<void>
  fetchTopic: (topic: NewsTopic) => Promise<NewsStory[]>
  saveStory: (story: NewsStory) => void
}

const TTL = 30 * 60_000 // 30 min

export const useNewsStore = create<NewsState>((set, get) => ({
  stories: [],
  saved: [],
  loading: false,
  lastFetched: null,

  fetchTop: async () => {
    const { lastFetched } = get()
    if (lastFetched && Date.now() - lastFetched < TTL) return

    set({ loading: true })
    try {
      const stories = await fetchTopStories()
      set({ stories, loading: false, lastFetched: Date.now() })
    } catch {
      set({ loading: false })
    }
  },

  fetchTopic: async (topic) => {
    try {
      return await fetchHeadlines(topic, 8)
    } catch {
      return get().stories.filter((s) => s.topic === topic)
    }
  },

  saveStory: (story) =>
    set((state) => (state.saved.find((s) => s.id === story.id) ? state : { saved: [story, ...state.saved] })),
}))
