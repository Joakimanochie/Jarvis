/**
 * Notion API Integration
 * Docs: https://developers.notion.com/reference/intro
 *
 * All calls go through a Vite proxy (/api/notion) to avoid CORS.
 * In production, use a backend route or Vercel Edge Function.
 */

import type { FinanceEntry, Goal, Idea, Milestone, Task } from '@/types'

const NOTION_API_KEY = import.meta.env.VITE_NOTION_API_KEY as string
const NOTION_VERSION = '2022-06-28'
const BASE_URL = '/api/notion' // proxied — see vite.config.ts

// ─── Base Client ────────────────────────────────────────────────────────────

async function notionFetch(
  path: string,
  options: RequestInit = {}
): Promise<unknown> {
  if (!NOTION_API_KEY) {
    throw new Error('VITE_NOTION_API_KEY is not set in .env.local')
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Notion API ${res.status}: ${body}`)
  }

  return res.json()
}

// ─── Goals ───────────────────────────────────────────────────────────────────

/**
 * Fetch all goals from the Notion Goals database.
 * Expects a database with properties: Area, Title, Progress, Status, Milestones (JSON), WeeklyLog (JSON)
 */
export async function fetchGoals(): Promise<Goal[]> {
  const GOALS_DB_ID = import.meta.env.VITE_NOTION_GOALS_DB_ID as string
  if (!GOALS_DB_ID) throw new Error('VITE_NOTION_GOALS_DB_ID not set')

  const data = (await notionFetch(`/databases/${GOALS_DB_ID}/query`, {
    method: 'POST',
    body: JSON.stringify({ page_size: 20 }),
  })) as { results: NotionPage[] }

  return data.results.map(parseGoalPage)
}

/**
 * Update the Progress property on a Notion goal page.
 */
export async function updateGoalProgress(notionPageId: string, progress: number): Promise<void> {
  await notionFetch(`/pages/${notionPageId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      properties: {
        // Notion percent format stores 70% as 0.7
        Progress: { number: progress / 100 },
      },
    }),
  })
}

/**
 * Toggle a milestone's done status by updating the Milestones JSON property.
 */
export async function toggleMilestoneNotion(
  notionPageId: string,
  milestones: Milestone[]
): Promise<void> {
  await notionFetch(`/pages/${notionPageId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      properties: {
        Milestones: {
          rich_text: [{ text: { content: JSON.stringify(milestones) } }],
        },
      },
    }),
  })
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

export async function fetchTasks(): Promise<Task[]> {
  const TASK_DB_ID = import.meta.env.VITE_NOTION_TASK_DB_ID as string
  if (!TASK_DB_ID) throw new Error('VITE_NOTION_TASK_DB_ID not set')

  const data = (await notionFetch(`/databases/${TASK_DB_ID}/query`, {
    method: 'POST',
    body: JSON.stringify({
      filter: {
        property: 'Status',
        select: { does_not_equal: 'Done' },
      },
      page_size: 100,
    }),
  })) as { results: NotionPage[] }

  return data.results.map(parseTaskPage)
}

export async function createTask(task: Omit<Task, 'id' | 'notionId'>): Promise<string> {
  const TASK_DB_ID = import.meta.env.VITE_NOTION_TASK_DB_ID as string

  const data = (await notionFetch('/pages', {
    method: 'POST',
    body: JSON.stringify({
      parent: { database_id: TASK_DB_ID },
      properties: {
        Title: { title: [{ text: { content: task.title } }] },
        Project: { select: { name: task.project } },
        Status: { select: { name: task.status } },
        Priority: { select: { name: task.priority } },
        ...(task.dueDate ? { 'Due Date': { date: { start: task.dueDate } } } : {}),
        'Agent Created': { checkbox: task.agentCreated },
      },
    }),
  })) as { id: string }

  return data.id
}

export async function updateTaskStatus(notionPageId: string, status: Task['status']): Promise<void> {
  await notionFetch(`/pages/${notionPageId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      properties: {
        Status: { select: { name: status } },
      },
    }),
  })
}

export async function archiveTask(notionPageId: string): Promise<void> {
  await notionFetch(`/pages/${notionPageId}`, {
    method: 'PATCH',
    body: JSON.stringify({ archived: true }),
  })
}

// ─── Ideas ───────────────────────────────────────────────────────────────────

export async function fetchIdeas(): Promise<Idea[]> {
  const IDEAS_DB_ID = import.meta.env.VITE_NOTION_IDEAS_DB_ID as string
  if (!IDEAS_DB_ID) throw new Error('VITE_NOTION_IDEAS_DB_ID not set')

  const data = (await notionFetch(`/databases/${IDEAS_DB_ID}/query`, {
    method: 'POST',
    body: JSON.stringify({ page_size: 100, sorts: [{ timestamp: 'created_time', direction: 'descending' }] }),
  })) as { results: NotionPage[] }

  return data.results.map(parseIdeaPage)
}

export async function saveIdea(idea: Omit<Idea, 'id' | 'notionId'>): Promise<string> {
  const IDEAS_DB_ID = import.meta.env.VITE_NOTION_IDEAS_DB_ID as string

  const data = (await notionFetch('/pages', {
    method: 'POST',
    body: JSON.stringify({
      parent: { database_id: IDEAS_DB_ID },
      properties: {
        Title: { title: [{ text: { content: idea.text } }] },
        Project: { select: { name: idea.project } },
        Status: { select: { name: idea.status } },
      },
    }),
  })) as { id: string }

  return data.id
}

