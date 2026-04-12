/** Auto-detect resource type from filename and content */
export function detectResourceType(name: string, content: string): string {
  const lower = name.toLowerCase() + ' ' + content.slice(0, 500).toLowerCase()

  if (/flashcard|flip\s?card|flash\s?card|cue.?card/.test(lower)) return 'Interactive Study'
  if (/quiz|multiple.choice|question.*answer|score/.test(lower)) return 'Practice Problems'
  if (/cheat\s?sheet|formula|quick.ref|reference.sheet/.test(lower)) return 'Cheat Sheet'
  if (/concept.map|flow.?chart|diagram|decision.tree/.test(lower)) return 'Interactive Study'
  if (/notes|summary|lecture|chapter/.test(lower)) return 'Notes'
  if (/slide|presentation|deck/.test(lower)) return 'Lecture Slides'
  if (/compar|vs\.|versus|table/.test(lower)) return 'Reference'
  if (/practice|problem|exercise|worksheet/.test(lower)) return 'Practice Problems'
  if (/review|exam|final/.test(lower)) return 'Interactive Study'

  // Detect by content patterns
  if (/useState|useEffect|React\.createElement|function\s+[A-Z]/.test(content)) return 'Interactive Study'
  if (/^#\s|^##\s|^\*\*/.test(content)) return 'Notes'

  // Detect by file type
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'jsx' || ext === 'tsx') return 'Interactive Study'
  if (ext === 'pdf') return 'Reference'
  if (ext === 'html') return 'Reference'

  return 'Other'
}

/**
 * Auto-detect class from filename AND content.
 *
 * Strategy: Check filename FIRST for course codes (most reliable),
 * then fall back to content matching. This prevents a course code
 * appearing deep in content from overriding the filename's code.
 */
export function detectClass(nameAndContent: string, availableClasses: string[]): string {
  // Split: first "word" before space is typically the filename portion
  // The caller passes "filename content" so we can separate them
  const spaceIdx = nameAndContent.indexOf(' ')
  const filenamePart = spaceIdx > 0 ? nameAndContent.slice(0, spaceIdx).toLowerCase() : nameAndContent.toLowerCase()
  const contentPart = spaceIdx > 0 ? nameAndContent.slice(spaceIdx).toLowerCase() : ''

  // PASS 1: Match course code in FILENAME only (highest priority)
  for (const cls of availableClasses) {
    const code = cls.replace(/\s*[\u2014\u2013-]\s*.*/g, '').replace(/\s+/g, '').toLowerCase()
    const codeSpaced = cls.replace(/\s*[\u2014\u2013-]\s*.*/g, '').toLowerCase()

    if (filenamePart.includes(code)) return cls
    if (codeSpaced.length > 3 && filenamePart.includes(codeSpaced)) return cls

    const codeDashed = code.replace(/(\D)(\d)/, '$1-$2')
    const codeUnder = code.replace(/(\D)(\d)/, '$1_$2')
    if (filenamePart.includes(codeDashed)) return cls
    if (filenamePart.includes(codeUnder)) return cls
  }

  // PASS 2: Match topic keyword in filename
  for (const cls of availableClasses) {
    const topic = cls.replace(/.*[\u2014\u2013-]\s*/, '').toLowerCase().trim()
    if (topic.length > 3 && filenamePart.includes(topic)) return cls

    const topicWords = topic.split(/\s+/)
    for (const word of topicWords) {
      if (word.length > 4 && filenamePart.includes(word)) return cls
    }
  }

  // PASS 3: Match course code in content (fallback)
  for (const cls of availableClasses) {
    const code = cls.replace(/\s*[\u2014\u2013-]\s*.*/g, '').replace(/\s+/g, '').toLowerCase()
    const codeSpaced = cls.replace(/\s*[\u2014\u2013-]\s*.*/g, '').toLowerCase()

    if (contentPart.includes(code)) return cls
    if (codeSpaced.length > 3 && contentPart.includes(codeSpaced)) return cls

    const codeDashed = code.replace(/(\D)(\d)/, '$1-$2')
    const codeUnder = code.replace(/(\D)(\d)/, '$1_$2')
    if (contentPart.includes(codeDashed)) return cls
    if (contentPart.includes(codeUnder)) return cls
  }

  // PASS 4: Match topic keyword in content
  for (const cls of availableClasses) {
    const topic = cls.replace(/.*[\u2014\u2013-]\s*/, '').toLowerCase().trim()
    if (topic.length > 3 && contentPart.includes(topic)) return cls

    const topicWords = topic.split(/\s+/)
    for (const word of topicWords) {
      if (word.length > 4 && contentPart.includes(word)) return cls
    }
  }

  return availableClasses.includes('General') ? 'General' : availableClasses[0] || 'General'
}
