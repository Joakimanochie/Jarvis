/**
 * Ambient Narrator — Day 11.
 *
 * Runs in the background (mounted once in AppShell) and proactively speaks
 * updates through SpeechSynthesis:
 *   - Calendar event starting in N minutes (configurable, default 5)
 *   - Newly overdue tasks
 *   - Auto-spoken morning briefing at a configured hour
 *
 * Respects quiet hours and narrator enabled toggle from NarratorSettings.
 */

import { useEffect, useRef, useCallback } from 'react'
import { useCommsStore } from '@/store/commsStore'
import { useTasksStore } from '@/store/tasksStore'
import { getNarratorSettings, isQuietHours } from '@/store/narratorSettings'
import type { CalendarEvent, Task } from '@/types'

// ─── TTS utility ────────────────────────────────────────────────────────────

function speak(text: string): void {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.rate = 0.9
  u.pitch = 1.05
  u.volume = 1

  const setVoice = () => {
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(
      (v) => /en.*gb|karen|samantha|google.*english/i.test(v.name) && v.lang.startsWith('en')
    ) ?? voices.find((v) => v.lang.startsWith('en'))
    if (preferred) u.voice = preferred
    window.speechSynthesis.speak(u)
  }

  if (window.speechSynthesis.getVoices().length > 0) {
    setVoice()
  } else {
    window.speechSynthesis.addEventListener('voiceschanged', setVoice, { once: true })
  }
}

// ─── Formatting helpers ──────────────────────────────────────────────────────

function minutesUntil(isoString: string): number {
  return Math.round((new Date(isoString).getTime() - Date.now()) / 60_000)
}

function eventSummary(event: CalendarEvent, mins: number): string {
  if (mins <= 1) return `Heads up — "${event.title}" is starting now.`
  return `Heads up — "${event.title}" starts in ${mins} minute${mins !== 1 ? 's' : ''}.`
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAmbientNarrator(): void {
  // IDs/timestamps of things already announced — persists across intervals
  const spokenEventsRef   = useRef<Set<string>>(new Set())
  const spokenTasksRef    = useRef<Set<string>>(new Set())
  const briefSpokenDate   = useRef<string | null>(null)  // 'YYYY-MM-DD' of last auto-brief
  const weeklyReviewDate  = useRef<string | null>(null)
  const isSpeakingRef     = useRef(false)

  const { events, fetchAll: fetchComms } = useCommsStore()
  const { tasks } = useTasksStore()

  const checkNow = useCallback(async () => {
    const settings = getNarratorSettings()
    if (!settings.enabled) return
    if (isQuietHours()) return
    if (isSpeakingRef.current) return

    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]

    // ── 1. Upcoming calendar events ─────────────────────────────────────────
    if (settings.speakMeetings) {
      for (const event of events) {
        const mins = minutesUntil(event.start)
        const withinWindow = mins >= 0 && mins <= settings.meetingWarningMins
        if (withinWindow && !spokenEventsRef.current.has(event.id)) {
          spokenEventsRef.current.add(event.id)
          isSpeakingRef.current = true
          speak(eventSummary(event, mins))
          setTimeout(() => { isSpeakingRef.current = false }, 4000)
          return // one announcement at a time
        }
      }
    }

    // ── 2. Overdue tasks (check once per task) ───────────────────────────────
    if (settings.speakOverdue) {
      const overdueNew = (tasks as Task[]).filter(
        (t) =>
          t.status !== 'done' &&
          t.dueDate &&
          t.dueDate < todayStr &&
          !spokenTasksRef.current.has(t.id)
      )
      if (overdueNew.length > 0) {
        overdueNew.forEach((t) => spokenTasksRef.current.add(t.id))
        const names = overdueNew.slice(0, 2).map((t) => `"${t.title}"`).join(' and ')
        const more = overdueNew.length > 2 ? ` and ${overdueNew.length - 2} more` : ''
        isSpeakingRef.current = true
        speak(`You have overdue tasks: ${names}${more}.`)
        setTimeout(() => { isSpeakingRef.current = false }, 5000)
        return
      }
    }

    // ── 3. Auto morning briefing ─────────────────────────────────────────────
    if (
      settings.autoBriefHour !== null &&
      now.getHours() === settings.autoBriefHour &&
      now.getMinutes() < 5 &&
      briefSpokenDate.current !== todayStr
    ) {
      briefSpokenDate.current = todayStr
      try {
        const { generateBriefingWithTools } = await import('@/agents/briefingAgent')
        const brief = await generateBriefingWithTools()
        // Strip markdown so TTS reads cleanly
        const plain = brief.replace(/#{1,6}\s/g, '').replace(/[*_`]/g, '').replace(/\n+/g, '. ')
        isSpeakingRef.current = true
        speak(`Good morning, Tobe. Here's your briefing. ${plain}`)
        setTimeout(() => { isSpeakingRef.current = false }, 30_000)
      } catch {
        // silently skip if briefing fails
      }
    }
    // ── 4. Monday weekly operating review ──────────────────────────────────
    if (
      now.getDay() === 1 && // Monday
      now.getHours() >= 9 && now.getHours() < 10 &&
      weeklyReviewDate.current !== todayStr
    ) {
      weeklyReviewDate.current = todayStr
      try {
        const { runJarvis } = await import('@/agents/orchestrator')
        await runJarvis('Give me my weekly operating review — synthesise all agent reports.')
        isSpeakingRef.current = true
        speak('Your weekly operating review is ready, Tobe. Check the agent panel.')
        setTimeout(() => { isSpeakingRef.current = false }, 5000)
      } catch { /* skip */ }
    }
  }, [events, tasks])

  // Poll every 30 seconds
  useEffect(() => {
    checkNow()
    const interval = setInterval(async () => {
      await fetchComms()
      checkNow()
    }, 30_000)
    return () => clearInterval(interval)
  }, [checkNow, fetchComms])

  // React to settings changes
  useEffect(() => {
    const handler = () => checkNow()
    window.addEventListener('jarvis_narrator_changed', handler)
    return () => window.removeEventListener('jarvis_narrator_changed', handler)
  }, [checkNow])
}
