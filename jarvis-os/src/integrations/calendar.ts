/**
 * Google Calendar API client (https://www.googleapis.com/calendar/v3) — direct fetch.
 * Falls back to seed data when Google is not connected.
 */

import { getAccessToken, isGoogleConnected } from './googleAuth'
import type { CalendarEvent } from '@/types'

const BASE_URL = 'https://www.googleapis.com/calendar/v3'

async function calendarFetch(path: string, options: RequestInit = {}): Promise<any> {
  const token = await getAccessToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  })
  if (!res.ok) throw new Error(`Calendar API ${res.status}: ${await res.text()}`)
  if (res.status === 204) return null
  return res.json()
}

function parseEvent(ev: any): CalendarEvent {
  return {
    id: ev.id,
    title: ev.summary ?? '(no title)',
    start: ev.start?.dateTime ?? ev.start?.date,
    end: ev.end?.dateTime ?? ev.end?.date,
    location: ev.location,
    attendees: (ev.attendees ?? []).map((a: any) => a.email),
    videoLink: ev.hangoutLink ?? ev.conferenceData?.entryPoints?.[0]?.uri,
  }
}

async function fetchEventsBetween(timeMin: Date, timeMax: Date): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '20',
  })
  const data = await calendarFetch(`/calendars/primary/events?${params.toString()}`)
  return (data.items ?? []).map(parseEvent)
}

/** Fetch all calendar events for today. */
export async function fetchTodayEvents(): Promise<CalendarEvent[]> {
  if (!isGoogleConnected()) return SEED_TODAY_EVENTS

  const now = new Date()
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)

  return fetchEventsBetween(start, end)
}

/** Fetch events for the next 7 days. */
export async function fetchWeekEvents(): Promise<CalendarEvent[]> {
  if (!isGoogleConnected()) return SEED_WEEK_EVENTS

  const now = new Date()
  const end = new Date(now)
  end.setDate(end.getDate() + 7)

  return fetchEventsBetween(now, end)
}

/** Create a new calendar event. */
export async function createEvent(
  title: string,
  start: string,
  end: string,
  attendees: string[] = []
): Promise<CalendarEvent> {
  if (!isGoogleConnected()) throw new Error('Google account not connected — go to Settings to connect')

  const data = await calendarFetch('/calendars/primary/events', {
    method: 'POST',
    body: JSON.stringify({
      summary: title,
      start: { dateTime: start },
      end: { dateTime: end },
      attendees: attendees.map((email) => ({ email })),
    }),
  })
  return parseEvent(data)
}

// ─── Seed data (used when Google is not connected) ─────────────────────────

function todayAt(hour: number, minute = 0): string {
  const d = new Date()
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

const SEED_TODAY_EVENTS: CalendarEvent[] = [
  {
    id: 'seed_ev_1',
    title: 'Deep work — Research dataset review',
    start: todayAt(9, 0),
    end: todayAt(11, 0),
  },
  {
    id: 'seed_ev_2',
    title: 'Sync with Fatima — VLM First Aid project',
    start: todayAt(14, 0),
    end: todayAt(14, 30),
    attendees: ['fatima@example.com'],
    videoLink: 'https://meet.google.com/abc-defg-hij',
  },
  {
    id: 'seed_ev_3',
    title: 'Weekly review & planning',
    start: todayAt(17, 0),
    end: todayAt(17, 30),
  },
]

const SEED_WEEK_EVENTS: CalendarEvent[] = [
  ...SEED_TODAY_EVENTS,
  {
    id: 'seed_ev_4',
    title: 'Investor intro call',
    start: new Date(Date.now() + 2 * 86400_000).toISOString(),
    end: new Date(Date.now() + 2 * 86400_000 + 1800_000).toISOString(),
    videoLink: 'https://meet.google.com/xyz-uvwx-rst',
  },
]
