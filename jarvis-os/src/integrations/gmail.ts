/**
 * Gmail API client (https://www.googleapis.com/gmail/v1) — direct fetch, no proxy needed
 * (Google APIs allow CORS for authenticated requests).
 *
 * Falls back to seed data when Google is not connected, so the UI always has
 * something to render.
 */

import { getAccessToken, isGoogleConnected } from './googleAuth'
import type { EmailThread, TriageBucket } from '@/types'

const BASE_URL = 'https://gmail.googleapis.com/gmail/v1'

async function gmailFetch(path: string, options: RequestInit = {}): Promise<any> {
  const token = await getAccessToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  })
  if (!res.ok) throw new Error(`Gmail API ${res.status}: ${await res.text()}`)
  if (res.status === 204) return null
  return res.json()
}

function header(headers: { name: string; value: string }[], name: string): string {
  return headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? ''
}

/** Cheap heuristic triage — refined later by the Comms Agent. */
function quickTriage(subject: string, snippet: string, unread: boolean): TriageBucket {
  const text = `${subject} ${snippet}`.toLowerCase()
  if (!unread) return 'archive'
  if (/urgent|asap|action required|deadline|invoice|overdue/.test(text)) return 'urgent'
  if (/\?|please (review|confirm|let me know|respond)|re:|reply/.test(text)) return 'reply'
  return 'fyi'
}

/** Fetch the last 20 inbox threads (sender, subject, snippet, date, triage). */
export async function fetchInbox(): Promise<EmailThread[]> {
  if (!isGoogleConnected()) return SEED_INBOX

  const list = await gmailFetch('/users/me/messages?maxResults=20&labelIds=INBOX')
  const messages = list.messages ?? []

  const threads: EmailThread[] = await Promise.all(
    messages.map(async (m: { id: string; threadId: string }) => {
      const msg = await gmailFetch(
        `/users/me/messages/${m.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`
      )
      const headers = msg.payload?.headers ?? []
      const from = header(headers, 'From')
      const senderMatch = from.match(/^(.*?)\s*<(.+)>$/)
      const sender = senderMatch ? senderMatch[1].replace(/"/g, '') : from
      const senderEmail = senderMatch ? senderMatch[2] : from
      const subject = header(headers, 'Subject') || '(no subject)'
      const snippet = msg.snippet ?? ''
      const unread = (msg.labelIds ?? []).includes('UNREAD')

      return {
        id: msg.id,
        threadId: msg.threadId,
        sender,
        senderEmail,
        subject,
        snippet,
        date: header(headers, 'Date'),
        unread,
        triage: quickTriage(subject, snippet, unread),
      }
    })
  )

  return threads
}

/** Fetch a full thread (all messages) for summarisation. */
export async function fetchThread(threadId: string): Promise<{ from: string; date: string; body: string }[]> {
  if (!isGoogleConnected()) {
    const seed = SEED_INBOX.find((t) => t.threadId === threadId)
    return seed
      ? [{ from: seed.sender, date: seed.date, body: seed.snippet }]
      : []
  }

  const thread = await gmailFetch(`/users/me/threads/${threadId}?format=full`)
  return (thread.messages ?? []).map((msg: any) => {
    const headers = msg.payload?.headers ?? []
    const part = msg.payload?.parts?.find((p: any) => p.mimeType === 'text/plain') ?? msg.payload
    const data = part?.body?.data ?? ''
    const body = data ? atob(data.replace(/-/g, '+').replace(/_/g, '/')) : msg.snippet ?? ''
    return { from: header(headers, 'From'), date: header(headers, 'Date'), body }
  })
}

function buildRawMessage(to: string, subject: string, body: string): string {
  const message = [`To: ${to}`, `Subject: ${subject}`, 'Content-Type: text/plain; charset=utf-8', '', body].join(
    '\r\n'
  )
  return btoa(message).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Create a Gmail draft. Returns the draft ID. */
export async function createDraft(to: string, subject: string, body: string): Promise<string> {
  if (!isGoogleConnected()) throw new Error('Google account not connected — go to Settings to connect')

  const draft = await gmailFetch('/users/me/drafts', {
    method: 'POST',
    body: JSON.stringify({ message: { raw: buildRawMessage(to, subject, body) } }),
  })
  return draft.id
}

/** Send a previously-created draft. Requires explicit user confirmation in the UI. */
export async function sendEmail(draftId: string): Promise<void> {
  if (!isGoogleConnected()) throw new Error('Google account not connected — go to Settings to connect')

  await gmailFetch('/users/me/drafts/send', {
    method: 'POST',
    body: JSON.stringify({ id: draftId }),
  })
}

// ─── Seed data (used when Google is not connected) ─────────────────────────

const SEED_INBOX: EmailThread[] = [
  {
    id: 'seed_1',
    threadId: 'seed_1',
    sender: 'Adaeze (Notion)',
    senderEmail: 'adaeze@notion-team.com',
    subject: 'Re: Workspace access for JarOs integration',
    snippet: 'Thanks for setting this up — can you confirm the integration has access to the Goals database?',
    date: new Date(Date.now() - 2 * 3600_000).toISOString(),
    unread: true,
    triage: 'reply',
  },
  {
    id: 'seed_2',
    threadId: 'seed_2',
    sender: 'NVIDIA Developer',
    senderEmail: 'no-reply@nvidia.com',
    subject: 'Your build.nvidia.com API usage summary',
    snippet: 'Here is your weekly usage summary for the Nvidia NIM API — moonshotai/kimi-k2.6 usage up 18%.',
    date: new Date(Date.now() - 5 * 3600_000).toISOString(),
    unread: true,
    triage: 'fyi',
  },
  {
    id: 'seed_3',
    threadId: 'seed_3',
    sender: 'Chinedu O.',
    senderEmail: 'chinedu@example.com',
    subject: 'URGENT: Invoice overdue — action required',
    snippet: 'Hi, the invoice for last month is now 5 days overdue. Please confirm payment by Friday.',
    date: new Date(Date.now() - 20 * 3600_000).toISOString(),
    unread: true,
    triage: 'urgent',
  },
  {
    id: 'seed_4',
    threadId: 'seed_4',
    sender: 'GitHub',
    senderEmail: 'notifications@github.com',
    subject: '[jarvis-os] New release v0.4.0 published',
    snippet: 'A new release has been published in your repository jarvis-os.',
    date: new Date(Date.now() - 30 * 3600_000).toISOString(),
    unread: false,
    triage: 'archive',
  },
  {
    id: 'seed_5',
    threadId: 'seed_5',
    sender: 'Fatima B.',
    senderEmail: 'fatima@example.com',
    subject: 'Quick question on the research dataset',
    snippet: 'Could you let me know which version of the dataset you used for the baseline? Want to reproduce it.',
    date: new Date(Date.now() - 36 * 3600_000).toISOString(),
    unread: true,
    triage: 'reply',
  },
]
