import { useEffect, useMemo, useState } from 'react'
import { RESOURCE_TYPES } from '../types'
import type { FileType, StudySource } from '../types'
import { extractArtifact } from '../utils/artifact'
import { detectClass, detectResourceType } from '../utils/detect'
import { suggestLogicalName, isGenericName } from '../utils/rename'

interface Props {
  classes: string[]
  onSave: (name: string, content: string, className: string, resourceType: string, source?: StudySource) => void
  onClose: () => void
}

function detectTypeFromName(name: string): FileType {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'jsx' || ext === 'tsx') return 'jsx'
  if (ext === 'html' || ext === 'htm') return 'html'
  if (ext === 'pdf') return 'pdf'
  if (ext === 'md' || ext === 'mdx' || ext === 'markdown' || ext === 'txt') return 'markdown'
  return 'other'
}

function detectTypeFromContent(content: string): FileType {
  if (/React\.createElement|function\s+[A-Z]\w*\s*\(|const\s+[A-Z]\w*\s*=\s*\(/.test(content)) return 'jsx'
  if (/<[A-Z][a-zA-Z]*[\s/>]/.test(content) || /return\s*\(?\s*</.test(content)) return 'jsx'
  if (/^\s*<!doctype\s+html|^\s*<html/i.test(content)) return 'html'
  if (/^#\s|\n##\s|\*\*.*\*\*|\[.*\]\(.*\)/.test(content)) return 'markdown'
  return 'other'
}

export default function QuickAdd({ classes, onSave, onClose }: Props) {
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [className, setClassName] = useState(classes[0] ?? 'General')
  const [resourceType, setResourceType] = useState(RESOURCE_TYPES[0])
  const [saved, setSaved] = useState(false)
  const [autoDetected, setAutoDetected] = useState(false)
  const artifact = useMemo(() => extractArtifact(content, name.trim() || undefined), [content, name])

  useEffect(() => {
    if (!content.trim() || autoDetected) return
    const extracted = artifact.content || content
    const detectedCls = detectClass(extracted, classes)
    const detectedRes = detectResourceType(name.trim() || artifact.suggestedName, extracted)
    setClassName(detectedCls)
    setResourceType(detectedRes)
    setAutoDetected(true)
  }, [artifact, content, name, classes, autoDetected])

  useEffect(() => {
    if (!content.trim()) setAutoDetected(false)
  }, [content])

  const detectedType = (() => {
    if (name.includes('.')) {
      const fromName = detectTypeFromName(name)
      if (fromName !== 'other') return fromName
    }
    if (artifact.fileType !== 'other') return artifact.fileType
    return detectTypeFromContent(artifact.content || content)
  })()

  const handleSave = () => {
    const trimmedContent = content.trim()
    if (!trimmedContent) return

    let fileName = name.trim() || artifact.suggestedName
    if (isGenericName(fileName)) {
      fileName = suggestLogicalName(fileName, className, resourceType, artifact.content || trimmedContent)
    }
    if (!fileName.includes('.')) {
      fileName += detectedType === 'jsx' ? '.jsx' : detectedType === 'html' ? '.html' : detectedType === 'markdown' ? '.md' : '.jsx'
    }
    onSave(fileName, artifact.content, className, resourceType, 'quick-add')
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setName('')
      setContent('')
      setAutoDetected(false)
    }, 1500)
  }

  return (
    <div className="modal-panel animate-slideDown" style={{ marginBottom: 16 }}>
      <div className="flex items-start justify-between" style={{ marginBottom: 16 }}>
        <div>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 18,
              fontWeight: 700,
              color: '#3A2830',
              letterSpacing: '0.04em',
              marginBottom: 4,
            }}
          >
            Quick Add from Claude
          </h2>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 11,
              fontStyle: 'italic',
              color: 'rgba(90,62,75,0.45)',
            }}
          >
            Paste a Claude response and Jot Gloss saves the main artifact.
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            color: 'rgba(90,62,75,0.35)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            marginLeft: 12,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div style={{ marginBottom: 14 }}>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Filename (e.g. supply-demand-flashcards.jsx)"
          className="w-full input-warm"
          style={{ padding: '10px 14px', fontSize: 13 }}
        />
        <span
          style={{
            fontFamily: "'Outfit', system-ui, sans-serif",
            fontSize: 10,
            color: 'rgba(90,62,75,0.6)',
            marginTop: 4,
            display: 'inline-block',
          }}
        >
          Suggested: {artifact.suggestedName} {'\u00b7'} {detectedType.toUpperCase()}
          {artifact.extracted ? ' \u00b7 extracted from code block' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ marginBottom: 14 }}>
        <select
          value={className}
          onChange={(event) => setClassName(event.target.value)}
          className="w-full input-warm"
          style={{ padding: '10px 14px', fontSize: 12, cursor: 'pointer' }}
        >
          {classes.map((course) => (
            <option key={course} value={course}>
              {course}
            </option>
          ))}
        </select>
        <select
          value={resourceType}
          onChange={(event) => setResourceType(event.target.value)}
          className="w-full input-warm"
          style={{ padding: '10px 14px', fontSize: 12, cursor: 'pointer' }}
        >
          {RESOURCE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Paste your JSX component, HTML, markdown, or any content here..."
        rows={10}
        className="w-full input-warm"
        style={{
          padding: '12px 14px',
          fontSize: 12,
          fontFamily: "'Outfit', system-ui, monospace",
          resize: 'vertical',
          lineHeight: 1.6,
        }}
      />

      <div className="flex items-center justify-end gap-3" style={{ marginTop: 16 }}>
        {saved && (
          <span
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 13,
              fontWeight: 700,
              color: '#5A3E4B',
            }}
            className="animate-fadeIn"
          >
            {'\u2713'} Saved to library
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={!content.trim()}
          className="btn-primary"
          style={{
            padding: '10px 28px',
            fontSize: 12,
            opacity: content.trim() ? 1 : 0.4,
            cursor: content.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          Save to Library
        </button>
      </div>
    </div>
  )
}
