# StudyBloom Auto-Generator

Generate interactive study materials and auto-push them to StudyBloom's cloud storage so they appear on all devices (phone + desktop) immediately.

## When to Use

Trigger when the user asks to:
- Create study materials, flashcards, quizzes, cheat sheets, concept maps, practice problems
- Add new content to StudyBloom
- Generate educational content for their MBA classes

## Classes

The user's current classes:
- MBAS 832 — Strategy
- MBAS 811 — Financial Accounting
- MBAS 801 — Economics
- General

## Auto-Push Workflow

After generating a JSX or Markdown file, **automatically push it to StudyBloom cloud storage**:

### Step 1: Generate the content (JSX or Markdown)

### Step 2: Save the file locally
Write the content to `generated/` folder in the project root:
```
generated/{filename}.jsx   (or .md)
```

### Step 3: Push to cloud via the sync script
Run the push script to add the file to Vercel Blob storage:
```bash
node scripts/push-to-cloud.js --name "{filename}" --type "{jsx|markdown}" --class "{className}" --resource "{resourceType}" --file "generated/{filename}"
```

This script:
1. GETs current files from the deployed `/api/sync` endpoint
2. Creates a new StudyFile entry with a unique ID
3. Merges it into the existing file list
4. POSTs the updated list back to `/api/sync`
5. The file now appears in StudyBloom on ALL devices after hitting Refresh & Sync

### Step 4: Confirm to user
Tell them: "Added {filename} to StudyBloom. Hit **Refresh & Sync** in the app to see it."

## Output Formats

### Interactive Components (JSX)

Write self-contained React components using `React.createElement()` syntax. The app's JSX sandbox provides these globals — do NOT use import/export:

```
React, useState, useEffect, useRef, useMemo, useCallback, useReducer,
useContext, createContext, Fragment, createElement, Children, cloneElement, memo, forwardRef
```

**Critical Rules:**
- Main component must be a PascalCase `function` declaration (e.g., `function EconFlashcards()`)
- **No `import` or `export` statements**
- **No JSX angle-bracket syntax** — use `React.createElement()` calls only
- Inline styles only (no CSS imports)
- Component must be fully self-contained
- **No raw newlines inside string literals** — use `\\n` for newlines in text content
- Use string concatenation (`+`) not template literals for dynamic text

**Style palette for components:**
- Background: `#f7f0e7` (warm parchment)
- Card bg: `#fdfaf5`
- Text: `#3d352f`
- Muted text: `rgba(140,125,105,0.7)`
- Accent mauve: `#8B6B7F`
- Sage green (buttons): `#8a9a7b`
- Gold: `#c4a265`
- Dusty blue: `#7B8FA3`
- Terracotta: `#C48B6B`
- Oxblood: `#6e3040`
- Border: `rgba(190,170,145,0.4)`
- Heading font: `'Cormorant Garamond', Georgia, serif`
- Body font: `'Outfit', system-ui, sans-serif`

**Card component template pattern:**
```javascript
function TopicCueCards() {
  var _s = React.useState;
  var idx = _s(0), setIdx = idx[1]; idx = idx[0];
  var flipped = _s(false), setFlipped = flipped[1]; flipped = flipped[0];
  var known = _s({}), setKnown = known[1]; known = known[0];

  var cards = [
    { q: "Question here?", a: "Answer here.\\nSecond line of answer." },
    // more cards...
  ];

  var total = cards.length;
  var card = cards[idx];
  var next = function() { setFlipped(false); setIdx(function(i) { return (i + 1) % total; }); };

  return React.createElement("div", {
    style: { fontFamily: "'Outfit', system-ui, sans-serif", maxWidth: 540, margin: "0 auto", padding: 20 }
  },
    React.createElement("h2", {
      style: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, fontWeight: 700, color: "#2a2220", textAlign: "center" }
    }, "Topic Title"),
    // ... card UI
  );
}
```

### Static Content (Markdown)

Write well-structured Markdown for cheat sheets, summaries, comparison tables, case analyses.

**Rules:**
- Use headers, bold, tables, blockquotes, code blocks
- Dense but scannable
- Include exam tips in blockquotes
- Tables for comparisons

## Resource Types

Tag the output with one of:
- Interactive Study (flashcards, quizzes, concept maps, flowcharts)
- Notes (lecture notes, case analyses)
- Cheat Sheet (formula sheets, summary sheets)
- Practice Problems (problem sets, quizzes)
- Reference (comparison tables, frameworks)

## File Naming Convention

Use: `{classCode}_{type}_{topic}.{ext}`

Examples:
- `mbas801_flashcards_supply-demand.jsx`
- `mbas832_cheatsheet_porters-five-forces.md`
- `mbas811_quiz_financial-ratios.jsx`
