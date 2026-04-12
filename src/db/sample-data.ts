import type { StudyFile } from '../types'

function makeSample(id: string, name: string, content: string): StudyFile {
  return {
    id,
    name,
    type: 'jsx' as const,
    content,
    className: 'MBAS 801 — Economics',
    resourceType: 'Interactive Study',
    version: 1,
    archived: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    size: content.length,
    canonicalName: name.replace(/.w+$/, ''),
    lineageId: id,
    source: 'sample' as const,
  }
}

const TOPIC1 = `function Topic1CueCards() {
  const [idx, setIdx] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [known, setKnown] = React.useState({});

  const cards = [
  {
    "q": "What is the demand function and what does it show?",
    "a": "Qd = a − bP\\n\\nShows quantity consumers want at each price, holding all else constant. Downward sloping: higher P → lower Qd."
  },
  {
    "q": "What is the inverse demand function?",
    "a": "P = (a/b) − (1/b)Qd\\n\\nGives price as a function of quantity. Used to find max price a firm can charge for a given output."
  },
  {
    "q": "Slide along the curve vs. Shift of the curve?",
    "a": "Slide: change in own price → move along existing curve.\\n\\nShift: change in a demand shifter → entire curve moves left or right."
  },
  {
    "q": "Name 5 demand shifters.",
    "a": "1. Consumer income (normal vs inferior)\\n2. Price of substitutes\\n3. Price of complements\\n4. Consumer tastes & preferences\\n5. Number of consumers\\n\\nAlso: expectations about future prices"
  },
  {
    "q": "What is the supply function?",
    "a": "Qs = α + βP\\n\\nUpward sloping: higher price → firms supply more (higher profit per unit)."
  },
  {
    "q": "Name 5 supply shifters.",
    "a": "1. Input prices (wages, materials)\\n2. Technology improvements\\n3. Number of firms\\n4. Government taxes/subsidies\\n5. Expectations about future prices"
  },
  {
    "q": "How do you find market equilibrium?",
    "a": "Set Qd = Qs\\n→ Solve for P* (equilibrium price)\\n→ Plug P* back to get Q*\\n\\nAt equilibrium: no tendency for price to change."
  },
  {
    "q": "What happens with a surplus? A shortage?",
    "a": "Surplus (P > P*): Qs > Qd → excess supply → price falls toward P*\\n\\nShortage (P < P*): Qd > Qs → excess demand → price rises toward P*"
  },
  {
    "q": "Price elasticity of demand formula?",
    "a": "Ed = (%ΔQd) / (%ΔP) = (ΔQ/Q) / (ΔP/P)\\n\\nFor linear demand: Ed = −b × (P/Q)\\n\\nAlways negative (use |Ed|)."
  },
  {
    "q": "Elastic vs Inelastic — revenue implications?",
    "a": "|Ed| > 1 (Elastic): ↓P → ↑Revenue\\n|Ed| < 1 (Inelastic): ↑P → ↑Revenue\\n|Ed| = 1 (Unit Elastic): Revenue maximized"
  }
];

  const total = cards.length;
  const knownCount = Object.values(known).filter(Boolean).length;
  const card = cards[idx];
  const next = () => { setFlipped(false); setIdx(i => (i + 1) % total); };
  const prev = () => { setFlipped(false); setIdx(i => (i - 1 + total) % total); };
  const mark = (v) => { setKnown(k => ({ ...k, [idx]: v })); next(); };

  const COLOR = "#065A82";

  return React.createElement("div", {
    style: { fontFamily: "'Outfit', system-ui, sans-serif", maxWidth: 540, margin: "0 auto", padding: 20 }
  },
    React.createElement("div", { style: { textAlign: "center", marginBottom: 16 } },
      React.createElement("h2", {
        style: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, fontWeight: 700, color: "#2a2220", margin: 0 }
      }, "Topic 1: Demand, Supply & Markets"),
      React.createElement("p", {
        style: { fontSize: 12, color: "#a89a88", marginTop: 4 }
      }, "Card " + (idx + 1) + " of " + total + "  ·  " + knownCount + " mastered"),
      React.createElement("div", {
        style: { height: 4, background: "#e8e0d4", borderRadius: 2, marginTop: 10, overflow: "hidden" }
      },
        React.createElement("div", {
          style: { height: "100%", width: ((idx + 1) / total * 100) + "%", background: "#8a9a7b", borderRadius: 2, transition: "width 0.3s" }
        })
      )
    ),

    React.createElement("div", {
      onClick: function() { setFlipped(!flipped); },
      style: {
        background: flipped ? "#f4f6f2" : COLOR,
        border: flipped ? "2px solid " + COLOR : "2px solid transparent",
        borderRadius: 14, padding: "32px 24px", minHeight: 220,
        display: "flex", flexDirection: "column", justifyContent: "center",
        cursor: "pointer", transition: "all 0.25s",
        boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
      }
    },
      React.createElement("div", {
        style: { fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: flipped ? COLOR : "rgba(255,255,255,0.5)", marginBottom: 12 }
      }, flipped ? "Answer" : "Question"),
      React.createElement("div", {
        style: { fontSize: flipped ? 15 : 19, lineHeight: 1.6, color: flipped ? "#2a2220" : "#fff", fontWeight: flipped ? 400 : 500, whiteSpace: "pre-line" }
      }, flipped ? card.a : card.q),
      !flipped && React.createElement("div", {
        style: { fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 14, textAlign: "center" }
      }, "Tap to reveal answer")
    ),

    flipped && React.createElement("div", {
      style: { display: "flex", justifyContent: "center", gap: 10, marginTop: 16 }
    },
      React.createElement("button", {
        onClick: function() { mark(false); },
        style: { padding: "10px 24px", borderRadius: 10, border: "2px solid #c4929f", background: "transparent", color: "#c4929f", fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }
      }, "Review Again"),
      React.createElement("button", {
        onClick: function() { mark(true); },
        style: { padding: "10px 24px", borderRadius: 10, border: "none", background: "#8a9a7b", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }
      }, "Got It ✓")
    ),

    !flipped && React.createElement("div", {
      style: { display: "flex", justifyContent: "center", gap: 10, marginTop: 16 }
    },
      React.createElement("button", {
        onClick: prev,
        style: { padding: "8px 20px", borderRadius: 10, border: "1px solid rgba(200,136,152,0.25)", background: "#FFF4F0", color: "#5A3E4B", cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }
      }, "← Prev"),
      React.createElement("button", {
        onClick: next,
        style: { padding: "8px 20px", borderRadius: 10, border: "none", background: "#8a9a7b", color: "#fff", cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }
      }, "Next →")
    )
  );
}`;
const TOPIC2 = `function Topic2CueCards() {
  const [idx, setIdx] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [known, setKnown] = React.useState({});

  const cards = [
  {
    "q": "What is Consumer Surplus (CS)?",
    "a": "CS = WTP − Price paid\\n\\nArea under demand curve, above market price.\\nMeasures how much better off consumers are from buying."
  },
  {
    "q": "What is Producer Surplus (PS)?",
    "a": "PS = Price received − Min acceptable price\\n\\nArea above supply curve, below market price.\\nMeasures producer welfare."
  },
  {
    "q": "When is Total Surplus maximized?",
    "a": "At competitive equilibrium.\\n\\nTS = CS + PS is maximized when the market clears without intervention. Any distortion creates deadweight loss."
  },
  {
    "q": "What is the effect of a price ceiling below P*?",
    "a": "Creates excess demand (shortage)\\n\\nΔCS = A − B\\nΔPS = −A − C\\nDWL = B + C\\n\\nExample: Rent control → apartment shortages"
  },
  {
    "q": "What is the effect of an excise tax?",
    "a": "Drives wedge between buyer price (Pb) and seller price (Ps)\\n\\nTax Revenue = t × Q_tax = A + D\\nDWL = B + C = ½ × t × ΔQ\\n\\nBoth sides worse off; Q falls."
  },
  {
    "q": "Who bears more of a tax?",
    "a": "The more INELASTIC side bears a larger share of the tax burden.\\n\\nIf demand more inelastic → consumers bear more.\\nIf supply more inelastic → producers bear more."
  },
  {
    "q": "Name 3 types of market failures.",
    "a": "1. Market power (monopoly) — restricts output, raises price\\n2. Information asymmetry — adverse selection, moral hazard\\n3. Externalities — costs/benefits on third parties\\n\\nThese justify government intervention."
  },
  {
    "q": "What is a Pigouvian tax?",
    "a": "Tax = marginal external cost\\n\\nCorrects a negative externality by aligning private cost with social cost.\\n\\nSubsidy corrects positive externality (a 'negative tax')."
  }
];

  const total = cards.length;
  const knownCount = Object.values(known).filter(Boolean).length;
  const card = cards[idx];
  const next = () => { setFlipped(false); setIdx(i => (i + 1) % total); };
  const prev = () => { setFlipped(false); setIdx(i => (i - 1 + total) % total); };
  const mark = (v) => { setKnown(k => ({ ...k, [idx]: v })); next(); };

  const COLOR = "#1C7293";

  return React.createElement("div", {
    style: { fontFamily: "'Outfit', system-ui, sans-serif", maxWidth: 540, margin: "0 auto", padding: 20 }
  },
    React.createElement("div", { style: { textAlign: "center", marginBottom: 16 } },
      React.createElement("h2", {
        style: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, fontWeight: 700, color: "#2a2220", margin: 0 }
      }, "Topic 2: Markets & Government"),
      React.createElement("p", {
        style: { fontSize: 12, color: "#a89a88", marginTop: 4 }
      }, "Card " + (idx + 1) + " of " + total + "  ·  " + knownCount + " mastered"),
      React.createElement("div", {
        style: { height: 4, background: "#e8e0d4", borderRadius: 2, marginTop: 10, overflow: "hidden" }
      },
        React.createElement("div", {
          style: { height: "100%", width: ((idx + 1) / total * 100) + "%", background: "#8a9a7b", borderRadius: 2, transition: "width 0.3s" }
        })
      )
    ),

    React.createElement("div", {
      onClick: function() { setFlipped(!flipped); },
      style: {
        background: flipped ? "#f4f6f2" : COLOR,
        border: flipped ? "2px solid " + COLOR : "2px solid transparent",
        borderRadius: 14, padding: "32px 24px", minHeight: 220,
        display: "flex", flexDirection: "column", justifyContent: "center",
        cursor: "pointer", transition: "all 0.25s",
        boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
      }
    },
      React.createElement("div", {
        style: { fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: flipped ? COLOR : "rgba(255,255,255,0.5)", marginBottom: 12 }
      }, flipped ? "Answer" : "Question"),
      React.createElement("div", {
        style: { fontSize: flipped ? 15 : 19, lineHeight: 1.6, color: flipped ? "#2a2220" : "#fff", fontWeight: flipped ? 400 : 500, whiteSpace: "pre-line" }
      }, flipped ? card.a : card.q),
      !flipped && React.createElement("div", {
        style: { fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 14, textAlign: "center" }
      }, "Tap to reveal answer")
    ),

    flipped && React.createElement("div", {
      style: { display: "flex", justifyContent: "center", gap: 10, marginTop: 16 }
    },
      React.createElement("button", {
        onClick: function() { mark(false); },
        style: { padding: "10px 24px", borderRadius: 10, border: "2px solid #c4929f", background: "transparent", color: "#c4929f", fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }
      }, "Review Again"),
      React.createElement("button", {
        onClick: function() { mark(true); },
        style: { padding: "10px 24px", borderRadius: 10, border: "none", background: "#8a9a7b", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }
      }, "Got It ✓")
    ),

    !flipped && React.createElement("div", {
      style: { display: "flex", justifyContent: "center", gap: 10, marginTop: 16 }
    },
      React.createElement("button", {
        onClick: prev,
        style: { padding: "8px 20px", borderRadius: 10, border: "1px solid rgba(200,136,152,0.25)", background: "#FFF4F0", color: "#5A3E4B", cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }
      }, "← Prev"),
      React.createElement("button", {
        onClick: next,
        style: { padding: "8px 20px", borderRadius: 10, border: "none", background: "#8a9a7b", color: "#fff", cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }
      }, "Next →")
    )
  );
}`;
const TOPIC3 = `function Topic3CueCards() {
  const [idx, setIdx] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [known, setKnown] = React.useState({});

  const cards = [
  {
    "q": "What is the GDP identity?",
    "a": "Y = C + I + G + NX\\n\\nC = Consumption\\nI = Investment\\nG = Government spending\\nNX = Net Exports (Exports − Imports)"
  },
  {
    "q": "How do you calculate inflation rate?",
    "a": "Inflation = (CPI_t − CPI_{t−1}) / CPI_{t−1} × 100\\n\\nNominal GDP: current prices\\nReal GDP: base-year prices (true output measure)"
  },
  {
    "q": "Why does AD slope downward? (3 effects)",
    "a": "1. Wealth Effect: Higher P → lower real wealth → less C\\n\\n2. Interest Rate Effect: Higher P → higher r → less I\\n\\n3. Exchange Rate Effect: Higher r → currency appreciates → less NX"
  },
  {
    "q": "Name 4 AD shifters.",
    "a": "1. Consumer/business confidence\\n2. Changes in wealth (housing, stocks)\\n3. Fiscal policy (ΔG, ΔT)\\n4. Monetary policy (Δ money supply, Δ interest rates)"
  },
  {
    "q": "Why does SRAS slope upward?",
    "a": "Sticky wages: nominal wages fixed by contracts in SR.\\n\\nIf P rises but wages unchanged → profit per unit rises → firms produce more.\\n\\nAlso: sticky markups."
  },
  {
    "q": "Name 3 SRAS shifters.",
    "a": "1. Commodity/input prices (oil, materials)\\n2. Nominal wages\\n3. Productivity changes\\n\\nHigher input costs → SRAS shifts left."
  },
  {
    "q": "What is LRAS and potential output?",
    "a": "LRAS is vertical at Y_p (potential output).\\n\\nY_p = output when all resources fully employed.\\n\\nIn LR, wages fully adjust and Y returns to Y_p."
  },
  {
    "q": "What is an inflationary gap?",
    "a": "Y > Y_p (economy overheating)\\n\\nSelf-correction: wages rise → SRAS shifts left → P↑, Y falls back to Y_p."
  },
  {
    "q": "What is a recessionary gap?",
    "a": "Y < Y_p (economy in recession)\\n\\nSelf-correction: wages fall → SRAS shifts right → P↓, Y rises back to Y_p."
  },
  {
    "q": "What causes stagflation?",
    "a": "Negative supply shock → SRAS shifts left\\n\\nResult: P↑ AND Y↓ simultaneously.\\n\\nPolicy dilemma: can't fix both inflation and recession at once."
  }
];

  const total = cards.length;
  const knownCount = Object.values(known).filter(Boolean).length;
  const card = cards[idx];
  const next = () => { setFlipped(false); setIdx(i => (i + 1) % total); };
  const prev = () => { setFlipped(false); setIdx(i => (i - 1 + total) % total); };
  const mark = (v) => { setKnown(k => ({ ...k, [idx]: v })); next(); };

  const COLOR = "#2C5F2D";

  return React.createElement("div", {
    style: { fontFamily: "'Outfit', system-ui, sans-serif", maxWidth: 540, margin: "0 auto", padding: 20 }
  },
    React.createElement("div", { style: { textAlign: "center", marginBottom: 16 } },
      React.createElement("h2", {
        style: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, fontWeight: 700, color: "#2a2220", margin: 0 }
      }, "Topic 3: The AD/AS Model"),
      React.createElement("p", {
        style: { fontSize: 12, color: "#a89a88", marginTop: 4 }
      }, "Card " + (idx + 1) + " of " + total + "  ·  " + knownCount + " mastered"),
      React.createElement("div", {
        style: { height: 4, background: "#e8e0d4", borderRadius: 2, marginTop: 10, overflow: "hidden" }
      },
        React.createElement("div", {
          style: { height: "100%", width: ((idx + 1) / total * 100) + "%", background: "#8a9a7b", borderRadius: 2, transition: "width 0.3s" }
        })
      )
    ),

    React.createElement("div", {
      onClick: function() { setFlipped(!flipped); },
      style: {
        background: flipped ? "#f4f6f2" : COLOR,
        border: flipped ? "2px solid " + COLOR : "2px solid transparent",
        borderRadius: 14, padding: "32px 24px", minHeight: 220,
        display: "flex", flexDirection: "column", justifyContent: "center",
        cursor: "pointer", transition: "all 0.25s",
        boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
      }
    },
      React.createElement("div", {
        style: { fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: flipped ? COLOR : "rgba(255,255,255,0.5)", marginBottom: 12 }
      }, flipped ? "Answer" : "Question"),
      React.createElement("div", {
        style: { fontSize: flipped ? 15 : 19, lineHeight: 1.6, color: flipped ? "#2a2220" : "#fff", fontWeight: flipped ? 400 : 500, whiteSpace: "pre-line" }
      }, flipped ? card.a : card.q),
      !flipped && React.createElement("div", {
        style: { fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 14, textAlign: "center" }
      }, "Tap to reveal answer")
    ),

    flipped && React.createElement("div", {
      style: { display: "flex", justifyContent: "center", gap: 10, marginTop: 16 }
    },
      React.createElement("button", {
        onClick: function() { mark(false); },
        style: { padding: "10px 24px", borderRadius: 10, border: "2px solid #c4929f", background: "transparent", color: "#c4929f", fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }
      }, "Review Again"),
      React.createElement("button", {
        onClick: function() { mark(true); },
        style: { padding: "10px 24px", borderRadius: 10, border: "none", background: "#8a9a7b", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }
      }, "Got It ✓")
    ),

    !flipped && React.createElement("div", {
      style: { display: "flex", justifyContent: "center", gap: 10, marginTop: 16 }
    },
      React.createElement("button", {
        onClick: prev,
        style: { padding: "8px 20px", borderRadius: 10, border: "1px solid rgba(200,136,152,0.25)", background: "#FFF4F0", color: "#5A3E4B", cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }
      }, "← Prev"),
      React.createElement("button", {
        onClick: next,
        style: { padding: "8px 20px", borderRadius: 10, border: "none", background: "#8a9a7b", color: "#fff", cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }
      }, "Next →")
    )
  );
}`;
const TOPIC4 = `function Topic4CueCards() {
  const [idx, setIdx] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [known, setKnown] = React.useState({});

  const cards = [
  {
    "q": "Describe the monetary policy transmission mechanism.",
    "a": "Central bank buys T-bills → money supply ↑ → overnight rate ↓ → market interest rates ↓ → I↑, NX↑ → AD shifts right → Y↑\\n\\nRisk: inflation if already at Y_p."
  },
  {
    "q": "What are the 3 key monetary policy tools?",
    "a": "1. Overnight rate — rate banks charge each other (main tool)\\n\\n2. Open market operations — buy/sell T-bills\\n\\n3. QE — buy long-term assets when rates near zero"
  },
  {
    "q": "How does fiscal policy shift AD?",
    "a": "↑G → AD right directly\\n↓T → disposable income ↑ → C↑ → AD right\\n\\nMultiplier effect: total ΔY > initial ΔG\\n\\nRisks: government debt, lags"
  },
  {
    "q": "Why is an AS shock harder than an AD shock?",
    "a": "AS shock causes BOTH recession (Y↓) and inflation (P↑).\\n\\nDilemma:\\n• Stimulate AD → fixes Y but worsens inflation\\n• Do nothing → painful but self-corrects in LR\\n\\nCan't fix both simultaneously."
  },
  {
    "q": "2008 Financial Crisis — what happened?",
    "a": "AD shock: credit froze, spending collapsed.\\n\\nResponses:\\n• QE (bought assets)\\n• TARP (bank bailouts)\\n• Fiscal stimulus\\n• BoC cut overnight rate\\n\\nSlow recovery, avoided depression."
  },
  {
    "q": "COVID → 2022 inflation story?",
    "a": "2020: Both AD and AS shifted left (shutdown + supply chains).\\nMassive fiscal + monetary response.\\n\\n2021-22: Demand recovered faster than supply → inflationary gap.\\n\\n2022-23: BoC raised rates aggressively to cool inflation."
  }
];

  const total = cards.length;
  const knownCount = Object.values(known).filter(Boolean).length;
  const card = cards[idx];
  const next = () => { setFlipped(false); setIdx(i => (i + 1) % total); };
  const prev = () => { setFlipped(false); setIdx(i => (i - 1 + total) % total); };
  const mark = (v) => { setKnown(k => ({ ...k, [idx]: v })); next(); };

  const COLOR = "#4a6a3a";

  return React.createElement("div", {
    style: { fontFamily: "'Outfit', system-ui, sans-serif", maxWidth: 540, margin: "0 auto", padding: 20 }
  },
    React.createElement("div", { style: { textAlign: "center", marginBottom: 16 } },
      React.createElement("h2", {
        style: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, fontWeight: 700, color: "#2a2220", margin: 0 }
      }, "Topic 4: Macro Shocks & Gov Policy"),
      React.createElement("p", {
        style: { fontSize: 12, color: "#a89a88", marginTop: 4 }
      }, "Card " + (idx + 1) + " of " + total + "  ·  " + knownCount + " mastered"),
      React.createElement("div", {
        style: { height: 4, background: "#e8e0d4", borderRadius: 2, marginTop: 10, overflow: "hidden" }
      },
        React.createElement("div", {
          style: { height: "100%", width: ((idx + 1) / total * 100) + "%", background: "#8a9a7b", borderRadius: 2, transition: "width 0.3s" }
        })
      )
    ),

    React.createElement("div", {
      onClick: function() { setFlipped(!flipped); },
      style: {
        background: flipped ? "#f4f6f2" : COLOR,
        border: flipped ? "2px solid " + COLOR : "2px solid transparent",
        borderRadius: 14, padding: "32px 24px", minHeight: 220,
        display: "flex", flexDirection: "column", justifyContent: "center",
        cursor: "pointer", transition: "all 0.25s",
        boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
      }
    },
      React.createElement("div", {
        style: { fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: flipped ? COLOR : "rgba(255,255,255,0.5)", marginBottom: 12 }
      }, flipped ? "Answer" : "Question"),
      React.createElement("div", {
        style: { fontSize: flipped ? 15 : 19, lineHeight: 1.6, color: flipped ? "#2a2220" : "#fff", fontWeight: flipped ? 400 : 500, whiteSpace: "pre-line" }
      }, flipped ? card.a : card.q),
      !flipped && React.createElement("div", {
        style: { fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 14, textAlign: "center" }
      }, "Tap to reveal answer")
    ),

    flipped && React.createElement("div", {
      style: { display: "flex", justifyContent: "center", gap: 10, marginTop: 16 }
    },
      React.createElement("button", {
        onClick: function() { mark(false); },
        style: { padding: "10px 24px", borderRadius: 10, border: "2px solid #c4929f", background: "transparent", color: "#c4929f", fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }
      }, "Review Again"),
      React.createElement("button", {
        onClick: function() { mark(true); },
        style: { padding: "10px 24px", borderRadius: 10, border: "none", background: "#8a9a7b", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }
      }, "Got It ✓")
    ),

    !flipped && React.createElement("div", {
      style: { display: "flex", justifyContent: "center", gap: 10, marginTop: 16 }
    },
      React.createElement("button", {
        onClick: prev,
        style: { padding: "8px 20px", borderRadius: 10, border: "1px solid rgba(200,136,152,0.25)", background: "#FFF4F0", color: "#5A3E4B", cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }
      }, "← Prev"),
      React.createElement("button", {
        onClick: next,
        style: { padding: "8px 20px", borderRadius: 10, border: "none", background: "#8a9a7b", color: "#fff", cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }
      }, "Next →")
    )
  );
}`;
const TOPIC5 = `function Topic5CueCards() {
  const [idx, setIdx] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [known, setKnown] = React.useState({});

  const cards = [
  {
    "q": "What is the "Should I?" decision rule?",
    "a": "Take action if and only if:\\n\\nNEB > 0\\n\\nNet Economic Benefit = Benefit − Opportunity Cost"
  },
  {
    "q": "What is opportunity cost?",
    "a": "What you give up to take an action.\\n\\n= Explicit costs (actual $ payments)\\n+ Implicit costs (value of next-best alternative forgone)\\n\\nAlways ≥ accounting cost."
  },
  {
    "q": "Why should sunk costs be ignored?",
    "a": "Sunk costs are already incurred and CANNOT be recovered regardless of your decision.\\n\\nRule: IRRELEVANT to forward-looking decisions.\\n\\nOnly future costs and benefits matter."
  },
  {
    "q": "Accounting cost vs Economic cost?",
    "a": "Accounting cost = explicit costs only (what shows on books)\\n\\nEconomic cost = explicit + implicit costs (includes opportunity cost)\\n\\nEconomic cost ≥ Accounting cost always."
  },
  {
    "q": "What is the "How Many?" rule?",
    "a": "Marginal analysis:\\n\\nMB = ΔB/Δq (marginal benefit)\\nMC = ΔC/Δq (marginal cost)\\n\\nOptimal q*: where MB = MC\\nIncrease q while MB > MC."
  },
  {
    "q": "Wine bar: Rev $300K, explicit $200K, salary forgone $120K. Should you open?",
    "a": "NEB = Benefit − Opportunity Cost\\n= $300K − ($200K + $120K)\\n= $300K − $320K\\n= −$20K\\n\\nNO! Economic net benefit is negative."
  },
  {
    "q": "How many workers should you hire?",
    "a": "Hire until:\\nMB of next worker = MC of next worker\\n\\nMB = Marginal Revenue Product (extra revenue)\\nMC = Wage\\n\\nIf MB > wage → hire.\\nIf MB < wage → don't hire."
  }
];

  const total = cards.length;
  const knownCount = Object.values(known).filter(Boolean).length;
  const card = cards[idx];
  const next = () => { setFlipped(false); setIdx(i => (i + 1) % total); };
  const prev = () => { setFlipped(false); setIdx(i => (i - 1 + total) % total); };
  const mark = (v) => { setKnown(k => ({ ...k, [idx]: v })); next(); };

  const COLOR = "#B85042";

  return React.createElement("div", {
    style: { fontFamily: "'Outfit', system-ui, sans-serif", maxWidth: 540, margin: "0 auto", padding: 20 }
  },
    React.createElement("div", { style: { textAlign: "center", marginBottom: 16 } },
      React.createElement("h2", {
        style: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, fontWeight: 700, color: "#2a2220", margin: 0 }
      }, "Topic 5: 'Should I?' & 'How Many?'"),
      React.createElement("p", {
        style: { fontSize: 12, color: "#a89a88", marginTop: 4 }
      }, "Card " + (idx + 1) + " of " + total + "  ·  " + knownCount + " mastered"),
      React.createElement("div", {
        style: { height: 4, background: "#e8e0d4", borderRadius: 2, marginTop: 10, overflow: "hidden" }
      },
        React.createElement("div", {
          style: { height: "100%", width: ((idx + 1) / total * 100) + "%", background: "#8a9a7b", borderRadius: 2, transition: "width 0.3s" }
        })
      )
    ),

    React.createElement("div", {
      onClick: function() { setFlipped(!flipped); },
      style: {
        background: flipped ? "#f4f6f2" : COLOR,
        border: flipped ? "2px solid " + COLOR : "2px solid transparent",
        borderRadius: 14, padding: "32px 24px", minHeight: 220,
        display: "flex", flexDirection: "column", justifyContent: "center",
        cursor: "pointer", transition: "all 0.25s",
        boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
      }
    },
      React.createElement("div", {
        style: { fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: flipped ? COLOR : "rgba(255,255,255,0.5)", marginBottom: 12 }
      }, flipped ? "Answer" : "Question"),
      React.createElement("div", {
        style: { fontSize: flipped ? 15 : 19, lineHeight: 1.6, color: flipped ? "#2a2220" : "#fff", fontWeight: flipped ? 400 : 500, whiteSpace: "pre-line" }
      }, flipped ? card.a : card.q),
      !flipped && React.createElement("div", {
        style: { fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 14, textAlign: "center" }
      }, "Tap to reveal answer")
    ),

    flipped && React.createElement("div", {
      style: { display: "flex", justifyContent: "center", gap: 10, marginTop: 16 }
    },
      React.createElement("button", {
        onClick: function() { mark(false); },
        style: { padding: "10px 24px", borderRadius: 10, border: "2px solid #c4929f", background: "transparent", color: "#c4929f", fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }
      }, "Review Again"),
      React.createElement("button", {
        onClick: function() { mark(true); },
        style: { padding: "10px 24px", borderRadius: 10, border: "none", background: "#8a9a7b", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }
      }, "Got It ✓")
    ),

    !flipped && React.createElement("div", {
      style: { display: "flex", justifyContent: "center", gap: 10, marginTop: 16 }
    },
      React.createElement("button", {
        onClick: prev,
        style: { padding: "8px 20px", borderRadius: 10, border: "1px solid rgba(200,136,152,0.25)", background: "#FFF4F0", color: "#5A3E4B", cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }
      }, "← Prev"),
      React.createElement("button", {
        onClick: next,
        style: { padding: "8px 20px", borderRadius: 10, border: "none", background: "#8a9a7b", color: "#fff", cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }
      }, "Next →")
    )
  );
}`;
const TOPIC6 = `function Topic6CueCards() {
  const [idx, setIdx] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [known, setKnown] = React.useState({});

  const cards = [
  {
    "q": "Key features of perfect competition?",
    "a": "1. Many small firms\\n2. Homogeneous products\\n3. Free entry and exit\\n\\n→ Firms are price takers\\n→ Each firm faces horizontal demand at P*"
  },
  {
    "q": "Optimal output in perfect competition?",
    "a": "Produce where P = MC\\n\\n(Since MR = P for a price taker, this is MR = MC)\\n\\nFirm's MC curve (above AVC) IS its supply curve."
  },
  {
    "q": "SR shutdown rule? LR exit rule?",
    "a": "SR: Shut down if P < AVC\\n(Continue if P ≥ AVC, even at a loss)\\n\\nLR: Exit if P < ATC\\n(Must cover ALL costs long-term)"
  },
  {
    "q": "Long-run competitive equilibrium?",
    "a": "Entry/exit drives economic profit to zero.\\n\\nP = min ATC\\n\\nAll firms earn normal (zero economic) profit.\\n\\nInvestors don't like competitive markets!"
  },
  {
    "q": "Monopolist's optimal output and pricing?",
    "a": "1. Set MR = MC → find Q*\\n2. Read price from demand curve at Q* → P*\\n\\nKey: P* > MC (monopolist has markup)\\nKey: MR < P (must lower price on ALL units)"
  },
  {
    "q": "If P = a − bQ, what is MR?",
    "a": "MR = a − 2bQ\\n\\nSame intercept (a), DOUBLE the slope (−2b).\\n\\nThis always holds for linear demand."
  },
  {
    "q": "What is the Lerner markup rule?",
    "a": "P = MC / (1 + 1/Ed)\\n\\nMore inelastic demand (|Ed| close to 1) → higher markup.\\nMore elastic demand (|Ed| large) → closer to MC."
  },
  {
    "q": "Monopolistic competition in the long run?",
    "a": "Entry shifts each firm's demand LEFT until P = ATC → zero economic profit.\\n\\nExcess capacity remains.\\n\\nTechnique: same as monopoly but use firm's OWN demand, not market demand."
  }
];

  const total = cards.length;
  const knownCount = Object.values(known).filter(Boolean).length;
  const card = cards[idx];
  const next = () => { setFlipped(false); setIdx(i => (i + 1) % total); };
  const prev = () => { setFlipped(false); setIdx(i => (i - 1 + total) % total); };
  const mark = (v) => { setKnown(k => ({ ...k, [idx]: v })); next(); };

  const COLOR = "#6D2E46";

  return React.createElement("div", {
    style: { fontFamily: "'Outfit', system-ui, sans-serif", maxWidth: 540, margin: "0 auto", padding: 20 }
  },
    React.createElement("div", { style: { textAlign: "center", marginBottom: 16 } },
      React.createElement("h2", {
        style: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, fontWeight: 700, color: "#2a2220", margin: 0 }
      }, "Topic 6: Fundamental Managerial Decisions"),
      React.createElement("p", {
        style: { fontSize: 12, color: "#a89a88", marginTop: 4 }
      }, "Card " + (idx + 1) + " of " + total + "  ·  " + knownCount + " mastered"),
      React.createElement("div", {
        style: { height: 4, background: "#e8e0d4", borderRadius: 2, marginTop: 10, overflow: "hidden" }
      },
        React.createElement("div", {
          style: { height: "100%", width: ((idx + 1) / total * 100) + "%", background: "#8a9a7b", borderRadius: 2, transition: "width 0.3s" }
        })
      )
    ),

    React.createElement("div", {
      onClick: function() { setFlipped(!flipped); },
      style: {
        background: flipped ? "#f4f6f2" : COLOR,
        border: flipped ? "2px solid " + COLOR : "2px solid transparent",
        borderRadius: 14, padding: "32px 24px", minHeight: 220,
        display: "flex", flexDirection: "column", justifyContent: "center",
        cursor: "pointer", transition: "all 0.25s",
        boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
      }
    },
      React.createElement("div", {
        style: { fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: flipped ? COLOR : "rgba(255,255,255,0.5)", marginBottom: 12 }
      }, flipped ? "Answer" : "Question"),
      React.createElement("div", {
        style: { fontSize: flipped ? 15 : 19, lineHeight: 1.6, color: flipped ? "#2a2220" : "#fff", fontWeight: flipped ? 400 : 500, whiteSpace: "pre-line" }
      }, flipped ? card.a : card.q),
      !flipped && React.createElement("div", {
        style: { fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 14, textAlign: "center" }
      }, "Tap to reveal answer")
    ),

    flipped && React.createElement("div", {
      style: { display: "flex", justifyContent: "center", gap: 10, marginTop: 16 }
    },
      React.createElement("button", {
        onClick: function() { mark(false); },
        style: { padding: "10px 24px", borderRadius: 10, border: "2px solid #c4929f", background: "transparent", color: "#c4929f", fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }
      }, "Review Again"),
      React.createElement("button", {
        onClick: function() { mark(true); },
        style: { padding: "10px 24px", borderRadius: 10, border: "none", background: "#8a9a7b", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }
      }, "Got It ✓")
    ),

    !flipped && React.createElement("div", {
      style: { display: "flex", justifyContent: "center", gap: 10, marginTop: 16 }
    },
      React.createElement("button", {
        onClick: prev,
        style: { padding: "8px 20px", borderRadius: 10, border: "1px solid rgba(200,136,152,0.25)", background: "#FFF4F0", color: "#5A3E4B", cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }
      }, "← Prev"),
      React.createElement("button", {
        onClick: next,
        style: { padding: "8px 20px", borderRadius: 10, border: "none", background: "#8a9a7b", color: "#fff", cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }
      }, "Next →")
    )
  );
}`;
const TOPIC7 = `function Topic7CueCards() {
  const [idx, setIdx] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [known, setKnown] = React.useState({});

  const cards = [
  {
    "q": "What is 3rd degree price discrimination?",
    "a": "Charging different prices to different identifiable groups.\\n\\nRule: More elastic group → lower price.\\n\\nFormula: P_i = MC / (1 + 1/Ed_i)\\n\\nEx: Student discounts, Best Buy HDMI cables."
  },
  {
    "q": "3 conditions for price discrimination to work?",
    "a": "1. Market power (not perfect competition)\\n2. Ability to identify and separate groups\\n3. No resale (arbitrage) between groups\\n\\nIf consumers can resell, it breaks down."
  },
  {
    "q": "What is a two-part tariff?",
    "a": "Total payment = T (entry fee) + p × Q\\n\\nOptimal: set p = MC, T = CS at that price.\\n\\nCaptures ALL surplus as profit.\\n\\nEx: Costco membership, gym memberships."
  },
  {
    "q": "What is 2nd degree price discrimination?",
    "a": "Quantity discounts: lower per-unit price for larger purchases.\\n\\nEx: Buy 1 for $10, 3 for $25.\\n\\nCaptures more CS from high-volume buyers."
  },
  {
    "q": "What is 1st degree (perfect) price discrimination?",
    "a": "Charge each consumer their WTP.\\n\\nCaptures ALL consumer surplus → CS = 0.\\nNo DWL (efficient Q produced).\\n\\nHard in practice. Approximated by auctions, negotiation."
  },
  {
    "q": "Price discrimination vs uniform pricing — profit?",
    "a": "Price discrimination ALWAYS yields ≥ profit vs uniform pricing.\\n\\nWhy: extracts more surplus by tailoring prices to each group's elasticity."
  }
];

  const total = cards.length;
  const knownCount = Object.values(known).filter(Boolean).length;
  const card = cards[idx];
  const next = () => { setFlipped(false); setIdx(i => (i + 1) % total); };
  const prev = () => { setFlipped(false); setIdx(i => (i - 1 + total) % total); };
  const mark = (v) => { setKnown(k => ({ ...k, [idx]: v })); next(); };

  const COLOR = "#028090";

  return React.createElement("div", {
    style: { fontFamily: "'Outfit', system-ui, sans-serif", maxWidth: 540, margin: "0 auto", padding: 20 }
  },
    React.createElement("div", { style: { textAlign: "center", marginBottom: 16 } },
      React.createElement("h2", {
        style: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, fontWeight: 700, color: "#2a2220", margin: 0 }
      }, "Topic 7: Pricing with Market Power"),
      React.createElement("p", {
        style: { fontSize: 12, color: "#a89a88", marginTop: 4 }
      }, "Card " + (idx + 1) + " of " + total + "  ·  " + knownCount + " mastered"),
      React.createElement("div", {
        style: { height: 4, background: "#e8e0d4", borderRadius: 2, marginTop: 10, overflow: "hidden" }
      },
        React.createElement("div", {
          style: { height: "100%", width: ((idx + 1) / total * 100) + "%", background: "#8a9a7b", borderRadius: 2, transition: "width 0.3s" }
        })
      )
    ),

    React.createElement("div", {
      onClick: function() { setFlipped(!flipped); },
      style: {
        background: flipped ? "#f4f6f2" : COLOR,
        border: flipped ? "2px solid " + COLOR : "2px solid transparent",
        borderRadius: 14, padding: "32px 24px", minHeight: 220,
        display: "flex", flexDirection: "column", justifyContent: "center",
        cursor: "pointer", transition: "all 0.25s",
        boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
      }
    },
      React.createElement("div", {
        style: { fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: flipped ? COLOR : "rgba(255,255,255,0.5)", marginBottom: 12 }
      }, flipped ? "Answer" : "Question"),
      React.createElement("div", {
        style: { fontSize: flipped ? 15 : 19, lineHeight: 1.6, color: flipped ? "#2a2220" : "#fff", fontWeight: flipped ? 400 : 500, whiteSpace: "pre-line" }
      }, flipped ? card.a : card.q),
      !flipped && React.createElement("div", {
        style: { fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 14, textAlign: "center" }
      }, "Tap to reveal answer")
    ),

    flipped && React.createElement("div", {
      style: { display: "flex", justifyContent: "center", gap: 10, marginTop: 16 }
    },
      React.createElement("button", {
        onClick: function() { mark(false); },
        style: { padding: "10px 24px", borderRadius: 10, border: "2px solid #c4929f", background: "transparent", color: "#c4929f", fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }
      }, "Review Again"),
      React.createElement("button", {
        onClick: function() { mark(true); },
        style: { padding: "10px 24px", borderRadius: 10, border: "none", background: "#8a9a7b", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }
      }, "Got It ✓")
    ),

    !flipped && React.createElement("div", {
      style: { display: "flex", justifyContent: "center", gap: 10, marginTop: 16 }
    },
      React.createElement("button", {
        onClick: prev,
        style: { padding: "8px 20px", borderRadius: 10, border: "1px solid rgba(200,136,152,0.25)", background: "#FFF4F0", color: "#5A3E4B", cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }
      }, "← Prev"),
      React.createElement("button", {
        onClick: next,
        style: { padding: "8px 20px", borderRadius: 10, border: "none", background: "#8a9a7b", color: "#fff", cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }
      }, "Next →")
    )
  );
}`;
const TOPIC8 = `function Topic8CueCards() {
  const [idx, setIdx] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [known, setKnown] = React.useState({});

  const cards = [
  {
    "q": "What is a Nash Equilibrium?",
    "a": "A set of strategies where NO player can improve by unilaterally changing their strategy.\\n\\nBoth players are playing their best response to each other."
  },
  {
    "q": "How do you find NE? (Best response method)",
    "a": "1. For P1: circle best payoff in each COLUMN\\n2. For P2: circle best payoff in each ROW\\n3. NE = cell where BOTH are circled\\n\\nMay have 0, 1, or multiple NE."
  },
  {
    "q": "What is a dominant strategy?",
    "a": "A strategy that is best REGARDLESS of what the rival does.\\n\\nIf both have dominant strategies → unique NE.\\n\\nNot all games have dominant strategies."
  },
  {
    "q": "Explain the Prisoners' Dilemma.",
    "a": "Both have dominant strategy to DEFECT.\\nNE: Both defect.\\nBUT: mutual cooperation > mutual defection!\\n\\nIndividual rationality ≠ collective rationality.\\n\\nEx: Ad wars, price wars, arms races."
  },
  {
    "q": "What is Cournot competition?",
    "a": "Firms simultaneously choose QUANTITIES.\\nP = a − b(Q1 + Q2)\\n\\nEach maximizes profit given rival's Q → best response functions.\\n\\nNE: Q between monopoly and competitive levels."
  },
  {
    "q": "Bertrand competition & the Bertrand paradox?",
    "a": "Firms simultaneously choose PRICES.\\nConsumers buy from lowest-price firm.\\n\\nWith identical products: NE is P = MC!\\n\\nParadox: Only 2 firms but competitive pricing.\\nDifferentiation softens this."
  },
  {
    "q": "What about games with multiple NE?",
    "a": "Coordination problem: players need to land on same equilibrium.\\n\\nExamples: Tech standards, driving on left vs right.\\n\\nFocal points or communication help coordinate."
  }
];

  const total = cards.length;
  const knownCount = Object.values(known).filter(Boolean).length;
  const card = cards[idx];
  const next = () => { setFlipped(false); setIdx(i => (i + 1) % total); };
  const prev = () => { setFlipped(false); setIdx(i => (i - 1 + total) % total); };
  const mark = (v) => { setKnown(k => ({ ...k, [idx]: v })); next(); };

  const COLOR = "#990011";

  return React.createElement("div", {
    style: { fontFamily: "'Outfit', system-ui, sans-serif", maxWidth: 540, margin: "0 auto", padding: 20 }
  },
    React.createElement("div", { style: { textAlign: "center", marginBottom: 16 } },
      React.createElement("h2", {
        style: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, fontWeight: 700, color: "#2a2220", margin: 0 }
      }, "Topic 8: Game Theory I"),
      React.createElement("p", {
        style: { fontSize: 12, color: "#a89a88", marginTop: 4 }
      }, "Card " + (idx + 1) + " of " + total + "  ·  " + knownCount + " mastered"),
      React.createElement("div", {
        style: { height: 4, background: "#e8e0d4", borderRadius: 2, marginTop: 10, overflow: "hidden" }
      },
        React.createElement("div", {
          style: { height: "100%", width: ((idx + 1) / total * 100) + "%", background: "#8a9a7b", borderRadius: 2, transition: "width 0.3s" }
        })
      )
    ),

    React.createElement("div", {
      onClick: function() { setFlipped(!flipped); },
      style: {
        background: flipped ? "#f4f6f2" : COLOR,
        border: flipped ? "2px solid " + COLOR : "2px solid transparent",
        borderRadius: 14, padding: "32px 24px", minHeight: 220,
        display: "flex", flexDirection: "column", justifyContent: "center",
        cursor: "pointer", transition: "all 0.25s",
        boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
      }
    },
      React.createElement("div", {
        style: { fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: flipped ? COLOR : "rgba(255,255,255,0.5)", marginBottom: 12 }
      }, flipped ? "Answer" : "Question"),
      React.createElement("div", {
        style: { fontSize: flipped ? 15 : 19, lineHeight: 1.6, color: flipped ? "#2a2220" : "#fff", fontWeight: flipped ? 400 : 500, whiteSpace: "pre-line" }
      }, flipped ? card.a : card.q),
      !flipped && React.createElement("div", {
        style: { fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 14, textAlign: "center" }
      }, "Tap to reveal answer")
    ),

    flipped && React.createElement("div", {
      style: { display: "flex", justifyContent: "center", gap: 10, marginTop: 16 }
    },
      React.createElement("button", {
        onClick: function() { mark(false); },
        style: { padding: "10px 24px", borderRadius: 10, border: "2px solid #c4929f", background: "transparent", color: "#c4929f", fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }
      }, "Review Again"),
      React.createElement("button", {
        onClick: function() { mark(true); },
        style: { padding: "10px 24px", borderRadius: 10, border: "none", background: "#8a9a7b", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }
      }, "Got It ✓")
    ),

    !flipped && React.createElement("div", {
      style: { display: "flex", justifyContent: "center", gap: 10, marginTop: 16 }
    },
      React.createElement("button", {
        onClick: prev,
        style: { padding: "8px 20px", borderRadius: 10, border: "1px solid rgba(200,136,152,0.25)", background: "#FFF4F0", color: "#5A3E4B", cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }
      }, "← Prev"),
      React.createElement("button", {
        onClick: next,
        style: { padding: "8px 20px", borderRadius: 10, border: "none", background: "#8a9a7b", color: "#fff", cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }
      }, "Next →")
    )
  );
}`;
const TOPIC9 = `function Topic9CueCards() {
  const [idx, setIdx] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [known, setKnown] = React.useState({});

  const cards = [
  {
    "q": "How do you solve a sequential game?",
    "a": "BACKWARD INDUCTION:\\n1. Start at final decision nodes\\n2. Pick payoff-maximizing action at each\\n3. Replace node with resulting payoff\\n4. Move backward to root\\n\\nGives subgame-perfect NE (SPNE)."
  },
  {
    "q": "What is first-mover advantage?",
    "a": "By committing first, a player influences rival's response and secures a better outcome than simultaneous play.\\n\\nKey: commitment must be observable and irreversible."
  },
  {
    "q": "When is a threat credible vs empty?",
    "a": "Credible: carrying it out is in your interest AFTER rival acts.\\n\\nEmpty: you wouldn't actually follow through.\\n\\nBackward induction reveals empty threats — rival knows you won't carry through."
  },
  {
    "q": "Name 3 commitment devices.",
    "a": "1. Irreversible investment (capacity expansion)\\n2. Contractual obligations (price-match guarantees)\\n3. Burning bridges (eliminate retreat option)\\n\\nAll change your own future incentives."
  },
  {
    "q": "How does Stackelberg competition work?",
    "a": "Leader commits to Q first.\\nFollower observes, best-responds.\\n\\nResult:\\n• Leader: MORE output, MORE profit than Cournot\\n• Follower: LESS output, LESS profit\\n• Total Q > Cournot; Price < Cournot"
  },
  {
    "q": "How is cooperation sustained in repeated games?",
    "a": "Trigger strategy: cooperate until rival defects, then punish forever.\\n\\nWorks if:\\n• Game repeated indefinitely\\n• Future payoffs valued enough (low discount rate)\\n\\nBreaks down in finitely repeated games (unraveling)."
  },
  {
    "q": "How do you decide under uncertainty?",
    "a": "Expected Value:\\nEV = Σ(prob_i × payoff_i)\\n\\nRisk-neutral: choose max EV.\\nRisk-averse: prefer certainty, may choose lower EV.\\n\\nEx: EV = 0.35($40K) + 0.65(−$10K) = $7.5K"
  }
];

  const total = cards.length;
  const knownCount = Object.values(known).filter(Boolean).length;
  const card = cards[idx];
  const next = () => { setFlipped(false); setIdx(i => (i + 1) % total); };
  const prev = () => { setFlipped(false); setIdx(i => (i - 1 + total) % total); };
  const mark = (v) => { setKnown(k => ({ ...k, [idx]: v })); next(); };

  const COLOR = "#36454F";

  return React.createElement("div", {
    style: { fontFamily: "'Outfit', system-ui, sans-serif", maxWidth: 540, margin: "0 auto", padding: 20 }
  },
    React.createElement("div", { style: { textAlign: "center", marginBottom: 16 } },
      React.createElement("h2", {
        style: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, fontWeight: 700, color: "#2a2220", margin: 0 }
      }, "Topic 9: Game Theory II — Strategies Over Time"),
      React.createElement("p", {
        style: { fontSize: 12, color: "#a89a88", marginTop: 4 }
      }, "Card " + (idx + 1) + " of " + total + "  ·  " + knownCount + " mastered"),
      React.createElement("div", {
        style: { height: 4, background: "#e8e0d4", borderRadius: 2, marginTop: 10, overflow: "hidden" }
      },
        React.createElement("div", {
          style: { height: "100%", width: ((idx + 1) / total * 100) + "%", background: "#8a9a7b", borderRadius: 2, transition: "width 0.3s" }
        })
      )
    ),

    React.createElement("div", {
      onClick: function() { setFlipped(!flipped); },
      style: {
        background: flipped ? "#f4f6f2" : COLOR,
        border: flipped ? "2px solid " + COLOR : "2px solid transparent",
        borderRadius: 14, padding: "32px 24px", minHeight: 220,
        display: "flex", flexDirection: "column", justifyContent: "center",
        cursor: "pointer", transition: "all 0.25s",
        boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
      }
    },
      React.createElement("div", {
        style: { fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: flipped ? COLOR : "rgba(255,255,255,0.5)", marginBottom: 12 }
      }, flipped ? "Answer" : "Question"),
      React.createElement("div", {
        style: { fontSize: flipped ? 15 : 19, lineHeight: 1.6, color: flipped ? "#2a2220" : "#fff", fontWeight: flipped ? 400 : 500, whiteSpace: "pre-line" }
      }, flipped ? card.a : card.q),
      !flipped && React.createElement("div", {
        style: { fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 14, textAlign: "center" }
      }, "Tap to reveal answer")
    ),

    flipped && React.createElement("div", {
      style: { display: "flex", justifyContent: "center", gap: 10, marginTop: 16 }
    },
      React.createElement("button", {
        onClick: function() { mark(false); },
        style: { padding: "10px 24px", borderRadius: 10, border: "2px solid #c4929f", background: "transparent", color: "#c4929f", fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }
      }, "Review Again"),
      React.createElement("button", {
        onClick: function() { mark(true); },
        style: { padding: "10px 24px", borderRadius: 10, border: "none", background: "#8a9a7b", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }
      }, "Got It ✓")
    ),

    !flipped && React.createElement("div", {
      style: { display: "flex", justifyContent: "center", gap: 10, marginTop: 16 }
    },
      React.createElement("button", {
        onClick: prev,
        style: { padding: "8px 20px", borderRadius: 10, border: "1px solid rgba(200,136,152,0.25)", background: "#FFF4F0", color: "#5A3E4B", cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }
      }, "← Prev"),
      React.createElement("button", {
        onClick: next,
        style: { padding: "8px 20px", borderRadius: 10, border: "none", background: "#8a9a7b", color: "#fff", cursor: "pointer", fontSize: 13, fontFamily: "'Outfit', sans-serif" }
      }, "Next →")
    )
  );
}`;

export const SAMPLE_FILES: StudyFile[] = [
  makeSample('sample-topic1-cue-cards', 'topic1-cue-cards.jsx', TOPIC1),
  makeSample('sample-topic2-cue-cards', 'topic2-cue-cards.jsx', TOPIC2),
  makeSample('sample-topic3-cue-cards', 'topic3-cue-cards.jsx', TOPIC3),
  makeSample('sample-topic4-cue-cards', 'topic4-cue-cards.jsx', TOPIC4),
  makeSample('sample-topic5-cue-cards', 'topic5-cue-cards.jsx', TOPIC5),
  makeSample('sample-topic6-cue-cards', 'topic6-cue-cards.jsx', TOPIC6),
  makeSample('sample-topic7-cue-cards', 'topic7-cue-cards.jsx', TOPIC7),
  makeSample('sample-topic8-cue-cards', 'topic8-cue-cards.jsx', TOPIC8),
  makeSample('sample-topic9-cue-cards', 'topic9-cue-cards.jsx', TOPIC9),
]
