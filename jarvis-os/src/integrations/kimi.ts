/**
 * Kimi K2.6 — AI Engine via Nvidia NIM
 * https://build.nvidia.com/moonshotai/kimi-k2.6
 *
 * Nvidia NIM exposes an OpenAI-compatible API.
 * Base URL: https://integrate.api.nvidia.com/v1 (proxied via /api/nim in dev — see vite.config.ts)
 * Model: moonshotai/kimi-k2.6
 */

import OpenAI from 'openai'

export const KIMI_MODEL = 'moonshotai/kimi-k2.6'

// ─── Tool-calling types ─────────────────────────────────────────────────────

export interface ToolDefinition {
  name: string
  description: string
  parameters: Record<string, unknown> // JSON Schema object
}

export interface ToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
}

export interface ToolsResult {
  toolCalls: ToolCall[]
  text: string
  finishReason: string
}

const API_KEY = import.meta.env.VITE_NVIDIA_API_KEY as string

let _client: OpenAI | null = null

export function isKimiConfigured(): boolean {
  return Boolean(API_KEY)
}

function getClient(): OpenAI {
  if (!API_KEY) {
    throw new Error(
      'VITE_NVIDIA_API_KEY is not set. Get a key from https://build.nvidia.com/moonshotai/kimi-k2.6 and add it to .env.local'
    )
  }
  if (!_client) {
    _client = new OpenAI({
      apiKey: API_KEY,
      baseURL: `${window.location.origin}/api/nim`, // Vite proxy → https://integrate.api.nvidia.com/v1
      dangerouslyAllowBrowser: true, // personal local app — key lives in .env.local
    })
  }
  return _client
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * Non-streaming completion. Used for intent classification (fast, short output).
 */
export async function complete(
  messages: ChatMessage[],
  options: { maxTokens?: number; temperature?: number } = {}
): Promise<string> {
  const client = getClient()
  const res = await client.chat.completions.create({
    model: KIMI_MODEL,
    messages,
    max_tokens: options.maxTokens ?? 1024,
    temperature: options.temperature ?? 0.6,
  })
  return res.choices[0]?.message?.content ?? ''
}

/**
 * Streaming completion. Calls onToken for each text delta.
 * Returns the full accumulated response.
 */
export async function streamComplete(
  messages: ChatMessage[],
  onToken: (token: string, fullText: string) => void,
  options: { maxTokens?: number; temperature?: number; signal?: AbortSignal } = {}
): Promise<string> {
  const client = getClient()
  const stream = await client.chat.completions.create(
    {
      model: KIMI_MODEL,
      messages,
      max_tokens: options.maxTokens ?? 2048,
      temperature: options.temperature ?? 0.6,
      stream: true,
    },
    { signal: options.signal }
  )

  let fullText = ''
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? ''
    if (delta) {
      fullText += delta
      onToken(delta, fullText)
    }
  }
  return fullText
}

/**
 * Non-streaming completion with tool/function calling.
 * Returns the tool calls requested by the model (if any) plus any text content.
 * Nvidia NIM supports the OpenAI tool_calls API — this uses it natively.
 */
export async function completeWithTools(
  messages: ChatMessage[],
  tools: ToolDefinition[],
  options: { maxTokens?: number; temperature?: number } = {}
): Promise<ToolsResult> {
  const client = getClient()

  const openaiTools: OpenAI.Chat.Completions.ChatCompletionTool[] = tools.map((t) => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }))

  const res = await client.chat.completions.create({
    model: KIMI_MODEL,
    messages,
    tools: openaiTools,
    tool_choice: 'auto',
    max_tokens: options.maxTokens ?? 1024,
    temperature: options.temperature ?? 0.6,
  })

  const choice = res.choices[0]
  const msg = choice.message
  const finishReason = choice.finish_reason ?? 'stop'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toolCalls: ToolCall[] = (msg.tool_calls ?? []).map((tc: any) => ({
    id: tc.id as string,
    name: (tc.function?.name ?? '') as string,
    arguments: (() => {
      try {
        return JSON.parse(tc.function?.arguments ?? '{}') as Record<string, unknown>
      } catch {
        return {}
      }
    })(),
  }))

  return {
    toolCalls,
    text: msg.content ?? '',
    finishReason,
  }
}
