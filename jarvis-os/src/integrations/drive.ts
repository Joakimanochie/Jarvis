/**
 * Google Drive API client — search files, read doc content.
 * Uses the same OAuth token as Gmail/Calendar.
 */

import { getAccessToken, isGoogleConnected } from './googleAuth'

const BASE_URL = 'https://www.googleapis.com/drive/v3'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function driveFetch(path: string, options: RequestInit = {}): Promise<any> {
  const token = await getAccessToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  })
  if (!res.ok) throw new Error(`Drive API ${res.status}: ${await res.text()}`)
  return res.json()
}

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  modifiedTime: string
  webViewLink?: string
}

export async function searchFiles(query: string, maxResults = 5): Promise<DriveFile[]> {
  if (!isGoogleConnected()) return []

  const q = encodeURIComponent(`fullText contains '${query.replace(/'/g, "\\'")}' and trashed = false`)
  const fields = encodeURIComponent('files(id,name,mimeType,modifiedTime,webViewLink)')
  const data = await driveFetch(`/files?q=${q}&fields=${fields}&pageSize=${maxResults}&orderBy=modifiedTime desc`)
  return (data.files ?? []) as DriveFile[]
}

export async function readFileContent(fileId: string): Promise<string> {
  if (!isGoogleConnected()) return ''

  const token = await getAccessToken()
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`,
    { headers: { Authorization: `Bearer ${token}` } }
  )

  if (!res.ok) {
    // Not a Google Doc — try direct download
    const dlRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!dlRes.ok) return '(Unable to read file content)'
    const text = await dlRes.text()
    return text.slice(0, 5000)
  }

  const text = await res.text()
  return text.slice(0, 5000)
}

export async function uploadFile(file: File, folderId?: string): Promise<DriveFile> {
  if (!isGoogleConnected()) throw new Error('Google not connected')

  const token = await getAccessToken()

  const metadata: Record<string, unknown> = { name: file.name }
  if (folderId) metadata.parents = [folderId]

  const form = new FormData()
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
  form.append('file', file)

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,webViewLink',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    }
  )

  if (!res.ok) throw new Error(`Drive upload ${res.status}: ${await res.text()}`)
  return res.json() as Promise<DriveFile>
}
