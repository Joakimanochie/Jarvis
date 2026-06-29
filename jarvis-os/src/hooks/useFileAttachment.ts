import { useState, useCallback, useRef } from 'react'
import { parseDocument, type DocType } from '@/lib/parseDocument'

const ACCEPT = '.pdf,.txt,.md,.csv,.xlsx,.xls,.docx,.png,.jpg,.jpeg,.gif,.webp,.json'

export interface FileAttachment {
  attachedFile: File | null
  attachedText: string
  fileType: DocType | null
  isProcessing: boolean
  pickFile: () => void
  clearFile: () => void
  inputRef: React.RefObject<HTMLInputElement | null>
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  accept: string
}

export function useFileAttachment(): FileAttachment {
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const [attachedText, setAttachedText] = useState('')
  const [fileType, setFileType] = useState<DocType | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const pickFile = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const clearFile = useCallback(() => {
    setAttachedFile(null)
    setAttachedText('')
    setFileType(null)
    if (inputRef.current) inputRef.current.value = ''
  }, [])

  const onFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAttachedFile(file)
    setIsProcessing(true)

    try {
      const result = await parseDocument(file)
      setAttachedText(result.text)
      setFileType(result.type)
    } catch {
      setAttachedText(`(Failed to parse ${file.name})`)
      setFileType('text')
    } finally {
      setIsProcessing(false)
    }
  }, [])

  return {
    attachedFile,
    attachedText,
    fileType,
    isProcessing,
    pickFile,
    clearFile,
    inputRef,
    onFileChange,
    accept: ACCEPT,
  }
}

/** Build the enriched input string with attached file content. */
export function buildAttachedInput(value: string, file: File | null, text: string, type: DocType | null): string {
  if (!file) return value

  if (type === 'image') {
    return `[Attached image: ${file.name} — this is a text-only AI, image content cannot be read]\n\n${value || 'I attached an image. Can you save it to Google Drive for me?'}`
  }

  if (!text) return value

  const header = `[Attached ${file.name}]:\n${text}\n\n---\n`
  return value ? `${header}User message: ${value}` : `${header}Please summarize this document.`
}
