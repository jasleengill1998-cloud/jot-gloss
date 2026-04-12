import { useState } from 'react'

interface Prompt {
  title: string
  category: string
  icon: string
  template: string
}

const PROMPTS: Prompt[] = [
  {
    title: 'Interactive Flashcards',
    category: 'Interactive Study',
    icon: '\u{1F4C7}',
    template: `Create an interactive flashcard component for [TOPIC] in [CLASS NAME].

Requirements:
- Write as a self-contained JSX component using React.createElement() syntax
- Include 8-10 cards with Question on front, detailed Answer on back
- Click to flip, Previous/Next navigation, card counter
- Style with this palette: blush (#FFEAE6), sage (#E6F2E8), parchment (#FFF4F0), gold (#C8A878), coral (#F0849C), plum text (#5A3E4B), rose (#FFB8C8)
- Use fonts: 'Cormorant Garamond' for headings, 'Outfit' for body text
- Make it visually beautiful with soft shadows and ornate styling
- No import/export statements`
  },
  {
    title: 'Practice Quiz',
    category: 'Practice Problems',
    icon: '\u{1F4DD}',
    template: `Create an interactive multiple-choice quiz component for [TOPIC] in [CLASS NAME].

Requirements:
- Write as a self-contained JSX component using React.createElement() syntax
- 8-10 questions with 4 answer choices each
- Show correct/incorrect feedback after each answer
- Running score tracker, final results summary with percentage
- "Try Again" button to restart
- Style with this palette: blush (#FFEAE6), sage (#E6F2E8), parchment (#FFF4F0), gold (#C8A878), coral (#F0849C), plum text (#5A3E4B), rose (#FFB8C8)
- Correct = sage green highlight, Incorrect = soft rose highlight
- Use 'Cormorant Garamond' headings, 'Outfit' body text
- No import/export statements`
  },
  {
    title: 'Cheat Sheet',
    category: 'Cheat Sheet',
    icon: '\u{1F4CB}',
    template: `Create a comprehensive cheat sheet in Markdown for [TOPIC] in [CLASS NAME].

Requirements:
- Organized with clear headers and subheaders
- Key formulas in code blocks
- Important definitions as bold terms with concise explanations
- Use tables for comparisons
- Include "Quick Rules" callout boxes using blockquotes
- Mnemonic devices where helpful
- Keep it dense but scannable — designed to fit 1-2 printed pages
- End with "Common Exam Mistakes to Avoid" section`
  },
  {
    title: 'Concept Map',
    category: 'Interactive Study',
    icon: '\u{1F5FA}',
    template: `Create an interactive concept map component for [TOPIC] in [CLASS NAME].

Requirements:
- Write as a self-contained JSX component using React.createElement() syntax
- Visual node-and-connection diagram showing how concepts relate
- Each node is clickable to expand with a definition/explanation
- Use colored groupings for related concepts
- Style with this palette: blush (#FFEAE6), sage (#E6F2E8), parchment (#FFF4F0), gold (#C8A878), coral (#F0849C), plum text (#5A3E4B), rose (#FFB8C8), lavender (#EBE4F4), powder (#E4EEF8)
- Nodes should have ornate borders with subtle shadows
- Use 'Cormorant Garamond' for concept titles, 'Outfit' for descriptions
- No import/export statements`
  },
  {
    title: 'Comparison Table',
    category: 'Reference',
    icon: '\u{1F4CA}',
    template: `Create a detailed comparison table in Markdown for [ITEMS TO COMPARE] in [CLASS NAME].

Requirements:
- Clear, well-structured Markdown table
- Comparison dimensions as rows: Definition, Key Features, Advantages, Disadvantages, When to Use, Real-World Example
- Bold key differentiators
- Add a "Quick Decision Guide" section below the table
- Include "Exam Tip" callouts using blockquotes
- End with practice scenarios: "Which would you choose if...?"`
  },
  {
    title: 'Case Study Breakdown',
    category: 'Notes',
    icon: '\u{1F4D6}',
    template: `Create a structured case study analysis in Markdown for [CASE/COMPANY] in [CLASS NAME].

Requirements:
- Sections: Background, Key Problem, Stakeholder Analysis, Strategic Options (with pros/cons), Recommended Solution, Implementation Plan, Key Takeaways
- Use tables for stakeholder mapping and option comparison
- Include relevant frameworks (Porter's 5 Forces, SWOT, BCG Matrix, etc.) where applicable
- Bold key terms and decision points
- End with "Discussion Questions" for study group review
- Add "Exam Application" section: how this case illustrates testable concepts`
  },
  {
    title: 'Formula Reference',
    category: 'Cheat Sheet',
    icon: '\u{1F9EE}',
    template: `Create a formula reference sheet in Markdown for [TOPIC] in [CLASS NAME].

Requirements:
- Every relevant formula with clear variable definitions
- Group formulas by sub-topic
- Show each formula in a code block
- Include "When to use" for each formula
- Add worked examples for the 3 trickiest formulas
- Common mistakes / gotchas for each
- Include unit analysis reminders where relevant
- Quick-reference table at the top: Formula Name | Formula | Key Variables`
  },
  {
    title: 'Process Flowchart',
    category: 'Interactive Study',
    icon: '\u{1F500}',
    template: `Create an interactive decision flowchart component for [PROCESS/DECISION] in [CLASS NAME].

Requirements:
- Write as a self-contained JSX component using React.createElement() syntax
- Step-by-step visual flow with decision nodes (Yes/No branches)
- Clicking a node highlights the path and shows explanation
- Color-coded: decisions in rose, actions in sage, outcomes in gold
- Style with this palette: blush (#FFEAE6), sage (#E6F2E8), parchment (#FFF4F0), gold (#C8A878), coral (#F0849C), plum text (#5A3E4B), rose (#FFB8C8)
- Clean connecting lines between nodes
- Use 'Cormorant Garamond' for titles, 'Outfit' for content
- No import/export statements`
  },
  {
    title: 'Element Design Board',
    category: 'Interactive Study',
    icon: '\u{1F3A8}',
    template: `Create an interactive element/component design board for [TOPIC AREA] in [CLASS NAME].

Requirements:
- Write as a self-contained JSX component using React.createElement() syntax
- Show a grid of design elements/building blocks for the topic (e.g., for Strategy: Porter's 5 Forces, Value Chain, PESTEL; for Finance: NPV, IRR, WACC, CAPM)
- Each element is a card showing: Name, Visual icon/symbol, Core formula or definition, When to use it, Key inputs needed
- Click any element card to expand it into a detailed view with: full explanation, worked example, common pitfalls, exam tips
- Include a "Build Your Analysis" section at the bottom where you can drag/select elements to combine into a framework stack
- Style with this palette: blush (#FFEAE6), sage (#E6F2E8), parchment (#FFF4F0), gold (#C8A878), coral (#F0849C), plum text (#5A3E4B), rose (#FFB8C8), lavender (#EBE4F4), powder (#E4EEF8)
- Ornate card borders with material feel — soft shadows, double borders
- Use 'Cormorant Garamond' for headings, 'Outfit' for body
- No import/export statements`
  },
  {
    title: 'Timeline & Milestones',
    category: 'Interactive Study',
    icon: '\u{1F4C5}',
    template: `Create an interactive timeline component for [HISTORICAL TOPIC / PROCESS STAGES] in [CLASS NAME].

Requirements:
- Write as a self-contained JSX component using React.createElement() syntax
- Vertical timeline with connected nodes for each milestone/event
- Each node shows: date/stage, title, brief description
- Click to expand any node for full detail, significance, and exam relevance
- Color-coded by theme or era
- Style with this palette: blush (#FFEAE6), sage (#E6F2E8), parchment (#FFF4F0), gold (#C8A878), coral (#F0849C), plum text (#5A3E4B), rose (#FFB8C8)
- Ornate connecting line with subtle decorative details
- Use 'Cormorant Garamond' for headings, 'Outfit' for body
- No import/export statements`
  },
  {
    title: 'Exam Strategy Guide',
    category: 'Reference',
    icon: '\u{1F3AF}',
    template: `Create a comprehensive exam strategy guide in Markdown for [EXAM NAME] in [CLASS NAME].

Requirements:
- Sections: Exam Format Overview, Time Allocation Strategy, Question-Type Tactics, Must-Know Topics (ranked by weight), Common Traps & How to Avoid Them, Last-Hour Review Checklist
- Use tables for time allocation breakdown
- Include "If you see X, think Y" pattern-matching tips
- Bold critical terms and warning signs
- Add a "Confidence Check" section with self-test questions
- End with a calming pre-exam ritual/mindset section`
  },
]

