import type { FileType } from '../types'

export interface ExtractedArtifact {
  content: string
  fileType: FileType
  extension: string
  suggestedName: string
  extracted: boolean
  language?: string
  note?: string
}

const FENCE_REGEX = /```([^\n`]*)\n([\s\S]*?)```/g

function normalizeLanguage(label: string): string {
  return label.trim().toLowerCase().split(/\s+/)[0] ?? ''
}

function extensionFor(fileType: FileType, language?: string): string {
  if (language === 'tsx') return '.tsx'
  if (language === 'ts') return '.ts'
  if (language === 'js' || language === 'javascript') return '.jsx'
  if (fileType === 'jsx') return '.jsx'
  if (fileType === 'html') return '.html'
  if (fileType === 'markdown') return '.md'
  return '.txt'
}

function detectFileType(text: string, language?: string): FileType {
  const lower = text.toLowerCase()

  if (language === 'html' || lower.includes('<!doctype html') || lower.includes('<html')) return 'html'
  if (language === 'md' || language === 'markdown' || /^#\s+/m.test(text)) return 'markdown'
  if (
    language === 'jsx'
    || language === 'tsx'
    || /React\.createElement/.test(text)
    || /function\s+[A-Z][A-Za-z0-9]*\s*\(/.test(text)
    || /export\s+default\s+function\s+[A-Z]/.test(text)
    || /<[A-Z][A-Za-z0-9]*[\s/>]/.test(text)
  ) {
    return 'jsx'
  }

  return 'other'
}

function suggestNameFromContent(content: string, fileType: FileType, language?: string): string {
  const componentMatch = content.match(/(?:function|class)\s+([A-Z][A-Za-z0-9]*)/)
    || content.match(/(?:const|let|var)\s+([A-Z][A-Za-z0-9]*)\s*=/)
  if (componentMatch?.[1]) {
    return `${componentMatch[1].replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')}${extensionFor(fileType, language)}`
  }

  const headingMatch = content.match(/^#\s+(.+)/m)
  if (headingMatch?.[1]) {
    return `${headingMatch[1].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'study-notes'}${extensionFor(fileType, language)}`
  }

  if (fileType === 'html') return 'study-document.html'
  if (fileType === 'markdown') return 'study-notes.md'
  if (fileType === 'jsx') return `study-component${extensionFor(fileType, language)}`
  return 'study-material.txt'
}

function parseFenceFilename(info: string): string | null {
  const quoted = info.match(/(?:filename|file|title)\s*=\s*["']([^"']+\.[A-Za-z0-9]+)["']/i)
  if (quoted?.[1]) return quoted[1]

  const bare = info.match(/\b([A-Za-z0-9._-]+\.(?:jsx|tsx|js|ts|html|htm|md|markdown|txt|json|csv))\b/i)
  return bare?.[1] ?? null
}

export function extractArtifact(rawText: string, providedName?: string): ExtractedArtifact {
  const trimmed = rawText.trim()
  if (!trimmed) {
    return {
      content: '',
      fileType: 'other',
      extension: '.txt',
      suggestedName: providedName?.trim() || 'study-material.txt',
      extracted: false,
    }
  }

  const fences = Array.from(trimmed.matchAll(FENCE_REGEX)).map(match => {
    const info = match[1] ?? ''
    const content = match[2]?.trim() ?? ''
    const language = normalizeLanguage(info)
    const fileType = detectFileType(content, language)
    const score = content.length + (fileType === 'jsx' ? 500 : 0) + (fileType === 'html' ? 300 : 0) + (fileType === 'markdown' ? 200 : 0)

    return {
      info,
      content,
      language,
      fileType,
      score,
      parsedName: parseFenceFilename(info),
    }
  }).filter(candidate => candidate.content.length > 0)

  const bestFence = fences.sort((left, right) => right.score - left.score)[0]
  const extracted = Boolean(bestFence) && bestFence.content !== trimmed
  const content = bestFence?.content ?? trimmed
  const fileType = bestFence?.fileType ?? detectFileType(content)
  const language = bestFence?.language
  const extension = extensionFor(fileType, language)

  let suggestedName = providedName?.trim() || bestFence?.parsedName || suggestNameFromContent(content, fileType, language)
  if (!/\.[A-Za-z0-9]+$/.test(suggestedName)) {
    suggestedName += extension
  }

  return {
    content,
    fileType,
    extension,
    suggestedName,
    extracted,
    language,
    note: extracted ? 'Saved the main artifact from a fenced code block.' : undefined,
  }
}

export function looksLikeStudyArtifact(rawText: string): boolean {
  const artifact = extractArtifact(rawText)
  if (!artifact.content) return false

  return artifact.fileType !== 'other'
    || /^#\s+/m.test(artifact.content)
    || artifact.content.length > 80
}
