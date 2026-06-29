/**
 * Client-side document parser. All heavy libraries are lazy-loaded
 * via dynamic import so they stay out of the main bundle.
 */

const MAX_CHARS = 8000

export type DocType = 'text' | 'pdf' | 'docx' | 'spreadsheet' | 'image'

export interface ParseResult {
  text: string
  type: DocType
}

function truncate(text: string): string {
  if (text.length <= MAX_CHARS) return text
  return text.slice(0, MAX_CHARS) + `\n\n[…truncated at ${MAX_CHARS} characters]`
}

function extension(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? ''
}

async function parseText(file: File): Promise<ParseResult> {
  const text = await file.text()
  return { text: truncate(text), type: 'text' }
}

async function parsePdf(file: File): Promise<ParseResult> {
  const pdfjsLib = await import('pdfjs-dist')

  // Use the bundled worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  ).toString()

  const buffer = await file.arrayBuffer()
  const doc = await pdfjsLib.getDocument({ data: buffer }).promise
  const pages: string[] = []

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pageText = content.items.map((item: any) => item.str ?? '').join(' ')
    pages.push(pageText)
  }

  return { text: truncate(pages.join('\n\n')), type: 'pdf' }
}

async function parseDocx(file: File): Promise<ParseResult> {
  const mammoth = await import('mammoth')
  const buffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer: buffer })
  return { text: truncate(result.value), type: 'docx' }
}

async function parseXlsx(file: File): Promise<ParseResult> {
  const XLSX = await import('xlsx')
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })

  const sheets: string[] = []
  for (const name of workbook.SheetNames) {
    const sheet = workbook.Sheets[name]
    const csv = XLSX.utils.sheet_to_csv(sheet)
    sheets.push(`### Sheet: ${name}\n${csv}`)
  }

  return { text: truncate(sheets.join('\n\n')), type: 'spreadsheet' }
}

export async function parseDocument(file: File): Promise<ParseResult> {
  const ext = extension(file.name)

  switch (ext) {
    case 'txt':
    case 'md':
    case 'csv':
    case 'json':
      return parseText(file)

    case 'pdf':
      return parsePdf(file)

    case 'docx':
      return parseDocx(file)

    case 'xlsx':
    case 'xls':
      return parseXlsx(file)

    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
      return { text: '', type: 'image' }

    default:
      // Try as plain text
      try {
        return parseText(file)
      } catch {
        return { text: `(Unsupported file type: .${ext})`, type: 'text' }
      }
  }
}
