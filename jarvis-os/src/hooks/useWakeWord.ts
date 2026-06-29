/**
 * Always-on wake word hook — chain (non-continuous) approach.
 *
 * WHY NOT continuous=true:
 * Chrome's continuous SpeechRecognition is unreliable for always-on listening —
 * it silently stops, fires onend, and the restart loop gets into bad states.
 *
 * CHAIN APPROACH:
 * Each recognition instance runs in non-continuous mode (listens for one
 * utterance, delivers a result, fires onend). onend immediately restarts
 * a fresh instance. Gap is ~150 ms — imperceptible to the user.
 *
 * This is how reliable always-on STT works in the browser.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

export type WakeWordState = 'off' | 'listening' | 'triggered' | 'error'

interface UseWakeWordOptions {
  enabled: boolean
  onWake: () => void
}

interface UseWakeWordResult {
  state: WakeWordState
  lastHeard: string       // last transcribed phrase — for debug display
  pause: () => void
  resume: () => void
  supported: boolean
  errorMessage: string | null
}

const TRIGGER_PHRASES = ['hey jarvis', 'ok jarvis', 'okay jarvis', 'jarvis']

function containsTrigger(text: string): boolean {
  return TRIGGER_PHRASES.some((p) => text.toLowerCase().includes(p))
}

interface SRResult { readonly isFinal: boolean; readonly [i: number]: { readonly transcript: string } }
interface SRResultList { readonly length: number; readonly [i: number]: SRResult }
interface SREvent { readonly resultIndex: number; readonly results: SRResultList }
interface SRErrorEvent { readonly error: string }
interface SR {
  continuous: boolean; interimResults: boolean; lang: string; maxAlternatives: number
  start(): void; stop(): void; abort(): void
  onstart: (() => void) | null
  onresult: ((e: SREvent) => void) | null
  onerror: ((e: SRErrorEvent) => void) | null
  onend: (() => void) | null
}
interface SRConstructor { new(): SR }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSRClass(): SRConstructor | null { const w = window as any; return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null }

export function useWakeWord({ enabled, onWake }: UseWakeWordOptions): UseWakeWordResult {
  const [state, setState]       = useState<WakeWordState>('off')
  const [lastHeard, setLastHeard] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const recognitionRef  = useRef<SR | null>(null)
  const pausedRef       = useRef(false)
  const deniedRef       = useRef(false)
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Stable refs — no deps on these in useCallback below
  const onWakeRef   = useRef(onWake)
  const enabledRef  = useRef(enabled)
  useLayoutEffect(() => { onWakeRef.current  = onWake  }, [onWake])
  useLayoutEffect(() => { enabledRef.current = enabled }, [enabled])

  const supported = Boolean(getSRClass())

  const clearTimer = () => {
    if (restartTimerRef.current) { clearTimeout(restartTimerRef.current); restartTimerRef.current = null }
  }

  const stopRecognition = useCallback(() => {
    clearTimer()
    recognitionRef.current?.abort()
    recognitionRef.current = null
  }, [])

  // Stable — reads everything via refs
  const startRecognition = useCallback(() => {
    const SRClass = getSRClass()
    if (!SRClass || pausedRef.current || deniedRef.current || !enabledRef.current) return
    if (recognitionRef.current) return // guard double-start

    const r = new SRClass()
    r.continuous    = false  // ← chain mode: one utterance per instance
    r.interimResults = false // only finals needed for keyword match
    r.lang           = navigator.language ?? 'en-US'
    r.maxAlternatives = 1

    r.onstart = () => setState('listening')

    r.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript
      setLastHeard(transcript)

      if (containsTrigger(transcript)) {
        setState('triggered')
        recognitionRef.current = null
        pausedRef.current = true
        r.abort()
        onWakeRef.current()
      }
      // if not a trigger — onend fires naturally and chain restarts
    }

    r.onerror = (event) => {
      if (event.error === 'aborted' || event.error === 'no-speech') return // expected in chain mode
      if (event.error === 'not-allowed') {
        deniedRef.current = true
        setErrorMessage('Microphone access denied — check Chrome site permissions for localhost')
        setState('error')
      }
      // other errors: let onend handle restart
    }

    r.onend = () => {
      recognitionRef.current = null
      if (pausedRef.current || deniedRef.current || !enabledRef.current) {
        setState('off')
        return
      }
      // Chain: restart for next utterance after a short gap
      restartTimerRef.current = setTimeout(startRecognition, 150)
    }

    recognitionRef.current = r
    try { r.start() } catch { /* guard */ }
  }, []) // intentionally empty — all state via refs

  useEffect(() => {
    if (!supported) return
    if (enabled) {
      deniedRef.current = false
      pausedRef.current = false
      startRecognition()
    } else {
      pausedRef.current = true
      stopRecognition()
      setState('off')
    }
    return stopRecognition
  }, [enabled, supported, startRecognition, stopRecognition])

  const pause = useCallback(() => {
    pausedRef.current = true
    stopRecognition()
    setState('off')
  }, [stopRecognition])

  const resume = useCallback(() => {
    if (deniedRef.current || !enabledRef.current) return
    pausedRef.current = false
    clearTimer()
    restartTimerRef.current = setTimeout(startRecognition, 400)
  }, [startRecognition])

  return { state, lastHeard, pause, resume, supported, errorMessage }
}
