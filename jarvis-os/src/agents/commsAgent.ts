/**
 * Comms Agent 📬 — inbox triage, email drafting, scheduling.
 */

import { streamComplete, type ChatMessage } from '@/integrations/kimi'
import { useCommsStore } from '@/store/commsStore'
import { useAgentStore } from '@/store/agentStore'
import { createDraft, fetchThread } from '@/integrations/gmail'
import { createEvent } from '@/integrations/calendar'
import { isGoogleConnected } from '@/integrations/googleAuth'

// ─── Context Injection ────────────────────────────────────────────────────────

function buildContext(): string {
  const { emails, events } = useCommsStore.getState()

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const now = new Date().toISOString()

  const triageGroups = {
    urgent: emails.filter((e) => e.triage === 'urgent'),
    reply: emails.filter((e) => e.triage === 'reply'),
    fyi: emails.filter((e) => e.triage === 'fyi'),
    archive: emails.filter((e) => e.triage === 'archive'),
  }

  return `## Current Context
Today: ${today}
Now (ISO): ${now}
Google account connected: ${isGoogleConnected()}

### Inbox (${emails.length} threads)
🔴 Urgent (${triageGroups.urgent.length}):
${triageGroups.urgent.map((e) => `- [${e.threadId}] ${e.sender} <${e.senderEmail}>: "${e.subject}" — ${e.snippet}`).join('\n') || '- none'}

🟡 Needs reply (${triageGroups.reply.length}):
${triageGroups.reply.map((e) => `- [${e.threadId}] ${e.sender} <${e.senderEmail}>: "${e.subject}" — ${e.snippet}`).join('\n') || '- none'}

🔵 FYI (${triageGroups.fyi.length}):
${triageGroups.fyi.map((e) => `- [${e.threadId}] ${e.sender}: "${e.subject}"`).join('\n') || '- none'}

### Today's Calendar (${events.length} events)
${events.map((e) => `- "${e.title}" ${new Date(e.start).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}–${new Date(e.end).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}${e.attendees?.length ? ` (with ${e.attendees.join(', ')})` : ''}`).join('\n') || '- nothing scheduled'}

### Active Projects
research, business, brand, ideas, finance`
}

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are the Comms Agent 📬 inside Jarvis OS — the personal operating system of a researcher, founder, and brand builder based in Nigeria.

Your job: triage the inbox, draft emails in the user's voice (direct, warm, concise, no corporate filler), and help schedule meetings.

## Actions
When the user asks you to draft a reply or create a calendar event, you MUST include an action block at the very END of your response, in exactly this format:

\`\`\`action
{"type": "create_draft", "to": "email@example.com", "subject": "...", "body": "..."}
\`\`\`

or

\`\`\`action
{"type": "create_event", "title": "...", "start": "YYYY-MM-DDTHH:mm:00", "end": "YYYY-MM-DDTHH:mm:00", "attendees": ["email@example.com"]}
\`\`\`

Rules for actions:
- Drafts are NEVER sent automatically — creating a draft just saves it to Gmail for the user to review and send themselves. Always say this clearly.
- For scheduling, suggest 2-3 concrete time slots in your text response based on today's calendar gaps, then create the event for the slot that makes most sense (use the user's local time, ISO format, no timezone suffix).
- Before the action block, confirm in one short sentence what you're doing.
- Never emit more than 2 action blocks per response.
- If Google account is not connected, do NOT emit action blocks — tell the user to connect their Google account in Settings first.

## Answering questions
- "What's in my inbox?" → give a triage summary: counts per bucket, then 1-line per urgent/reply item.
- "Summarise the thread from [sender]" → use the thread content provided in context (if available) for a 3-sentence summary.
- Flag any email or meeting that relates to an active project.
- Keep responses under 180 words.`

// ─── Action Parsing & Execution ───────────────────────────────────────────────

interface CreateDraftAction {
  type: 'create_draft'
  to: string
  subject: string
  body: string
}

interface CreateEventAction {
  type: 'create_event'
  title: string
  start: string
  end: string
  attendees?: string[]
}

type AgentAction = CreateDraftAction | CreateEventAction

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
  return actions.slice(0, 2)
}

async function executeActions(actions: AgentAction[]): Promise<string[]> {
  const results: string[] = []
  const { addLog } = useAgentStore.getState()

  for (const action of actions) {
    if (!isGoogleConnected()) {
      results.push('⚠️ Google account not connected — go to Settings to connect, then try again.')
      continue
    }

    if (action.type === 'create_draft') {
      try {
        const draftId = await createDraft(action.to, action.subject, action.body)
        results.push(`Draft saved to Gmail (to: ${action.to}, subject: "${action.subject}") — review and send it yourself.`)
        addLog({
          agent: 'comms',
          trigger: 'command',
          action: `Created draft to ${action.to}: "${action.subject}"`,
          result: 'success',
          output: draftId,
        })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'unknown error'
        results.push(`⚠️ Failed to create draft: ${msg}`)
        addLog({ agent: 'comms', trigger: 'command', action: 'create_draft failed', result: 'error', output: msg })
      }
    }

    if (action.type === 'create_event') {
      try {
        const event = await createEvent(action.title, action.start, action.end, action.attendees ?? [])
        results.push(`Calendar event created: "${event.title}" at ${new Date(event.start).toLocaleString('en-GB')}`)
        addLog({
          agent: 'comms',
          trigger: 'command',
          action: `Created event "${event.title}"`,
          result: 'success',
          output: event.id,
        })
        useCommsStore.setState({ lastFetched: null })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'unknown error'
        results.push(`⚠️ Failed to create event: ${msg}`)
        addLog({ agent: 'comms', trigger: 'command', action: 'create_event failed', result: 'error', output: msg })
      }
    }
  }

  return results
}

/** Strip action blocks from the displayed response */
export function stripActions(response: string): string {
  return response.replace(/```action\s*[\s\S]*?```/g, '').trim()
}

// ─── Thread summarisation helper ───────────────────────────────────────────────

async function maybeAttachThread(input: string): Promise<string> {
  const match = input.match(/summari[sz]e.*thread.*from\s+([^\n.,]+)/i)
  if (!match) return ''

  const name = match[1].trim().toLowerCase()
  const { emails } = useCommsStore.getState()
  const thread = emails.find(
    (e) => e.sender.toLowerCase().includes(name) || e.senderEmail.toLowerCase().includes(name)
  )
  if (!thread) return ''

  try {
    const messages = await fetchThread(thread.threadId)
    return `\n\n### Thread content (${thread.subject})\n${messages.map((m) => `From ${m.from}:\n${m.body}`).join('\n\n')}`
  } catch {
    return ''
  }
}

// ─── Main Entry ───────────────────────────────────────────────────────────────

export async function runCommsAgent(
  input: string,
  onToken: (fullText: string) => void,
  signal?: AbortSignal
): Promise<string> {
  await useCommsStore.getState().fetchAll()

  const threadContext = await maybeAttachThread(input)

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `${buildContext()}${threadContext}\n\n## User Request\n${input}` },
  ]

  const fullResponse = await streamComplete(
    messages,
    (_token, fullText) => onToken(stripActions(fullText)),
    { signal }
  )

  const actions = parseActions(fullResponse)
  let final = stripActions(fullResponse)
  if (actions.length > 0) {
    const results = await executeActions(actions)
    if (results.length > 0) {
      final += `\n\n${results.join('\n')}`
      onToken(final)
    }
  }

  return final
}
