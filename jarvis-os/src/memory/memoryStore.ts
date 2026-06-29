/**
 * Session memory storage — localStorage only.
 * Separated from memoryBuilder to avoid pulling kimi into the main bundle.
 */

const MEMORY_KEY = 'jarvis_session_memories'
const MAX_STORED = 30

export interface SessionMemory {
  date: string
  summary: string
  keyFacts: string[]
  decisions: string[]
  projectsTouched: string[]
  energy: 'high' | 'medium' | 'low'
}

export function getStoredMemories(): SessionMemory[] {
  try {
    return JSON.parse(localStorage.getItem(MEMORY_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function storeMemory(memory: SessionMemory): void {
  const existing = getStoredMemories()
  const updated = [memory, ...existing].slice(0, MAX_STORED)
  localStorage.setItem(MEMORY_KEY, JSON.stringify(updated))
}
