/**
 * Smart filename suggestion from metadata + content analysis.
 */

/** Extract a meaningful topic from content (component names, headings, data) */
function extractTopic(content: string, originalName: string): string {
  // 1. Try to find a title/heading in the content
  const headingMatch = content.match(/["']([A-Z][^"']{4,60})["']\s*\)/) // React.createElement("h2", null, "Title Here")
    || content.match(/<h[12][^>]*>([^<]{4,60})<\/h[12]>/)              // <h1>Title Here</h1>
    || content.match(/^#\s+(.{4,60})$/m)                                // # Markdown Heading
    || content.match(/["']Topic\s*\d*[:\s]+([^"']{4,50})["']/)          // "Topic 3: Game Theory"

  if (headingMatch) {
    return headingMatch[1]
      .replace(/^(Topic|Chapter|Unit|Module|Section)\s*\d*[:\s]*/i, '')
      .trim()
  }

  // 2. Try component function name
  const funcMatch = content.match(/function\s+([A-Z][A-Za-z0-9]+)/)
  if (funcMatch) {
    // Convert PascalCase to kebab: "EconFlashcards" → "econ-flashcards"
    const kebab = funcMatch[1]
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
      .toLowerCase()
    // Remove generic suffixes
    const cleaned = kebab
      .replace(/-(cue-?cards|flashcards|quiz|review|app|component|widget)$/i, '')
      .replace(/^(topic-?\d+)-?/i, (_, t) => t.toLowerCase() + '-')
    if (cleaned.length > 2) return cleaned
  }

  // 3. Fall back to cleaning the original filename
  const fromName = originalName
    .replace(/\.\w+$/, '')           // remove extension
    .replace(/[-_]+/g, ' ')          // normalize separators
    .replace(/\b(mbas|econ|fin|acct|strat)\s*\d*\b/gi, '') // remove class codes
    .replace(/\b(flashcard|quiz|cheat|sheet|notes|practice|reference|interactive|study|guide|review|final|exam|cue|cards?|v\d+)\w*\b/gi, '')
    .trim()

  if (fromName.length > 2) return fromName

  return ''
}

/** Generate a logical filename from metadata + content */
export function suggestLogicalName(
  originalName: string,
  className: string,
  resourceType: string,
  content = '',
): string {
  const ext = originalName.includes('.') ? `.${originalName.split('.').pop()}` : '.jsx'

  // Class code: "MBAS 832 — Strategy" → "mbas832"
  const classCode = className
    .replace(/\s*[\u2014\u2013-]\s*.*/g, '')
    .replace(/\s+/g, '')
    .toLowerCase()

  // Resource type code
  const typeMap: Record<string, string> = {
    'Interactive Study': 'interactive',
    'Notes': 'notes',
    'Cheat Sheet': 'cheatsheet',
    'Practice Problems': 'practice',
    'Lecture Slides': 'slides',
    'Reference': 'reference',
    'Other': 'misc',
  }
  const typeCode = typeMap[resourceType] || resourceType.toLowerCase().replace(/\s+/g, '-')

  // Extract topic from content, then filename
  let topic = extractTopic(content, originalName)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')

  if (!topic) topic = 'study-material'

  // Cap topic length
  if (topic.length > 40) topic = topic.slice(0, 40).replace(/-[^-]*$/, '')

  return `${classCode}_${typeCode}_${topic}${ext}`
}

/** Check if a name looks auto-generated or is a user's intentional name */
export function isGenericName(name: string): boolean {
  const base = name.replace(/\.\w+$/, '').toLowerCase()
  return /^(untitled|study.?guide|test|file|new|document|artifact|component|unnamed)/i.test(base)
    || base.length <= 3
}

/** Batch-rename suggestion for multiple files */
export function suggestBatchNames(
  files: Array<{ name: string; className: string; resourceType: string; content?: string }>,
): string[] {
  const counts: Record<string, number> = {}
  return files.map(file => {
    let name = suggestLogicalName(file.name, file.className, file.resourceType, file.content)
    if (counts[name]) {
      const e = name.includes('.') ? `.${name.split('.').pop()}` : ''
      const b = name.replace(/\.\w+$/, '')
      name = `${b}_${counts[name] + 1}${e}`
    }
    counts[name] = (counts[name] || 0) + 1
    return name
  })
}
