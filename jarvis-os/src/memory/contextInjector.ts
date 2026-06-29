/**
 * Context Injector — Day 14.
 *
 * Loads founder profile, recent memories, goals, and tasks
 * into a context payload injected at the start of every agent call.
 */

import { useGoalsStore, selectOverallProgress } from '@/store/goalsStore'
import { useTasksStore, selectTodaysTasks } from '@/store/tasksStore'
import { useCommsStore, selectNextEvent } from '@/store/commsStore'
import { getStoredMemories, type SessionMemory } from './memoryStore'

const PROFILE_KEY = 'jarvis_founder_profile'
const PINNED_KEY = 'jarvis_pinned_context'

// ─── Founder Profile ─────────────────────────────────────────────────────────

export interface FounderProfile {
  name: string
  role: string
  activeProjects: string[]
  workingHours: string
  timezone: string
  communicationStyle: string
}

const DEFAULT_PROFILE: FounderProfile = {
  name: 'Tobe',
  role: 'Researcher, Founder, Product Manager, Brand Builder',
  activeProjects: ['VLM First Aid research', 'Jarvis OS', 'LinkedIn personal brand'],
  workingHours: '8am–10pm',
  timezone: 'Africa/Lagos (WAT, UTC+1)',
  communicationStyle: 'Direct, concise, no corporate speak. First-person. Concrete over abstract.',
}

export function getFounderProfile(): FounderProfile {
  try {
    const stored = localStorage.getItem(PROFILE_KEY)
    if (!stored) return DEFAULT_PROFILE
    return { ...DEFAULT_PROFILE, ...JSON.parse(stored) }
  } catch {
    return DEFAULT_PROFILE
  }
}

export function setFounderProfile(profile: Partial<FounderProfile>): void {
  const next = { ...getFounderProfile(), ...profile }
  localStorage.setItem(PROFILE_KEY, JSON.stringify(next))
}

// ─── Pinned Context ──────────────────────────────────────────────────────────

export function getPinnedContext(): string {
  return localStorage.getItem(PINNED_KEY) ?? ''
}

export function setPinnedContext(text: string): void {
  localStorage.setItem(PINNED_KEY, text)
}

// ─── Context Assembly ────────────────────────────────────────────────────────

function formatMemories(memories: SessionMemory[], count = 5): string {
  const recent = memories.slice(0, count)
  if (recent.length === 0) return ''

  return `### Recent session memories\n${recent.map((m) => {
    const date = new Date(m.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
    const parts = [m.summary]
    if (m.decisions.length > 0) parts.push(`Decisions: ${m.decisions.join('; ')}`)
    return `- [${date}] ${parts.join(' — ')}`
  }).join('\n')}`
}

function formatGoals(): string {
  const goals = useGoalsStore.getState().goals
  if (goals.length === 0) return ''
  const overall = selectOverallProgress(goals)
  return `### Goals (overall ${overall}%)\n${goals.map((g) => `- ${g.area}: ${g.progress}% (${g.status})`).join('\n')}`
}

function formatTasks(): string {
  const tasks = useTasksStore.getState().tasks
  const todays = selectTodaysTasks(tasks)
  if (todays.length === 0) return '### Tasks due today\n- none'
  return `### Tasks due today (${todays.length})\n${todays.map((t) => `- [${t.priority}] ${t.title}`).join('\n')}`
}

function formatNextEvent(): string {
  const { events } = useCommsStore.getState()
  const next = selectNextEvent(events)
  if (!next) return ''
  const mins = Math.round((new Date(next.start).getTime() - Date.now()) / 60_000)
  if (mins < 0 || mins > 480) return ''
  return `### Next event\n- "${next.title}" in ${mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}m`}`
}

/**
 * Build the full context payload injected into every agent's system prompt.
 * Capped at ~2000 tokens (~8000 chars) to control cost.
 */
export function buildContextPayload(): string {
  const profile = getFounderProfile()
  const memories = getStoredMemories()
  const pinned = getPinnedContext()

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  const sections = [
    `# Founder Context`,
    `Today: ${today}, ${time}`,
    `Name: ${profile.name} | Role: ${profile.role}`,
    `Active projects: ${profile.activeProjects.join(', ')}`,
    `Style: ${profile.communicationStyle}`,
    '',
    formatGoals(),
    formatTasks(),
    formatNextEvent(),
    formatMemories(memories),
    pinned ? `### Pinned context\n${pinned}` : '',
  ].filter(Boolean)

  const payload = sections.join('\n\n')
  return payload.slice(0, 8000)
}

/**
 * Summary string for the MemoryCard component on the Home page.
 */
export function getMemorySummary(): {
  lastSession: string | null
  memoryCount: number
  greeting: string
} {
  const profile = getFounderProfile()
  const memories = getStoredMemories()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return {
    lastSession: memories.length > 0 ? memories[0].summary : null,
    memoryCount: memories.length,
    greeting: `${greeting}, ${profile.name}`,
  }
}
