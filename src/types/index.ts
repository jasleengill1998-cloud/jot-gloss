export type FileType = 'jsx' | 'html' | 'pdf' | 'markdown' | 'other'
export type StudySource = 'upload' | 'clipboard' | 'quick-add' | 'cloud-sync' | 'sample'

export interface StudyFile {
  id: string
  name: string
  type: FileType
  content: string            // base64 data URL for PDF/other, raw text for jsx/html/md
  className: string
  resourceType: string
  version: number
  archived: boolean
  createdAt: number
  updatedAt: number
  size: number
  canonicalName?: string
  lineageId?: string
  source?: StudySource
  viewerState?: Record<string, unknown>
}

export type SortField = 'name' | 'updatedAt' | 'createdAt' | 'size' | 'type' | 'className' | 'resourceType'
export type SortDir = 'asc' | 'desc'

export interface Filters {
  search: string
  className: string
  resourceType: string
  fileType: FileType | ''
  tab: 'library' | 'archive'
}

export type DuplicateAction = 'replace' | 'archive' | 'keep-both' | 'skip'

export const DEFAULT_CLASSES = [
  'MBAS 832 — Strategy',
  'MBAS 811 — Financial Accounting',
  'MBAS 801 — Economics',
  'General',
]

export const RESOURCE_TYPES = [
  'Interactive Study',
  'Notes',
  'Cheat Sheet',
  'Practice Problems',
  'Lecture Slides',
  'Reference',
  'Other',
]
