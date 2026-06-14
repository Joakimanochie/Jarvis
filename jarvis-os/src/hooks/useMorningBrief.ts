import { useCallback, useEffect, useState } from 'react'
import { complete } from '@/integrations/kimi'
import { useGoalsStore, selectOverallProgress } from '@/store/goalsStore'
import { useTasksStore, selectTodaysTasks } from '@/store/tasksStore'
import { useCommsStore, selectUnreadCount, selectNeedReplyCount } from '@/store/commsStore'
import { useNewsStore } from '@/store/newsStore'

const CACHE_KEY = 'jarvis_morning_brief'
const TTL = 30 * 60_000 // 30 min

interface CachedBrief {
  text: string
  generatedAt: number
}

function readCache(): CachedBrief | null {
  const raw = localStorage.getItem(CACHE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as CachedBrief
  } catch {
    return null
  }
}

function writeCache(brief: CachedBrief) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(brief))
}

function buildPrompt(): string {
  const goals = useGoalsStore.getState().goals
  const tasks = useTasksStore.getState().tasks
  const todays = selectTodaysTasks(tasks)
  const { emails, events } = useCommsStore.getState()
  const unread = selectUnreadCount(emails)
  const needReply = selectNeedReplyCount(emails)
  const topStories = useNewsStore.getState().stories.slice(0, 3)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return `Write a short morning brief for Tobe (2-4 sentences, warm but direct, no headers/bullets/markdown).

Structure to cover: greeting ("${greeting}, Tobe"), top 1-3 priority tasks for today, inbox summary, today's calendar, overall goal progress, and 1-2 notable headlines.

Data:
- Overall goal progress: ${selectOverallProgress(goals)}%
- Today's tasks (${todays.length}): ${todays.map((t) => `"${t.title}" (${t.priority})`).join(', ') || 'none'}
- Inbox: ${unread} unread, ${needReply} need a reply
- Today's events (${events.length}): ${events.map((e) => `"${e.title}" at ${new Date(e.start).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`).join(', ') || 'nothing scheduled'}
- Top headlines: ${topStories.map((s) => `"${s.headline}"`).join(', ') || 'none'}

Write the brief as flowing prose, one paragraph, under 70 words.`
}

export function useMorningBrief() {
  const [brief, setBrief] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async (force = false) => {
    if (!force) {
      const cached = readCache()
      if (cached && Date.now() - cached.generatedAt < TTL) {
        setBrief(cached.text)
        return
      }
    }

    setLoading(true)
    setError(null)
    try {
      await useCommsStore.getState().fetchAll()
      await useNewsStore.getState().fetchTop()

      const text = await complete([{ role: 'user', content: buildPrompt() }], {
        maxTokens: 160,
        temperature: 0.7,
      })

      const trimmed = text.trim()
      setBrief(trimmed)
      writeCache({ text: trimmed, generatedAt: Date.now() })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate brief')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    generate()
  }, [generate])

  return { brief, loading, error, regenerate: () => generate(true) }
}
