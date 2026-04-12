# Jot Gloss - Design Handoff Spec

## Status

- This document defines the target design system for the StudyBloom to Jot Gloss rebrand.
- User-facing copy should move toward `Jot Gloss` / `JG`, but the live codebase still uses `studybloom` in component names, storage keys, IndexedDB names, and helper constants. Treat those implementation names as compatibility debt until a dedicated rename migration lands.
- This handoff is grounded in the current app structure, especially [src/App.tsx](C:/Users/jasle/OneDrive/Desktop/experimenting/studybloom/src/App.tsx), [src/index.css](C:/Users/jasle/OneDrive/Desktop/experimenting/studybloom/src/index.css), [src/components/ArchNiche.tsx](C:/Users/jasle/OneDrive/Desktop/experimenting/studybloom/src/components/ArchNiche.tsx), [src/components/UtilityBookplate.tsx](C:/Users/jasle/OneDrive/Desktop/experimenting/studybloom/src/components/UtilityBookplate.tsx), [src/components/DeskNotebook.tsx](C:/Users/jasle/OneDrive/Desktop/experimenting/studybloom/src/components/DeskNotebook.tsx), and [src/components/FileViewer.tsx](C:/Users/jasle/OneDrive/Desktop/experimenting/studybloom/src/components/FileViewer.tsx).

## 1. Product Identity

- Product name: `Jot Gloss (JG)`.
- World: Jasleen's digital study, parlour office, and private library.
- Emotional goal: the app should feel like entering a decorated room with a lived-in desk, not opening a dashboard.
- Signature line: use a restrained bookplate phrase such as `Jasleen's digital study` or `A private study library`.
- Litmus test: if a screen could pass for a generic productivity app, it is off-brief.

## 2. Current Build Anchors

These are already present and should be refined rather than replaced:

- A three-part shell with a left rail, center desk, and right rail in [src/App.tsx](C:/Users/jasle/OneDrive/Desktop/experimenting/studybloom/src/App.tsx).
- Decorative structural primitives: `ArchNiche`, `UtilityBookplate`, `HashiyaBox`, `StudyFolio`, `ClassFolder`, and ornament components.
- A notebook surface with notes and task persistence through `DeskNotebook`.
- A music object that survives panel changes because the player is owned near the app root.
- App-level timer state in [src/hooks/useStudyTimer.ts](C:/Users/jasle/OneDrive/Desktop/experimenting/studybloom/src/hooks/useStudyTimer.ts).
- File viewer state persistence via `viewerState` and component-level persistence in [src/utils/componentState.ts](C:/Users/jasle/OneDrive/Desktop/experimenting/studybloom/src/utils/componentState.ts).

Current drift that must be corrected:

- Brand copy still says `StudyBloom`.
- The palette in [src/index.css](C:/Users/jasle/OneDrive/Desktop/experimenting/studybloom/src/index.css) is still tuned toward bright candy pastels instead of material pastels.
- The right rail currently exposes too many utilities at once; it needs a clearer hierarchy.
- The visual composition still reads as wallpaper plus widgets in places instead of a continuous room with inset panels and objects.

## 3. Session Model

Jot Gloss is session-centric.

- There is no separate home screen. The last study state is home.
- Re-opening the app should restore the user's working context as faithfully as possible:
  - active course or archive view
  - open folio or viewer state
  - notebook contents
  - sticky note contents and positions once implemented
  - music state
  - timer continuity where appropriate
- Fullscreen, reader, or modal states should read as zooming into the same room, not leaving it.
- App-level tools that need continuity must live above view-level switches or persist their state explicitly.

## 4. Room Architecture

### 4.1 Layer model

1. Wall
   - Continuous floral wallpaper across the app.
   - Wallpaper is atmosphere only. It must never carry primary text or act like the main card fill.
2. Architectural panels
   - Left rail, center study area, and right rail must read as inset panels mounted into the room.
   - Use frames, mouldings, arches, and bookplate logic to separate panels from the wall.
3. Objects
   - Notebook, clipboard, cabinet, sticky notes, to-do sheet, music object, and folios live inside panels or on the central desk.

### 4.2 Hard object budget

Allowed metaphors:

1. Wallpapered room
2. Architectural panels
3. Notebook
4. Clipboard
5. Filing cabinet
6. Music object

Do not introduce new recurring metaphors such as lamps, shelves, trays, drawers, charms, or floating gadgets unless the brief is explicitly updated.

## 5. Layout, Grid, and Spacing

- Keep the main structure as left rail, center desk, right rail.
- Desktop target: a strict three-zone grid with the center area dominant.
- The current `280px | 1fr | 320px` shell is acceptable as an implementation starting point. Refine spacing and panel relationships before changing the grid ratio.
- All spacing must follow a single baseline unit. Use `8px` increments as the default implementation scale unless a component already proves a stronger local rule.
- Align sidebar headings, hero frames, search/filter surfaces, folio cards, and right-rail cards to a shared vertical rhythm.
- Maximalism only works if every margin, inset, and divider feels deliberate. Off-grid ornament becomes visual noise immediately.

## 6. Panel Hierarchy

### Left rail

- Feels built into the room, not attached on top of it.
- Owns navigation, course folios, versions, and archive entry points.
- Should keep its identity panel and index logic, but user-facing copy must shift from `StudyBloom` to `Jot Gloss`.

### Center desk

