/**
 * Push-to-talk hook using the Web Speech API (SpeechRecognition).
 * Works in Chrome/Edge on Windows — no model download, real-time interim results.
 *
 * States:
 *   idle         → ready, not recording
 *   recording    → mic open, streaming interim transcript into input
 *   transcribing → speech ended, waiting for final result (brief flash)
 *   error        → something went wrong (auto-clears after 3 s)
 */

import { useCallback, useEffect, useRef, useState } from 'react'

export type PTTState = 'idle' | 'recording' | 'transcribing' | 'error'

interface UsePushToTalkOptions {
  onTranscript: (text: string) => void
  lang?: string
}

interface UsePushToTalkResult {
  state: PTTState
  interimTranscript: string
  toggle: () => void
  stop: () => void
  supported: boolean
  errorMessage: string | null
}

// Minimal hand-rolled types so we don't need @types/dom-speech-recognition
interface SRResult {
  readonly isFinal: boolean
  readonly [index: number]: { readonly transcript: string }
}
interface SRResultList {
  readonly length: number
  readonly [index: number]: SRResult
}
interface SREvent {
  readonly resultIndex: number
  readonly results: SRResultList
}
interface SRErrorEvent {
  readonly error: string
}
interface SR {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  start(): void
  stop(): void
  onstart: (() => void) | null
  onresult: ((e: SREvent) => void) | null
  onspeechend: (() => void) | null
  onerror: ((e: SRErrorEvent) => void) | null
  onend: (() => void) | null
}
interface SRConstructor {
  new (): SR
}

function getSRClass(): SRConstructor | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function usePushToTalk({ onTranscript, lang }: UsePushToTalkOptions): UsePushToTalkResult {
  const [state, setState] = useState<PTTState>('idle')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const recognitionRef = useRef<SR | null>(null)
  const supported = Boolean(getSRClass())

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setState('idle')
    setInterimTranscript('')
  }, [])

  const start = useCallback(() => {
    const SRClass = getSRClass()
    if (!SRClass) return

    const recognition = new SRClass()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = lang ?? navigator.language ?? 'en-US'
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setState('recording')
      setErrorMessage(null)
    }

    recognition.onresult = (event) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript
        if (event.results[i].isFinal) final += text
        else interim += text
      }
      setInterimTranscript(interim || final)
      if (final) {
        setState('transcribing')
        setInterimTranscript('')
        onTranscript(final.trim())
      }
    }

    recognition.onspeechend = () => {
      setState('transcribing')
    }

    recognition.onerror = (event) => {
      const msg =
        event.error === 'no-speech'
          ? 'No speech detected — try again'
          : event.error === 'not-allowed'
            ? 'Microphone access denied — check browser permissions'
            : `Speech error: ${event.error}`
      setErrorMessage(msg)
      setState('error')
      setTimeout(() => setState('idle'), 3000)
    }

    recognition.onend = () => {
      setState((prev) => (prev === 'recording' || prev === 'transcribing' ? 'idle' : prev))
      recognitionRef.current = null
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [lang, onTranscript])

  const toggle = useCallback(() => {
    if (state === 'recording') stop()
    else if (state === 'idle' || state === 'error') start()
  }, [state, start, stop])

  useEffect(() => () => { recognitionRef.current?.stop() }, [])

  return { state, interimTranscript, toggle, stop, supported, errorMessage }
}
