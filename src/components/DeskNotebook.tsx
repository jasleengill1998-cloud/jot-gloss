import { useEffect, useState } from 'react'
import type { StudyFile } from '../types'

export interface DeskTask {
  id: string
  text: string
  done: boolean
}

type NotebookTab = 'todo' | 'freeform'

interface Props {
  notes: string
  tasks: DeskTask[]
  hasPinnedNote: boolean
  companionFile?: StudyFile | null
  onSave: (notes: string, tasks: DeskTask[]) => Promise<void> | void
  onPin: (notes: string) => void
  onClearPin: () => void
  onOpenCompanion?: (file: StudyFile) => void
  onClose: () => void
}

function makeTask(text: string): DeskTask {
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    text,
    done: false,
  }
}

function humanTitle(name: string) {
  return name
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim()
}

const NOTEBOOK_TABS: Array<{ key: NotebookTab; label: string }> = [
  { key: 'todo', label: 'To-Do' },
  { key: 'freeform', label: 'Freeform' },
]

export default function DeskNotebook({
  notes,
  tasks,
  hasPinnedNote,
  companionFile,
  onSave,
  onPin,
  onClearPin,
  onOpenCompanion,
  onClose,
}: Props) {
  const [noteDraft, setNoteDraft] = useState(notes)
  const [taskDraft, setTaskDraft] = useState(tasks)
  const [newTask, setNewTask] = useState('')
  const [status, setStatus] = useState('Quiet on the desk')
  const [activeTab, setActiveTab] = useState<NotebookTab>('freeform')

  useEffect(() => {
    setNoteDraft(notes)
  }, [notes])

  useEffect(() => {
    setTaskDraft(tasks)
  }, [tasks])

  const saveChanges = async () => {
    await onSave(noteDraft, taskDraft)
    setStatus('Set aside just now')
  }

  const addTask = () => {
    const trimmed = newTask.trim()
    if (!trimmed) return
    setTaskDraft((current) => [...current, makeTask(trimmed)])
    setNewTask('')
    setStatus('Checklist updated')
  }

  const remainingTasks = taskDraft.filter((task) => !task.done).length

  return (
    <section className="desk-notebook animate-slideDown" aria-label="Study notebook">
      <div className="desk-notebook-spine" aria-hidden="true" />

      <div className="desk-notebook-cover">
        <div className="desk-notebook-header">
          <div className="desk-notebook-bookplate" aria-hidden="true">
            <span>JG</span>
            <small>Study Journal</small>
          </div>

          <div className="desk-notebook-headline">
            <div className="desk-notebook-kicker">Study Journal</div>
            <h2 className="desk-notebook-title">Keep one open volume on the desk.</h2>
            <p className="desk-notebook-subtitle">
              Work on the left page and keep the current folio close at hand on the right.
            </p>
          </div>

          <button type="button" className="desk-tool-link" onClick={onClose}>
            Set Aside
          </button>
        </div>

        <div className="desk-notebook-tabs" role="tablist" aria-label="Notebook sections">
          {NOTEBOOK_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              className={`desk-notebook-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="desk-notebook-layout">
          <section className="desk-notebook-page desk-notebook-page-primary">
            {activeTab === 'freeform' && (
              <div className="desk-notebook-section">
                <div className="desk-notebook-section-head">
                  <span className="section-label">Freeform</span>
                  <span className="desk-notebook-status">{status}</span>
                </div>

                <textarea
                  value={noteDraft}
                  onChange={(event) => setNoteDraft(event.target.value)}
                  className="desk-notebook-textarea input-warm"
                  placeholder="Keep rough explanations, reminders, and loose working notes here."
                />

                <div className="desk-notebook-actions">
                  <button type="button" className="bookplate-action compact" onClick={saveChanges}>
                    Set Aside Page
                  </button>
                  <button
                    type="button"
                    className="bookplate-action compact"
                    onClick={() => onPin(noteDraft)}
                    disabled={!noteDraft.trim()}
                  >
                    {hasPinnedNote ? 'Refresh Rail Slip' : 'Set on the Rail'}
                  </button>
                  {hasPinnedNote && (
                    <button type="button" className="desk-tool-link" onClick={onClearPin}>
                      Clear Rail Slip
                    </button>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'todo' && (
              <div className="desk-notebook-section">
                <div className="desk-notebook-section-head">
                  <span className="section-label">To-Do</span>
                  <span className="desk-notebook-status">
                    {remainingTasks === 0 ? 'Nothing queued' : `${remainingTasks} still to do`}
                  </span>
                </div>

                <div className="desk-task-entry">
                  <input
                    value={newTask}
                    onChange={(event) => setNewTask(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        addTask()
                      }
                    }}
                    className="input-warm desk-task-input"
                    placeholder="Add the next small piece of work"
                  />
                  <button type="button" className="bookplate-action compact" onClick={addTask}>
                    Add
                  </button>
                </div>

                <div className="desk-task-list">
                  {taskDraft.length === 0 ? (
                    <p className="rail-copy">Nothing queued yet. Add the next small piece of work so the desk can hold it for you.</p>
                  ) : (
                    taskDraft.map((task) => (
                      <label key={task.id} className="desk-task-row">
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={() =>
                            setTaskDraft((current) =>
                              current.map((item) => (item.id === task.id ? { ...item, done: !item.done } : item)),
                            )
                          }
                        />
                        <span className={task.done ? 'done' : ''}>{task.text}</span>
                        <button
                          type="button"
                          className="desk-tool-link desk-tool-link-danger"
                          onClick={() => setTaskDraft((current) => current.filter((item) => item.id !== task.id))}
                        >
                          Remove
                        </button>
                      </label>
                    ))
                  )}
                </div>

                <div className="desk-notebook-actions">
                  <button type="button" className="bookplate-action compact" onClick={saveChanges}>
                    Set Aside List
                  </button>
                </div>
              </div>
            )}
          </section>

          <aside className="desk-notebook-page desk-notebook-page-secondary">
            <div className="desk-notebook-section">
              <div className="desk-notebook-section-head">
                <span className="section-label">Reading Folio</span>
                <span className="desk-notebook-status">
                  {companionFile ? 'Kept close by' : 'Waiting on the desk'}
                </span>
              </div>

              {companionFile ? (
                <>
                  <h3 className="desk-notebook-companion-title">{humanTitle(companionFile.name)}</h3>
                  <p className="desk-notebook-companion-meta">
                    {companionFile.className} - {companionFile.resourceType}
                  </p>
                  <p className="desk-notebook-companion-copy">
                    Leave the journal open on the left and return to this folio when you need the source beside your notes.
                  </p>
                  {onOpenCompanion && (
                    <button type="button" className="bookplate-action compact" onClick={() => onOpenCompanion(companionFile)}>
                      Open Folio on the Desk
                    </button>
                  )}
                </>
              ) : (
                <p className="rail-copy">Open a folio and it will wait here beside the journal.</p>
              )}
            </div>

            <div className="desk-notebook-section">
              <div className="desk-notebook-section-head">
                <span className="section-label">Desk Markers</span>
              </div>

              <div className="desk-notebook-meta-board">
                <div className="desk-notebook-meta-row">
                  <span>Pinned slip</span>
                  <strong>{hasPinnedNote ? 'Set on the rail' : 'Not pinned'}</strong>
                </div>
                <div className="desk-notebook-meta-row">
                  <span>Checklist</span>
                  <strong>{remainingTasks === 0 ? 'Clear' : `${remainingTasks} to do`}</strong>
                </div>
                <div className="desk-notebook-meta-row">
                  <span>Freeform page</span>
                  <strong>{noteDraft.trim() ? 'In progress' : 'Blank'}</strong>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
