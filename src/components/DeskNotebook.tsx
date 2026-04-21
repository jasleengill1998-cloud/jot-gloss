import { useEffect, useState } from 'react'
import type { StudyFile } from '../types'

export interface DeskTask {
  id: string
  text: string
  done: boolean
}

export interface NotebookPage {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
}

type NotebookTab = 'todo' | 'freeform'
export type NotebookMode = 'side-panel' | 'center-desk'

interface Props {
  mode: NotebookMode
  pages: NotebookPage[]
  activePageId: string
  tasks: DeskTask[]
  hasPinnedNote: boolean
  companionFile?: StudyFile | null
  onSavePage: (pageId: string, content: string) => void
  onAddPage: () => void
  onDeletePage: (pageId: string) => void
  onSetActivePage: (pageId: string) => void
  onSaveTasks: (tasks: DeskTask[]) => void
  onPin: (notes: string) => void
  onClearPin: () => void
  onOpenCompanion?: (file: StudyFile) => void
  onClose: () => void
}

function makeTask(text: string): DeskTask {
  const id = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
  return { id, text, done: false }
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
  mode,
  pages,
  activePageId,
  tasks,
  hasPinnedNote,
  companionFile,
  onSavePage,
  onAddPage,
  onDeletePage,
  onSetActivePage,
  onSaveTasks,
  onPin,
  onClearPin,
  onOpenCompanion,
  onClose,
}: Props) {
  const isSidePanel = mode === 'side-panel'

  const activePage = pages.find((p) => p.id === activePageId) || pages[0] || null
  const activeIndex = pages.findIndex((p) => p.id === (activePage?.id ?? ''))

  const [draft, setDraft] = useState(activePage?.content ?? '')
  const [taskDraft, setTaskDraft] = useState(tasks)
  const [newTask, setNewTask] = useState('')
  const [status, setStatus] = useState('Ready')
  const [activeTab, setActiveTab] = useState<NotebookTab>('freeform')

  useEffect(() => {
    setDraft(activePage?.content ?? '')
    setStatus('Ready')
  }, [activePage?.id, activePage?.content])

  useEffect(() => {
    setTaskDraft(tasks)
  }, [tasks])

  const savePage = () => {
    if (!activePage) return
    onSavePage(activePage.id, draft)
    setStatus('Saved')
  }

  const saveTasks = () => {
    onSaveTasks(taskDraft)
    setStatus('Saved')
  }

  const addTask = () => {
    const trimmed = newTask.trim()
    if (!trimmed) return
    setTaskDraft((current) => [...current, makeTask(trimmed)])
    setNewTask('')
    setStatus('Updated')
  }

  const flipPage = (dir: -1 | 1) => {
    if (!activePage) return
    onSavePage(activePage.id, draft)
    const next = pages[activeIndex + dir]
    if (next) onSetActivePage(next.id)
  }

  const deletePage = () => {
    if (!activePage || pages.length <= 1) return
    onDeletePage(activePage.id)
  }

  const remainingTasks = taskDraft.filter((task) => !task.done).length

  return (
    <section className={`desk-notebook desk-notebook--${mode} animate-slideDown`} aria-label="Study notebook">
      {!isSidePanel && <div className="desk-notebook-spine" aria-hidden="true" />}

      <div className="desk-notebook-cover">
        <div className="desk-notebook-header">
          {!isSidePanel && (
            <div className="desk-notebook-bookplate" aria-hidden="true">
              <span>JG</span>
            </div>
          )}

          <div className="desk-notebook-headline">
            <h2 className="desk-notebook-title">{isSidePanel ? 'Notes' : 'Notes & Tasks'}</h2>
          </div>

          <button type="button" className="desk-tool-link" onClick={onClose}>
            Close
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

        <div className={`desk-notebook-layout ${isSidePanel ? 'desk-notebook-layout--compact' : ''}`}>
          <section className="desk-notebook-page desk-notebook-page-primary">
            {activeTab === 'freeform' && (
              <div className="desk-notebook-section">
                <div className="desk-notebook-page-nav">
                  <button
                    type="button"
                    className="desk-tool-link"
                    disabled={activeIndex <= 0}
                    onClick={() => flipPage(-1)}
                    aria-label="Previous page"
                  >
                    &lsaquo;
                  </button>
                  <span className="desk-notebook-page-indicator">
                    Page {activeIndex + 1} of {pages.length}
                  </span>
                  <button
                    type="button"
                    className="desk-tool-link"
                    disabled={activeIndex >= pages.length - 1}
                    onClick={() => flipPage(1)}
                    aria-label="Next page"
                  >
                    &rsaquo;
                  </button>
                  <button type="button" className="desk-tool-link" onClick={onAddPage}>
                    + New
                  </button>
                  {pages.length > 1 && (
                    <button type="button" className="desk-tool-link desk-tool-link-danger" onClick={deletePage}>
                      Delete
                    </button>
                  )}
                </div>

                <div className="desk-notebook-section-head">
                  <span className="section-label">Notes</span>
                  <span className="desk-notebook-status">{status}</span>
                </div>

                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  className="desk-notebook-textarea input-warm"
                  placeholder="Write notes here..."
                />

                <div className="desk-notebook-actions">
                  <button type="button" className="bookplate-action compact" onClick={savePage}>
                    Save
                  </button>
                  <button
                    type="button"
                    className="bookplate-action compact"
                    onClick={() => onPin(draft)}
                    disabled={!draft.trim()}
                  >
                    {hasPinnedNote ? 'Update pinned note' : 'Pin to sidebar'}
                  </button>
                  {hasPinnedNote && (
                    <button type="button" className="desk-tool-link" onClick={onClearPin}>
                      Unpin
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
                    {remainingTasks === 0 ? 'All done' : `${remainingTasks} to do`}
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
                    placeholder="Add a task"
                  />
                  <button type="button" className="bookplate-action compact" onClick={addTask}>
                    Add
                  </button>
                </div>

                <div className="desk-task-list">
                  {taskDraft.length === 0 ? (
                    <p className="rail-copy">No tasks yet.</p>
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
                  <button type="button" className="bookplate-action compact" onClick={saveTasks}>
                    Save
                  </button>
                </div>
              </div>
            )}
          </section>

          {!isSidePanel && (
            <aside className="desk-notebook-page desk-notebook-page-secondary">
              <div className="desk-notebook-section">
                <div className="desk-notebook-section-head">
                  <span className="section-label">Current Folio</span>
                  <span className="desk-notebook-status">{companionFile ? 'Open' : 'None'}</span>
                </div>

                {companionFile ? (
                  <>
                    <h3 className="desk-notebook-companion-title">{humanTitle(companionFile.name)}</h3>
                    <p className="desk-notebook-companion-meta">
                      {companionFile.className} - {companionFile.resourceType}
                    </p>
                    {onOpenCompanion && (
                      <button
                        type="button"
                        className="bookplate-action compact"
                        onClick={() => onOpenCompanion(companionFile)}
                      >
                        Open folio
                      </button>
                    )}
                  </>
                ) : (
                  <p className="rail-copy">No folio open.</p>
                )}
              </div>

              <div className="desk-notebook-section">
                <div className="desk-notebook-section-head">
                  <span className="section-label">Status</span>
                </div>

                <div className="desk-notebook-meta-board">
                  <div className="desk-notebook-meta-row">
                    <span>Pinned note</span>
                    <strong>{hasPinnedNote ? 'Yes' : 'No'}</strong>
                  </div>
                  <div className="desk-notebook-meta-row">
                    <span>Checklist</span>
                    <strong>{remainingTasks === 0 ? 'Clear' : `${remainingTasks} to do`}</strong>
                  </div>
                  <div className="desk-notebook-meta-row">
                    <span>Notes</span>
                    <strong>{draft.trim() ? 'Has content' : 'Empty'}</strong>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </section>
  )
}
