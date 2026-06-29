/**
 * Generic tool-calling loop for Jarvis agents.
 *
 * Runs up to maxIterations rounds of: model call → execute tool calls → feed results back.
 * Stops early when the model returns finish_reason "stop" (no more tool calls).
 * Dedup guard: skips exact (tool, serialized-args) repeats to prevent infinite loops.
 * Returns the final text response from the model.
 */

import { completeWithTools, type ChatMessage, type ToolDefinition } from '@/integrations/kimi'

export type ToolHandler = (args: Record<string, unknown>) => Promise<string>

export interface ToolLoopOptions {
  maxIterations?: number
  maxTokens?: number
  temperature?: number
}

export async function runToolLoop(
  systemPrompt: string,
  userMessage: string,
  tools: ToolDefinition[],
  handlers: Record<string, ToolHandler>,
  options: ToolLoopOptions = {}
): Promise<string> {
  const { maxIterations = 5, maxTokens, temperature } = options

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ]

  const seen = new Set<string>()
  let lastText = ''

  for (let i = 0; i < maxIterations; i++) {
    const result = await completeWithTools(messages, tools, { maxTokens, temperature })

    lastText = result.text

    // No tool calls → model is done
    if (result.toolCalls.length === 0 || result.finishReason === 'stop') {
      break
    }

    // Push assistant message with tool_calls (OpenAI format requires it)
    // We approximate this with a ChatMessage carrying the text content
    messages.push({ role: 'assistant', content: result.text || '' })

    let anyExecuted = false

    for (const tc of result.toolCalls) {
      const dedupeKey = `${tc.name}::${JSON.stringify(tc.arguments)}`
      if (seen.has(dedupeKey)) continue
      seen.add(dedupeKey)

      const handler = handlers[tc.name]
      let toolResult: string

      if (!handler) {
        toolResult = `Error: no handler registered for tool "${tc.name}"`
      } else {
        try {
          toolResult = await handler(tc.arguments)
        } catch (err) {
          toolResult = `Error calling ${tc.name}: ${err instanceof Error ? err.message : String(err)}`
        }
      }

      // Inject tool result as a user turn (simplified — NIM may not support role:"tool")
      messages.push({
        role: 'user',
        content: `[Tool result for ${tc.name}]: ${toolResult}`,
      })

      anyExecuted = true
    }

    // If all tool calls were dupes, bail out to avoid infinite loop
    if (!anyExecuted) break
  }

  return lastText
}

/**
 * Quick tool-gathering pass — asks the model which tools to call,
 * executes them, and returns the results as a context string.
 * Agents inject this into their streaming prompt for live data.
 */
export async function gatherToolContext(
  agentDescription: string,
  userMessage: string,
  tools: ToolDefinition[],
  handlers: Record<string, ToolHandler>,
): Promise<string> {
  if (tools.length === 0) return ''

  const systemPrompt = `You are ${agentDescription}. The user has a request. Decide which tools (if any) to call to gather the data needed to answer. If no tools are needed, respond with just "NONE".`

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ]

  const result = await completeWithTools(messages, tools, { maxTokens: 256, temperature: 0 })

  if (result.toolCalls.length === 0) return ''

  const parts: string[] = []
  for (const tc of result.toolCalls) {
    const handler = handlers[tc.name]
    if (!handler) continue
    try {
      const output = await handler(tc.arguments)
      parts.push(`### ${tc.name}\n${output}`)
    } catch (err) {
      parts.push(`### ${tc.name}\n(Error: ${err instanceof Error ? err.message : String(err)})`)
    }
  }

  // Second pass: if model made additional tool calls based on first results, run those too
  if (parts.length > 0) {
    messages.push({ role: 'assistant', content: result.text || '' })
    messages.push({ role: 'user', content: `[Tool results]:\n${parts.join('\n\n')}` })

    const result2 = await completeWithTools(messages, tools, { maxTokens: 256, temperature: 0 })
    for (const tc of result2.toolCalls) {
      const handler = handlers[tc.name]
      if (!handler) continue
      try {
        const output = await handler(tc.arguments)
        parts.push(`### ${tc.name}\n${output}`)
      } catch { /* skip */ }
    }
  }

  return parts.length > 0 ? `\n\n## Live Data (from tools)\n${parts.join('\n\n')}` : ''
}
