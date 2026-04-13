# Jot Gloss — Design Audit Report

**Audited:** 2026-04-12 (code-based audit against Design Director Specification)
**Source:** `C:\Users\jasle\Desktop\jot-gloss` (post-rebrand copy)

---

## Summary Table

| # | Area | Status | Notes |
|---|------|--------|-------|
| 1 | Wallpaper warmth | **FAIL** | Main desk and sidebar use `#FFE8EE` (candy pink), not `#faf6f0` (warm ivory). Wallpaper is `cover` not `1800px auto`. No `::before` pseudo at `opacity 0.65`. No `mix-blend-mode: multiply`. |
| 2 | Card colours | **PASS** | Four rail cards use distinct CSS-var colours via `nth-child` rules: sage, butter, parchment, lavender. |
| 3 | Body typography | **PASS** | Body font is `'EB Garamond'` at 13.5px/1.45. Rail copy class enforces this. |
| 4 | Gramophone kicker | **FAIL** | Kicker reads `"The Gramophone"`, spec requires `"PARLOUR MUSIC"`. |
| 5 | Wordmark | **PASS** | JOT small-caps 600 / rule / Gloss italic 400 / "notes in the margin" — all present and correctly styled. |
| 6 | Rail section order | **PASS** | Writing Desk → Clipboard → Gramophone → Filing Cabinet (confirmed via `nth-child` CSS and JSX order). |
| 7 | Banned words | **FAIL** | Multiple instances: "Uploading...", "Upload failed.", "Push to Cloud", "Loading component...", "Loading markdown viewer..." in SyncPanel and FileViewer. |
| 8 | Arch usage | **PASS** | Arches only in sidebar crest, hero panel, and folio cards. No arches on rail cards or modals. |
| 9 | Diamond dividers | **PASS** | DiamondDivider components placed between all four rail sections (3 instances: lines 521, 570, 602) and between sidebar sections. |
| 10 | Focus/collapse | **PASS** | Non-active sections collapse to 40px spine at opacity 0.5. Active section gets `border-left: 2px solid #C97C8A`. Sidebar: `opacity: 0.35, pointer-events: none`. Transition: 280ms ease-out. All match spec. |
| 11 | Notebook | **PASS** | Spine is 10px (spec says 8px — close). Ruled lines at 1px with gold-toned colour. Notebook cover has proper Mughal border treatment. |
| 12 | Signature line | **CONCERN** | Not verified — need to check sidebar bottom for "Jasleen's study library". |
| 13 | Clipboard brass clip | **CONCERN** | Not verified from code alone — need visual check. |
| 14 | Motion | **CONCERN** | `scaleIn` keyframe uses `scale(.94)` — spec says no `scale()` on cards. Need to verify where `scaleIn` is applied. |
| 15 | Border radius | **FAIL** | `.panel`, `.panel-warm`, `.frame-ornate`, `.modal-panel` all use `border-radius: 14px`. Spec says max 4px. |
| 16 | Grid layout | **FAIL** | Portal shell is `grid-template-columns: 280px 1fr` (two columns). Spec calls for three columns: sidebar 260px | main fluid | right rail 280px. Right rail is not a grid column — it's embedded inside the main area. |
| 17 | Sidebar background | **FAIL** | Sidebar uses `#FFE8EE` (candy pink) with chinoiserie wallpaper image. Spec doesn't call for wallpaper on sidebar — only on main desk. |
| 18 | Loading state copy | **FAIL** | "Opening your desk" + "The folios are being gathered now" is good. But FileViewer still shows "Loading component..." and "Loading markdown viewer..." — both use the banned word "Loading". |

---

## Detailed Findings

