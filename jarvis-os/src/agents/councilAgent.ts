/**
 * The Council 🏛️ — 5 adviser personas debate a decision, then a Chairman delivers a verdict.
 *
 * Runs as 2 calls: (1) all 5 advisers + anonymous peer review in one structured pass,
 * (2) Chairman synthesis. Both stream into the same response.
 */

import { streamComplete, complete, type ChatMessage } from '@/integrations/kimi'
import { useGoalsStore } from '@/store/goalsStore'

const ADVISERS = [
  { name: 'The Contrarian', voice: 'Argues against the obvious choice. Finds the weakest assumption and attacks it.' },
  { name: 'The First-Principles Thinker', voice: 'Strips the problem to fundamentals — physics, math, incentives. Ignores convention.' },
  { name: 'The Expansionist', voice: 'Asks "what if this works 10x bigger than planned?" Pushes for ambition and scale.' },
  { name: 'The Outsider', voice: 'Has no domain expertise — asks naive questions that expose hidden complexity.' },
  { name: 'The Executor', voice: 'Cares only about what can ship this week. Ruthlessly practical, allergic to abstraction.' },
]

function buildContext(): string {
  const goals = useGoalsStore.getState().goals
  return `### Context — active goals
${goals.map((g) => `- ${g.area}: "${g.title}" (${g.progress}%, ${g.status})`).join('\n')}`
}

const ADVISER_PROMPT = `You are simulating The Council inside Jarvis OS — 5 advisers debating a founder's decision.

${ADVISERS.map((a) => `**${a.name}**: ${a.voice}`).join('\n')}

For the decision/idea given by the user:
1. Give each adviser a distinct 2-3 sentence take, in their voice. Format as:
   **[Adviser Name]**
   <take>
2. After all 5, add a section "**Peer Review (anonymous)**" — 2-3 sentences where the advisers, anonymously, point out the strongest objection to ONE OTHER adviser's take (don't say which adviser made it).

Keep each adviser's take tight — no more than 3 sentences. Total under 350 words.`

const CHAIRMAN_PROMPT = `You are the Chairman of The Council inside Jarvis OS. You've just read 5 advisers' takes and an anonymous peer review on a founder's decision (provided below).

Deliver a final verdict in this exact structure:
**Decision:** <one sentence — go / no-go / modified path>
**Reasoning:** <2-3 sentences synthesising the strongest points>
**Risk:** <the single biggest risk, one sentence>
**Next step:** <one concrete action for this week>

Under 120 words total. Be decisive — no hedging.`

export async function runCouncilAgent(
  input: string,
  onToken: (fullText: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const adviserMessages: ChatMessage[] = [
    { role: 'system', content: ADVISER_PROMPT },
    { role: 'user', content: `${buildContext()}\n\n### Decision to debate\n${input}` },
  ]

  let advisersText = ''
  await streamComplete(
    adviserMessages,
    (_token, fullText) => {
      advisersText = fullText
      onToken(`${fullText}\n\n_The Chairman is deliberating…_`)
    },
    { signal }
  )

  const chairmanText = await complete(
    [
      { role: 'system', content: CHAIRMAN_PROMPT },
      { role: 'user', content: `${advisersText}\n\n### Original decision\n${input}` },
    ],
    { maxTokens: 250, temperature: 0.4 }
  )

  const final = `${advisersText}\n\n---\n\n**🏛️ Chairman's Verdict**\n${chairmanText.trim()}`
  onToken(final)
  return final
}
