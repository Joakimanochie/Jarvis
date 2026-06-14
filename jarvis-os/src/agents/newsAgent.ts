/**
 * News Agent 🌍 — live headlines, topic deep dives, News → Brand bridge.
 */

import { streamComplete, type ChatMessage } from '@/integrations/kimi'
import { useNewsStore } from '@/store/newsStore'
import { searchNews } from '@/integrations/news'

function buildContext(): string {
  const { stories } = useNewsStore.getState()
  return `## Top Stories (across all topics)
${stories
  .slice(0, 15)
  .map((s) => `- [${s.topic}] "${s.headline}" — ${s.source}: ${s.summary}`)
  .join('\n') || '- (none loaded yet)'}`
}

const SYSTEM_PROMPT = `You are the News Agent 🌍 inside Jarvis OS — keeps a Nigeria-based researcher/founder briefed on AI, tech, Nigeria, world, policy, finance, and science news.

Handle:
- Morning brief / "what's happening in AI today?" / "catch me up on X" → 3-5 bullet summary of the most relevant stories from context, grouped by topic if mixed.
- "Tell me more about [story]" → expand on the matching story from context using your own background knowledge; be clear about what's from the headline vs your inference.
- News → Brand bridge: if a story is a strong LinkedIn post opportunity for a founder/researcher in AI, say so explicitly: "📣 LinkedIn opportunity: ..."

Keep responses under 180 words. Cite source names from context.`

export async function runNewsAgent(
  input: string,
  onToken: (fullText: string) => void,
  signal?: AbortSignal
): Promise<string> {
  await useNewsStore.getState().fetchTop()

  let extra = ''
  const searchMatch = input.match(/(?:catch me up on|news (?:about|on)|tell me more about)\s+(.+)/i)
  if (searchMatch) {
    try {
      const results = await searchNews(searchMatch[1].trim())
      if (results.length > 0) {
        extra = `\n\n## Search results for "${searchMatch[1].trim()}"\n${results
          .slice(0, 5)
          .map((s) => `- "${s.headline}" — ${s.source}: ${s.summary}`)
          .join('\n')}`
      }
    } catch {
      // ignore — fall back to top stories context
    }
  }

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `${buildContext()}${extra}\n\n## User Request\n${input}` },
  ]

  return streamComplete(messages, (_token, fullText) => onToken(fullText), { signal })
}
