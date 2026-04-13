import { useState, useEffect } from 'react'
import type { DeskTask } from './DeskNotebook'

interface Props {
  tasks: DeskTask[]
  onAddTask: (text: string) => void
  onToggleTask: (id: string) => void
  onRemoveTask: (id: string) => void
}

const PINNED_KEY = 'jg-todo-pinned'

export default function DeskTodoPanel({ tasks, onAddTask, onToggleTask, onRemoveTask }: Props) {
  const [open, setOpen] = useState(false)
  const [pinned, setPinned] = useState(() => localStorage.getItem(PINNED_KEY) === 'true')
  const [newTask, setNewTask] = useState('')

  const isVisible = open || pinned

  useEffect(() => {
    localStorage.setItem(PINNED_KEY, String(pinned))
  }, [pinned])

  const remaining = tasks.filter((task) => !task.done).length

  return (
    <>
      {!isVisible && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed',
            left: 260,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 400,
            background: 'rgba(212,228,208,0.95)',
            border: '1px solid rgba(144,177,145,0.45)',
            borderLeft: 'none',
            width: 18,
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            borderRadius: '0 4px 4px 0',
            boxShadow: '2px 0 6px rgba(58,40,48,0.08)',
          }}
          title="Open to-do list"
          aria-label="Open to-do list"
        >
          <svg width="10" height="28" viewBox="0 0 10 28" fill="none" aria-hidden="true">
            {[0, 1, 2].map((index) => (
              <g key={index} transform={`translate(0,${index * 9})`}>
                <rect x="0" y="1" width="6" height="5" rx="1" stroke="rgba(90,62,75,0.45)" strokeWidth="0.7" fill="none" />
                <line x1="8" y1="3.5" x2="10" y2="3.5" stroke="rgba(90,62,75,0.35)" strokeWidth="0.8" />
              </g>
            ))}
          </svg>
          {remaining > 0 && (
            <span style={{
              position: 'absolute',
              top: -6,
              right: -4,
              background: '#C97C8A',
              color: '#fff',
              fontSize: 9,
              borderRadius: '50%',
              width: 14,
              height: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Outfit',system-ui,sans-serif",
            }}
            >
              {remaining}
            </span>
          )}
        </button>
      )}

      {isVisible && (
        <div style={{
          position: 'fixed',
          left: 260,
          top: 0,
          bottom: 0,
          width: 240,
          zIndex: 400,
          background: 'rgba(255,248,242,0.98)',
          borderRight: '1px solid rgba(199,183,157,0.4)',
          boxShadow: '4px 0 16px rgba(58,40,48,0.08)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        >
          <div style={{
            padding: '12px 14px 10px',
            borderBottom: '1px solid rgba(199,183,157,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(212,228,208,0.4)',
          }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              {[0, 1, 2].map((index) => (
                <g key={index} transform={`translate(0,${index * 5})`}>
                  <rect x="0" y="1" width="5" height="4" rx="1" stroke="rgba(90,62,75,0.5)" strokeWidth="0.7" fill="none" />
                  <line x1="7" y1="3" x2="16" y2="3" stroke="rgba(90,62,75,0.35)" strokeWidth="0.8" />
                </g>
              ))}
            </svg>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setPinned((current) => !current)}
                title={pinned ? 'Unpin panel' : 'Keep panel open'}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  color: pinned ? 'rgba(90,62,75,0.85)' : 'rgba(90,62,75,0.35)',
                  transition: 'color 0.15s',
                }}
                aria-label={pinned ? 'Unpin' : 'Pin open'}
              >
                ◈
              </button>
              {!pinned && (
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: "'Cormorant Garamond',Georgia,serif",
                    fontSize: 15,
                    color: 'rgba(90,62,75,0.45)',
                  }}
                  aria-label="Close"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px' }}>
            {tasks.length === 0 ? (
              <p style={{
                fontFamily: "'EB Garamond',Georgia,serif",
                fontSize: 12,
                fontStyle: 'italic',
                color: 'rgba(90,62,75,0.5)',
                marginTop: 8,
              }}
              >
                Nothing queued yet.
              </p>
            ) : (
              tasks.map((task) => (
                <label key={task.id} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  marginBottom: 8,
                  cursor: 'pointer',
                }}
                >
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => onToggleTask(task.id)}
                    style={{ marginTop: 3, accentColor: '#C97C8A' }}
                  />
                  <span style={{
                    fontFamily: "'Cormorant Garamond',Georgia,serif",
                    fontSize: 13,
                    color: task.done ? 'rgba(90,62,75,0.35)' : '#3A2830',
                    textDecoration: task.done ? 'line-through' : 'none',
                    flex: 1,
                    lineHeight: 1.4,
                  }}
                  >
                    {task.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveTask(task.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 11,
                      color: 'rgba(90,62,75,0.3)',
                      lineHeight: 1,
                      marginTop: 2,
                    }}
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </label>
              ))
            )}
          </div>

          <div style={{
            padding: '10px 14px',
            borderTop: '1px solid rgba(199,183,157,0.25)',
            display: 'flex',
            gap: 6,
          }}
          >
            <input
              type="text"
              value={newTask}
              onChange={(event) => setNewTask(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && newTask.trim()) {
                  onAddTask(newTask.trim())
                  setNewTask('')
                }
              }}
              placeholder="The next small piece of work"
              style={{
                flex: 1,
                fontFamily: "'Cormorant Garamond',Georgia,serif",
                fontSize: 12,
                background: 'rgba(255,248,242,0.8)',
                border: '1px solid rgba(199,183,157,0.35)',
                padding: '5px 8px',
                color: '#3A2830',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={() => {
                if (newTask.trim()) {
                  onAddTask(newTask.trim())
                  setNewTask('')
                }
              }}
              className="bookplate-action compact"
            >
              +
            </button>
          </div>
        </div>
      )}
    </>
  )
}
