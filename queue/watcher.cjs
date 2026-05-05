const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const QUEUE_DIR = path.resolve(__dirname);
const STAGING = path.join(QUEUE_DIR, 'staging.txt');
const TARGET  = path.join(QUEUE_DIR, 'target.txt');
const OUTPUT  = path.join(QUEUE_DIR, 'next-task.txt');
const SIGFILE = path.join(QUEUE_DIR, 'next-task.sig');

let debounceTimer = null;

function log(msg) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${msg}`);
}

/**
 * Sign the task content with HMAC-SHA256 keyed by JOTGLOSS_QUEUE_SECRET so
 * autopaste.ps1 can verify the file came from this watcher and was not
 * tampered with on disk. Refuse to emit a task without a key — running the
 * pipeline keyless is how prompt-injection content reaches the agent.
 */
function processStaging() {
  try {
    const secret = process.env.JOTGLOSS_QUEUE_SECRET;
    if (!secret || secret.length < 16) {
      log('REFUSING: set JOTGLOSS_QUEUE_SECRET (min 16 chars) before running the watcher.');
      return;
    }

    let target = 'codex';
    try {
      target = fs.readFileSync(TARGET, 'utf8').trim() || 'codex';
    } catch (_) {
      log('target.txt not found — defaulting to "codex"');
    }

    let staging;
    try {
      staging = fs.readFileSync(STAGING, 'utf8');
    } catch (_) {
      log('staging.txt read error — skipping');
      return;
    }

    if (!staging.trim()) {
      log('staging.txt is empty — skipping');
      return;
    }

    const content = `TARGET: ${target}\n\n${staging}`;
    fs.writeFileSync(OUTPUT, content, { encoding: 'utf8' });

    const sig = crypto.createHmac('sha256', secret).update(content, 'utf8').digest('hex');
    fs.writeFileSync(SIGFILE, sig, { encoding: 'utf8' });

    log(`Wrote next-task.txt (${content.length} chars) and next-task.sig`);
  } catch (err) {
    log(`ERROR: ${err.message}`);
  }
}

log('Watcher started — monitoring staging.txt');
log(`Queue dir: ${QUEUE_DIR}`);
if (!process.env.JOTGLOSS_QUEUE_SECRET) {
  log('WARNING: JOTGLOSS_QUEUE_SECRET is not set. The watcher will refuse to sign tasks.');
}

fs.watch(QUEUE_DIR, (eventType, filename) => {
  if (filename !== 'staging.txt') return;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    log(`staging.txt changed (${eventType})`);
    processStaging();
  }, 300);
});
