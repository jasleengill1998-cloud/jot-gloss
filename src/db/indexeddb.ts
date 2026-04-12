import { openDB, type IDBPDatabase } from 'idb'
import type { StudyFile } from '../types'

const DB_NAME = 'studybloom-db'
const DB_VERSION = 1
const STORE = 'files'

let dbPromise: Promise<IDBPDatabase> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' })
        store.createIndex('name', 'name')
        store.createIndex('className', 'className')
        store.createIndex('resourceType', 'resourceType')
        store.createIndex('type', 'type')
        store.createIndex('archived', 'archived')
        store.createIndex('updatedAt', 'updatedAt')
      },
    })
  }
  return dbPromise
}

export async function getAllFiles(): Promise<StudyFile[]> {
  const db = await getDB()
  return db.getAll(STORE)
}

export async function getFile(id: string): Promise<StudyFile | undefined> {
  const db = await getDB()
  return db.get(STORE, id)
}

export async function putFile(file: StudyFile): Promise<void> {
  const db = await getDB()
  await db.put(STORE, file)
}

export async function replaceAllFiles(files: StudyFile[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(STORE, 'readwrite')
  await tx.store.clear()
  for (const file of files) {
    await tx.store.put(file)
  }
  await tx.done
}

export async function deleteFile(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE, id)
}

export async function getFilesByName(name: string): Promise<StudyFile[]> {
  const db = await getDB()
  return db.getAllFromIndex(STORE, 'name', name)
}

export async function archiveByName(name: string): Promise<void> {
  const db = await getDB()
  const matches = await db.getAllFromIndex(STORE, 'name', name)
  const tx = db.transaction(STORE, 'readwrite')
  for (const file of matches) {
    file.archived = true
    file.updatedAt = Date.now()
    await tx.store.put(file)
  }
  await tx.done
}