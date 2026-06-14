/**
 * Google OAuth 2.0 — Authorization Code + PKCE flow (Gmail + Calendar, read/write scopes).
 * Tokens stored in localStorage. Falls back gracefully when not configured.
 */

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string
const CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET as string
const REDIRECT_URI =
  (import.meta.env.VITE_GOOGLE_REDIRECT_URI as string) || 'http://localhost:5173/auth/callback'

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/calendar',
].join(' ')

const TOKEN_KEY = 'jarvis_google_tokens'
const VERIFIER_KEY = 'jarvis_google_pkce_verifier'

interface StoredTokens {
  access_token: string
  refresh_token?: string
  expires_at: number // epoch ms
}

export function isGoogleConfigured(): boolean {
  return Boolean(CLIENT_ID)
}

export function isGoogleConnected(): boolean {
  return Boolean(localStorage.getItem(TOKEN_KEY))
}

export function disconnectGoogle(): void {
  localStorage.removeItem(TOKEN_KEY)
}

// ─── PKCE helpers ───────────────────────────────────────────────────────────

function base64url(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

async function sha256(input: string): Promise<ArrayBuffer> {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
}

function randomString(length = 64): string {
  const arr = new Uint8Array(length)
  crypto.getRandomValues(arr)
  return base64url(arr.buffer)
}

/** Redirect the browser to Google's consent screen. */
export async function startGoogleAuth(): Promise<void> {
  if (!CLIENT_ID) throw new Error('VITE_GOOGLE_CLIENT_ID is not set')

  const verifier = randomString()
  localStorage.setItem(VERIFIER_KEY, verifier)
  const challenge = base64url(await sha256(verifier))

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    code_challenge: challenge,
    code_challenge_method: 'S256',
  })

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

/** Called from /auth/callback with the `code` query param. */
export async function handleGoogleCallback(code: string): Promise<void> {
  const verifier = localStorage.getItem(VERIFIER_KEY)
  if (!verifier) throw new Error('Missing PKCE verifier — restart the connection flow')

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    ...(CLIENT_SECRET ? { client_secret: CLIENT_SECRET } : {}),
    code,
    code_verifier: verifier,
    grant_type: 'authorization_code',
    redirect_uri: REDIRECT_URI,
  })

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!res.ok) throw new Error(`Google token exchange failed: ${await res.text()}`)

  const json = (await res.json()) as {
    access_token: string
    refresh_token?: string
    expires_in: number
  }

  saveTokens(json)
  localStorage.removeItem(VERIFIER_KEY)
}

function saveTokens(json: { access_token: string; refresh_token?: string; expires_in: number }) {
  const existing = readTokens()
  const tokens: StoredTokens = {
    access_token: json.access_token,
    refresh_token: json.refresh_token ?? existing?.refresh_token,
    expires_at: Date.now() + json.expires_in * 1000,
  }
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens))
}

function readTokens(): StoredTokens | null {
  const raw = localStorage.getItem(TOKEN_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredTokens
  } catch {
    return null
  }
}

async function refreshAccessToken(refreshToken: string): Promise<void> {
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    ...(CLIENT_SECRET ? { client_secret: CLIENT_SECRET } : {}),
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  })

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!res.ok) throw new Error(`Google token refresh failed: ${await res.text()}`)

  const json = (await res.json()) as { access_token: string; expires_in: number }
  saveTokens({ ...json, refresh_token: refreshToken })
}

/** Returns a valid access token, refreshing it if expired. Throws if not connected. */
export async function getAccessToken(): Promise<string> {
  const tokens = readTokens()
  if (!tokens) throw new Error('Google account not connected — go to Settings to connect')

  if (Date.now() < tokens.expires_at - 60_000) {
    return tokens.access_token
  }

  if (!tokens.refresh_token) throw new Error('Google session expired — reconnect in Settings')
  await refreshAccessToken(tokens.refresh_token)
  return readTokens()!.access_token
}
