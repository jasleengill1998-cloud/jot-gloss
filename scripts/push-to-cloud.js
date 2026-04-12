#!/usr/bin/env node
/**
 * push-to-cloud.js
 *
 * Pushes a generated study file to StudyBloom's Vercel Blob cloud storage.
 * Usage:
 *   node scripts/push-to-cloud.js \
 *     --name "mbas801_flashcards_elasticity.jsx" \
 *     --type "jsx" \
 *     --class "MBAS 801 — Economics" \
 *     --resource "Interactive Study" \
 *     --file "generated/mbas801_flashcards_elasticity.jsx"
 *
 * Requires: STUDYBLOOM_URL env var (defaults to deployed Vercel URL)
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

// ── Parse CLI args ──────────────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2)
  const parsed = {}
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '')
    parsed[key] = args[i + 1]
  }
  return parsed
}

const args = parseArgs()

if (!args.name || !args.file) {
  console.error('Usage: node push-to-cloud.js --name <filename> --type <jsx|markdown|html> --class <className> --resource <resourceType> --file <path>')
  process.exit(1)
}

// ── Config ──────────────────────────────────────────────────────────────────
const SYNC_URL = process.env.STUDYBLOOM_URL || 'https://studybloom-gamma.vercel.app'
const API = `${SYNC_URL}/api/sync`

// ── Read file content ───────────────────────────────────────────────────────
const filePath = path.resolve(args.file)
if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`)
  process.exit(1)
}
const content = fs.readFileSync(filePath, 'utf-8')
const fileName = args.name
const fileType = args.type || (fileName.endsWith('.md') ? 'markdown' : fileName.endsWith('.html') ? 'html' : 'jsx')
const className = args.class || 'General'
const resourceType = args.resource || 'Interactive Study'

// ── Build StudyFile object ──────────────────────────────────────────────────
const now = Date.now()
const id = crypto.randomUUID()
const canonicalName = fileName.replace(/\.\w+$/, '')

const newFile = {
  id,
  name: fileName,
  type: fileType,
  content,
  className,
  resourceType,
  version: 1,
  archived: false,
  createdAt: now,
  updatedAt: now,
  size: content.length,
  canonicalName,
  lineageId: id,
  source: 'cloud-sync',
}

// ── Pull → Merge → Push ────────────────────────────────────────────────────
async function main() {
  console.log(`\n  Pushing "${fileName}" to StudyBloom cloud...`)
  console.log(`  Class: ${className}`)
  console.log(`  Type: ${resourceType}`)
  console.log(`  Size: ${content.length} chars\n`)

  // 1. Pull current files
  let existing = []
  try {
    const res = await fetch(API)
    if (res.ok) {
      const data = await res.json()
      existing = data.files || []
      console.log(`  Found ${existing.length} existing files in cloud.`)
    }
  } catch (err) {
    console.log('  No existing cloud data (first push). Starting fresh.')
  }

  // 2. Check for duplicate by name
  const dupIndex = existing.findIndex(f => f.name === fileName)
  if (dupIndex !== -1) {
    console.log(`  Updating existing file "${fileName}" (replacing old version).`)
    existing[dupIndex] = { ...existing[dupIndex], ...newFile, id: existing[dupIndex].id, version: existing[dupIndex].version + 1, lineageId: existing[dupIndex].lineageId }
  } else {
    existing.push(newFile)
  }

  // 3. Push merged list
  const payload = { files: existing, updatedAt: now }
  const pushRes = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!pushRes.ok) {
    const err = await pushRes.text()
    console.error(`  Push failed: ${err}`)
    process.exit(1)
  }

  const result = await pushRes.json()
  console.log(`  Done! File pushed at ${new Date(result.updatedAt).toLocaleTimeString()}.`)
  console.log(`  Hit "Refresh & Sync" in StudyBloom to see it.\n`)
}

main().catch(err => {
  console.error('Push failed:', err.message)
  process.exit(1)
})
