/**
 * Shared MCP Tool Registry — Day 13.
 *
 * Centralised tool definitions and handlers. Each agent picks the tools
 * it needs from this registry by name. No duplication across agents.
 */

import type { ToolDefinition } from '@/integrations/kimi'
import { fetchTodayEvents, fetchWeekEvents, createEvent } from '@/integrations/calendar'
import { fetchTasks, createTask, appendToPage } from '@/integrations/notion'
import { fetchInbox, fetchThread, createDraft } from '@/integrations/gmail'
import { isGoogleConnected } from '@/integrations/googleAuth'
import { searchFiles, readFileContent } from '@/integrations/drive'
import { webSearch, isWebSearchConfigured } from '@/integrations/webSearch'
import { searchVault, readNote, appendNote, getDailyNote, isObsidianRunning } from '@/integrations/obsidian'
import { useGoalsStore, selectOverallProgress } from '@/store/goalsStore'
import { useTasksStore, selectTodaysTasks } from '@/store/tasksStore'
import { useFinanceStore, selectMonthTotals } from '@/store/financeStore'

export type ToolHandler = (args: Record<string, unknown>) => Promise<string>

// ─── Tool Definitions ────────────────────────────────────────────────────────

export const TOOL_DEFS: Record<string, ToolDefinition> = {
  calendar_read: {
    name: 'calendar_read',
    description: "Read the user's calendar events for today or the next 7 days.",
    parameters: {
      type: 'object',
      properties: {
        range: { type: 'string', enum: ['today', 'week'], description: 'Date range to fetch' },
      },
      required: ['range'],
    },
  },
  calendar_create: {
    name: 'calendar_create',
    description: 'Create a new calendar event.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Event title' },
        start: { type: 'string', description: 'ISO 8601 start datetime' },
        end: { type: 'string', description: 'ISO 8601 end datetime' },
        attendees: { type: 'string', description: 'Comma-separated email addresses (optional)' },
      },
      required: ['title', 'start', 'end'],
    },
  },
  notion_read: {
    name: 'notion_read',
    description: "Read the user's open tasks, goals, or finance summary from Notion.",
    parameters: {
      type: 'object',
      properties: {
        resource: { type: 'string', enum: ['tasks', 'goals', 'finance'], description: 'Which resource to read' },
      },
      required: ['resource'],
    },
  },
  notion_create_task: {
    name: 'notion_create_task',
    description: 'Create a new task in Notion.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Task title' },
        project: { type: 'string', enum: ['research', 'business', 'brand', 'ideas', 'finance'], description: 'Project' },
        priority: { type: 'string', enum: ['high', 'medium', 'low'], description: 'Priority' },
        dueDate: { type: 'string', description: 'Due date YYYY-MM-DD (optional)' },
      },
      required: ['title', 'project'],
    },
  },
  notion_append: {
    name: 'notion_append',
    description: 'Append a paragraph of text to the Jarvis Notion page.',
    parameters: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Text to append' },
      },
      required: ['text'],
    },
  },
  gmail_inbox: {
    name: 'gmail_inbox',
    description: 'Fetch the latest inbox threads with sender, subject, and triage status.',
    parameters: { type: 'object', properties: {}, required: [] },
  },
  gmail_read_thread: {
    name: 'gmail_read_thread',
    description: 'Read the full messages of an email thread by thread ID.',
    parameters: {
      type: 'object',
      properties: {
        thread_id: { type: 'string', description: 'The thread ID to read' },
      },
      required: ['thread_id'],
    },
  },
  gmail_draft: {
    name: 'gmail_draft',
    description: 'Create an email draft (does not send).',
    parameters: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'Recipient email' },
        subject: { type: 'string', description: 'Email subject' },
        body: { type: 'string', description: 'Email body text' },
      },
      required: ['to', 'subject', 'body'],
    },
  },
  drive_search: {
    name: 'drive_search',
    description: 'Search Google Drive for files matching a query.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        max_results: { type: 'number', description: 'Max results (default 5)' },
      },
      required: ['query'],
    },
  },
  drive_read: {
    name: 'drive_read',
    description: 'Read the text content of a Google Drive file by its ID.',
    parameters: {
      type: 'object',
      properties: {
        file_id: { type: 'string', description: 'Google Drive file ID' },
      },
      required: ['file_id'],
    },
  },
  web_search: {
    name: 'web_search',
    description: 'Search the web for recent information on a topic.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        max_results: { type: 'number', description: 'Max results (default 3)' },
      },
      required: ['query'],
    },
  },
  obsidian_search: {
    name: 'obsidian_search',
    description: 'Search the Obsidian vault for notes matching a query.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
      },
      required: ['query'],
    },
  },
  obsidian_read: {
    name: 'obsidian_read',
    description: 'Read a note from the Obsidian vault by path.',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Note path in the vault (e.g. "research/vlm-notes.md")' },
      },
      required: ['path'],
    },
  },
  obsidian_append: {
    name: 'obsidian_append',
    description: 'Append text to an Obsidian note (creates if not exists).',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Note path' },
        content: { type: 'string', description: 'Text to append' },
      },
      required: ['path', 'content'],
    },
  },
  obsidian_daily: {
    name: 'obsidian_daily',
    description: "Read today's daily note from Obsidian.",
    parameters: { type: 'object', properties: {}, required: [] },
  },
}

