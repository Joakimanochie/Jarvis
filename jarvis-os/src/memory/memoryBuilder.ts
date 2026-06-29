/**
 * Memory Builder — Day 14.
 *
 * At end of session: extracts key facts from the conversation transcript,
 * saves a structured memory record to Notion + Obsidian.
 */

import { complete, isKimiConfigured } from '@/integrations/kimi'
import { useAgentStore, type Exchange } from '@/store/agentStore'
import { appendToPage } from '@/integrations/notion'
import { appendNote, isObsidianRunning } from '@/integrations/obsidian'
import { useToastStore } from '@/store/toastStore'
import { storeMemory, type SessionMemory } from './memoryStore'

export type { SessionMemory }

const EXTRACTION_PROMPT = `You are a memory extraction system. Given a conversation transcript between a user and AI agents, extract the following as JSON:

{
  "summary": "2-3 sentence summary of what happened this session",
  "keyFacts": ["fact 1", "fact 2", ...],
  "decisions": ["decision 1", ...],
  "projectsTouched": ["research", "business", ...],
  "energy": "high" | "medium" | "low"
}

Rules:
- keyFacts: only facts the user revealed about themselves, their work, or their plans — not things the AI said
- decisions: explicit decisions or commitments the user made ("I'll do X", "let's go with Y")
- projectsTouched: which project areas were discussed (research, business, brand, ideas, finance, wellbeing)
- energy: infer from tone — enthusiastic/productive = high, neutral = medium, frustrated/tired = low
- If the session was very short or trivial, return minimal data
- Return ONLY valid JSON, no markdown wrapping`

function buildTranscript(exchanges: Exchange[]): string {
  return exchanges
    .map((e) => `User: ${e.input}\nJarvis (${e.agent}): ${e.response.slice(0, 500)}`)
    .join('\n\n')
}

export async function extractSessionMemory(exchanges: Exchange[]): Promise<SessionMemory | null> {
  if (exchanges.length === 0) return null
  if (!isKimiConfigured()) return null

  const transcript = buildTranscript(exchanges)
  if (transcript.length < 50) return null

  try {
    const raw = await complete(
      [
        { role: 'system', content: EXTRACTION_PROMPT },
        { role: 'user', content: transcript },
      ],
      { maxTokens: 300, temperature: 0.2 }
    )

    const cleaned = raw.replace(/```json\s*|```/g, '').trim()
    const parsed = JSON.parse(cleaned)

    return {
      date: new Date().toISOString(),
      summary: parsed.summary ?? '',
      keyFacts: parsed.keyFacts ?? [],
      decisions: parsed.decisions ?? [],
      projectsTouched: parsed.projectsTouched ?? [],
      energy: parsed.energy ?? 'medium',
    }
  } catch {
    return null
  }
}

// ─── Save to External Stores ─────────────────────────────────────────────────

async function saveToNotion(memory: SessionMemory): Promise<void> {
  const JARVIS_PAGE_ID = import.meta.env.VITE_NOTION_JARVIS_PAGE_ID as string
  if (!JARVIS_PAGE_ID || !import.meta.env.VITE_NOTION_API_KEY) return

  const dateStr = new Date(memory.date).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })

  const block = [
    `── Session Memory: ${dateStr} ──`,
    memory.summary,
    memory.keyFacts.length > 0 ? `Key facts: ${memory.keyFacts.join('; ')}` : '',
    memory.decisions.length > 0 ? `Decisions: ${memory.decisions.join('; ')}` : '',
    `Projects: ${memory.projectsTouched.join(', ')} | Energy: ${memory.energy}`,
  ].filter(Boolean).join('\n')

  await appendToPage(JARVIS_PAGE_ID, block).catch(() => {})
}

async function saveToObsidian(memory: SessionMemory): Promise<void> {
  if (!await isObsidianRunning()) return

  const dateStr = new Date(memory.date).toISOString().slice(0, 10)
  const content = [
    `\n## Session — ${new Date(memory.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
    memory.summary,
    memory.keyFacts.length > 0 ? `**Key facts:** ${memory.keyFacts.join(' · ')}` : '',
    memory.decisions.length > 0 ? `**Decisions:** ${memory.decisions.join(' · ')}` : '',
    `**Projects:** ${memory.projectsTouched.join(', ')} | **Energy:** ${memory.energy}`,
  ].filter(Boolean).join('\n')

  await appendNote(`memory/sessions/${dateStr}.md`, content).catch(() => {})
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function runMemoryBuilder(): Promise<SessionMemory | null> {
  const exchanges = useAgentStore.getState().exchanges
  if (exchanges.length === 0) return null

  const memory = await extractSessionMemory(exchanges)
  if (!memory) return null

  storeMemory(memory)

  await Promise.allSettled([
    saveToNotion(memory),
    saveToObsidian(memory),
  ])

  useToastStore.getState().show('Session saved to memory', '🧠')
  return memory
}
