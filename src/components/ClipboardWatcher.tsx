import { useState, useEffect, useCallback } from 'react'
import { RESOURCE_TYPES } from '../types'
import type { StudySource } from '../types'
import { detectResourceType, detectClass } from '../utils/detect'
import { extractArtifact, looksLikeStudyArtifact } from '../utils/artifact'

interface Props {
  classes: string[]
  onSave: (name: string, content: string, className: string, resourceType: string, source?: StudySource) => void
}

interface ClipboardCandidate {
  raw: string
  extracted: ReturnType<typeof extractArtifact>
}

/* Human-readable title from filename */
function humanTitle(name: string): string {
  let base = name.replace(/\.[^.]+$/, '')
  // Collapse course-code dashes: m-b-a-s-801 → mbas801
  base = base.replace(/^m[-_]b[-_]a[-_]s[-_]?(\d{3})/i, 'mbas$1')
  base = base.replace(/^mbas[-_]?\d{3}[-_]/i, '')
  return base.replace(/[-_]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b\w/g, c => c.toUpperCase()).trim()
}

export default function ClipboardWatcher({ classes, onSave }: Props) {
  const [candidate, setCandidate] = useState<ClipboardCandidate | null>(null)
  const [fileName, setFileName] = useState('')
  const [className, setClassName] = useState(classes[0] ?? 'General')
  const [resourceType, setResourceType] = useState(RESOURCE_TYPES[0])
  const [saved, setSaved] = useState(false)

  const checkClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text && looksLikeStudyArtifact(text) && text !== localStorage.getItem('sb-last-clip')) {
        const extracted = extractArtifact(text)
        setCandidate({ raw: text, extracted })
        setFileName(extracted.suggestedName)
        // Detect class from filename FIRST (more reliable), then fall back to content
        setClassName(detectClass(extracted.suggestedName + ' ' + text, classes))
        setResourceType(detectResourceType(extracted.suggestedName, extracted.content))
      }
    } catch {
      // Clipboard access denied; ignore.
    }
  }, [classes])

  useEffect(() => {
    window.addEventListener('focus', checkClipboard)
    return () => window.removeEventListener('focus', checkClipboard)
  }, [checkClipboard])

  const handleSave = () => {
    if (!candidate) return
    const name = fileName.trim() || candidate.extracted.suggestedName
    onSave(name, candidate.extracted.content, className, resourceType, 'clipboard')
    localStorage.setItem('sb-last-clip', candidate.raw)
    setSaved(true)
    setTimeout(() => { setSaved(false); setCandidate(null) }, 2000)
  }

  const dismiss = () => {
    if (candidate) localStorage.setItem('sb-last-clip', candidate.raw)
    setCandidate(null)
  }

  if (!candidate) return null

  const preview = candidate.extracted.content.replace(/\s+/g, ' ').trim()
  const previewSnippet = preview.slice(0, 108)

  return (
    <div className="clipboard-slip-shell animate-slideDown">
      <div className="clipboard-slip">
        {saved ? (
          <div className="clipboard-slip-saved">
            {'\u2713'} Saved to library
          </div>
        ) : (
          <>
            <div className="clipboard-slip-head">
              <div>
                <div className="clipboard-slip-kicker">Clipboard slip</div>
                <p className="clipboard-slip-title">Ready to file</p>
                <p className="clipboard-slip-copy">Pulled from clipboard and set aside for the desk.</p>
              </div>
              <button onClick={dismiss} className="clipboard-slip-dismiss">
                dismiss
              </button>
            </div>

            <pre className="clipboard-slip-preview overflow-hidden">
              {previewSnippet}{preview.length > 108 ? '…' : ''}
            </pre>

            <p className="clipboard-slip-meta">
              {candidate.extracted.suggestedName}
              {candidate.extracted.extracted ? ' \u00b7 extracted from fenced code block' : ''}
            </p>

            <p className="clipboard-slip-note">
              Will display as <strong style={{ color: '#5A3E4B' }}>{humanTitle(fileName || candidate.extracted.suggestedName)}</strong>
            </p>

            <input
              value={fileName}
              onChange={event => setFileName(event.target.value)}
              className="w-full input-warm clipboard-slip-input"
              placeholder="filename.jsx"
            />

            <div className="clipboard-slip-grid">
              <select
                value={className}
                onChange={event => setClassName(event.target.value)}
                className="flex-1 input-warm clipboard-slip-input"
              >
                {classes.map(currentClass => <option key={currentClass} value={currentClass}>{currentClass}</option>)}
              </select>
              <select
                value={resourceType}
                onChange={event => setResourceType(event.target.value)}
                className="flex-1 input-warm clipboard-slip-input"
              >
                {RESOURCE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>

            <button onClick={handleSave} className="clipboard-slip-save">
              Save to Library
            </button>
          </>
        )}
      </div>
    </div>
  )
}
