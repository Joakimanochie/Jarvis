/**
 * Briefing Agent — tool-calling version.
 * Day 13: uses shared tool registry from tools.ts.
 */

import { runToolLoop } from './toolLoop'
import { getAgentTools } from './tools'

const SYSTEM_PROMPT = `You are Jarvis, a personal AI operating system for Tobe — a tech founder and AI researcher based in Nigeria.

Generate a concise, warm morning brief in flowing prose (2-4 sentences, no markdown headers or bullets in the final output).

Cover: greeting by time of day, top 1-3 priority tasks, calendar highlights, goal progress, and 1-2 notable headlines if web search is available.

Use the tools provided to gather live data before writing the brief. Call calendar_read with range "today", then notion_read with resource "tasks" and resource "goals". If web_search is available, search for "AI technology news today". Then synthesise everything into a single flowing paragraph under 80 words.`

export async function generateBriefingWithTools(): Promise<string> {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const { tools, handlers } = getAgentTools('ops')

  return runToolLoop(
    SYSTEM_PROMPT,
    `${greeting}, Tobe. Please generate my morning brief now using the available tools.`,
    tools,
    handlers,
    { maxIterations: 6, maxTokens: 200, temperature: 0.7 }
  )
}