// ─── Tool Handlers ───────────────────────────────────────────────────────────

export const TOOL_HANDLERS: Record<string, ToolHandler> = {
  calendar_read: async (args) => {
    const range = args['range'] as string
    const events = range === 'week' ? await fetchWeekEvents() : await fetchTodayEvents()
    if (events.length === 0) return 'No events found.'
    return events.map((e) => {
      const start = new Date(e.start).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
      const end = new Date(e.end).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
      return `• ${e.title} (${start}–${end})${e.location ? ` @ ${e.location}` : ''}`
    }).join('\n')
  },

  calendar_create: async (args) => {
    if (!isGoogleConnected()) return '(Google not connected — cannot create events)'
    const attendees = args['attendees'] ? (args['attendees'] as string).split(',').map((e) => e.trim()) : undefined
    await createEvent(args['title'] as string, args['start'] as string, args['end'] as string, attendees)
    return `Event "${args['title']}" created.`
  },

  notion_read: async (args) => {
    const resource = args['resource'] as string
    if (resource === 'goals') {
      const goals = useGoalsStore.getState().goals
      const overall = selectOverallProgress(goals)
      return `Overall progress: ${overall}%\n` + goals.map((g) => `• ${g.area}: ${g.progress}% (${g.status})`).join('\n')
    }
    if (resource === 'finance') {
      const entries = useFinanceStore.getState().entries
      const { income, expense, net } = selectMonthTotals(entries)
      return `This month: ₦${income.toLocaleString()} income, ₦${expense.toLocaleString()} expenses, ₦${net.toLocaleString()} net.`
    }
    try {
      const tasks = await fetchTasks()
      const open = tasks.filter((t) => t.status !== 'done')
      if (open.length === 0) return 'No open tasks.'
      return open.map((t) => `• [${t.priority}] ${t.title} (${t.project})`).join('\n')
    } catch {
      const tasks = useTasksStore.getState().tasks
      const todays = selectTodaysTasks(tasks)
      if (todays.length === 0) return 'No tasks due today.'
      return todays.map((t) => `• [${t.priority}] ${t.title}`).join('\n')
    }
  },

  notion_create_task: async (args) => {
    type Project = 'research' | 'business' | 'brand' | 'ideas' | 'finance'
    type Priority = 'high' | 'medium' | 'low'
    const task = {
      title: args['title'] as string,
      project: ((args['project'] as string) ?? 'research') as Project,
      status: 'todo' as const,
      priority: ((args['priority'] as string) ?? 'medium') as Priority,
      dueDate: args['dueDate'] as string | undefined,
      agentCreated: true,
    }
    try {
      await createTask(task)
      return `Task "${task.title}" created in ${task.project}.`
    } catch {
      return `Task "${task.title}" saved locally (Notion sync failed).`
    }
  },

  notion_append: async (args) => {
    const JARVIS_PAGE_ID = import.meta.env.VITE_NOTION_JARVIS_PAGE_ID as string
    if (!JARVIS_PAGE_ID) return '(VITE_NOTION_JARVIS_PAGE_ID not set)'
    const timestamped = `[${new Date().toLocaleString('en-GB')}] ${args['text'] as string}`
    await appendToPage(JARVIS_PAGE_ID, timestamped)
    return 'Appended to Jarvis Notion page.'
  },

  gmail_inbox: async () => {
    const threads = await fetchInbox()
    if (threads.length === 0) return 'Inbox is empty.'
    return threads.slice(0, 10).map((t) =>
      `• [${t.triage}] ${t.sender}: "${t.subject}" — ${t.snippet?.slice(0, 80)}${t.unread ? ' (unread)' : ''}`
    ).join('\n')
  },

  gmail_read_thread: async (args) => {
    if (!isGoogleConnected()) return '(Google not connected)'
    const messages = await fetchThread(args['thread_id'] as string)
    return messages.map((m) => `From: ${m.from}\nDate: ${m.date}\n${m.body.slice(0, 500)}`).join('\n---\n')
  },

  gmail_draft: async (args) => {
    if (!isGoogleConnected()) return '(Google not connected — cannot create drafts)'
    const id = await createDraft(args['to'] as string, args['subject'] as string, args['body'] as string)
    return `Draft created (ID: ${id}). Open Gmail to review and send.`
  },

  drive_search: async (args) => {
    if (!isGoogleConnected()) return '(Google not connected — cannot search Drive)'
    const files = await searchFiles(args['query'] as string, (args['max_results'] as number) ?? 5)
    if (files.length === 0) return 'No files found.'
    return files.map((f) => `• ${f.name} (${f.mimeType}) — modified ${f.modifiedTime?.slice(0, 10)}${f.webViewLink ? ` — ${f.webViewLink}` : ''}`).join('\n')
  },

  drive_read: async (args) => {
    if (!isGoogleConnected()) return '(Google not connected)'
    const content = await readFileContent(args['file_id'] as string)
    return content || '(No content)'
  },

  web_search: async (args) => {
    if (!isWebSearchConfigured()) return '(web search not configured — VITE_TAVILY_API_KEY not set)'
    const results = await webSearch(args['query'] as string, (args['max_results'] as number) ?? 3)
    if (results.length === 0) return 'No results found.'
    return results.map((r) => `• ${r.title}: ${r.content.slice(0, 200)}`).join('\n\n')
  },

  obsidian_search: async (args) => {
    if (!await isObsidianRunning()) return '(Obsidian not running)'
    const results = await searchVault(args['query'] as string)
    if (results.length === 0) return 'No notes found.'
    return results.slice(0, 5).map((r) => `• ${r.filename}: ${r.matches?.[0]?.context?.slice(0, 100) ?? ''}`).join('\n')
  },

  obsidian_read: async (args) => {
    if (!await isObsidianRunning()) return '(Obsidian not running)'
    const content = await readNote(args['path'] as string)
    return content.slice(0, 3000) || '(Empty note)'
  },

  obsidian_append: async (args) => {
    if (!await isObsidianRunning()) return '(Obsidian not running)'
    await appendNote(args['path'] as string, args['content'] as string)
    return `Appended to ${args['path']}.`
  },

  obsidian_daily: async () => {
    if (!await isObsidianRunning()) return '(Obsidian not running)'
    const content = await getDailyNote()
    return content.slice(0, 2000) || '(No daily note yet)'
  },
}

