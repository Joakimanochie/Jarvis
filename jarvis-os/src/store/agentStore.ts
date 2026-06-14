import { create } from 'zustand'
import type { AgentLog } from '@/types'

export type AgentName = 'ops' | 'research' | 'comms' | 'brand' | 'finance' | 'news'

export interface Exchange {
  id: string
  agent: AgentName
  input: string
  response: string
  streaming: boolean
  timestamp: string
}

interface AgentState {
  logs: AgentLog[]
  exchanges: Exchange[]
  busy: boolean

  addLog: (log: Omit<AgentLog, 'id' | 'timestamp'>) => void
  clearLogs: () => void
  startExchange: (agent: AgentName, input: string) => string
  appendToExchange: (id: string, fullText: string) => void
  finishExchange: (id: string) => void
  setBusy: (v: boolean) => void
}

export const useAgentStore = create<AgentState>((set) => ({
  logs: [],
  exchanges: [],
  busy: false,

  addLog: (log) =>
    set((state) => ({
      logs: [
        {
          ...log,
          id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          timestamp: new Date().toISOString(),
        },
        ...state.logs,
      ].slice(0, 50), // keep last 50
    })),

  clearLogs: () => set({ logs: [] }),

  startExchange: (agent, input) => {
    const id = `ex_${Date.now()}`
    set((state) => ({
      exchanges: [
        ...state.exchanges,
        {
          id,
          agent,
          input,
          response: '',
          streaming: true,
          timestamp: new Date().toISOString(),
        },
      ].slice(-5), // keep last 5 exchanges
      busy: true,
    }))
    return id
  },

  appendToExchange: (id, fullText) =>
    set((state) => ({
      exchanges: state.exchanges.map((e) => (e.id === id ? { ...e, response: fullText } : e)),
    })),

  finishExchange: (id) =>
    set((state) => ({
      exchanges: state.exchanges.map((e) => (e.id === id ? { ...e, streaming: false } : e)),
      busy: false,
    })),

  setBusy: (busy) => set({ busy }),
}))

export const AGENT_META: Record<AgentName, { label: string; emoji: string; color: string }> = {
  ops: { label: 'Ops Agent', emoji: '🗂️', color: '#f59e0b' },
  research: { label: 'Research Agent', emoji: '🔬', color: '#818cf8' },
  comms: { label: 'Comms Agent', emoji: '📬', color: '#3b82f6' },
  brand: { label: 'Brand Agent', emoji: '📣', color: '#f472b6' },
  finance: { label: 'Finance Agent', emoji: '💰', color: '#34d399' },
  news: { label: 'News Agent', emoji: '🌍', color: '#60a5fa' },
}
