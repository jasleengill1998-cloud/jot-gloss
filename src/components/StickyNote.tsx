import { useRef, useState, useCallback } from 'react'
import type { StickyNoteData } from '../hooks/useStickyNotes'

const COLORS = [
  { bg: '#F5E6B8', border: 'rgba(194,167,108,0.45)', line: 'rgba(194,167,108,0.18)', header: 'rgba(194,167,108,0.35)' },
  { bg: '#F2D0CC', border: 'rgba(201,124,138,0.4)',  line: 'rgba(201,124,138,0.15)', header: 'rgba(201,124,138,0.3)' },
  { bg: '#D4E4D0', border: 'rgba(144,177,145,0.4)',  line: 'rgba(144,177,145,0.15)', header: 'rgba(144,177,145,0.3)' },
  { bg: '#DDD4EC', border: 'rgba(164,143,191,0.4)',  line: 'rgba(164,143,191,0.15)', header: 'rgba(164,143,191,0.3)' },
]

interface Props extends StickyNoteData {
  onUpdate: (id: string, data: Partial<StickyNoteData>) => void
  onDismiss: (id: string) => void
}

export default function StickyNote({ id, text, colorIndex, x, y, pinned, onUpdate, onDismiss }: Props) {
  const color = COLORS[colorIndex % COLORS.length]
  const [pos, setPos] = useState({ x, y })
  const dragging = useRef(false)
  const origin = useRef({ mx: 0, my: 0, nx: 0, ny: 0 })
  const noteLineHeight = 24
  const noteTopInset = 8

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (pinned) return
    dragging.current = true
    origin.current = { mx: e.clientX, my: e.clientY, nx: pos.x, ny: pos.y }
    e.preventDefault()
  }, [pinned, pos])

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current) return
    const nx = origin.current.nx + (e.clientX - origin.current.mx)
    const ny = origin.current.ny + (e.clientY - origin.current.my)
    setPos({ x: nx, y: ny })
  }, [])

  const onMouseUp = useCallback(() => {
    if (!dragging.current) return
    dragging.current = false
    onUpdate(id, { x: pos.x, y: pos.y })
  }, [id, pos, onUpdate])

  const startDrag = useCallback((e: React.MouseEvent) => {
    onMouseDown(e)
    const move = (ev: MouseEvent) => onMouseMove(ev)
    const up = () => { onMouseUp(); window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }, [onMouseDown, onMouseMove, onMouseUp])

  return (
    <div
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        width: 192,
        zIndex: 500,
        pointerEvents: 'all',
        background: color.bg,
        border: `1px solid ${color.border}`,
        boxShadow: pinned
          ? `2px 3px 10px rgba(58,40,48,0.18), inset 0 0 0 4px ${color.bg}, inset 0 0 0 5px ${color.border}`
          : `3px 5px 14px rgba(58,40,48,0.14), inset 0 0 0 4px ${color.bg}, inset 0 0 0 5px ${color.border}`,
        userSelect: dragging.current ? 'none' : 'auto',
      }}
    >
      <div
        onMouseDown={startDrag}
        style={{
          height: 28,
          background: color.header,
          borderBottom: `1px solid ${color.border}`,
          cursor: pinned ? 'default' : 'grab',
          display: 'flex',
          flexDirection: 'row-reverse',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 6px',
          userSelect: 'none',
        }}
      >
        <button
          type="button"
          onMouseDown={e => e.stopPropagation()}
          onClick={() => onDismiss(id)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: "'Cormorant Garamond',Georgia,serif",
            fontSize: 14, lineHeight: 1, color: 'rgba(58,40,48,0.5)',
            padding: '0 2px',
          }}
          title="Remove"
          aria-label="Remove note"
        >×</button>

        <button
          type="button"
          onMouseDown={e => e.stopPropagation()}
          onClick={() => onUpdate(id, { pinned: !pinned })}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 11, lineHeight: 1,
            color: pinned ? 'rgba(58,40,48,0.85)' : 'rgba(58,40,48,0.4)',
            padding: '0 2px',
            transition: 'color 0.15s',
          }}
          title={pinned ? 'Unpin' : 'Pin in place'}
          aria-label={pinned ? 'Unpin note' : 'Pin note'}
        >◈</button>
      </div>

        <textarea
          value={text}
          onChange={e => onUpdate(id, { text: e.target.value })}
          style={{
            width: '100%',
            height: 164,
            padding: `${noteTopInset}px 10px 12px`,
            boxSizing: 'border-box',
            backgroundImage: `linear-gradient(
              to bottom,
              transparent ${noteLineHeight - 1}px,
              ${color.line} ${noteLineHeight - 1}px,
              ${color.line} ${noteLineHeight}px,
              transparent ${noteLineHeight}px
            )`,
            backgroundSize: `100% ${noteLineHeight}px`,
            backgroundPosition: `0 ${noteTopInset}px`,
            backgroundRepeat: 'repeat',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontFamily: "'Cormorant Garamond',Georgia,serif",
            fontSize: 15,
            lineHeight: `${noteLineHeight}px`,
            color: '#3A2830',
            backgroundColor: 'transparent',
            textAlign: 'left',
            verticalAlign: 'top',
          }}
          placeholder="Jot it here…"
        />
    </div>
  )
}