// ─── Agent-to-Tool Matrix ────────────────────────────────────────────────────

/** Pick tool definitions and handlers for a given agent. */
export function getAgentTools(agentName: string): {
  tools: ToolDefinition[]
  handlers: Record<string, ToolHandler>
} {
  const AGENT_TOOL_NAMES: Record<string, string[]> = {
    ops: ['calendar_read', 'notion_read', 'notion_create_task', 'notion_append', 'obsidian_append', 'obsidian_daily', 'web_search'],
    research: ['web_search', 'drive_search', 'drive_read', 'notion_read', 'obsidian_search', 'obsidian_read', 'obsidian_append'],
    comms: ['gmail_inbox', 'gmail_read_thread', 'gmail_draft', 'calendar_read', 'calendar_create'],
    brand: ['notion_read', 'web_search', 'obsidian_read'],
    finance: ['notion_read'],
    news: ['web_search', 'notion_read'],
    council: ['notion_read', 'web_search'],
    cofounder: ['notion_read', 'obsidian_search', 'obsidian_read', 'calendar_read'],
    learning: ['web_search', 'notion_read', 'obsidian_append'],
  }

  const names = AGENT_TOOL_NAMES[agentName] ?? []
  const tools = names.map((n) => TOOL_DEFS[n]).filter(Boolean)
  const handlers: Record<string, ToolHandler> = {}
  for (const n of names) {
    if (TOOL_HANDLERS[n]) handlers[n] = TOOL_HANDLERS[n]
  }
  return { tools, handlers }
}
