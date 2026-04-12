---

## Mandatory self-audit after every file change

After editing any file, before reporting completion, you must run 
this checklist against the changed file and report results inline. 
Do not skip this even if the build passes.

### 1. Banned copy check
Search the changed file for these strings. If any are found, fix them 
before reporting done — do not ask for confirmation first:
- "dashboard", "workspace", "app" (as noun), "tool" (as noun)
- "upload", "delete", "settings", "loading"
- "set aside", "reading folio", "desk markers", "rail slip"
- "kept close by", "study journal" (as heading)
- "remove from rail", "update rail slip"
- Any string not in the copy mapping table above

### 2. Raw pixel check
Search for any padding:, margin:, or gap: value that is not using 
var(--space-*). If found, replace with the correct token before reporting.

### 3. Object budget check
Check that no new visual metaphor was introduced outside this list:
room, arch panels, notebook, clipboard, filing cabinet, gramophone, 
sticky notes, to-dos.
If anything new was added, remove it before reporting.

### 4. Border radius check
No border-radius value greater than 4px on any card element.
If found, reduce to 4px before reporting.

### 5. Z-index check
No card or rail section component should have z-index above 399.
No floating element should be below z-index 500.

### 6. Report format
After every task, report in this exact format:

FILE CHANGED: [filename]
BUILD: pass / fail
BANNED COPY: none found / [list any found and fixed]
RAW PX: none found / [list any found and fixed]
OBJECT BUDGET: no violations / [list any found and fixed]
BORDER RADIUS: no violations / [list any found and fixed]
READY FOR CONFIRMATION: yes / no — [reason if no]

Do not say "ready for confirmation" until all 5 checks are clean.

Run npm run build to confirm. Then show the report.
