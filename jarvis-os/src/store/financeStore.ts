import { create } from 'zustand'
import type { FinanceEntry } from '@/types'
import { fetchFinanceEntries, logFinanceEntry } from '@/integrations/notion'
import { useToastStore } from '@/store/toastStore'

interface FinanceState {
  entries: FinanceEntry[]
  loading: boolean
  connected: boolean

  fetchAll: () => Promise<void>
  addEntry: (entry: Omit<FinanceEntry, 'id' | 'notionId'>) => void
}

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86400_000).toISOString().slice(0, 10)
}

const SEED_ENTRIES: FinanceEntry[] = [
  { id: 'fin_1', amount: 850000, category: 'salary', type: 'income', date: daysAgo(10), notes: 'Monthly salary' },
  { id: 'fin_2', amount: 15000, category: 'transport', type: 'expense', date: daysAgo(1), notes: 'Uber to client meeting' },
  { id: 'fin_3', amount: 45000, category: 'subscriptions', type: 'expense', date: daysAgo(3), notes: 'Notion + Vercel + NIM credits' },
  { id: 'fin_4', amount: 120000, category: 'food', type: 'expense', date: daysAgo(5), notes: 'Groceries (month)' },
  { id: 'fin_5', amount: 200000, category: 'freelance', type: 'income', date: daysAgo(7), notes: 'Consulting project payment' },
  { id: 'fin_6', amount: 30000, category: 'rent', type: 'expense', date: daysAgo(2), notes: 'Coworking space' },
]

const NOTION_FINANCE_DB_ID = import.meta.env.VITE_NOTION_FINANCE_DB_ID as string

export const useFinanceStore = create<FinanceState>((set, get) => ({
  entries: SEED_ENTRIES,
  loading: false,
  connected: Boolean(NOTION_FINANCE_DB_ID),

  fetchAll: async () => {
    if (!NOTION_FINANCE_DB_ID) return
    set({ loading: true })
    try {
      const entries = await fetchFinanceEntries()
      set({ entries: entries.length > 0 ? entries : get().entries, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  addEntry: (entry) => {
    const newEntry: FinanceEntry = {
      id: `fin_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      ...entry,
    }
    set((state) => ({ entries: [newEntry, ...state.entries] }))
    useToastStore.getState().show(
      `${entry.type === 'income' ? 'Income' : 'Expense'} logged: ₦${entry.amount.toLocaleString()}`,
      '💰'
    )

    if (NOTION_FINANCE_DB_ID) {
      logFinanceEntry(newEntry)
        .then((notionId) =>
          set((state) => ({
            entries: state.entries.map((e) => (e.id === newEntry.id ? { ...e, notionId } : e)),
          }))
        )
        .catch(console.warn)
    }
  },
}))

export function selectMonthTotals(entries: FinanceEntry[]): { income: number; expense: number; net: number } {
  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()
  const inMonth = entries.filter((e) => {
    const d = new Date(e.date)
    return d.getMonth() === month && d.getFullYear() === year
  })
  const income = inMonth.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0)
  const expense = inMonth.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
  return { income, expense, net: income - expense }
}

export function selectExpensesByCategory(entries: FinanceEntry[]): Record<string, number> {
  return entries
    .filter((e) => e.type === 'expense')
    .reduce((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.amount
      return acc
    }, {} as Record<string, number>)
}
