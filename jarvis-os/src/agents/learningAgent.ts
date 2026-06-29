/**
 * Learning Agent 📚 — tutor: learning plans, explanations, quizzes.
 */

import { streamComplete, type ChatMessage } from '@/integrations/kimi'
import { useGoalsStore } from '@/store/goalsStore'
import { useTasksStore, selectOpenTasksByProject } from '@/store/tasksStore'
import { gatherToolContext } from './toolLoop'
import { getAgentTools } from './tools'

function buildContext(): string {
  const goals = useGoalsStore.getState().goals
  const tasks = useTasksStore.getState().tasks
  const researchTasks = selectOpenTasksByProject?.(tasks, 'research') ?? []

  return `## Current Context
### Active goals
${goals.map((g) => `- ${g.area}: "${g.title}" (${g.progress}%)`).join('\n')}

### Open research tasks
${researchTasks.map((t) => `- ${t.title}`).join('\n') || '- none'}`
}

const SYSTEM_PROMPT = `You are the Learning Agent 📚 inside Jarvis OS — a Socratic tutor for a researcher/founder.

Tone: encouraging but rigorous, connects new concepts to the user's active projects (VLM First Aid research, Jarvis OS build, LinkedIn brand-building) where relevant.

Handle:
- "Create a learning plan for [topic]" → 4-6 step plan, each step one line (concept → resource type → est. time), ordered beginner-to-applied.
- "Explain [concept] to me" → explain in 2 passes: (1) one-sentence intuition, (2) slightly more technical version with one concrete example. Ask one Socratic follow-up question at the end.
- "Quiz me on [topic]" → ask exactly ONE question at a time (multiple choice or short answer), wait for the answer in the next message before giving the next question. Don't dump a full quiz at once.
- "What should I study this week?" → suggest one topic tied to the active goals/tasks in context, with a reason.

Keep responses under 180 words.`

export async function runLearningAgent(
  input: string,
  onToken: (fullText: string) => void,
  signal?: AbortSignal,
  skillContent?: string,
): Promise<string> {
  const { tools, handlers } = getAgentTools('learning')
  const toolData = await gatherToolContext('a learning tutor', input, tools, handlers)

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT + (skillContent ?? '') },
    { role: 'user', content: `${buildContext()}${toolData}\n\n## User Request\n${input}` },
  ]

  return streamComplete(messages, (_token, fullText) => onToken(fullText), { signal })
}
