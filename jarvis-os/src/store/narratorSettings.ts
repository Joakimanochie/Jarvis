/**
 * Narrator settings — persisted to localStorage.
 * Dispatches 'jarvis_narrator_changed' so any mounted component can react.
 */

const KEY = 'jarvis_narrator'

export interface NarratorSettings {
  enabled: boolean
  speakMeetings: boolean     // warn N minutes before a calendar event
  meetingWarningMins: number // how many minutes before to warn (default 5)
  speakOverdue: boolean      // announce newly overdue tasks
  autoBriefHour: number | null // null = off; 9 = auto-speak brief at 9am
  quietStart: number | null  // hour (0-23) quiet period starts, null = no quiet hours
  quietEnd: number | null    // hour quiet period ends
}

const DEFAULTS: NarratorSettings = {
  enabled: false,
  speakMeetings: true,
  meetingWarningMins: 5,
  speakOverdue: true,
  autoBriefHour: 9,
  quietStart: 22,
  quietEnd: 8,
}

export function getNarratorSettings(): NarratorSettings {
  try {
    const stored = localStorage.getItem(KEY)
    if (!stored) return DEFAULTS
    return { ...DEFAULTS, ...JSON.parse(stored) }
  } catch {
    return DEFAULTS
  }
}

export function setNarratorSettings(s: Partial<NarratorSettings>): void {
  const next = { ...getNarratorSettings(), ...s }
  localStorage.setItem(KEY, JSON.stringify(next))
  window.dispatchEvent(new Event('jarvis_narrator_changed'))
}

export function isQuietHours(): boolean {
  const { quietStart, quietEnd } = getNarratorSettings()
  if (quietStart === null || quietEnd === null) return false
  const h = new Date().getHours()
  if (quietStart < quietEnd) return h >= quietStart && h < quietEnd
  // wraps midnight: e.g. quietStart=22, quietEnd=8 → quiet from 22 to 8
  return h >= quietStart || h < quietEnd
}
