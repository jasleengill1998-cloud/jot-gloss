import { useState } from 'react'
import type { StudyFile } from '../types'
import { RESOURCE_TYPES } from '../types'
import { suggestLogicalName } from '../utils/rename'

interface Props {
  file: StudyFile
  classes: string[]
  onSave: (id: string, updates: Partial<StudyFile>) => void
  onClose: () => void
}

export default function EditModal({ file, classes, onSave, onClose }: Props) {
  const [name, setName] = useState(file.name)
  const [className, setClassName] = useState(file.className)
  const [resourceType, setResourceType] = useState(file.resourceType)

  const suggestedName = suggestLogicalName(file.name, className, resourceType)

  const handleSave = () => {
    const updates: Partial<StudyFile> = {}
    if (name.trim() && name !== file.name) updates.name = name.trim()
    if (className !== file.className) updates.className = className
    if (resourceType !== file.resourceType) updates.resourceType = resourceType
    if (Object.keys(updates).length > 0) onSave(file.id, updates)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fadeIn modal-overlay"
         role="dialog" aria-modal="true" aria-label="Edit file"
         onClick={onClose}
         onKeyDown={e => { if (e.key === 'Escape') onClose() }}>
      <div className="modal-panel max-w-md w-full animate-scaleIn"
           onClick={e => e.stopPropagation()}>
        <h3 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 18, fontWeight: 700, color: '#5A3E4B',
          letterSpacing: '0.04em', marginBottom: 4,
        }}>
          {'\u270E'} Edit File
        </h3>
        <div style={{
          width: 40, height: 0, borderTop: '1.5px solid rgba(184,149,106,0.3)',
          marginBottom: 20,
        }} />

        <label style={{
          display: 'block', fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 10, fontWeight: 700, letterSpacing: '0.2em',
          textTransform: 'uppercase' as const, color: 'rgba(90,62,75,0.5)',
          marginBottom: 6,
        }}>Filename</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full input-warm"
          style={{ padding: '10px 14px', fontSize: 13, marginBottom: 4 }}
        />

        {suggestedName !== name && (
          <button
            onClick={() => setName(suggestedName)}
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 11, fontStyle: 'italic', color: '#C88FA0',
              background: 'none', border: 'none', cursor: 'pointer',
              marginBottom: 16, padding: '4px 0',
            }}
          >
            {'\u2728'} Suggest: <strong style={{ color: '#5A3E4B' }}>{suggestedName}</strong>
          </button>
        )}

        <label style={{
          display: 'block', fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 10, fontWeight: 700, letterSpacing: '0.2em',
          textTransform: 'uppercase' as const, color: 'rgba(90,62,75,0.5)',
          marginBottom: 6, marginTop: 12,
        }}>Class</label>
        <select
          value={className}
          onChange={e => setClassName(e.target.value)}
          className="w-full input-warm"
          style={{ padding: '10px 14px', fontSize: 13, marginBottom: 16, cursor: 'pointer' }}
        >
          {classes.map(c => <option key={c} value={c}>{c}</option>)}
          {!classes.includes(className) && <option value={className}>{className}</option>}
        </select>

        <label style={{
          display: 'block', fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 10, fontWeight: 700, letterSpacing: '0.2em',
          textTransform: 'uppercase' as const, color: 'rgba(90,62,75,0.5)',
          marginBottom: 6,
        }}>Resource Type</label>
        <select
          value={resourceType}
          onChange={e => setResourceType(e.target.value)}
          className="w-full input-warm"
          style={{ padding: '10px 14px', fontSize: 13, marginBottom: 24, cursor: 'pointer' }}
        >
          {RESOURCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase' as const, color: 'rgba(90,62,75,0.5)',
            background: 'none', border: '1px solid rgba(184,149,106,0.3)',
            cursor: 'pointer', padding: '8px 20px',
          }}>
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary" style={{ padding: '8px 24px', fontSize: 12 }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
