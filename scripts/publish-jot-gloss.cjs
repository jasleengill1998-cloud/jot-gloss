const fetch = require('node-fetch')
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

function requireEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function safeParseJson(text) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

async function createGitHubRepo(token, repoName) {
  console.log(`Creating private GitHub repository "${repoName}"...`)

  const response = await fetch('https://api.github.com/user/repos', {
    method: 'POST',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: repoName,
      private: true,
    }),
  })

  const rawBody = await response.text()
  const data = safeParseJson(rawBody) || {}

  if (response.status !== 201) {
    const message = typeof data.message === 'string' ? data.message : rawBody || 'Unknown error'
    throw new Error(`GitHub repository creation failed (${response.status}): ${message}`)
  }

  const cloneUrl = data.clone_url

  if (typeof cloneUrl !== 'string' || !cloneUrl) {
    throw new Error('GitHub repository was created, but clone_url was missing from the response.')
  }

  console.log('Repository created successfully.')
  return cloneUrl
}

function runGit(command, cwd, label) {
  console.log(label)
  execSync(command, {
    cwd,
    stdio: 'inherit',
  })
}

function readGit(command, cwd) {
  return execSync(command, {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
  }).trim()
}

function remoteUrlWithToken(cloneUrl, token) {
  const encodedToken = encodeURIComponent(token)
  return cloneUrl.replace('https://', `https://${encodedToken}@`)
}

function configureAndPushGitRepo(localDir, remoteUrl) {
  console.log(`Preparing local Git repository in ${localDir}...`)

  runGit('git init', localDir, 'Initialized Git repository.')
  runGit('git add .', localDir, 'Staged project files.')
  if (readGit('git status --porcelain', localDir)) {
    runGit('git commit -m "Initial commit"', localDir, 'Created initial commit.')
  } else {
    console.log('Initial commit skipped because there were no staged changes.')
  }

  try {
    runGit(`git remote add origin "${remoteUrl}"`, localDir, 'Configured origin remote.')
  } catch {
    runGit(`git remote set-url origin "${remoteUrl}"`, localDir, 'Updated existing origin remote.')
  }

  runGit('git branch -M main', localDir, 'Ensured branch is named main.')
  runGit('git push -u origin main', localDir, 'Pushed initial commit to GitHub.')
  console.log('Initial push completed.')
}

function isComponentFile(filePath) {
  return filePath.endsWith('.jsx') || filePath.endsWith('.tsx')
}

function collectComponentFiles(rootDir) {
  const files = []

  function walk(currentDir) {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const fullPath = path.join(currentDir, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
      } else if (entry.isFile() && isComponentFile(fullPath)) {
        files.push(fullPath)
      }
    }
  }

  walk(rootDir)
  return files
}

function rewriteVisibleText(content) {
  let changed = false

  const replaceBranding = (text) => {
    let next = text.replace(/StudyBloom|Study Bloom/g, 'Jot Gloss')
    next = next.replace(/\bSB\b/g, 'JG')
    if (next !== text) {
      changed = true
    }
    return next
  }

  let updated = content.replace(/>([^<]*)</g, (full, text) => `>${replaceBranding(text)}<`)

  updated = updated.replace(
    /\b(aria-label|title|placeholder|alt)\s*=\s*"([^"]*)"/g,
    (full, attr, value) => `${attr}="${replaceBranding(value)}"`,
  )

  updated = updated.replace(
    /\b(aria-label|title|placeholder|alt)\s*=\s*'([^']*)'/g,
    (full, attr, value) => `${attr}='${replaceBranding(value)}'`,
  )

  updated = updated.replace(
    /\b(aria-label|title|placeholder|alt)\s*=\s*\{"([^"]*)"\}/g,
    (full, attr, value) => `${attr}={"${replaceBranding(value)}"}`,
  )

  return { updated, changed }
}

function rewriteBrandingInSrc(localDir) {
  const srcDir = path.join(localDir, 'src')

  if (!fs.existsSync(srcDir)) {
    throw new Error(`Could not find src directory at ${srcDir}`)
  }

  console.log(`Rewriting visible branding in ${srcDir}...`)

  let changedFiles = 0

  for (const filePath of collectComponentFiles(srcDir)) {
    const original = fs.readFileSync(filePath, 'utf8')
    const { updated, changed } = rewriteVisibleText(original)
    if (!changed || updated === original) {
      continue
    }

    fs.writeFileSync(filePath, updated, 'utf8')
    changedFiles += 1
  }

  console.log(`Branding replacements completed in ${changedFiles} file(s).`)
}

function commitAndPushBranding(localDir) {
  if (!readGit('git status --porcelain -- src', localDir)) {
    console.log('No branding changes were detected, so the rename commit was skipped.')
    return
  }

  runGit('git commit -am "Rename StudyBloom to Jot Gloss"', localDir, 'Committed branding updates.')
  runGit('git push', localDir, 'Pushed branding updates to main.')
  console.log('Branding changes pushed successfully.')
}

async function main() {
  try {
    const token = requireEnv('GITHUB_TOKEN')
    const repoName = requireEnv('REPO_NAME')
    const localDir = requireEnv('LOCAL_DIR')

    if (!fs.existsSync(localDir)) {
      throw new Error(`LOCAL_DIR does not exist: ${localDir}`)
    }

    const cloneUrl = await createGitHubRepo(token, repoName)
    const authRemoteUrl = remoteUrlWithToken(cloneUrl, token)

    configureAndPushGitRepo(localDir, authRemoteUrl)
    rewriteBrandingInSrc(localDir)
    commitAndPushBranding(localDir)

    console.log('All steps completed successfully.')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`Error: ${message}`)
    process.exitCode = 1
  }
}

main()
