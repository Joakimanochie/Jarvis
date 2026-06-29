/**
 * Tests for the generic tool-calling loop (toolLoop.ts).
 * Uses vi.mock to stub out completeWithTools so no real API calls are made.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { runToolLoop } from './toolLoop'
import type { ToolDefinition } from '@/integrations/kimi'

// Mock kimi module
vi.mock('@/integrations/kimi', () => ({
  completeWithTools: vi.fn(),
}))

import { completeWithTools } from '@/integrations/kimi'
const mockComplete = vi.mocked(completeWithTools)

const TOOLS: ToolDefinition[] = [
  {
    name: 'get_weather',
    description: 'Get current weather',
    parameters: {
      type: 'object',
      properties: { city: { type: 'string' } },
      required: ['city'],
    },
  },
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe('runToolLoop', () => {
  it('returns text immediately when no tool calls are made', async () => {
    mockComplete.mockResolvedValueOnce({ toolCalls: [], text: 'Hello!', finishReason: 'stop' })

    const result = await runToolLoop('sys', 'hi', TOOLS, {})
    expect(result).toBe('Hello!')
    expect(mockComplete).toHaveBeenCalledTimes(1)
  })

  it('executes a tool call and feeds result back', async () => {
    mockComplete
      .mockResolvedValueOnce({
        toolCalls: [{ id: 'tc1', name: 'get_weather', arguments: { city: 'Lagos' } }],
        text: '',
        finishReason: 'tool_calls',
      })
      .mockResolvedValueOnce({ toolCalls: [], text: 'It is 32°C in Lagos.', finishReason: 'stop' })

    const weatherHandler = vi.fn().mockResolvedValue('32°C, sunny')

    const result = await runToolLoop('sys', 'weather in Lagos?', TOOLS, { get_weather: weatherHandler })

    expect(weatherHandler).toHaveBeenCalledWith({ city: 'Lagos' })
    expect(result).toBe('It is 32°C in Lagos.')
    expect(mockComplete).toHaveBeenCalledTimes(2)
  })

  it('deduplicates identical tool calls', async () => {
    const call = { id: 'tc1', name: 'get_weather', arguments: { city: 'Lagos' } }
    mockComplete
      .mockResolvedValueOnce({ toolCalls: [call], text: '', finishReason: 'tool_calls' })
      .mockResolvedValueOnce({ toolCalls: [call], text: 'cached result', finishReason: 'tool_calls' }) // same call again

    const weatherHandler = vi.fn().mockResolvedValue('32°C')

    const result = await runToolLoop('sys', 'weather?', TOOLS, { get_weather: weatherHandler })

    // Handler called exactly once; loop breaks on the second iteration (all dupes → anyExecuted=false)
    expect(weatherHandler).toHaveBeenCalledTimes(1)
    // lastText is the text from the second model call before the break
    expect(result).toBe('cached result')
  })

  it('respects maxIterations cap', async () => {
    // Always return a new unique tool call to exhaust the iteration limit
    mockComplete.mockImplementation(async (_msgs, _tools, _opts) => ({
      toolCalls: [{ id: String(Math.random()), name: 'get_weather', arguments: { city: String(Math.random()) } }],
      text: '',
      finishReason: 'tool_calls' as const,
    }))

    const handler = vi.fn().mockResolvedValue('result')

    await runToolLoop('sys', 'loop?', TOOLS, { get_weather: handler }, { maxIterations: 3 })

    // Loop runs at most maxIterations times
    expect(mockComplete).toHaveBeenCalledTimes(3)
  })

  it('handles missing handler gracefully', async () => {
    mockComplete
      .mockResolvedValueOnce({
        toolCalls: [{ id: 'tc1', name: 'unknown_tool', arguments: {} }],
        text: '',
        finishReason: 'tool_calls',
      })
      .mockResolvedValueOnce({ toolCalls: [], text: 'Handled.', finishReason: 'stop' })

    const result = await runToolLoop('sys', 'use unknown tool', TOOLS, {})
    expect(result).toBe('Handled.')
  })
})