export async function updateIdeaStatus(notionPageId: string, status: Idea['status']): Promise<void> {
  await notionFetch(`/pages/${notionPageId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      properties: {
        Status: { select: { name: status } },
      },
    }),
  })
}

function parseIdeaPage(page: NotionPage): Idea {
  return {
    id: page.id,
    notionId: page.id,
    text: getProp<string>(page, 'Title', 'Untitled idea'),
    project: getProp<Idea['project']>(page, 'Project', 'ideas'),
    status: getProp<Idea['status']>(page, 'Status', 'new'),
    createdAt: new Date().toISOString(),
  }
}

// ─── Finance ─────────────────────────────────────────────────────────────────

export async function fetchFinanceEntries(): Promise<FinanceEntry[]> {
  const FINANCE_DB_ID = import.meta.env.VITE_NOTION_FINANCE_DB_ID as string
  if (!FINANCE_DB_ID) throw new Error('VITE_NOTION_FINANCE_DB_ID not set')

  const data = (await notionFetch(`/databases/${FINANCE_DB_ID}/query`, {
    method: 'POST',
    body: JSON.stringify({ page_size: 100, sorts: [{ property: 'Date', direction: 'descending' }] }),
  })) as { results: NotionPage[] }

  return data.results.map(parseFinancePage)
}

export async function logFinanceEntry(entry: Omit<FinanceEntry, 'id' | 'notionId'>): Promise<string> {
  const FINANCE_DB_ID = import.meta.env.VITE_NOTION_FINANCE_DB_ID as string

  const data = (await notionFetch('/pages', {
    method: 'POST',
    body: JSON.stringify({
      parent: { database_id: FINANCE_DB_ID },
      properties: {
        Title: { title: [{ text: { content: entry.notes || entry.category } }] },
        Amount: { number: entry.amount },
        Category: { select: { name: entry.category } },
        Type: { select: { name: entry.type } },
        Date: { date: { start: entry.date } },
        Notes: { rich_text: [{ text: { content: entry.notes } }] },
      },
    }),
  })) as { id: string }

  return data.id
}

function parseFinancePage(page: NotionPage): FinanceEntry {
  return {
    id: page.id,
    notionId: page.id,
    amount: getProp<number>(page, 'Amount', 0),
    category: getProp<string>(page, 'Category', 'misc'),
    type: getProp<FinanceEntry['type']>(page, 'Type', 'expense'),
    date: getProp<string>(page, 'Date', new Date().toISOString().slice(0, 10)),
    notes: getProp<string>(page, 'Notes', ''),
  }
}

// ─── Write helpers ───────────────────────────────────────────────────────────

/**
 * Append a paragraph block to any Notion page by its page ID.
 * Used by the Ops Agent for "log decision", "append note", etc.
 */
export async function appendToPage(pageId: string, text: string): Promise<void> {
  await notionFetch(`/blocks/${pageId}/children`, {
    method: 'PATCH',
    body: JSON.stringify({
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: text } }],
          },
        },
      ],
    }),
  })
}

// ─── Parsers ─────────────────────────────────────────────────────────────────

interface NotionPage {
  id: string
  properties: Record<string, NotionProperty>
}

type NotionProperty =
  | { type: 'title'; title: Array<{ plain_text: string }> }
  | { type: 'rich_text'; rich_text: Array<{ plain_text: string }> }
  | { type: 'number'; number: number | null }
  | { type: 'select'; select: { name: string } | null }
  | { type: 'checkbox'; checkbox: boolean }
  | { type: 'date'; date: { start: string } | null }

function getProp<T>(page: NotionPage, key: string, fallback: T): T {
  const prop = page.properties[key]
  if (!prop) return fallback
  switch (prop.type) {
    case 'title':
      return (prop.title[0]?.plain_text ?? fallback) as T
    case 'rich_text':
      return (prop.rich_text[0]?.plain_text ?? fallback) as T
    case 'number':
      return (prop.number ?? fallback) as T
    case 'select':
      return (prop.select?.name ?? fallback) as T
    case 'checkbox':
      return prop.checkbox as T
    case 'date':
      return (prop.date?.start ?? fallback) as T
    default:
      return fallback
  }
}

function parseGoalPage(page: NotionPage): Goal {
  const milestonesRaw = getProp<string>(page, 'Milestones', '[]')
  const weeklyLogRaw = getProp<string>(page, 'WeeklyLog', '[]')

  let milestones: Milestone[] = []
  let weeklyLog: Goal['weeklyLog'] = []

  try {
    milestones = JSON.parse(milestonesRaw)
  } catch {
    milestones = []
  }
  try {
    weeklyLog = JSON.parse(weeklyLogRaw)
  } catch {
    weeklyLog = []
  }

  // Notion percent format stores 70% as 0.7 — convert to 0–100
  const rawProgress = getProp<number>(page, 'Progress', 0)
  const progress = Math.round(rawProgress <= 1 ? rawProgress * 100 : rawProgress)
  const status = getProp<string>(page, 'Status', 'on_track') as Goal['status']

  return {
    id: page.id,
    area: getProp<Goal['area']>(page, 'Area', 'Research'),
    title: getProp<string>(page, 'Title', 'Untitled goal'),
    progress,
    status,
    milestones,
    weeklyLog,
  }
}

function parseTaskPage(page: NotionPage): Task {
  return {
    id: page.id,
    notionId: page.id,
    title: getProp<string>(page, 'Title', 'Untitled task'),
    project: getProp<Task['project']>(page, 'Project', 'research'),
    status: getProp<Task['status']>(page, 'Status', 'todo'),
    priority: getProp<Task['priority']>(page, 'Priority', 'medium'),
    dueDate: getProp<string | undefined>(page, 'Due Date', undefined),
    agentCreated: getProp<boolean>(page, 'Agent Created', false),
  }
}
