/**
 * Skills Loader — Day 12.
 *
 * Loads all `.md` files from the `skills/` directory at build time via
 * Vite's import.meta.glob. Parses YAML frontmatter to build a skill registry.
 * No runtime file I/O — everything is bundled.
 */

export interface Skill {
  name: string
  description: string
  triggerPhrases: string[]
  agent: string            // which agent owns this skill (ops, brand, comms, research, finance, news, council, cofounder, all)
  toolsNeeded: string[]
  outputFormat: string
  content: string          // the full markdown body (injected into system prompt)
  fileName: string
}

// Vite bundles these at build time — raw string content
const skillFiles = import.meta.glob('/skills/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

function parseFrontmatter(raw: string): { meta: Record<string, string | string[]>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) return { meta: {}, body: raw }

  const meta: Record<string, string | string[]> = {}
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':')
    if (idx < 0) continue
    const key = line.slice(0, idx).trim()
    const val = line.slice(idx + 1).trim()
    if (val.startsWith('[') && val.endsWith(']')) {
      meta[key] = val.slice(1, -1).split(',').map((s) => s.trim().replace(/^["']|["']$/g, ''))
    } else {
      meta[key] = val.replace(/^["']|["']$/g, '')
    }
  }
  return { meta, body: match[2] }
}

function loadSkills(): Skill[] {
  const skills: Skill[] = []

  for (const [path, raw] of Object.entries(skillFiles)) {
    const fileName = path.split('/').pop() ?? path
    const { meta, body } = parseFrontmatter(raw as string)

    skills.push({
      name: (meta.name as string) ?? fileName.replace('.md', ''),
      description: (meta.description as string) ?? '',
      triggerPhrases: Array.isArray(meta.trigger_phrases) ? meta.trigger_phrases : [],
      agent: (meta.agent as string) ?? 'all',
      toolsNeeded: Array.isArray(meta.tools_needed) ? meta.tools_needed : [],
      outputFormat: (meta.output_format as string) ?? 'markdown',
      content: body.trim(),
      fileName,
    })
  }

  return skills
}

let _skills: Skill[] | null = null

export function getSkillRegistry(): Skill[] {
  if (!_skills) _skills = loadSkills()
  return _skills
}

/**
 * Find the best matching skill for a given user input and agent.
 * Checks trigger phrases (case-insensitive substring match).
 * Returns the skill content to inject, or null if no match.
 */
export function matchSkills(input: string, agentName: string): Skill[] {
  const lower = input.toLowerCase()
  const registry = getSkillRegistry()

  return registry.filter((skill) => {
    const agentMatch = skill.agent === 'all' || skill.agent === agentName
    if (!agentMatch) return false
    return skill.triggerPhrases.some((phrase) => lower.includes(phrase.toLowerCase()))
  })
}

/**
 * Build the skill injection block for a system prompt.
 * Concatenates matched skill contents with headers.
 */
export function buildSkillPrompt(skills: Skill[]): string {
  if (skills.length === 0) return ''
  const blocks = skills.map((s) =>
    `\n## Skill: ${s.name}\n${s.content}`
  )
  return `\n\n# Active Skills\nThe following skills have been loaded for this request. Follow their instructions precisely.\n${blocks.join('\n')}`
}
