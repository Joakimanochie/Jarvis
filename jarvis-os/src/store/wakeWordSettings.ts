const WAKE_WORD_KEY = 'jarvis_wake_word_enabled'

export function getWakeWordEnabled(): boolean {
  return localStorage.getItem(WAKE_WORD_KEY) === 'true'
}

export function setWakeWordEnabled(v: boolean) {
  localStorage.setItem(WAKE_WORD_KEY, String(v))
  window.dispatchEvent(new Event('jarvis_wake_word_changed'))
}
