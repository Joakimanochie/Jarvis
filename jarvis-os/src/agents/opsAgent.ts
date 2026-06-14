/**
 * Ops Agent 🗂️ — tasks, goals, projects, ideas, weekly reviews.
 * The system of record for what you're working on.
 */

import { streamComplete, type ChatMessage } from '@/integrations/kimi'
import { useTasksStore, selectTodaysTasks } from '@/store/tasksStore'
import { useGoalsStore, selectOverallProgress } from '@/store/goalsStore'
import { useAgentStore } from '@/store/agentStore'
import { useToastStore } from '@/store/toastStore'
import { createTask, updateGoalProgress } from '@/integrations/notion'
import type { Task } from '@/types'

// ─── Context Injection ────────────────────────────────────────────────────────

function buildContext(): string {
  const tasks = useTasksStore.getState().tasks
  const goals = useGoalsStore.getState().goals
  const openTasks = tasks.filter((t) => t.status !== 'done')
  const todays = selectTodaysTasks(tasks)

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return `## Current Context
Today: ${today}

### Goals (overall ${selectOverallProgress(goals)}%)
${goals.map((g) => `- ${g.area}: "${g.title}" — ${g.progress}% (${g.status})`).join('\n')}

### Open Tasks (${openTasks.length})
${openTasks
  .map(
    (t) =>
      `- [${t.id}] "${t.title}" — project: ${t.project}, status: ${t.status}, priority: ${t.priority}${t.dueDate ? `, due: ${t.dueDate}` : ''}`
  )
  .join('\n')}

### Due Today (${todays.length})
${todays.map((t) => `- "${t.title}" (${t.priority})`).join('\n') || '- none'}

### Active Projects
research, business, brand, ideas, finance`
}

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are the Ops Agent 🗂️ inside Jarvis OS — the personal operating system of a researcher, founder, and brand builder based in Nigeria.

Your job: keep tasks, goals, projects, and ideas organised. You are direct, concise, and action-oriented. No filler, no corporate speak.

## Actions
When the user asks you to DO something (create a task, update a goal), you MUST include an action block at the very END of your response, in exactly this format:

\`\`\`action
{"type": "create_task", "title": "...", "project": "research|business|brand|ideas|finance", "priority": "high|medium|low", "dueDate": "YYYY-MM-DD or omit"}
\`\`\`

or

\`\`\`action
{"type": "update_goal", "area": "Research|Business|Brand|Finance|Ideas|Wellbeing", "progress": 0-100}
\`\`\`

Rules for actions:
- Only emit an action block when the user clearly requests a change.
- Before the action block, confirm in one short sentence what you're doing.
- Never emit more than 3 action blocks per response.
- If the request is ambiguous (no project specified, unclear goal), pick the most sensible default and say so.

## Answering questions
For questions ("what are my priorities?", "run my weekly review"), answer from the context provided. Be specific — reference actual task titles and goal percentages. Rank by priority and due date. Keep responses under 200 words unless a review is requested.`

// ─── Action Parsing & Execution ───────────────────────────────────────────────

interface CreateTaskAction {
  type: 'create_task'
  title: string
  project: Task['project']
  priority: Task['priority']
  dueDate?: string
}

interface UpdateGoalAction {
  type: 'update_goal'
  area: string
  progress: number
}

type AgentAction = CreateTaskAction | UpdateGoalAction

function parseActions(response: string): AgentAction[] {
  const actions: AgentAction[] = []
  const regex = /```action\s*([\s\S]*?)```/g
  let match
  while ((match = regex.exec(response)) !== null) {
    try {
      actions.push(JSON.parse(match[1].trim()))
    } catch {
      // malformed action JSON — skip
    }
  }
  return actions.slice(0, 3)
}

async function executeActions(actions: AgentAction[]): Promise<string[]> {
  const results: string[] = []
  const { addLog } = useAgentStore.getState()

  for (const action of actions) {
    if (action.type === 'create_task') {
      const task: Task = {
        id: `agent_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: action.title,
        project: action.project ?? 'research',
        status: 'todo',
        priority: action.priority ?? 'medium',
        dueDate: action.dueDate,
        agentCreated: true,
      }
      useTasksStore.getState().addTask(task)
      useToastStore.getState().show(`Task added: "${task.title}"`, '✅')
      results.push(`Task created: "${task.title}" → ${task.project}`)
      addLog({
        agent: 'ops',
        trigger: 'command',
        action: `Created task "${task.title}" in ${task.project}`,
        result: 'success',
        output: task.title,
      })

      if (import.meta.env.VITE_NOTION_API_KEY) {
        createTask(task)
          .then((notionId) => useTasksStore.getState().updateTask(task.id, { notionId }))
          .catch(console.warn)
      }
    }

    if (action.type === 'update_goal') {
      const goals = useGoalsStore.getState().goals
      const goal = goals.find((g) => g.area.toLowerCase() === action.area.toLowerCase())
      if (goal) {
        const progress = Math.min(100, Math.max(0, action.progress))
        useGoalsStore.getState().updateProgress(goal.id, progress)
        useToastStore.getState().show(`Goal updated: ${goal.area} → ${progress}%`, '🎯')
        results.push(`Goal updated: ${goal.area} → ${progress}%`)
        addLog({
          agent: 'ops',
          trigger: 'command',
          action: `Updated ${goal.area} goal to ${progress}%`,
          result: 'success',
          output: `${goal.area}: ${progress}%`,
        })

        if (import.meta.env.VITE_NOTION_API_KEY) {
          updateGoalProgress(goal.id, progress).catch(console.warn)
        }
      } else {
        results.push(`Goal area "${action.area}" not found`)
      }
    }
  }

  return results
}

/** Strip action blocks from the displayed response */
export function stripActions(response: string): string {
  return response.replace(/```action\s*[\s\S]*?```/g, '').trim()
}

// ─── Main Entry ───────────────────────────────────────────────────────────────

export async function runOpsAgent(
  input: string,
  onToken: (fullText: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `${buildContext()}\n\n## User Request\n${input}` },
  ]

  const fullResponse = await streamComplete(
    messages,
    (_token, fullText) => onToken(stripActions(fullText)),
    { signal }
  )

  // Execute any actions the agent emitted
  const actions = parseActions(fullResponse)
  if (actions.length > 0) {
    await executeActions(actions)
  }

  return stripActions(fullResponse)
}
