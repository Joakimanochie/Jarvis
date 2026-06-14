/**
 * NewsAPI client (https://newsapi.org) — proxied via Vite `/api/news` to avoid CORS
 * and keep the key out of query strings on the client where possible.
 *
 * Falls back to seed headlines when VITE_NEWS_API_KEY is not set.
 */

import type { NewsStory, NewsTopic } from '@/types'

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY as string
const BASE_URL = '/api/news' // proxied — see vite.config.ts

const TOPIC_QUERIES: Record<NewsTopic, string> = {
  ai: 'artificial intelligence OR LLM OR OpenAI OR Anthropic',
  tech: 'technology OR startup OR software',
  nigeria: 'Nigeria',
  world: 'world news',
  policy: 'policy OR regulation OR government',
  finance: 'finance OR markets OR economy',
  science: 'science OR research breakthrough',
}

export function isNewsConfigured(): boolean {
  return Boolean(NEWS_API_KEY)
}

interface RawArticle {
  title: string
  source: { name: string }
  url: string
  publishedAt: string
  description: string | null
}

function parseArticles(articles: RawArticle[], topic: NewsTopic): NewsStory[] {
  return articles.map((a, i) => ({
    id: `${topic}_${i}_${a.url}`,
    headline: a.title.replace(/\s*-\s*[^-]+$/, ''),
    source: a.source.name,
    url: a.url,
    publishedAt: a.publishedAt,
    summary: a.description ?? '',
    topic,
  }))
}

/** Fetch top headlines for a single topic. */
export async function fetchHeadlines(topic: NewsTopic, pageSize = 6): Promise<NewsStory[]> {
  if (!NEWS_API_KEY) return SEED_STORIES.filter((s) => s.topic === topic)

  const params = new URLSearchParams({
    q: TOPIC_QUERIES[topic],
    sortBy: 'publishedAt',
    pageSize: String(pageSize),
    language: 'en',
    apiKey: NEWS_API_KEY,
  })

  const res = await fetch(`${BASE_URL}/v2/everything?${params.toString()}`)
  if (!res.ok) throw new Error(`NewsAPI ${res.status}: ${await res.text()}`)
  const data = (await res.json()) as { articles: RawArticle[] }
  return parseArticles(data.articles, topic)
}

/** Fetch top stories across all topics (for morning brief / news strip). */
export async function fetchTopStories(): Promise<NewsStory[]> {
  if (!NEWS_API_KEY) return SEED_STORIES

  const topics: NewsTopic[] = ['ai', 'tech', 'nigeria', 'world', 'policy', 'finance', 'science']
  const results = await Promise.all(topics.map((t) => fetchHeadlines(t, 2).catch(() => [])))
  return results.flat()
}

/** Free-text search across all news. */
export async function searchNews(query: string): Promise<NewsStory[]> {
  if (!NEWS_API_KEY) {
    const lower = query.toLowerCase()
    return SEED_STORIES.filter(
      (s) => s.headline.toLowerCase().includes(lower) || s.summary.toLowerCase().includes(lower)
    )
  }

  const params = new URLSearchParams({
    q: query,
    sortBy: 'relevancy',
    pageSize: '8',
    language: 'en',
    apiKey: NEWS_API_KEY,
  })

  const res = await fetch(`${BASE_URL}/v2/everything?${params.toString()}`)
  if (!res.ok) throw new Error(`NewsAPI ${res.status}: ${await res.text()}`)
  const data = (await res.json()) as { articles: RawArticle[] }
  return parseArticles(data.articles, 'world')
}

// ─── Seed data (used when NewsAPI is not configured) ────────────────────────

const now = new Date().toISOString()

const SEED_STORIES: NewsStory[] = [
  {
    id: 'seed_ai_1',
    headline: 'OpenAI releases o3-mini with breakthrough reasoning performance',
    source: 'TechCrunch',
    url: 'https://techcrunch.com',
    publishedAt: now,
    summary: 'The new model shows major gains on reasoning benchmarks while cutting inference cost by 60%.',
    topic: 'ai',
  },
  {
    id: 'seed_ai_2',
    headline: 'Google DeepMind publishes Gemini Ultra 2 benchmark results',
    source: 'The Verge',
    url: 'https://theverge.com',
    publishedAt: now,
    summary: 'Gemini Ultra 2 tops several multimodal benchmarks, narrowing the gap with frontier rivals.',
    topic: 'ai',
  },
  {
    id: 'seed_tech_1',
    headline: 'Sequoia leads $120M Series B in Lagos-based fintech startup',
    source: 'Bloomberg',
    url: 'https://bloomberg.com',
    publishedAt: now,
    summary: 'The round values the company at $800M and will fund expansion across West Africa.',
    topic: 'tech',
  },
  {
    id: 'seed_tech_2',
    headline: 'Open-source agent framework crosses 50k GitHub stars',
    source: 'Hacker News',
    url: 'https://news.ycombinator.com',
    publishedAt: now,
    summary: 'The framework has become a popular base for building autonomous coding agents.',
    topic: 'tech',
  },
  {
    id: 'seed_nigeria_1',
    headline: "Nigeria's GDP grows 4.2% in Q1 2026, driven by tech & services sector",
    source: 'BusinessDay',
    url: 'https://businessday.ng',
    publishedAt: now,
    summary: 'Analysts credit the growth to a surge in fintech exports and a stabilising naira.',
    topic: 'nigeria',
  },
  {
    id: 'seed_nigeria_2',
    headline: 'Lagos unveils new tech hub aimed at AI startups',
    source: 'TechCabal',
    url: 'https://techcabal.com',
    publishedAt: now,
    summary: 'The hub will offer subsidised compute credits to early-stage AI founders.',
    topic: 'nigeria',
  },
  {
    id: 'seed_world_1',
    headline: 'Global markets rally on cooling inflation data',
    source: 'Reuters',
    url: 'https://reuters.com',
    publishedAt: now,
    summary: 'Major indices climbed after inflation came in below expectations for a third month.',
    topic: 'world',
  },
  {
    id: 'seed_policy_1',
    headline: 'EU Parliament passes landmark AI liability directive',
    source: 'Reuters',
    url: 'https://reuters.com',
    publishedAt: now,
    summary: 'The directive assigns liability for AI-caused harm to deployers, not just developers.',
    topic: 'policy',
  },
  {
    id: 'seed_finance_1',
    headline: 'Central banks signal coordinated rate cuts later this year',
    source: 'Financial Times',
    url: 'https://ft.com',
    publishedAt: now,
    summary: 'Officials cite easing inflation and slowing growth as reasons for the shift.',
    topic: 'finance',
  },
  {
    id: 'seed_science_1',
    headline: 'Researchers report new low-cost diagnostic tool for malaria',
    source: 'Nature',
    url: 'https://nature.com',
    publishedAt: now,
    summary: 'The tool uses a smartphone camera and a low-cost lens attachment for field diagnosis.',
    topic: 'science',
  },
]
