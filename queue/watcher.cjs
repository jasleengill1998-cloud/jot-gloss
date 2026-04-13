const fs = require('fs');
const path = require('path');

const QUEUE_DIR = path.resolve(__dirname);
const STAGING = path.join(QUEUE_DIR, 'staging.txt');
const TARGET  = path.join(QUEUE_DIR, 'target.txt');
const OUTPUT  = path.join(QUEUE_DIR, 'next-task.txt');

let debounceTimer = null;

function log(msg) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${msg}`);
}

function processStaging() {
  try {
    // Read target — default to "codex"
    let target = 'codex';
    try {
      target = fs.readFileSync(TARGET, 'utf8').trim() || 'codex';
    } catch (e) {
      log('target.txt not found — defaulting to "codex"');
    }

    // Read staging
    let staging;
    try {
      staging = fs.readFileSync(STAGING, 'utf8');
    } catch (e) {
      log('staging.txt read error — skipping');
      return;
    }

    if (!staging.trim()) {
      log('staging.txt is empty — skipping');
      return;
    }

    // Build output: TARGET line, blank line, then staging content
    const content = `TARGET: ${target}\n\n${staging}`;

    // Write UTF-8, no BOM
    fs.writeFileSync(OUTPUT, content, { encoding: 'utf8' });

    log(`Wrote next-task.txt | target="${target}" | ${content.length} chars`);
  } catch (err) {
    log(`ERROR: ${err.message}`);
  }
}

// Watch the queue folder for changes to staging.txt
log('Watcher started — monitoring staging.txt');
log(`Queue dir: ${QUEUE_DIR}`);

fs.watch(QUEUE_DIR, (eventType, filename) => {
  if (filename !== 'staging.txt') return;

  // Debounce 300ms
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    log(`staging.txt changed (${eventType})`);
    processStaging();
  }, 300);
});
