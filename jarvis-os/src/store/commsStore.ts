import { create } from 'zustand'
import type { EmailThread, CalendarEvent, TriageBucket } from '@/types'
import { fetchInbox } from '@/integrations/gmail'
import { fetchTodayEvents, fetchWeekEvents } from '@/integrations/calendar'

interface CommsState {
  emails: EmailThread[]
  events: CalendarEvent[]
  weekEvents: CalendarEvent[]
  loading: boolean
  lastFetched: number | null

  fetchAll: () => Promise<void>
  setTriage: (id: string, triage: TriageBucket) => void
}

const TTL = 2 * 60_000 // 2 minutes, same pattern as tasksStore

export const useCommsStore = create<CommsState>((set, get) => ({
  emails: [],
  events: [],
  weekEvents: [],
  loading: false,
  lastFetched: null,

  fetchAll: async () => {
    const { lastFetched } = get()
    if (lastFetched && Date.now() - lastFetched < TTL) return

    set({ loading: true })
    try {
      const [emails, events, weekEvents] = await Promise.all([
        fetchInbox(),
        fetchTodayEvents(),
        fetchWeekEvents(),
      ])
      set({ emails, events, weekEvents, loading: false, lastFetched: Date.now() })
    } catch {
      set({ loading: false })
    }
  },

  setTriage: (id, triage) =>
    set((state) => ({
      emails: state.emails.map((e) => (e.id === id ? { ...e, triage } : e)),
    })),
}))

export function selectUnreadCount(emails: EmailThread[]): number {
  return emails.filter((e) => e.unread).length
}

export function selectNeedReplyCount(emails: EmailThread[]): number {
  return emails.filter((e) => e.triage === 'urgent' || e.triage === 'reply').length
}

export function selectNextEvent(events: CalendarEvent[]): CalendarEvent | null {
  const now = Date.now()
  const upcoming = events
    .filter((e) => new Date(e.start).getTime() > now)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
  return upcoming[0] ?? null
}
