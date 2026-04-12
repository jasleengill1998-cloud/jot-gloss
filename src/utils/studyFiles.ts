import type { StudyFile } from '../types'

export function getBaseName(name: string): string {
  return name
    .replace(/\s*\(?\d+\)?\s*(?=\.\w+$)/, '')
    .replace(/[-_]v?\d+(?=\.\w+$)/i, '')
    .trim()
}

export function getLineageKey(file: Pick<StudyFile, 'name' | 'canonicalName' | 'lineageId'>): string {
  return (file.lineageId || file.canonicalName || getBaseName(file.name)).toLowerCase()
}

export function compareFilesByVersion(a: StudyFile, b: StudyFile): number {
  if (a.version !== b.version) return b.version - a.version
  return b.updatedAt - a.updatedAt
}

export function getVersionGroup(files: StudyFile[], target: StudyFile): StudyFile[] {
  const lineageKey = getLineageKey(target)
  return files
    .filter(file => getLineageKey(file) === lineageKey)
    .sort(compareFilesByVersion)
}

export function getVersionSummary(files: StudyFile[], target: StudyFile) {
  const versions = getVersionGroup(files, target)
  const archivedCount = versions.filter(file => file.archived).length

  return {
    versions,
    total: versions.length,
    archivedCount,
    activeCount: versions.length - archivedCount,
    latestVersion: versions[0]?.version ?? target.version,
  }
}
