# StudyBloom Final Exam Review Generator

Generate comprehensive, interactive final exam review widgets for any course. Each review is a single self-contained React component with multiple study modes built in.

## When to Use

When the user asks for:
- Final exam review / exam prep
- Comprehensive review for a course or set of topics
- Study widget covering multiple topics
- "Review everything" or "help me study for finals"

## Required Sections (ALL must be included)

Every exam review widget MUST contain these 6 sections in a tabbed interface:

### 1. Concept Map
- Visual grid of clickable topic cards
- Each card expands to show key concepts and how they connect to other topics
- Color-coded by theme/unit

### 2. Flashcard Deck (30-50 cards)
- Covers every key concept, formula, definition
- Flip animation (click to reveal answer)
- "Got It" / "Review Again" buttons
- Progress counter and mastery tracking
- Cards should be DENSE with real content, not vague summaries

### 3. Formula & Framework Reference
- Scrollable cheat sheet grouped by topic
- Every formula with variable definitions
- Every framework/model with when to use it
- Common pitfalls and exam tips per formula

### 4. Practice Problems (15-20)
- Mix of calculation, short answer, scenario-based
- Hidden solutions (click to reveal)
- Difficulty rating (Easy/Medium/Hard)
- Step-by-step solution walkthrough

### 5. True/False Speed Round (25+)
- Rapid-fire statements
- Immediate feedback with explanation on wrong answers
- Running score tracker
- Covers common misconceptions and trap questions

### 6. Exam Strategy Guide
- Time allocation advice for the exam format
- How to structure long-answer responses
- Common trap answers to avoid
- What professors typically emphasize
- Last-minute review priorities

## Component Architecture

```jsx
function CourseFinalReview() {
  const TABS = [
    { id: "concepts", label: "Concepts" },
    { id: "flashcards", label: "Flashcards" },
    { id: "formulas", label: "Formulas" },
    { id: "practice", label: "Practice" },
    { id: "truefalse", label: "T/F Quiz" },
    { id: "strategy", label: "Strategy" },
  ];

  const [tab, setTab] = useState("concepts");
  const [flashIdx, setFlashIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState({});
  const [tfIdx, setTfIdx] = useState(0);
  const [tfScore, setTfScore] = useState(0);
  const [revealed, setRevealed] = useState({});

  // ALL content data as arrays/objects defined here
  // ...

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", maxWidth: 700, margin: "0 auto", padding: 20 }}>
      {/* Course title */}
      {/* Tab navigation bar */}
      {/* Active section content */}
      {/* Progress footer */}
    </div>
  );
}
```

## StudyBloom Compatibility (MANDATORY)

Follow ALL rules from the studybloom-jsx-compat skill:
- NO import/export statements
- PascalCase function name (e.g. `function Mbas801FinalReview()`)
- Single root `<div>` wrapper
- Inline styles only
- Available: useState, useEffect, useRef, useMemo, useCallback, React, Fragment
- Use `\n` for newlines in strings
- No external libraries
- Fully self-contained

## Style Palette

```
Background:     #f7f0e7
Card surface:   #fdfaf5
Text:           #3d352f
Muted text:     rgba(140,125,105,0.7)
Heading font:   'Cormorant Garamond', Georgia, serif
Body font:      'Outfit', system-ui, sans-serif

Tab active:     #6e3040 (oxblood) with bottom border
Tab inactive:   #c4b8a0 text, no border
Correct:        #8a9a7b (sage green)
Wrong/Review:   #c4929f (blush)
Accent gold:    #c4a265
Border:         rgba(190,170,145,0.4)
Card shadow:    0 2px 8px rgba(0,0,0,0.06)
```

## File Naming

`{course}_final-review.jsx`

Examples:
- `mbas801_final-review.jsx`
- `mbas832_final-review.jsx`
- `mbas811_final-review.jsx`

## Content Quality Standards

- Every flashcard must contain REAL course content, not placeholders
- Practice problems must require actual computation or analysis
- True/False statements must test genuine understanding, not trivia
- Formulas must include all variables defined
- Strategy must be specific to the course and exam format
- AIM FOR 500+ lines of dense, useful content

## Workflow

1. Ask the user which course and which topics to cover
2. Generate the COMPLETE component with all 6 sections fully populated
3. Output the code in a single code block
4. Suggest filename following naming convention
5. Tell user: "Paste this into StudyBloom using the **Paste from Claude** button. Name it `{filename}` and assign it to `{className}` as Interactive Study."
