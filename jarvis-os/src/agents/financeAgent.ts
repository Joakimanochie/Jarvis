/**
 * Finance Agent 💰 — tracks income/expenses, gives monthly status and reviews.
 */

import { streamComplete, type ChatMessage } from '@/integrations/kimi'
import { useFinanceStore, selectMonthTotals, selectExpensesByCategory } from '@/store/financeStore'
import { useAgentStore } from '@/store/agentStore'
import type { FinanceEntry } from '@/types'

function buildContext(): string {
  const entries = useFinanceStore.getState().entries
  const { income, expense, net } = selectMonthTotals(entries)
  const byCategory = selectExpensesByCategory(entries)

  const today = new Date().toISOString().slice(0, 10)

  return `## Current Context
Today: ${today}

### This month
- Income: ₦${income.toLocaleString()}
- Expenses: ₦${expense.toLocaleString()}
- Net: ₦${net.toLocaleString()}

### Expenses by category (all-time)
${Object.entries(byCategory).map(([cat, amt]) => `- ${cat}: ₦${amt.toLocaleString()}`).join('\n') || '- none'}

### Recent entries (last 5)
${entries.slice(0, 5).map((e) => `- ${e.date}: ${e.type} ₦${e.amount.toLocaleString()} (${e.category}) — ${e.notes}`).join('\n')}`
}

const SYSTEM_PROMPT = `You are the Finance Agent 💰 inside Jarvis OS — tracks personal income and expenses for a founder based in Nigeria. Amounts are in Naira (₦).

Your job: log transactions, summarise financial status, and give clear, no-nonsense reviews. Be concise and direct.

## Actions
When the user reports a transaction ("Log expense: ₦15,000 transport", "I got paid ₦200,000 for the project"), include an action block at the very END of your response:

\`\`\`action
{"type": "log_entry", "amount": 15000, "category": "transport", "entryType": "expense", "notes": "..."}
\`\`\`

\`entryType\` is "expense" or "income". Pick a sensible lowercase category (transport, food, rent, subscriptions, salary, freelance, savings, misc, etc.) from the user's description.

Rules:
- Only emit an action block when the user reports an actual transaction.
- Before the action block, confirm in one short sentence what was logged.
- Never emit more than 1 action block per response.

## Answering questions
For "what's my financial status this month?", "generate my monthly review" — answer from the context provided. Reference real numbers (income, expenses, net, top categories). Be specific and under 150 words.`

interface LogEntryAction {
  type: 'log_entry'
  amount: number
  category: string
  entryType: FinanceEntry['type']
  notes?: string
}

function parseAction(response: string): LogEntryAction | null {
  const match = /```action\s*([\s\S]*?)```/.exec(response)
  if (!match) return null
  try {
    const parsed = JSON.parse(match[1].trim())
    if (parsed.type === 'log_entry') return parsed
  } catch {
    // malformed — ignore
  }
  return null
}

export function stripActions(response: string): string {
  return response.replace(/```action\s*[\s\S]*?```/g, '').trim()
}

export async function runFinanceAgent(
  input: string,
  onToken: (fullText: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `${buildContext()}\n\n## User Request\n${input}` },
  ]

  const fullResponse = await streamComplete(
    messages,
    (_token, fullText) => onToken(stripActions(fullText)),
    { signal }
  )

  const action = parseAction(fullResponse)
  if (action) {
    useFinanceStore.getState().addEntry({
      amount: action.amount,
      category: action.category,
      type: action.entryType,
      date: new Date().toISOString().slice(0, 10),
      notes: action.notes ?? '',
    })
    useAgentStore.getState().addLog({
      agent: 'finance',
      trigger: 'command',
      action: `Logged ${action.entryType} ₦${action.amount.toLocaleString()} (${action.category})`,
      result: 'success',
      output: action.notes ?? action.category,
    })
  }

  return stripActions(fullResponse)
}
