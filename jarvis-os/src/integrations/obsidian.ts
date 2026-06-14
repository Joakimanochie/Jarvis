/**
 * Obsidian Local REST API Integration
 * Plugin: https://github.com/coddingtonbear/obsidian-local-rest-api
 *
 * Enable HTTP (not HTTPS) on port 27123 in Obsidian settings to avoid cert issues.
 * OBSIDIAN_HOST should be http://127.0.0.1:27123
 */

const OBSIDIAN_HOST = import.meta.env.VITE_OBSIDIAN_HOST || 'http://127.0.0.1:27123'
const OBSIDIAN_API_KEY = import.meta.env.VITE_OBSIDIAN_API_KEY as string

// ─── Health Check ────────────────────────────────────────────────────────────

export async function isObsidianRunning(): Promise<boolean> {
  try {
    const res = await fetch(`${OBSIDIAN_HOST}/`, {
      headers: obsidianHeaders(),
      signal: AbortSignal.timeout(2000),
    })
    return res.ok
  } catch {
    return false
  }
}

// ─── Notes ───────────────────────────────────────────────────────────────────

/** Read a note by vault-relative path, e.g. "Daily/2026-06-02.md" */
export async function readNote(path: string): Promise<string> {
  const res = await obsidianFetch(`/vault/${encodePath(path)}`, 'GET')
  return res.text()
}

/** Create or overwrite a note */
export async function writeNote(path: string, content: string): Promise<void> {
  await obsidianFetchRaw(`/vault/${encodePath(path)}`, {
    method: 'PUT',
    headers: { ...obsidianHeaders(), 'Content-Type': 'text/markdown' },
    body: content,
  })
}

/** Append content to an existing note */
export async function appendNote(path: string, content: string): Promise<void> {
  await obsidianFetchRaw(`/vault/${encodePath(path)}`, {
    method: 'POST',
    headers: { ...obsidianHeaders(), 'Content-Type': 'text/markdown' },
    body: content,
  })
}

/** Surgically patch one heading section of a note */
export async function patchSection(
  path: string,
  heading: string,
  content: string
): Promise<void> {
  await obsidianFetchRaw(`/vault/${encodePath(path)}`, {
    method: 'PATCH',
    headers: {
      ...obsidianHeaders(),
      'Content-Type': 'text/markdown',
      Heading: heading,
    },
    body: content,
  })
}

/** Full-text search across all notes in vault */
export async function searchVault(query: string): Promise<SearchResult[]> {
  const res = await obsidianFetch('/search/simple/', 'POST', { query, contextLength: 100 })
  const json = (await res.json()) as SearchResult[]
  return json
}

/** List all notes in a folder */
export async function listFolder(path: string): Promise<string[]> {
  const res = await obsidianFetch(`/vault/${encodePath(path)}/`, 'GET')
  const json = (await res.json()) as { files: string[] }
  return json.files ?? []
}

/** Get (or create) today's daily note */
export async function getDailyNote(): Promise<string> {
  const res = await obsidianFetch('/periodic/daily/', 'GET')
  return res.text()
}

/** Write/update today's daily note */
export async function writeDailyNote(content: string): Promise<void> {
  await obsidianFetchRaw('/periodic/daily/', {
    method: 'PUT',
    headers: { ...obsidianHeaders(), 'Content-Type': 'text/markdown' },
    body: content,
  })
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export interface SearchResult {
  filename: string
  score: number
  matches: Array<{ context: string; match: { start: number; end: number } }>
}

function obsidianHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  if (OBSIDIAN_API_KEY) {
    headers['Authorization'] = `Bearer ${OBSIDIAN_API_KEY}`
  }
  return headers
}

async function obsidianFetch(path: string, method: string, body?: unknown): Promise<Response> {
  if (!OBSIDIAN_API_KEY) {
    throw new Error('VITE_OBSIDIAN_API_KEY is not set — configure Obsidian Local REST API first')
  }

  const options: RequestInit = {
    method,
    headers: {
      ...obsidianHeaders(),
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(5000),
  }

  if (body !== undefined) {
    options.body = JSON.stringify(body)
  }

  const res = await fetch(`${OBSIDIAN_HOST}${path}`, options)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Obsidian API ${res.status}: ${text}`)
  }

  return res
}

async function obsidianFetchRaw(url: string, options: RequestInit): Promise<void> {
  const res = await fetch(`${OBSIDIAN_HOST}${url}`, {
    ...options,
    signal: AbortSignal.timeout(5000),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Obsidian API ${res.status}: ${text}`)
  }
}

function encodePath(path: string): string {
  return path.split('/').map(encodeURIComponent).join('/')
}
