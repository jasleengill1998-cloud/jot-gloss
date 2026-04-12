# StudyBloom JSX Compatibility

Ensure ALL generated JSX/React code is compatible with StudyBloom's sandboxed renderer. Apply these rules automatically whenever generating React components, flashcards, quizzes, study tools, or any interactive content.

## When to Use

Apply these rules to EVERY JSX file generated in this project — no exceptions.

## Critical Rules

### 1. Single Root Element
The component MUST return exactly ONE root element. Wrap siblings in a `<div>` or `<React.Fragment>`:

```jsx
// ❌ BROKEN — adjacent elements
return (
  <div>header</div>
  <div>body</div>
)

// ✅ CORRECT
return (
  <div>
    <div>header</div>
    <div>body</div>
  </div>
)
```

### 2. No import/export Statements
The sandbox strips them, but leftover syntax can break parsing.

```jsx
// ❌ BROKEN
import React from 'react'
export default function MyCards() { ... }

// ✅ CORRECT
function MyCards() { ... }
```

### 3. PascalCase Function Declaration
The renderer detects the component by finding a PascalCase `function` declaration. Arrow functions assigned to PascalCase const also work.

```jsx
// ✅ These work
function EconFlashcards() { ... }
function Topic1CueCards() { ... }
const QuizApp = () => { ... }

// ❌ These don't
function econFlashcards() { ... }  // lowercase
const cards = () => { ... }         // lowercase
```

### 4. Available Globals (no imports needed)
These are injected by the sandbox — use them directly:

```
React, useState, useEffect, useRef, useMemo, useCallback,
useReducer, useContext, createContext, Fragment, createElement,
Children, cloneElement, memo, forwardRef
```

### 5. Two Valid Syntax Modes

**Mode A: JSX syntax (angle brackets)** — Babel transforms it automatically:
```jsx
function MyCards() {
  const [idx, setIdx] = useState(0);
  return (
    <div style={{ padding: 20 }}>
      <h2>Hello</h2>
      <button onClick={() => setIdx(idx + 1)}>Next</button>
    </div>
  );
}
```

**Mode B: React.createElement** — runs directly without Babel (faster):
```jsx
function MyCards() {
  const [idx, setIdx] = useState(0);
  return React.createElement("div", { style: { padding: 20 } },
    React.createElement("h2", null, "Hello"),
    React.createElement("button", { onClick: function() { setIdx(idx + 1); } }, "Next")
  );
}
```

Both work. Mode A is easier to read. Mode B is more reliable.

### 6. Inline Styles Only
No CSS imports, no className references to external CSS, no styled-components.

```jsx
// ✅ CORRECT
<div style={{ fontFamily: "'Outfit', sans-serif", color: "#3d352f", padding: 20 }}>

// ❌ BROKEN
<div className="card-wrapper">  // no external CSS available
```

### 7. No Raw Newlines in String Literals
Use `\n` for line breaks in text content, never actual newlines inside quotes:

```jsx
// ❌ BROKEN
const answer = "Line one
Line two"

// ✅ CORRECT
const answer = "Line one\nLine two"
```

### 8. Self-Contained — No External Dependencies
No axios, no lodash, no external libraries. Only React and standard browser APIs.

### 9. No ES Module Syntax Inside the Component
Avoid `import()`, dynamic imports, or `require()`.

## StudyBloom Style Palette

Use these colors for visual consistency:

```
Background:     #f7f0e7 (warm parchment)
Card/Surface:   #fdfaf5
Text:           #3d352f
Muted text:     rgba(140,125,105,0.7)
Border:         rgba(190,170,145,0.4)
Heading font:   'Cormorant Garamond', Georgia, serif
Body font:      'Outfit', system-ui, sans-serif

Accents:
  Sage green:   #8a9a7b  (primary buttons, "correct" state)
  Oxblood:      #6e3040  (accent, "review" state)
  Mauve:        #8B6B7F
  Gold:         #c4a265
  Dusty blue:   #7B8FA3
  Terracotta:   #C48B6B
  Blush:        #c4929f
```

## Validation Checklist

Before outputting any JSX for StudyBloom, verify:
- [ ] Single root element in return statement
- [ ] No import/export lines
- [ ] PascalCase function name
- [ ] Only uses available globals (React hooks, createElement, etc.)
- [ ] Inline styles only
- [ ] No raw newlines inside string literals
- [ ] No external dependencies
- [ ] Tested: does the function return a valid React element?

## File Naming

Always suggest a filename with `.jsx` extension:
`{course}_{type}_{topic}.jsx`

Examples: `mbas801_flashcards_elasticity.jsx`, `mbas832_quiz_porters.jsx`