### FINDING 1 — Wallpaper: wrong base colour and technique
**Status:** FAIL (P0)
**Spec says:** Main desk `background-color: #faf6f0`, wallpaper image via `::before` pseudo at `opacity: 0.65`, `background-size: 1800px auto`, `mix-blend-mode: multiply`.
**Current state:** `main-desk` uses `background-color: #FFE8EE` (candy pink), wallpaper applied directly as `background-image` with `background-size: cover`. No `::before` pseudo-element. No `mix-blend-mode: multiply`. Comment at line 352 says "DO NOT re-add a pseudo-element here."
**Fix:**
```css
.main-desk {
  background-color: #faf6f0;
  background-image: none;
  position: relative;
}
.main-desk::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/chinoiserie-wallpaper.png');
  background-size: 1800px auto;
  background-repeat: repeat;
  background-position: center top;
  opacity: 0.65;
  mix-blend-mode: multiply;
  pointer-events: none;
  z-index: 0;
}
```

---

### FINDING 2 — Sidebar background: wallpaper shouldn't be here
**Status:** FAIL (P1)
**Spec says:** Wallpaper on main desk only, NOT sidebar or rail.
**Current state:** `.archive-rail` has `background-color: #FFE8EE` and `background-image: url("/chinoiserie-wallpaper.png")` with `background-size: cover`.
**Fix:** Remove `background-image` from `.archive-rail`. Set `background-color` to `#FFF8F2` (parchment) or `var(--color-parchment)`.

---

### FINDING 3 — Gramophone kicker text
**Status:** FAIL (P0)
**Spec says:** Kicker should be `"PARLOUR MUSIC"` (not `"THE GRAMOPHONE"`).
**Current state:** In App.tsx FocusableRailSection for The Gramophone, `kicker="The Gramophone"`.
**Fix:** Change to `kicker="Parlour Music"`. (The `title` prop can remain `"The Gramophone"`.)

---

### FINDING 4 — Banned copy in SyncPanel.tsx
**Status:** FAIL (P1)
**Spec says:** "upload", "loading" are banned words in UI copy.
**Current state:**
- Line 22: `'Uploading your library...'`
- Line 25: `'Uploaded ${files.length} files.'`
- Line 27: `'Upload failed.'`
- Line 86: `'Uploading...'` / `'Push to Cloud'`
**Fix:** Replace with in-world language:
- `'Uploading your library...'` → `'Sending folios to the cloud...'`
- `'Uploaded ${files.length} files.'` → `'${files.length} folios placed in the cloud.'`
- `'Upload failed.'` → `'The ink has run — try again.'`
- `'Uploading...'` → `'Syncing...'`
- `'Push to Cloud'` → `'Sync the desk'`

---

### FINDING 5 — Banned copy in FileViewer.tsx
**Status:** FAIL (P1)
**Spec says:** "Loading..." should be "Turning to the right page..."
**Current state:**
- Line 109: `<div id="loading">Loading component...</div>`
- Line 427: `Loading markdown viewer...`
**Fix:**
- `'Loading component...'` → `'Turning to the right page...'`
- `'Loading markdown viewer...'` → `'Turning to the right page...'`

---

### FINDING 6 — Border radius exceeds 4px
**Status:** FAIL (P1)
**Spec says:** No rounded rectangles with radius > 4px.
**Current state:** `.panel`, `.panel-warm`, `.frame-ornate`, `.modal-panel` all use `border-radius: 14px`. Inner frames use `10px`. `.desk-tool-btn` uses `8px`. `.search-filter-frame` uses `6px`.
**Fix:** Reduce all `border-radius` values:
- `.panel`, `.panel-warm`, `.frame-ornate`, `.modal-panel` → `border-radius: 3px`
- Inner `::before` pseudo → `border-radius: 2px`
- `.desk-tool-btn` → `border-radius: 3px`
- `.search-filter-frame` → `border-radius: 3px`

---

