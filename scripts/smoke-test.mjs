import { chromium } from 'playwright-core'

const baseUrl = process.env.STUDYBLOOM_BASE_URL || 'http://127.0.0.1:4173'
const executablePath = process.env.STUDYBLOOM_BROWSER || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

const sampleResponse = `Here is your study tool.

\`\`\`jsx
function StrategyFlashcards() {
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h2>Strategy Flashcards</h2>
      <p>Five forces, positioning, and competitive advantage.</p>
    </div>
  )
}
\`\`\`
`

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const browser = await chromium.launch({ executablePath, headless: true })
const context = await browser.newContext()
const page = await context.newPage()
const pageErrors = []
const consoleErrors = []

page.on('pageerror', error => pageErrors.push(error.message))
page.on('console', message => {
  if (message.type() === 'error') consoleErrors.push(message.text())
})

try {
  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  await page.getByText('StudyBloom').waitFor()

  const pasteButton = page.getByRole('button', { name: /paste from claude/i })
  await pasteButton.click()

  const textarea = page.getByPlaceholder(/Paste your JSX component/i)
  await textarea.fill(sampleResponse)
  await page.getByRole('button', { name: /Save to Library/i }).click()

  await page.getByText(/Saved to library!/i).waitFor({ timeout: 5000 })
  await page.waitForTimeout(1700)

  await textarea.fill(sampleResponse)
  await page.getByRole('button', { name: /Save to Library/i }).click()

  await page.getByText(/Saving it as a new version keeps the lineage visible/i).waitFor({ timeout: 5000 })
  await page.getByRole('button', { name: /Archive old versions/i }).click()

  await page.getByText('strategy-flashcards.jsx').first().waitFor({ timeout: 5000 })
  await page.getByText(/1 in archive/i).waitFor({ timeout: 5000 })

  await page.getByText('strategy-flashcards.jsx').first().click()
  await page.getByText('Version History').waitFor({ timeout: 5000 })
  await page.getByText(/2 saved versions in this lineage/i).waitFor({ timeout: 5000 })
  await page.getByText(/Quick Add/i).waitFor({ timeout: 5000 })

  assert(pageErrors.length === 0, `Page errors detected: ${pageErrors.join(' | ')}`)
  assert(consoleErrors.length === 0, `Console errors detected: ${consoleErrors.join(' | ')}`)

  console.log('Smoke test passed')
} finally {
  await browser.close()
}
