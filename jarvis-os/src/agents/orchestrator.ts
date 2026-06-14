/**
 * Orchestrator — classifies user intent and routes to the right agent.
 * Day 4: only Ops Agent is live; other intents fall through to Ops with a note.
 */

import { complete } from '@/integrations/kimi'
import { useAgentStore, type AgentName } from '@/store/agentStore'
import { runOpsAgent } from './opsAgent'
import { runCommsAgent } from './commsAgent'
import { runBrandAgent } from './brandAgent'
import { runResearchAgent } from './researchAgent'
import { runNewsAgent } from './newsAgent'
import { runLearningAgent } from './learningAgent'
import { runCouncilAgent } from './councilAgent'
import { runFinanceAgent } from './financeAgent'
import { runCofounderAgent } from './cofounderAgent'

const CLASSIFIER_PROMPT = `Classify the user's request into exactly ONE of these intents. Respond with ONLY the intent word, nothing else.

- ops — tasks, projects, goals, ideas, priorities, weekly reviews, planning ("add task", "what are my priorities", "update goal", "log idea")
- research — papers, datasets, summarising documents, literature, deep questions
- comms — email, inbox, calendar, meetings, scheduling
- brand — LinkedIn, posts, content, personal brand, carousels
- finance — expenses, money, budget, savings, financial status
- news — headlines, current events, world news, "what's happening"

If unsure, answer: ops`

// Fast keyword pre-check — avoids an API round-trip for obvious cases
function quickClassify(input: string): AgentName | null {
  const lower = input.toLowerCase()
  if (/^(add|create) task|priorit|weekly review|update .*goal|log idea|to-?do/.test(lower)) return 'ops'
  if (/linkedin|write.*post|carousel|content for/.test(lower)) return 'brand'
  if (/inbox|email|calendar|meeting|schedule/.test(lower)) return 'comms'
  if (/expense|budget|savings|financ/.test(lower)) return 'finance'
  if (/news|headline|happening in|catch me up/.test(lower)) return 'news'
  if (/research |summarise.*paper|dataset|literature/.test(lower)) return 'research'
  if (/run the council|challenge my thinking|quiz me|learning plan|explain .* to me|study this week/.test(lower))
    return 'research'
  if (/focused on this week|review my (business )?strategy|am i working on the right things|synthesise all agent|log decision|log lesson/.test(lower))
    return 'ops'
  return null
}

/** Council and Learning aren't separate AgentName values — detect them by keyword regardless of classified intent. */
function pickRunner(agent: AgentName, input: string) {
  const lower = input.toLowerCase()
  if (/run the council|challenge my thinking/.test(lower)) return { runner: runCouncilAgent, agent: 'research' as AgentName }
  if (/quiz me|learning plan|explain .* to me|study this week/.test(lower))
    return { runner: runLearningAgent, agent: 'research' as AgentName }
  if (/focused on this week|review my (business )?strategy|am i working on the right things|synthesise all agent|log decision|log lesson/.test(lower))
    return { runner: runCofounderAgent, agent: 'ops' as AgentName }

  const runners: Record<AgentName, typeof runOpsAgent> = {
    ops: runOpsAgent,
    comms: runCommsAgent,
    brand: runBrandAgent,
    research: runResearchAgent,
    news: runNewsAgent,
    finance: runFinanceAgent,
  }
  return { runner: runners[agent], agent }
}

export async function classifyIntent(input: string): Promise<AgentName> {
  const quick = quickClassify(input)
  if (quick) return quick

  try {
    const result = await complete(
      [
        { role: 'system', content: CLASSIFIER_PROMPT },
        { role: 'user', content: input },
      ],
      { maxTokens: 8, temperature: 0 }
    )
    const intent = result.trim().toLowerCase() as AgentName
    const valid: AgentName[] = ['ops', 'research', 'comms', 'brand', 'finance', 'news']
    return valid.includes(intent) ? intent : 'ops'
  } catch {
    return 'ops'
  }
}

/**
 * Main entry: classify, route, stream response into the agent store.
 */
export async function runJarvis(input: string): Promise<void> {
  const store = useAgentStore.getState()

  let agent: AgentName
  try {
    agent = await classifyIntent(input)
  } catch {
    agent = 'ops'
  }

  store.addLog({
    agent,
    trigger: 'command_bar',
    action: `Routed input to ${agent} agent`,
    result: 'success',
    output: input.slice(0, 80),
  })

  const exchangeId = store.startExchange(agent, input)

  try {
    const { runner } = pickRunner(agent, input)

    await runner(input, (fullText) => {
      useAgentStore.getState().appendToExchange(exchangeId, fullText)
    })

    useAgentStore.getState().finishExchange(exchangeId)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    useAgentStore.getState().appendToExchange(
      exchangeId,
      `⚠️ ${message.includes('VITE_NVIDIA_API_KEY') ? message : `Agent error: ${message}`}`
    )
    useAgentStore.getState().finishExchange(exchangeId)
    useAgentStore.getState().addLog({
      agent,
      trigger: 'command_bar',
      action: 'Agent call failed',
      result: 'error',
      output: message.slice(0, 120),
    })
  }
}
