import type { StudyFile, Filters, SortField, SortDir, FileType } from '../types'
import { RESOURCE_TYPES } from '../types'

interface Props {
  files: StudyFile[]
  classes: string[]
  filters: Filters
  sortField: SortField
  sortDir: SortDir
  onFiltersChange: (f: Filters) => void
  onSortChange: (field: SortField, dir: SortDir) => void
}

export default function FilterBar({
  files, classes, filters, sortField, sortDir, onFiltersChange, onSortChange,
}: Props) {
  const set = (patch: Partial<Filters>) => onFiltersChange({ ...filters, ...patch })

  // Only show resource types that exist in current files
  const usedTypes = [...new Set(files.map(f => f.resourceType))].sort()

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 py-4 font-body">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
             width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C88898" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <label htmlFor="sb-search" className="sr-only">Search files</label>
        <input
          id="sb-search"
          type="search"
          placeholder="Look through the archive..."
          value={filters.search}
          onChange={e => set({ search: e.target.value })}
          className="w-full input-warm"
          style={{ paddingLeft: 36, paddingRight: 12, paddingTop: 8, paddingBottom: 8, fontSize: 13 }}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select
          value={filters.className}
          onChange={e => set({ className: e.target.value })}
          className="input-warm"
          aria-label="Filter by class"
          style={{ padding: '8px 12px', fontSize: 13, cursor: 'pointer', minHeight: 44 }}
        >
          <option value="">All Classes</option>
          {classes.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={filters.resourceType}
          onChange={e => set({ resourceType: e.target.value })}
          className="input-warm"
          aria-label="Filter by resource type"
          style={{ padding: '8px 12px', fontSize: 13, cursor: 'pointer', minHeight: 44 }}
        >
          <option value="">All Types</option>
          {(filters.tab === 'library' ? usedTypes : RESOURCE_TYPES).map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          value={filters.fileType}
          onChange={e => set({ fileType: e.target.value as FileType | '' })}
          className="input-warm"
          aria-label="Filter by format"
          style={{ padding: '8px 12px', fontSize: 13, cursor: 'pointer', minHeight: 44 }}
        >
          <option value="">All Formats</option>
          <option value="jsx">JSX</option>
          <option value="html">HTML</option>
          <option value="pdf">PDF</option>
          <option value="markdown">Markdown</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Sort */}
      <div className="flex gap-1.5 items-center ml-auto">
        <select
          value={sortField}
          onChange={e => onSortChange(e.target.value as SortField, sortDir)}
          className="input-warm"
          aria-label="Sort by"
          style={{ padding: '8px 8px', fontSize: 11, cursor: 'pointer', minHeight: 44 }}
        >
          <option value="updatedAt">Modified</option>
          <option value="createdAt">Created</option>
          <option value="name">Name</option>
          <option value="className">Course</option>
          <option value="resourceType">Type</option>
          <option value="size">Size</option>
          <option value="type">Format</option>
        </select>
        <button
          onClick={() => onSortChange(sortField, sortDir === 'asc' ? 'desc' : 'asc')}
          className="input-warm"
          aria-label={sortDir === 'asc' ? 'Sort ascending' : 'Sort descending'}
          style={{ padding: '8px 10px', fontSize: 13, cursor: 'pointer', color: '#C88898', minHeight: 44, minWidth: 44 }}
          title={sortDir === 'asc' ? 'Ascending' : 'Descending'}
        >
          {sortDir === 'asc' ? '\u25b4' : '\u25be'}
        </button>
      </div>
    </div>
  )
}