interface Props {
  onClose: () => void
}

export default function PromptBank({ onClose }: Props) {
  const [copied, setCopied] = useState<number | null>(null)
  const [filter, setFilter] = useState('')

  const filtered = filter
    ? PROMPTS.filter(p => p.category.toLowerCase().includes(filter.toLowerCase()) || p.title.toLowerCase().includes(filter.toLowerCase()))
    : PROMPTS

  const copyPrompt = (index: number, text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(index)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="panel p-5 mb-4 animate-slideDown">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-heading text-lg font-semibold text-[#5A3E4B]">
            {'\u2767'} Prompt Bank
          </h2>
          <p className="text-[11px] text-[#C88898] font-body mt-0.5">
            Copy a prompt, paste into Claude, get study materials. Replace [BRACKETS] with your topic.
          </p>
        </div>
        <button onClick={onClose} className="text-[#C88898] hover:text-[#5A3E4B] transition-colors p-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {['', 'Interactive Study', 'Practice Problems', 'Cheat Sheet', 'Notes', 'Reference'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`text-[11px] font-body px-2.5 py-1 rounded-full border transition-colors
              ${filter === cat
                ? 'bg-[#C88898] text-[#FFF4F0] border-[#C88898]'
                : 'border-[#E8B8C7] text-[#C88898] hover:border-[#C88898] hover:text-[#C88898]'
              }`}
          >
            {cat || 'All'}
          </button>
        ))}
      </div>

      {/* Prompt list — compact, scrollable */}
      <div className="max-h-[200px] overflow-y-auto pr-1 space-y-1">
        {filtered.map((prompt, i) => (
          <div key={i} className="flex items-center justify-between py-2 px-3 transition-colors cursor-pointer hover:bg-[rgba(241,210,220,0.15)]"
               style={{borderBottom:'0.5px solid rgba(200,142,163,0.08)'}}
               onClick={() => copyPrompt(i, prompt.template)}>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm flex-shrink-0">{prompt.icon}</span>
              <span className="font-heading font-semibold text-[13px] text-[#5A3E4B] truncate">{prompt.title}</span>
              <span className="text-[10px] font-body px-1.5 py-0.5 flex-shrink-0" style={{background:'rgba(241,210,220,0.25)', color:'#C88898', borderRadius:2}}>
                {prompt.category}
              </span>
            </div>
            <span className="font-heading text-[9px] font-bold tracking-[0.1em] uppercase flex-shrink-0 ml-3"
                  style={{color: copied === i ? '#80C890' : '#C8A878'}}>
              {copied === i ? '\u2713 Copied' : 'Copy'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
