import { useState, useCallback } from 'react'
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

/**
 * Reject strings that are probably secrets (tokens, MFA codes, private keys).
 * Keeps the clipboard watcher from accidentally ingesting credentials into
 * persistent storage / cloud sync.
 */
function looksLikeSecret(text: string): boolean {
  if (/^[0-9]{6,8}$/.test(text.trim())) return true                 // plain OTP
  if (/-----BEGIN [A-Z ]+-----/.test(text)) return true              // PEM key
  if (/\beyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]+/.test(text)) return true // JWT
  if (/\b(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{10,}/.test(text)) return true // Stripe-ish
  if (/\bghp_[A-Za-z0-9]{20,}/.test(text)) return true               // GitHub PAT
  if (/\bAKIA[0-9A-Z]{16}\b/.test(text)) return true                 // AWS key id
  if (/\b[A-Za-z0-9+/]{40,}={0,2}\b(?:[^A-Za-z0-9+/=]|$)/.test(text.slice(0, 200))
      && !/[\s.,;:?!]/.test(text.slice(0, 80))) return true          // bare long base64 blob
  return false
}

export default function ClipboardWatcher({ classes, onSave }: Props) {
  const [candidate, setCandidate] = useState<ClipboardCandidate | null>(null)
  const [fileName, setFileName] = useState('')
  const [className, setClassName] = useState(classes[0] ?? 'General')
  const [resourceType, setResourceType] = useState(RESOURCE_TYPES[0])
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Read the clipboard ONLY in response to a user click. Never on focus,
   * never on a timer — that's how sensitive clipboard contents leak into
   * persistent stores without the user realising.
   */
  const checkClipboard = useCallback(async () => {
    setError(null)
    try {
      const text = await navigator.clipboard.readText()
      if (!text) {
        setError('Clipboard is empty.')
        return
      }
      if (looksLikeSecret(text)) {
        setError('Clipboard looks like a secret (token, OTP, or private key) — refusing to capture.')
        return
      }
      if (!looksLikeStudyArtifact(text)) {
        setError('Clipboard does not look like a study artifact.')
        return
      }
      const extracted = extractArtifact(text)
      setCandidate({ raw: text, extracted })
      setFileName(extracted.suggestedName)
      setClassName(detectClass(extracted.suggestedName + ' ' + text, classes))
      setResourceType(detectResourceType(extracted.suggestedName, extracted.content))
    } catch {
      setError('Clipboard access denied by browser.')
    }
  }, [classes])

  const handleSave = () => {
    if (!candidate) return
    const name = fileName.trim() || candidate.extracted.suggestedName
    onSave(name, candidate.extracted.content, className, resourceType, 'clipboard')
    setSaved(true)
    setTimeout(() => { setSaved(false); setCandidate(null) }, 2000)
  }

  const dismiss = () => {
    setCandidate(null)
    setError(null)
  }

  if (!candidate) {
    return (
      <div className="clipboard-slip-shell">
        <div className="clipboard-slip">
          <div className="clipboard-slip-head">
            <div>
              <div className="clipboard-slip-kicker">Clipboard slip</div>
              <p className="clipboard-slip-title">Paste from clipboard</p>
              <p className="clipboard-slip-copy">Only captures when you tap the button — never automatically.</p>
            </div>
          </div>
          <button onClick={checkClipboard} className="clipboard-slip-save">
            Read clipboard
          </button>
          {error && (
            <p className="clipboard-slip-meta" style={{ color: '#F0849C', marginTop: 8 }}>
              {error}
            </p>
          )}
        </div>
      </div>
    )
  }

  const preview = candidate.extracted.content.replace(/\s+/g, ' ').trim()
  const previewSnippet = preview.slice(0, 108)

  return (
    <div className="clipboard-slip-shell animate-slideDown">
      <div className="clipboard-slip">
        {saved ? (
          <div className="clipboard-slip-saved">
            {'✓'} Saved to library
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
              {candidate.extracted.extracted ? ' · extracted from fenced code block' : ''}
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
