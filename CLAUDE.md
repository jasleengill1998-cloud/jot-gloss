# Jot Gloss - Implementation Guardrails

## Naming Note

- User-facing language should say `Jot Gloss` or `JG`.
- Internal code names can remain `studybloom` until a deliberate migration updates storage keys, IndexedDB names, and component APIs safely.

## 1. Highest-Priority Product Rules

1. Jot Gloss is session-centric.
   - There is no separate dashboard or detached home state.
   - The last state is home.
   - Opening a file, notebook, viewer, or fullscreen surface must feel like zooming further into the same room.
2. Build one continuous interior.
   - Wallpaper is atmosphere.
   - Panels hold content.
   - Objects live inside panels or on the desk.
3. Do not expand the metaphor set casually.
   - Allowed recurring metaphors: room, panels, notebook, clipboard, cabinet, music object.
   - New recurring objects are out of scope unless the brief changes.

## 2. Architectural Surface Order

- Never place primary text or controls directly on raw wallpaper.
- Use existing framed primitives before inventing new surfaces:
  - `ArchNiche` for rare architectural hero moments
  - `UtilityBookplate` for rectangular framed utilities
  - `HashiyaBox` for ornate content showcases
  - `StudyFolio` for featured resume-state content
- Treat the left rail, center desk, and right rail as parts of one room, not three unrelated layouts.

## 3. Session Continuity Rules

- Music, timer, notebook data, viewer state, and similar long-lived study tools should survive navigation whenever practical.
- If a tool cannot stay mounted, its state must persist explicitly.
- Do not reset user context just because a panel closes or a viewer opens.
- Fullscreen is a zoomed desk state, not a separate mode with a separate design language.

## 4. Right-Rail Priority

Default first-class rail content:

1. Stationery
2. Study Music

Secondary rail content should be progressively disclosed:

1. Clipboard or resume activity
2. Filing cabinet or archive access
3. Upload, paste, prompt bank, stats, sync, and similar utilities

If the rail starts feeling like a stack of admin widgets, it has drifted off-brief.

## 5. Writing Surface Hierarchy

- Notebook is the primary writing surface.
- Sticky notes are quick capture only.
- To-do lists are utility only.
- Only one writing surface may be visually dominant at a time.
- Main reading and writing surfaces should have the quietest fills and the least ornament.

## 6. Grid and Spacing Discipline

- Keep the global shell disciplined. The current three-column structure in [src/App.tsx](C:/Users/jasle/OneDrive/Desktop/experimenting/studybloom/src/App.tsx) and [src/index.css](C:/Users/jasle/OneDrive/Desktop/experimenting/studybloom/src/index.css) is the starting point.
- Use one baseline spacing scale. Default to `8px` increments unless a component already proves a stronger local rule.
- Maximalism requires alignment. If ornament or color is being used to hide spacing problems, stop and fix the layout.

## 7. Color Hierarchy

- Colors should feel like paper, plaster, faded ink, and textile.
- In any viewport:
  - one dominant neutral family
  - one active accent surface
  - optional one secondary accent
- Do not let four loud pastel surfaces compete equally.
- Avoid bright candy gloss, generic white cards, dark corporate accents, or unrelated new color families.

## 8. Ornament Hierarchy

Heavy ornament:

- crest
- wordmark
- primary hero arch

Medium ornament:

- panel edges
- framed borders
- section dividers

Light ornament:

- small corner flourishes
- dots
- pen-line rules

No ornament:

- notebook pages
- sticky note bodies
- to-do lines
- long-form reading surfaces

If ornament interferes with scanning, alignment, or input, it is wrong.

## 9. Arch Rules

- Arches are architectural punctuation, not the default container shape for everything.
- Use at most:
  - one primary hero arch
  - one secondary arch or framed study surface
- All other surfaces should be rectangular or only subtly echo the arch language.

## 10. Text Containment

This remains non-negotiable.

- Text must stay fully inside the visual fill area of its container.
- Text must not touch borders, ornamental strokes, or cusp transitions.
- In arches, content belongs in the wide belly of the shape, never in the narrow top.
- If copy does not fit, increase space or reduce copy. Do not let it leak into ornament.

## 11. Motion Rules

- Motions should feel like desk actions:
  - slide across desk
  - open folio
  - lift page
  - zoom into sheet
- Avoid generic bounce, pop, springy scale, or unrelated fades.

## 12. Copy Rules

- Use in-world language.
- Prefer `folio`, `desk`, `cabinet`, `study`, `archive`, `notebook`, `pinned note`.
- Avoid generic SaaS words like `dashboard`, `workspace`, `empty state`, `no data`, or `quick actions`.

## 13. Existing Code Boundaries

Use these files and components as the implementation vocabulary:

- [src/App.tsx](C:/Users/jasle/OneDrive/Desktop/experimenting/studybloom/src/App.tsx)
- [src/index.css](C:/Users/jasle/OneDrive/Desktop/experimenting/studybloom/src/index.css)
- [src/components/ArchNiche.tsx](C:/Users/jasle/OneDrive/Desktop/experimenting/studybloom/src/components/ArchNiche.tsx)
- [src/components/UtilityBookplate.tsx](C:/Users/jasle/OneDrive/Desktop/experimenting/studybloom/src/components/UtilityBookplate.tsx)
- [src/components/StudyFolio.tsx](C:/Users/jasle/OneDrive/Desktop/experimenting/studybloom/src/components/StudyFolio.tsx)
- [src/components/ClassFolder.tsx](C:/Users/jasle/OneDrive/Desktop/experimenting/studybloom/src/components/ClassFolder.tsx)
- [src/components/DeskNotebook.tsx](C:/Users/jasle/OneDrive/Desktop/experimenting/studybloom/src/components/DeskNotebook.tsx)
- [src/components/FileViewer.tsx](C:/Users/jasle/OneDrive/Desktop/experimenting/studybloom/src/components/FileViewer.tsx)
- [src/hooks/useStudyTimer.ts](C:/Users/jasle/OneDrive/Desktop/experimenting/studybloom/src/hooks/useStudyTimer.ts)
- [src/utils/componentState.ts](C:/Users/jasle/OneDrive/Desktop/experimenting/studybloom/src/utils/componentState.ts)

Do not silently replace these with a new generic component library or dashboard system.

## 14. Banned Patterns

- Generic white cards over wallpaper
- New recurring physical metaphors outside the approved object budget
- A separate dashboard/home screen
- Random one-off palettes per feature
- Heavy ornament on reading or writing surfaces
- Rail designs that give utility widgets equal visual weight with the main desk
- Feature work that resets session context without a strong reason

## 15. Definition of Done

Before considering a UI change complete, verify that:

1. The screen still reads as one room.
2. The center desk remains primary.
3. Session continuity is preserved.
4. The right rail keeps stationery and music first.
5. The copy sounds like Jot Gloss.
6. Text stays inside its containers.
7. Ornament frames the content instead of fighting it.
