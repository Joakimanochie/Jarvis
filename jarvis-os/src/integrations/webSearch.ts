/**
 * Tavily web search integration.
 * Proxied via /api/search → https://api.tavily.com in dev (see vite.config.ts).
 * Falls back to empty results when VITE_TAVILY_API_KEY is not set.
 */

const TAVILY_API_KEY = import.meta.env.VITE_TAVILY_API_KEY as string | undefined

export interface SearchResult {
  title: string
  url: string
  content: string
  score: number
}

export function isWebSearchConfigured(): boolean {
  return Boolean(TAVILY_API_KEY)
}

export async function webSearch(query: string, maxResults = 5): Promise<SearchResult[]> {
  if (!TAVILY_API_KEY) return []

  const res = await fetch('/api/search/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: TAVILY_API_KEY,
      query,
      max_results: maxResults,
      search_depth: 'basic',
      include_answer: false,
    }),
  })

  if (!res.ok) {
    console.warn(`Tavily search failed: ${res.status}`)
    return []
  }

  const data = (await res.json()) as { results?: Array<{ title: string; url: string; content: string; score: number }> }
  return (data.results ?? []).map((r) => ({
    title: r.title,
    url: r.url,
    content: r.content,
    score: r.score,
  }))
}
