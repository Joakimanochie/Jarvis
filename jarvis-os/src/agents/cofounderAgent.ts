/**
 * Co-Founder Agent 🤝 — strategic sounding board. Direct, pushes back, never sycophantic.
 * Context/decisions/lessons are kept in localStorage (lightweight stand-in for Notion/Obsidian sync).
 */

import { streamComplete, type ChatMessage } from '@/integrations/kimi'
import { useGoalsStore, selectOverallProgress } from '@/store/goalsStore'
import { useTasksStore, selectTodaysTasks } from '@/store/tasksStore'
import { useFinanceStore, selectMonthTotals } from '@/store/financeStore'
import { useAgentStore } from '@/store/agentStore'
import { gatherToolContext } from './toolLoop'
import { getAgentTools } from './tools'
import { appendToPage } from '@/integrations/notion'
import { appendNote, isObsidianRunning } from '@/integrations/obsidian'

export const DECISIONS_KEY = 'jarvis_decisions_log'
export const LESSONS_KEY = 'jarvis_lessons_log'

export interface LogEntry {
  date: string
  text: string
}

export function readLog(key: string): LogEntry[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]')
  } catch {
    return []
  }
}

function appendLog(key: string, text: string) {
  const log = readLog(key)
  log.unshift({ date: new Date().toISOString().slice(0, 10), text })
  localStorage.setItem(key, JSON.stringify(log.slice(0, 50)))
}

async function syncToExternal(type: string, text: string) {
  const date = new Date().toISOString().slice(0, 10)
  const line = `[${date}] ${type}: ${text}`
  const JARVIS_PAGE_ID = import.meta.env.VITE_NOTION_JARVIS_PAGE_ID as string
  if (JARVIS_PAGE_ID && import.meta.env.VITE_NOTION_API_KEY) {
    appendToPage(JARVIS_PAGE_ID, line).catch(() => {})
  }
  if (await isObsidianRunning()) {
    appendNote(`cofounder/${type.toLowerCase()}s.md`, `\n- ${line}`).catch(() => {})
  }
}

function buildContext(): string {
  const goals = useGoalsStore.getState().goals
  const tasks = useTasksStore.getState().tasks
  const todays = selectTodaysTasks(tasks)
  const { income, expense, net } = selectMonthTotals(useFinanceStore.getState().entries)
  const decisions = readLog(DECISIONS_KEY).slice(0, 5)
  const lessons = readLog(LESSONS_KEY).slice(0, 5)

  return `### Active goals (overall ${selectOverallProgress(goals)}%)
${goals.map((g) => `- ${g.area}: "${g.title}" — ${g.progress}% (${g.status})`).join('\n')}

### Today's tasks
${todays.map((t) => `- "${t.title}" (${t.priority}, ${t.project})`).join('\n') || '- none'}

### Finance this month
Income ₦${income.toLocaleString()}, expenses ₦${expense.toLocaleString()}, net ₦${net.toLocaleString()}

### Recent decisions log
${decisions.map((d) => `- ${d.date}: ${d.text}`).join('\n') || '- none recorded'}

### Recent lessons log
${lessons.map((l) => `- ${l.date}: ${l.text}`).join('\n') || '- none recorded'}`
}

const SYSTEM_PROMPT = `You are the Co-Founder Agent 🤝 inside Jarvis OS — a strategic thinking partner for a solo founder/researcher/brand-builder in Nigeria.

Tone: direct, candid, never sycophantic. You push back when something contradicts a prior decision or looks unfocused. You don't pad answers with encouragement.

You have access to tools: Notion (goals, tasks), Obsidian vault (search, read), and calendar. Use tool data injected below to ground your responses in reality.

Handle:
- "What should I be focused on this week?" — pick 1-3 priorities from goals/tasks, justify briefly.
- "Review my business strategy" / "Am I working on the right things?" — assess goal progress vs effort, flag misalignment.
- "Synthesise all agent reports" / "Weekly operating review" — structured review:
  1. Progress snapshot: goals %, tasks completed vs created.
  2. What's working: 1-2 areas with momentum.
  3. What's stuck: stalled goals, overdue tasks.
  4. Strategic tension: biggest trade-off right now.
  5. Recommendation: ONE clear action for the week.
- "Log decision: X" or "Log lesson: X" — acknowledge in one sentence; the app stores it.

If the user states something that contradicts a recent decision in the log, call it out directly. If a goal hasn't moved in 7+ days, mention it. If no LinkedIn post in 7+ days, flag it.

Keep responses under 200 words. No headers, no bullet-point walls — flowing prose with at most a short list when truly needed.`

export async function runCofounderAgent(
  input: string,
  onToken: (fullText: string) => void,
  signal?: AbortSignal,
  skillContent?: string,
): Promise<string> {
  const decisionMatch = /log decision:?\s*(.+)/i.exec(input)
  const lessonMatch = /log lesson:?\s*(.+)/i.exec(input)

  if (decisionMatch) {
    const text = decisionMatch[1].trim()
    appendLog(DECISIONS_KEY, text)
    useAgentStore.getState().addLog({ agent: 'ops', trigger: 'command', action: 'Logged decision', result: 'success', output: text.slice(0, 80) })
    syncToExternal('Decision', text)
  }
  if (lessonMatch) {
    const text = lessonMatch[1].trim()
    appendLog(LESSONS_KEY, text)
    useAgentStore.getState().addLog({ agent: 'ops', trigger: 'command', action: 'Logged lesson', result: 'success', output: text.slice(0, 80) })
    syncToExternal('Lesson', text)
  }

  const { tools, handlers } = getAgentTools('cofounder')
  const toolData = await gatherToolContext('a strategic co-founder', input, tools, handlers)

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT + (skillContent ?? '') },
    { role: 'user', content: `${buildContext()}${toolData}\n\n### Request\n${input}` },
  ]

  let final = ''
  await streamComplete(
    messages,
    (_token, fullText) => {
      final = fullText
      onToken(fullText)
    },
    { signal }
  )

  return final
}
