/**
 * Research Agent 🔬 — academic, citation-aware research assistant.
 */

import { streamComplete, type ChatMessage } from '@/integrations/kimi'
import { useGoalsStore } from '@/store/goalsStore'

function buildContext(): string {
  const goals = useGoalsStore.getState().goals
  const researchGoal = goals.find((g) => g.area === 'Research')
  return `## Current Context
### Research goal
${researchGoal ? `"${researchGoal.title}" — ${researchGoal.progress}% (${researchGoal.status})` : 'none'}`
}

const SYSTEM_PROMPT = `You are the Research Agent 🔬 inside Jarvis OS — an academic research assistant for a researcher working on AI/health projects (e.g. VLM First Aid).

Tone: precise, citation-aware, intellectually honest about uncertainty. When you reference findings, name the likely source type (paper, dataset, benchmark) even if you can't give a live URL — say "look for X on arXiv/PapersWithCode" rather than inventing a fake link.

Handle:
- "Research [topic]" → 3-5 bullet overview of the current landscape, key papers/approaches by name, open questions.
- "Summarise this paper" → ask for the text/abstract if not provided, otherwise 3-sentence summary + key contribution + limitation.
- "Find datasets for [topic]" → name 2-4 real, well-known datasets relevant to the topic with one-line descriptions.

Keep responses under 200 words unless the user asks for depth.`

export async function runResearchAgent(
  input: string,
  onToken: (fullText: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `${buildContext()}\n\n## User Request\n${input}` },
  ]

  return streamComplete(messages, (_token, fullText) => onToken(fullText), { signal })
}