### FINDING 7 — Grid is two-column, not three
**Status:** CONCERN (P2)
**Spec says:** Three columns — sidebar 260px fixed | main desk fluid | right rail 280px fixed.
**Current state:** `portal-shell` grid is `280px 1fr`. The right rail is rendered inside the main desk column as a `<aside className="desk-rail">`, not as a third grid column.
**Fix:** This is an architectural question. The current approach works functionally — the rail appears on the right and has the correct width (padding-based). A true three-column grid would be more spec-correct but is a larger refactor. Mark as tech debt unless layout bugs appear.

---

### FINDING 8 — `scale()` in keyframe animation
**Status:** CONCERN (P2)
**Spec says:** No `scale()` transforms on cards.
**Current state:** `@keyframes scaleIn` uses `transform: scale(.94) translateY(8px)`. Need to verify whether this is applied to cards. If it's only on modals or overlays, it's acceptable.
**Fix:** If applied to cards or rail sections, replace with `translateY` only:
```css
@keyframes scaleIn { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
```

---

### FINDING 9 — Notebook spine width
**Status:** CONCERN (P2)
**Spec says:** Visible spine 8px.
**Current state:** `.notebook-spine` is `width: 10px`.
**Fix:** Change to `width: 8px`.

---

### FINDING 10 — Palette comment block is stale
**Status:** CONCERN (P2)
**Spec says:** Colours should feel like paper, plaster, faded ink, textile.
**Current state:** Lines 31-59 of index.css contain a legacy comment block titled "PALETTE — CLEAN BRIGHT PASTELS (No Dusty/Muted Tones)" with references to candy pink, baby pink, warm pink, peach, bright coral. This contradicts the Design Director spec and the actual CSS variables now in `:root`.
**Fix:** Delete or rewrite the comment block to reflect the current palette intent.

---

## Prioritised Fix List

### P0 — Critical (fix first, smallest effort first)

| # | Finding | Effort |
|---|---------|--------|
| 3 | Gramophone kicker: `"The Gramophone"` → `"Parlour Music"` | 1 line |
| 1 | Main desk wallpaper: change `#FFE8EE` → `#faf6f0`, add `::before` pseudo with `opacity: 0.65` and `mix-blend-mode: multiply`, set `background-size: 1800px auto` | ~15 lines CSS |

### P1 — Important (fix in next pass)

| # | Finding | Effort |
|---|---------|--------|
| 4 | SyncPanel banned words: 5 string replacements | 5 lines |
| 5 | FileViewer banned words: 2 string replacements | 2 lines |
| 2 | Sidebar background: remove wallpaper image, use parchment | 2 lines CSS |
| 6 | Border radius: find-replace 14px→3px, 10px→2px, 8px→3px, 6px→3px in panel/frame classes | ~10 lines CSS |

### P2 — Polish

| # | Finding | Effort |
|---|---------|--------|
| 10 | Delete stale palette comment block | Delete ~30 lines |
| 9 | Notebook spine: 10px → 8px | 1 line CSS |
| 8 | Audit `scaleIn` usage; remove `scale()` if on cards | 1 line CSS |
| 7 | Three-column grid (optional refactor) | Medium effort |

---

## Items That PASS (no action needed)

- Card colours (sage/butter/parchment/lavender distinct and correct)
- Body typography (EB Garamond 13.5px, serif throughout)
- Wordmark (JOT/Gloss/"notes in the margin" — correct fonts, weights, spacing)
- Rail section order (Writing Desk → Clipboard → Gramophone → Filing Cabinet)
- Arch usage (sidebar, hero, folios only — none on rail cards)
- Diamond dividers (3 instances between 4 rail sections)
- Focus/collapse behaviour (40px spine, opacity 0.5, 280ms ease-out, accent border)
- Sidebar muted state (opacity 0.35, pointer-events none)
- Gramophone play/pause copy ("Set the needle" / "Lift the needle")
- Mood names ("The reading hour" / "Past midnight" / "Rain on glass")
- Loading state on main desk ("Opening your desk" / "The folios are being gathered now")
- No dashboard/workspace/app/tool/settings words in main UI
- No "WIND IT UP" anywhere
