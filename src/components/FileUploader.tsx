import { useState, useRef, useCallback, type DragEvent } from 'react'
import { RESOURCE_TYPES } from '../types'
import { detectResourceType, detectClass } from '../utils/detect'

interface Props {
  classes: string[]
  onUpload: (file: File, className: string, resourceType: string) => void
  onClose: () => void
}

const ACCEPTED = '.jsx,.tsx,.html,.htm,.pdf,.md,.mdx,.markdown,.txt,.json,.csv'

export default function FileUploader({ classes, onUpload, onClose }: Props) {
  const [dragging, setDragging] = useState(false)
  const [className, setClassName] = useState(classes[0] ?? 'General')
  const [resourceType, setResourceType] = useState(RESOURCE_TYPES[0])
  const [autoDetected, setAutoDetected] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(async (fileList: FileList | null) => {
    if (!fileList?.length) return
    for (const file of Array.from(fileList)) {
      // Auto-detect class and resource type from file name + content
      let detectedClass = className
      let detectedType = resourceType

      try {
        const preview = file.type.startsWith('text') || file.name.match(/\.(jsx|tsx|html|htm|md|mdx|txt|json|csv)$/i)
          ? await file.text()
          : ''

        detectedClass = detectClass(file.name + ' ' + preview, classes)
        detectedType = detectResourceType(file.name, preview)
        setClassName(detectedClass)
        setResourceType(detectedType)
        setAutoDetected(true)
        setTimeout(() => setAutoDetected(false), 3000)
      } catch {
        // Fallback to manual selections
      }

      onUpload(file, detectedClass, detectedType)
    }
    if (inputRef.current) inputRef.current.value = ''
  }, [onUpload, className, resourceType, classes])

  const onDrop = useCallback((e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  return (
    <div className="panel p-5 mb-4 animate-slideDown">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 18, fontWeight: 700, color: '#5A3E4B',
          }}>Place in the cabinet</h2>
          <p style={{
            fontFamily: "'Outfit', system-ui, sans-serif",
            fontSize: 11, color: 'rgba(90,62,75,0.6)', marginTop: 2,
          }}>
            Class and type are auto-detected from filename
          </p>
        </div>
        <button onClick={onClose} aria-label="Close the cabinet panel" className="p-1" style={{ color: '#C88898', cursor: 'pointer', background: 'none', border: 'none', minWidth: 44, minHeight: 44, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Auto-detected feedback */}
      {autoDetected && (
        <div className="mb-3 animate-slideDown" style={{
          fontFamily: "'Outfit', system-ui, sans-serif",
          fontSize: 12, padding: '8px 12px',
          background: 'rgba(128,200,144,0.08)', color: '#80C890',
          border: '1px solid rgba(128,200,144,0.15)',
        }}>
          Auto-detected: <strong style={{ color: '#5A3E4B' }}>{className}</strong> / <strong style={{ color: '#5A3E4B' }}>{resourceType}</strong>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <select value={className} onChange={e => setClassName(e.target.value)}
          className="w-full input-warm" style={{ padding: '8px 12px', fontSize: 13, cursor: 'pointer' }}>
          {classes.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={resourceType} onChange={e => setResourceType(e.target.value)}
          className="w-full input-warm" style={{ padding: '8px 12px', fontSize: 13, cursor: 'pointer' }}>
          {RESOURCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div
        className={`border-2 border-dashed p-10 text-center cursor-pointer transition-all`}
        style={{
          borderColor: dragging ? '#F0849C' : 'rgba(200,136,152,0.25)',
          background: dragging ? 'rgba(240,132,156,0.04)' : '#FFF4F0',
        }}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED}
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
             className="mx-auto mb-3" style={{ color: '#C88898' }}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
        <p style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 14, fontWeight: 600, color: '#5A3E4B',
        }}>Drop files here or click to browse</p>
        <p style={{
          fontFamily: "'Outfit', system-ui, sans-serif",
          fontSize: 11, color: 'rgba(90,62,75,0.6)', marginTop: 4,
        }}>{ACCEPTED.split(',').join(', ')}</p>
      </div>
    </div>
  )
}
    