- This is the primary work surface.
- The hero, folio grid, open notebook, and file viewer all belong to the same desk world.
- The central surface must always feel more important than the rails.

### Right rail

Default visible content should be:

1. Stationery
2. Study Music

Secondary utilities should be tucked behind a toggle, drawer, tab, or progressive disclosure:

1. Clipboard / resume activity
2. Filing cabinet / archive access
3. Prompt bank, stats, sync, upload, or paste actions

The current `DeskRailContent` should be restructured toward that priority instead of showing every utility as a first-class card.

## 7. Writing Surface Hierarchy

- Notebook is the primary thinking surface.
- Sticky notes are quick capture only.
- To-dos are utility only.
- Only one writing surface may be visually dominant at a time.
- If the notebook is open, sticky notes and task lists should visually subordinate themselves through scale, placement, and tint.
- Main writing surfaces should use the calmest fills and the least ornament.

## 8. Color System

The palette should feel like materials, not candy.

- Butter becomes parchment or plaster butter.
- Blue becomes shell blue-grey.
- Pink becomes faded rose.
- Green becomes muted sage.

Viewport rules:

- One dominant neutral family per view.
- One active accent surface.
- Optional one secondary accent.
- Do not allow four equally loud pastel surfaces to compete in the same viewport.

Implementation note:

- The current CSS still leans bright and glossy. Future passes should soften saturation and increase the sense of paper, plaster, textile, and faded ink.

## 9. Ornament Hierarchy

### Heavy ornament

- JG crest
- primary wordmark
- the main hero arch only

### Medium ornament

- panel edges
- arch borders
- key section dividers

### Light ornament

- tiny stars, dots, pen rules, corner flourishes

### No ornament

- notebook pages
- sticky note bodies
- to-do lines
- long-form reading surfaces

Ornament must frame content, never compete with scanning or writing.

## 10. Arches and Frames

- Arches are architectural moments, not the default shape for every container.
- Maximum per viewport:
  - one primary hero arch
  - one secondary arch or framed study surface
- All other surfaces should use rectangular panels, bookplates, or very subtle arch echoes.
- Multi-line bookplate borders are preferred over thick modern card outlines.

## 11. Typography

- Serif-first system.
- Decorative serif for identity and hero moments.
- Simpler reading serif or restrained body pairing for long-form content.
- Illuminated lettering belongs only in the crest, wordmark, or very rare hero headings.
- All other headings should stay readable, calm, and archival.

## 12. Motion and Transitions

Motion must feel spatial and desk-like.

- Moving between contexts should feel like sliding across a desk or opening a folio.
- Opening a notebook should feel like lifting or unfolding a paper surface.
- Fullscreen transitions should feel like zooming into a page, not switching apps.
- Avoid generic scale bounces, flashy fades, and unrelated motion presets.

## 13. Empty, Error, and Utility Copy

All states must stay in-world.

Good:

- `No files in the cabinet yet.`
- `No notes pinned to your desk.`
- `The folios are being gathered now.`

Avoid:

- `No data available`
- `Something went wrong`
- `Dashboard`
- `Workspace`

## 14. Implementation Mapping

### Reuse these existing primitives

- `ArchNiche` for hero or rare featured surfaces.
- `UtilityBookplate` for framed rectangular rail cards and utility surfaces.
- `StudyFolio` for the main "resume where you left off" moment.
- `ClassFolder` for course-level folios.
- `DeskNotebook` for the primary writing surface.
- `FileViewer` for immersive reading and generated study widgets.

### File ownership for future implementation

- [src/App.tsx](C:/Users/jasle/OneDrive/Desktop/experimenting/studybloom/src/App.tsx)
  - overall session model
  - panel priority
  - right-rail disclosure
  - user-facing copy
- [src/index.css](C:/Users/jasle/OneDrive/Desktop/experimenting/studybloom/src/index.css)
  - grid
  - spacing system
  - panel framing
  - tint hierarchy
  - motion rules
- `src/components/*`
  - component-specific structure and ornament discipline
- [src/hooks/useStudyTimer.ts](C:/Users/jasle/OneDrive/Desktop/experimenting/studybloom/src/hooks/useStudyTimer.ts)
  - continuity for study sessions
- [src/utils/componentState.ts](C:/Users/jasle/OneDrive/Desktop/experimenting/studybloom/src/utils/componentState.ts)
  - viewer and widget persistence

## 15. Phasing

### Phase 1

- Rebrand visible copy to `Jot Gloss`.
- Tighten wallpaper plus panel architecture.
- Enforce right-rail hierarchy.
- Establish one grid and spacing scale.
- Shift palette toward material pastels.
- Make notebook the clear primary writing surface.

### Phase 2

- Add cabinet and clipboard as refined secondary objects.
- Add sticky note persistence and visibility management.
- Add lifecycle features such as gathering-dust prompts, auto-sort suggestions, and bulk archive actions.
- Add motion polish that matches folio and desk behavior.

## 16. Acceptance Criteria

- The app reads as one continuous room with inset panels, not as wallpaper behind widgets.
- The center desk remains visually primary at desktop and mobile sizes.
- The right rail defaults to stationery and music before other utilities.
- Only one writing surface is dominant at a time.
- User-facing copy says `Jot Gloss` or `JG`, not `StudyBloom`.
- Empty states sound in-world.
- No new persistent object metaphor appears without an explicit brief update.
- Visual richness remains, but ornament never interferes with reading, input, or scanning.
