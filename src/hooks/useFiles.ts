import { useState, useEffect, useCallback } from 'react'
import type { StudyFile, FileType, DuplicateAction, StudySource } from '../types'
import * as db from '../db/indexeddb'
import { SAMPLE_FILES, SAMPLE_VERSION } from '../db/sample-data'

const SAMPLE_VERSION_KEY = 'jg-sample-version'
import { getBaseName } from '../utils/studyFiles'
import { useSync } from './useSync'

function detectFileType(name: string): FileType {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'jsx' || ext === 'tsx') return 'jsx'
  if (ext === 'html' || ext === 'htm') return 'html'
  if (ext === 'pdf') return 'pdf'
  if (ext === 'md' || ext === 'mdx' || ext === 'markdown' || ext === 'txt') return 'markdown'
  return 'other'
}

/** Detect type from content when filename gives no clue */
function detectTypeFromContent(content: string): FileType {
  if (/React\.createElement|function\s+[A-Z]\w*\s*\(|const\s+[A-Z]\w*\s*=\s*\(/.test(content)) return 'jsx'
  if (/<[A-Z][a-zA-Z]*[\s/>]/.test(content) || /return\s*\(?\s*</.test(content)) return 'jsx'
  if (/^\s*<!doctype\s+html|^\s*<html/i.test(content)) return 'html'
  if (/^#\s|\n##\s|\*\*.*\*\*|\[.*\]\(.*\)/.test(content)) return 'markdown'
  return 'other'
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function useFiles() {
  const [files, setFiles] = useState<StudyFile[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const all = await db.getAllFiles()
    setFiles(all)
    setLoading(false)
  }, [])

  // ── Cloud sync integration ────────────────────────────────────────────────
  const sync = useSync(refresh)

  useEffect(() => {
    ;(async () => {
      const all = await db.getAllFiles()
      const storedVersion = Number(localStorage.getItem(SAMPLE_VERSION_KEY) || '0')
      const needsReseed = storedVersion < SAMPLE_VERSION

      if (all.length === 0) {
        for (const sample of SAMPLE_FILES) {
          await db.putFile({ ...sample, createdAt: Date.now(), updatedAt: Date.now() })
        }
      } else {
        const existingIds = new Set(all.map(f => f.id))
        for (const sample of SAMPLE_FILES) {
          if (!existingIds.has(sample.id) || needsReseed) {
            await db.putFile({ ...sample, createdAt: Date.now(), updatedAt: Date.now() })
          }
        }
      }

      localStorage.setItem(SAMPLE_VERSION_KEY, String(SAMPLE_VERSION))
      await refresh()
    })()
  }, [refresh])

  const findDuplicates = useCallback(async (name: string): Promise<StudyFile[]> => {
    const base = getBaseName(name)
    const all = await db.getAllFiles()
    return all.filter(file => !file.archived && getBaseName(file.name) === base)
  }, [])

  const addFile = useCallback(async (
    rawFile: File,
    className: string,
    resourceType: string,
    duplicateAction?: DuplicateAction,
    source: StudySource = 'upload',
  ) => {
    let type = detectFileType(rawFile.name)
    const existing = await findDuplicates(rawFile.name)

    if (existing.length > 0 && duplicateAction) {
      if (duplicateAction === 'skip') return null
      if (duplicateAction === 'replace') {
        for (const file of existing) {
          await db.deleteFile(file.id)
          sync.pushDelete(file.id)
        }
      }
      if (duplicateAction === 'archive') {
        for (const file of existing) {
          file.archived = true
          file.updatedAt = Date.now()
          await db.putFile(file)
          sync.pushFile(file)
        }
      }
    }

    const lineageSeed = existing[0]
    const version = existing.length > 0 ? Math.max(...existing.map(file => file.version || 1)) + 1 : 1
    const lineageId = lineageSeed?.lineageId || lineageSeed?.id || generateId()
    const canonicalName = lineageSeed?.canonicalName || getBaseName(rawFile.name)

    let content: string
    if (type === 'pdf') {
      content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(rawFile)
      })
    } else if (type === 'other') {
      const text = await rawFile.text()
      const detected = detectTypeFromContent(text)
      if (detected !== 'other') {
        type = detected
        content = text
      } else {
        content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(rawFile)
        })
      }
    } else {
      content = await rawFile.text()
    }

    const file: StudyFile = {
      id: generateId(),
      name: rawFile.name,
      type,
      content,
      className: className || 'General',
      resourceType: resourceType || 'Other',
      version,
      archived: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      size: rawFile.size,
      canonicalName,
      lineageId,
      source,
    }

    await db.putFile(file)
    sync.pushFile(file)
    await refresh()
    return file
  }, [refresh, findDuplicates, sync])

  const updateFile = useCallback(async (id: string, updates: Partial<StudyFile>) => {
    const file = await db.getFile(id)
    if (file) {
      Object.assign(file, updates, { updatedAt: Date.now() })
      await db.putFile(file)
      sync.pushFile(file)
      await refresh()
    }
  }, [refresh, sync])

  const removeFile = useCallback(async (id: string) => {
    await db.deleteFile(id)
    sync.pushDelete(id)
    await refresh()
  }, [refresh, sync])

  const replaceAllFiles = useCallback(async (newFiles: StudyFile[]) => {
    await db.replaceAllFiles(newFiles)
    await refresh()
  }, [refresh])

  return {
    files,
    loading,
    addFile,
    updateFile,
    removeFile,
    findDuplicates,
    refresh,
    replaceAllFiles,
    sync,
  }
}