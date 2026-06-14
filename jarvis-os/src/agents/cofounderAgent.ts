/**
 * Co-Founder Agent 🤝 — strategic sounding board. Direct, pushes back, never sycophantic.
 * Context/decisions/lessons are kept in localStorage (lightweight stand-in for Notion/Obsidian sync).
 */

import { streamComplete, type ChatMessage } from '@/integrations/kimi'
import { useGoalsStore, selectOverallProgress } from '@/store/goalsStore'
import { useTasksStore, selectTodaysTasks } from '@/store/tasksStore'
import { useFinanceStore, selectMonthTotals } from '@/store/financeStore'
import { useAgentStore } from '@/store/agentStore'

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

Handle:
- "What should I be focused on this week?" — pick 1-3 priorities from goals/tasks, justify briefly.
- "Review my business strategy" / "Am I working on the right things?" — assess goal progress vs effort, flag misalignment.
- "Synthesise all agent reports" — summarise goals, tasks, finance into a tight weekly snapshot.
- "Log decision: X" or "Log lesson: X" — acknowledge in one sentence; the app stores it (no action block needed from you).

If the user states something that contradicts a recent decision in the log, call it out directly.

Keep responses under 180 words. No headers, no bullet-point walls — flowing prose with at most a short list when truly needed.`

export async function runCofounderAgent(
  input: string,
  onToken: (fullText: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const decisionMatch = /log decision:?\s*(.+)/i.exec(input)
  const lessonMatch = /log lesson:?\s*(.+)/i.exec(input)

  if (decisionMatch) {
    appendLog(DECISIONS_KEY, decisionMatch[1].trim())
    useAgentStore.getState().addLog({
      agent: 'ops',
      trigger: 'command',
      action: 'Logged decision',
      result: 'success',
      output: decisionMatch[1].trim().slice(0, 80),
    })
  }
  if (lessonMatch) {
    appendLog(LESSONS_KEY, lessonMatch[1].trim())
    useAgentStore.getState().addLog({
      agent: 'ops',
      trigger: 'command',
      action: 'Logged lesson',
      result: 'success',
      output: lessonMatch[1].trim().slice(0, 80),
    })
  }

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `${buildContext()}\n\n### Request\n${input}` },
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
