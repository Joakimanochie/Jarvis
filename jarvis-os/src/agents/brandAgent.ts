/**
 * Brand Agent 📣 — LinkedIn content: posts, carousels, weekly content plans.
 */

import { streamComplete, type ChatMessage } from '@/integrations/kimi'
import { useGoalsStore } from '@/store/goalsStore'
import { useIdeasStore } from '@/store/ideasStore'
import { usePostsStore } from '@/store/postsStore'
import { gatherToolContext } from './toolLoop'
import { getAgentTools } from './tools'
import { useAgentStore } from '@/store/agentStore'

function buildContext(): string {
  const goals = useGoalsStore.getState().goals
  const ideas = useIdeasStore.getState().ideas
  const brandGoal = goals.find((g) => g.area === 'Brand')

  return `## Current Context
### Brand goal
${brandGoal ? `"${brandGoal.title}" — ${brandGoal.progress}% (${brandGoal.status})` : 'none'}

### Recent ideas
${ideas.slice(0, 5).map((i) => `- [${i.project}] ${i.text}`).join('\n') || '- none'}

### Voice profile
Direct, founder-researcher voice. Short sentences, concrete details, no buzzwords or emoji spam. Occasional dry humour. Speaks from first-hand experience building Jarvis OS and doing AI/health research in Nigeria.`
}

const SYSTEM_PROMPT = `You are the Brand Agent 📣 inside Jarvis OS — helping a researcher/founder build a personal brand on LinkedIn.

Write LinkedIn posts in the voice profile given in context: direct, concrete, first-person, no corporate buzzwords, no emoji spam (max 1-2 emoji).

You have access to tools: Notion (goals, ideas), web search (trends), and Obsidian vault (research notes). When the user says "repurpose this note" or "turn my research into a post", look for the relevant Obsidian note in the tool data below.

## Actions
When the user asks you to write/draft a post or carousel, you MUST include an action block at the very END of your response, in exactly this format:

\`\`\`action
{"type": "create_post", "topic": "...", "content": "..."}
\`\`\`

Rules:
- "content" is the full post text, ready to paste into LinkedIn (use \\n for line breaks).
- Posts should be 80-200 words.
- Carousels: 5-8 slides, 20-40 words per slide, separated by "---". Structure: hook slide → 3-5 content slides → summary → CTA.
- Before the action block, give one short sentence ("Here's a draft:").
- Never emit more than 1 action block per response.

## Other requests
- "Turn this research note into a post" / "Repurpose this Obsidian note" → read the note from tool data, extract the key insight, draft a LinkedIn post.
- "I need content for this week" → 3 post ideas from active projects/goals, one sentence each.
- "Write a carousel about [topic]" → 5-8 slide outline with hook/content/summary/CTA structure.
- Keep non-draft responses under 120 words.`

interface CreatePostAction {
  type: 'create_post'
  topic: string
  content: string
}

function parseAction(response: string): CreatePostAction | null {
  const match = response.match(/```action\s*([\s\S]*?)```/)
  if (!match) return null
  try {
    const parsed = JSON.parse(match[1].trim())
    return parsed.type === 'create_post' ? parsed : null
  } catch {
    return null
  }
}

export function stripActions(response: string): string {
  return response.replace(/```action\s*[\s\S]*?```/g, '').trim()
}

export async function runBrandAgent(
  input: string,
  onToken: (fullText: string) => void,
  signal?: AbortSignal,
  skillContent?: string,
): Promise<string> {
  const { tools, handlers } = getAgentTools('brand')
  const toolData = await gatherToolContext('a LinkedIn content creator', input, tools, handlers)

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT + (skillContent ?? '') },
    { role: 'user', content: `${buildContext()}${toolData}\n\n## User Request\n${input}` },
  ]

  const fullResponse = await streamComplete(
    messages,
    (_token, fullText) => onToken(stripActions(fullText)),
    { signal }
  )

  const action = parseAction(fullResponse)
  let final = stripActions(fullResponse)

  if (action) {
    const draft = usePostsStore.getState().addDraft(action.topic, action.content)
    final += `\n\n📋 Draft saved to Content Calendar (${draft.content.length} chars) — view and edit it on the Ideas Corner page.`
    useAgentStore.getState().addLog({
      agent: 'brand',
      trigger: 'command',
      action: `Drafted LinkedIn post: "${action.topic}"`,
      result: 'success',
      output: action.content.slice(0, 100),
    })
    onToken(final)
  }

  return final
}
