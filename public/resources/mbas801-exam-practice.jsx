import { useState, useCallback } from "react";

const QUESTIONS = [
  // TOPIC 1
  { topic: 1, type: "mc", q: "If the price of a substitute good increases, what happens to the demand curve for the original good?", options: ["Shifts left", "Shifts right", "Slides up along the curve", "No change"], correct: 1, explain: "When the price of a substitute rises, consumers switch to the original good → demand shifts right." },
  { topic: 1, type: "mc", q: "Which of the following is NOT a demand shifter?", options: ["Consumer income", "Price of the good itself", "Advertising", "Price of a complement"], correct: 1, explain: "The price of the good itself causes a slide along the curve, not a shift. Everything else shifts the curve." },
  { topic: 1, type: "mc", q: "If Qd = 286 − 20P and Qs = 88 + 40P, what is the equilibrium price?", options: ["$2.50", "$3.30", "$4.20", "$5.00"], correct: 1, explain: "Set 286 − 20P = 88 + 40P → 198 = 60P → P* = $3.30." },
  { topic: 1, type: "mc", q: "If the demand function is Qd = 36 − 4P, what is the inverse demand function?", options: ["P = 36 − 4Q", "P = 9 − 0.25Q", "P = 4 − 36Q", "P = 9 − 4Q"], correct: 1, explain: "Rearrange: 4P = 36 − Q → P = 9 − 0.25Q. The intercept is a/b = 36/4 = 9, slope is −1/b = −1/4." },
  { topic: 1, type: "mc", q: "A demand curve with b = 0 (Qd = a) is:", options: ["Perfectly elastic", "Perfectly inelastic", "Unit elastic", "Undefined"], correct: 1, explain: "If b = 0, quantity demanded doesn't change with price at all — demand is a vertical line = perfectly inelastic." },
  { topic: 1, type: "mc", q: "During March 2020, egg prices rose 180% while oil prices fell 76%. Which best explains this?", options: ["Both had supply shocks only", "Eggs: demand right + supply left. Oil: demand left + supply right", "Both had demand shocks only", "Eggs: supply right. Oil: demand left"], correct: 1, explain: "Eggs: pandemic stockpiling shifted demand right AND supply disruptions shifted supply left → price skyrocketed. Oil: lockdowns collapsed demand AND supply increased → price plummeted." },

  // TOPIC 2
  { topic: 2, type: "mc", q: "In a competitive market at equilibrium, consumer surplus is:", options: ["The area above the supply curve", "The area under the demand curve and above the price", "The area between supply and demand curves", "Equal to producer surplus"], correct: 1, explain: "Consumer surplus = the triangle between the demand curve above and the market price line below." },
  { topic: 2, type: "mc", q: "A price ceiling set below equilibrium causes:", options: ["A surplus and deadweight loss", "A shortage and deadweight loss", "Higher producer surplus", "No effect on quantity"], correct: 1, explain: "Below-equilibrium ceiling → quantity demanded > quantity supplied → shortage. Lost surplus (B + C) = deadweight loss." },
  { topic: 2, type: "mc", q: "What is the deadweight loss formula for both a price ceiling and an excise tax?", options: ["A + D", "B + C", "A + B + C", "A − B"], correct: 1, explain: "In both cases, the deadweight loss is the two triangles B + C — surplus that nobody receives." },
  { topic: 2, type: "mc", q: "A Pigouvian tax is designed to:", options: ["Raise maximum government revenue", "Correct an externality by aligning private and social costs", "Protect domestic producers from imports", "Reduce consumer surplus"], correct: 1, explain: "A Pigouvian tax equals the external cost per unit, forcing producers to internalize the externality and produce the socially optimal quantity." },

  // TOPIC 3
  { topic: 3, type: "mc", q: "In the national income identity Y ≡ C + I + G + NX, what does 'I' represent?", options: ["Consumer income", "Business investment (buildings, equipment, inventories)", "Government investment only", "Interest payments"], correct: 1, explain: "I = gross private domestic investment — spending by businesses on buildings, equipment, and inventory changes." },
  { topic: 3, type: "mc", q: "Which is NOT a reason Aggregate Demand slopes downward?", options: ["The wealth effect", "The interest rate effect", "The sticky wage effect", "The exchange rate effect"], correct: 2, explain: "Sticky wages explain why Aggregate Supply slopes upward. AD slopes down due to the wealth, interest rate, and exchange rate effects." },
  { topic: 3, type: "mc", q: "Stagflation occurs when:", options: ["AD shifts right", "AS shifts left — prices rise AND output falls", "Both AD and AS shift right", "AD shifts left — prices and output fall together"], correct: 1, explain: "A negative supply shock (like an oil price spike) shifts AS left → higher price level AND lower output = stagflation." },
  { topic: 3, type: "mc", q: "If the CPI basket cost $1,000 in the base year and $3,110 this year, real income on a $100,000 salary is:", options: ["$100,000", "$32,154", "$311,000", "$68,846"], correct: 1, explain: "CPI = 3.11. Real income = Nominal / CPI = $100,000 / 3.11 ≈ $32,154." },

  // TOPIC 4
  { topic: 4, type: "mc", q: "Expansionary monetary policy works by:", options: ["Raising taxes to increase government revenue", "Central bank buying bonds → interest rates fall → investment rises → AD shifts right", "Increasing government spending directly", "Central bank selling bonds → interest rates rise"], correct: 1, explain: "The central bank buys T-bills from banks → banks have more cash → rates fall → I and NX rise → AD shifts right." },
  { topic: 4, type: "mc", q: "The fiscal policy 'multiplier effect' means:", options: ["$1 of government spending creates exactly $1 in GDP", "Tax cuts always pay for themselves", "$1 of government spending creates more than $1 in total demand", "Government debt has no economic consequences"], correct: 2, explain: "Each dollar spent becomes someone's income, who spends part of it, which becomes someone else's income, etc. The chain of re-spending multiplies the initial impact." },
  { topic: 4, type: "mc", q: "Why are negative supply shocks harder for governments to address than demand shocks?", options: ["Supply shocks are always temporary", "Policy tools can't shift AS back", "Fixing recession worsens inflation and vice versa — can't fix both", "Governments can only use monetary policy for supply shocks"], correct: 2, explain: "A supply shock causes BOTH higher prices and lower output. Expansionary policy fixes output but worsens inflation; contractionary policy tames inflation but deepens recession." },

  // TOPIC 5
  { topic: 5, type: "mc", q: "Your brother's wine bar has $200K revenue and $50K in explicit costs. He could rent his space for $100K and earn $75K elsewhere. His economic profit is:", options: ["+$150,000", "+$75,000", "−$25,000", "$0"], correct: 2, explain: "Opportunity cost = $50K explicit + $100K forgone rent + $75K forgone salary = $225K. Economic profit = $200K − $225K = −$25K." },
  { topic: 5, type: "mc", q: "You paid a non-refundable $10,000 for a railcar lease you don't need. Someone offers $2,000 to sub-lease. You should:", options: ["Refuse — you'd lose $8,000", "Accept — the $10,000 is a sunk cost and $2,000 > $0", "Hold out for at least $5,000", "Accept only if offered $10,000"], correct: 1, explain: "The $10,000 is sunk — gone regardless. The choice is $2,000 (sub-lease) vs. $0 (don't). Always take $2,000." },
  { topic: 5, type: "mc", q: "You hire an assistant at $40/hour. Revenue from the q-th hour is $1,200/q. Optimal hours per month?", options: ["20", "25", "30", "40"], correct: 2, explain: "Set MB = MC: 1,200/q = 40 → q = 30 hours." },

  // TOPIC 6
  { topic: 6, type: "mc", q: "In perfect competition, a firm should produce where:", options: ["Price = Average Total Cost", "Price = Marginal Cost", "Marginal Revenue = Average Cost", "Price = Fixed Cost"], correct: 1, explain: "A competitive firm is a price-taker with MR = P*. The profit-maximizing rule MR = MC becomes P* = MC(q*)." },
  { topic: 6, type: "mc", q: "For a monopolist with inverse demand P = a − bQ, the marginal revenue function is:", options: ["MR = a − bQ", "MR = a − 2bQ", "MR = 2a − bQ", "MR = a/2 − bQ"], correct: 1, explain: "TR = (a − bQ)Q = aQ − bQ². Taking the derivative: MR = a − 2bQ. Same intercept, twice the slope." },
  { topic: 6, type: "mc", q: "If P = 775 − 375Q and MC = $25, the monopolist's optimal price is:", options: ["$25", "$400", "$775", "$375"], correct: 1, explain: "MR = 775 − 750Q. Set MR = MC: 775 − 750Q = 25 → Q* = 1. P* = 775 − 375(1) = $400." },
  { topic: 6, type: "mc", q: "A competitive firm should exit immediately when:", options: ["Price < zero-profit price", "Price < minimum price (Pmin)", "Profit is negative", "Price < average total cost"], correct: 1, explain: "Exit when P < Pmin (revenue doesn't cover variable costs). Between Pmin and P₀, the firm loses money but less than if it shut down — so stay in the short run." },

  // TOPIC 7
  { topic: 7, type: "mc", q: "Third-degree price discrimination means:", options: ["Charging different prices for different quantities", "Charging different prices to different customer groups based on elasticity", "Charging the maximum each customer will pay", "Charging the same price to everyone"], correct: 1, explain: "3rd-degree PD: charge lower prices to groups with more elastic demand, higher prices to less elastic groups." },
  { topic: 7, type: "mc", q: "With a two-part tariff and identical consumers, the firm should set:", options: ["P = highest WTP, F = 0", "P = MC, fixed fee = entire consumer surplus", "P above MC, no fixed fee", "P = 0, F = total revenue"], correct: 1, explain: "Set per-unit price at marginal cost (maximizes quantity), then extract all consumer surplus via the fixed fee. This is perfect price discrimination." },

  // TOPIC 8
  { topic: 8, type: "mc", q: "A Nash Equilibrium is a situation where:", options: ["Both players maximize their combined payoff", "No player can improve their payoff by unilaterally changing strategy", "Both players have dominant strategies", "One player always wins"], correct: 1, explain: "At a Nash Equilibrium, each player is doing the best they can given what the other is doing — no one has an incentive to deviate alone." },
  { topic: 8, type: "mc", q: "In the Prisoners' Dilemma, the Nash Equilibrium:", options: ["Maximizes total payoff", "Minimizes total payoff", "Does NOT maximize total payoff — both would prefer mutual cooperation", "Doesn't exist"], correct: 2, explain: "The core insight: individual rationality (each confessing) leads to a collectively inferior outcome. Both would prefer to cooperate but can't credibly commit." },
  { topic: 8, type: "mc", q: "In a Cournot duopoly with P = 100 − Q and MC = 10, each firm's equilibrium output is:", options: ["20", "30", "45", "60"], correct: 1, explain: "q* = (a − c) / 3b = (100 − 10) / (3 × 1) = 30 each." },
  { topic: 8, type: "mc", q: "In Bertrand competition, if Firm A creates value VA = $15 and Firm B creates VB = $10, Firm A's profit per consumer is:", options: ["$15", "$10", "$5", "$25"], correct: 2, explain: "Firm A's profit = VA − VB = $15 − $10 = $5 per consumer. The firm with more value captures the gap as profit." },

  // TOPIC 9
  { topic: 9, type: "mc", q: "To solve a sequential game, you should:", options: ["Find dominant strategies first", "Use backward induction — start at the end and work backward", "Randomly pick a strategy", "Always move first"], correct: 1, explain: "Backward induction: determine the follower's optimal move at each end node, then work backward to find the leader's best strategy." },
  { topic: 9, type: "mc", q: "In a Stackelberg duopoly with P = 100 − Q and MC = 10, the leader's output is:", options: ["30", "45", "22.5", "60"], correct: 1, explain: "Leader: q₁ = (a − c) / 2b = (100 − 10) / 2 = 45. (Compare to Cournot's 30 — the leader produces more by committing first.)" },
  { topic: 9, type: "mc", q: "In a finitely repeated Prisoners' Dilemma with a known endpoint:", options: ["Cooperation emerges in early rounds", "The Nash Equilibrium of the one-shot game is played in every round", "Players always cooperate", "Only the last round matters"], correct: 1, explain: "Backward induction from the last round: cheat in the last round (no future punishment), so cheat in second-to-last, so cheat in third-to-last... cheat every round." },

  // TOPIC 10
  { topic: 10, type: "mc", q: "Adverse selection in insurance means:", options: ["Insurers select the worst policies to offer", "Unhealthy people are more likely to buy, driving premiums up and healthy people out", "Healthy people buy too much insurance", "Insurance companies discriminate illegally"], correct: 1, explain: "Unhealthy people (who know they're high-risk) buy insurance → premiums rise → healthy people drop out → only high-risk remain → market unravels." },
  { topic: 10, type: "mc", q: "For a warranty to be a credible signal of high quality, it must be:", options: ["Free to offer", "More costly for low-quality sellers to match than for high-quality sellers", "Government mandated", "The same cost for all sellers"], correct: 1, explain: "If the signal costs the same for everyone, low-quality sellers would copy it. Credibility requires the cost to be disproportionately high for low-quality types." },
  { topic: 10, type: "mc", q: "Harry's cars cost $8K (WTP $10K), Lew's cost $5K (WTP $7K). Warranty: $500Y for Harry, $1,000Y for Lew. Minimum credible warranty?", options: ["1 year", "1.5 years", "Just over 1.5 years", "2 years"], correct: 2, explain: "Lew won't match when: $8,500 − $5,000 − $1,000Y < $2,000 → Y > 1.5 years. Optimal = just over 1.5 years." },
];

const TOPIC_NAMES = {
  1: "Demand, Supply & Markets",
  2: "Markets & Government",
  3: "The AD/AS Model",
  4: "Macro Shocks & Policy",
  5: '"Should I?" and "How Many?"',
  6: "Managerial Decisions",
  7: "Pricing with Market Power",
  8: "Game Theory I",
  9: "Game Theory II",
  10: "Asymmetric Information",
};

const COLORS = {
  bg: "#FFF4F0", card: "#FFEAE6", accent: "#5A3E4B", accentLight: "rgba(255,234,230,0.6)",
  correct: "#80C890", correctBg: "rgba(128,200,144,0.1)", wrong: "#F0849C", wrongBg: "rgba(240,132,156,0.08)",
  warm: "#FFEAE6", text: "#5A3E4B", textLight: "#C88898", border: "rgba(200,136,152,0.25)"
};

export default function JotGloss() {
  const [mode, setMode] = useState("menu");
  const [selectedTopics, setSelectedTopics] = useState(new Set([1,2,3,4,5,6,7,8,9,10]));
  const [deck, setDeck] = useState([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [showExplain, setShowExplain] = useState(false);
  const [score, setScore] = useState({ right: 0, wrong: 0, seen: 0 });
  const [history, setHistory] = useState([]);

  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const startQuiz = useCallback(() => {
    const pool = QUESTIONS.filter(q => selectedTopics.has(q.topic));
    const shuffled = shuffle(pool);
    setDeck(shuffled);
    setIdx(0);
    setPicked(null);
    setShowExplain(false);
    setScore({ right: 0, wrong: 0, seen: 0 });
    setHistory([]);
    setMode("quiz");
  }, [selectedTopics]);

  const toggleTopic = (t) => {
    setSelectedTopics(prev => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t); else next.add(t);
      return next;
    });
  };

  const pickAnswer = (i) => {
    if (picked !== null) return;
    setPicked(i);
    const isRight = i === deck[idx].correct;
    setScore(prev => ({
      right: prev.right + (isRight ? 1 : 0),
      wrong: prev.wrong + (isRight ? 0 : 1),
      seen: prev.seen + 1,
    }));
    setHistory(prev => [...prev, { q: deck[idx], picked: i, correct: isRight }]);
    setShowExplain(true);
  };

  const nextQ = () => {
    setPicked(null);
    setShowExplain(false);
    if (idx + 1 < deck.length) setIdx(idx + 1);
    else setMode("results");
  };

  const pct = score.seen > 0 ? Math.round((score.right / score.seen) * 100) : 0;
  const current = deck[idx];

  const s = {
    page: { minHeight: "100vh", background: COLORS.bg, fontFamily: "'Outfit', system-ui, sans-serif", color: COLORS.text },
    container: { maxWidth: 640, margin: "0 auto", padding: "24px 20px" },
    h1: { fontSize: 28, fontWeight: 700, color: COLORS.accent, marginBottom: 4, fontFamily: "'Cormorant Garamond', Georgia, serif" },
    sub: { fontSize: 14, color: COLORS.textLight, marginBottom: 32 },
    card: { background: COLORS.card, borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: 28, marginBottom: 20 },
    topicBtn: (active) => ({
      display: "inline-block", padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer",
      margin: "0 6px 8px 0", border: `1.5px solid ${active ? COLORS.accent : COLORS.border}`,
      background: active ? COLORS.accentLight : "white", color: active ? COLORS.accent : COLORS.textLight,
      transition: "all 0.15s",
    }),
    startBtn: { background: "linear-gradient(180deg, #FFB8C8, #F0A0B4)", color: "#5A3E4B", border: "1px solid rgba(240,160,176,0.4)", borderRadius: 10, padding: "14px 32px", fontSize: 16, fontWeight: 700, cursor: "pointer", width: "100%", marginTop: 16, fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: "0.08em", textTransform: "uppercase" },
    qNum: { fontSize: 12, fontWeight: 600, color: COLORS.textLight, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 },
    qText: { fontSize: 18, fontWeight: 600, lineHeight: 1.5, marginBottom: 20, fontFamily: "'Cormorant Garamond', Georgia, serif" },
    option: (i) => {
      const isCorrect = current && i === current.correct;
      const isPicked = i === picked;
      let bg = "#FFF4F0", border = COLORS.border, color = COLORS.text, weight = 400;
      if (picked !== null) {
        if (isCorrect) { bg = COLORS.correctBg; border = COLORS.correct; color = COLORS.correct; weight = 600; }
        else if (isPicked) { bg = COLORS.wrongBg; border = COLORS.wrong; color = COLORS.wrong; weight = 600; }
        else { bg = "#FFEAE6"; color = COLORS.textLight; }
      }
      return {
        display: "block", width: "100%", textAlign: "left", padding: "14px 16px", borderRadius: 10,
        border: `1.5px solid ${border}`, background: bg, color, fontWeight: weight,
        fontSize: 15, cursor: picked !== null ? "default" : "pointer", marginBottom: 10,
        transition: "all 0.15s", fontFamily: "inherit",
      };
    },
    explain: { background: COLORS.warm, borderRadius: 10, padding: "16px 18px", fontSize: 14, lineHeight: 1.65, marginTop: 8, marginBottom: 16, color: COLORS.text },
    nextBtn: { background: "linear-gradient(180deg, #FFB8C8, #F0A0B4)", color: "#5A3E4B", border: "1px solid rgba(240,160,176,0.4)", borderRadius: 10, padding: "12px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", float: "right", fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: "0.08em", textTransform: "uppercase" },
    progress: { height: 6, background: COLORS.border, borderRadius: 3, marginBottom: 20, overflow: "hidden" },
    progressFill: { height: "100%", background: COLORS.accent, borderRadius: 3, transition: "width 0.3s" },
    scoreRow: { display: "flex", gap: 16, marginBottom: 16, fontSize: 14, fontWeight: 500 },
    scoreBadge: (c) => ({ background: c === "g" ? COLORS.correctBg : COLORS.wrongBg, color: c === "g" ? COLORS.correct : COLORS.wrong, padding: "4px 12px", borderRadius: 6 }),
    topicTag: { display: "inline-block", fontSize: 11, fontWeight: 600, color: COLORS.accent, background: COLORS.accentLight, padding: "3px 8px", borderRadius: 4, marginBottom: 10 },
    backBtn: { background: "none", border: `1.5px solid ${COLORS.border}`, borderRadius: 10, padding: "12px 24px", fontSize: 15, fontWeight: 500, cursor: "pointer", color: COLORS.text },
  };

  // MENU
  if (mode === "menu") {
    return React.createElement("div", { style: s.page },
      React.createElement("div", { style: s.container },
        React.createElement("h1", { style: s.h1 }, "Jot Gloss"),
        React.createElement("p", { style: s.sub }, "MBAS 801 \u2014 Interactive Exam Practice"),
        React.createElement("div", { style: s.card },
          React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: COLORS.textLight, marginBottom: 12, letterSpacing: "0.05em", textTransform: "uppercase" } }, "Select topics to quiz"),
          React.createElement("div", null,
            Object.entries(TOPIC_NAMES).map(function([t, name]) {
              return React.createElement("button", { key: t, style: s.topicBtn(selectedTopics.has(Number(t))), onClick: function() { toggleTopic(Number(t)); } },
                t + ". " + name
              );
            })
          ),
          React.createElement("div", { style: { marginTop: 12, fontSize: 13, color: COLORS.textLight } },
            QUESTIONS.filter(function(q) { return selectedTopics.has(q.topic); }).length + " questions selected"
          ),
          React.createElement("button", { style: s.startBtn, onClick: startQuiz, disabled: selectedTopics.size === 0 }, "Start Quiz")
        ),
        React.createElement("div", { style: Object.assign({}, s.card, { background: COLORS.warm, border: "none" }) },
          React.createElement("div", { style: { fontSize: 14, fontWeight: 600, marginBottom: 6 } }, "How to use"),
          React.createElement("div", { style: { fontSize: 13, color: COLORS.textLight, lineHeight: 1.7 } },
            "Pick your weakest topics and drill them. Each question comes from actual course slides, sample exam questions, or practice exercises. After you pick an answer, read the explanation carefully \u2014 they reference the exact reasoning Prof. de Bettignies uses. Aim for 85%+ before exam day."
          )
        )
      )
    );
  }

  // QUIZ
  if (mode === "quiz" && current) {
    const progressPct = ((idx + 1) / deck.length) * 100;
    return React.createElement("div", { style: s.page },
      React.createElement("div", { style: s.container },
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 } },
          React.createElement("h1", { style: Object.assign({}, s.h1, { fontSize: 22, marginBottom: 0 }) }, "Jot Gloss"),
          React.createElement("div", { style: s.scoreRow },
            React.createElement("span", { style: s.scoreBadge("g") }, score.right + " correct"),
            React.createElement("span", { style: s.scoreBadge("r") }, score.wrong + " wrong")
          )
        ),
        React.createElement("div", { style: s.progress },
          React.createElement("div", { style: Object.assign({}, s.progressFill, { width: progressPct + "%" }) })
        ),
        React.createElement("div", { style: s.card },
          React.createElement("div", { style: s.topicTag }, "Topic " + current.topic + ": " + TOPIC_NAMES[current.topic]),
          React.createElement("div", { style: s.qNum }, "Question " + (idx + 1) + " of " + deck.length),
          React.createElement("div", { style: s.qText }, current.q),
          React.createElement("div", null,
            current.options.map(function(opt, i) {
              return React.createElement("button", { key: i, style: s.option(i), onClick: function() { pickAnswer(i); } },
                React.createElement("span", { style: { marginRight: 10, fontWeight: 600, opacity: 0.5 } }, "ABCD"[i] + "."),
                opt
              );
            })
          ),
          showExplain ? React.createElement(React.Fragment, null,
            React.createElement("div", { style: s.explain },
              React.createElement("strong", null, picked === current.correct ? "Correct!" : "Not quite."),
              " " + current.explain
            ),
            React.createElement("div", { style: { overflow: "hidden" } },
              React.createElement("button", { style: s.nextBtn, onClick: nextQ },
                idx + 1 < deck.length ? "Next \u2192" : "See Results"
              )
            )
          ) : null
        )
      )
    );
  }

  // RESULTS
  if (mode === "results") {
    const topicScores = {};
    history.forEach(function(h) {
      const t = h.q.topic;
      if (!topicScores[t]) topicScores[t] = { right: 0, total: 0 };
      topicScores[t].total++;
      if (h.correct) topicScores[t].right++;
    });
    return React.createElement("div", { style: s.page },
      React.createElement("div", { style: s.container },
        React.createElement("h1", { style: s.h1 }, "Results"),
        React.createElement("p", { style: s.sub }, score.right + " / " + score.seen + " correct (" + pct + "%)"),
        React.createElement("div", { style: s.card },
          React.createElement("div", { style: { height: 12, background: COLORS.border, borderRadius: 6, overflow: "hidden", marginBottom: 24 } },
            React.createElement("div", { style: { height: "100%", borderRadius: 6, width: pct + "%", background: pct >= 80 ? COLORS.correct : pct >= 60 ? "#B45309" : COLORS.wrong, transition: "width 0.5s" } })
          ),
          React.createElement("div", { style: { fontSize: 14, fontWeight: 600, marginBottom: 12, color: COLORS.textLight, textTransform: "uppercase", letterSpacing: "0.06em" } }, "Score by Topic"),
          Object.entries(topicScores).sort(function([a],[b]) { return a - b; }).map(function([t, s2]) {
            const tp = Math.round((s2.right / s2.total) * 100);
            return React.createElement("div", { key: t, style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid " + COLORS.border } },
              React.createElement("div", { style: { fontSize: 14 } },
                React.createElement("strong", null, "T" + t + ":"),
                " " + TOPIC_NAMES[t]
              ),
              React.createElement("div", { style: { fontSize: 14, fontWeight: 600, color: tp >= 80 ? COLORS.correct : tp >= 60 ? "#B45309" : COLORS.wrong } }, s2.right + "/" + s2.total + " (" + tp + "%)")
            );
          }),
          React.createElement("div", { style: { marginTop: 20, fontSize: 14, color: COLORS.textLight, lineHeight: 1.6 } },
            pct >= 85 ? "Excellent \u2014 you're well-prepared for the exam." : pct >= 65 ? "Solid foundation, but review the topics you missed. Focus on those before exam day." : "Keep studying. Review the study notes for your weakest topics, then re-quiz."
          )
        ),
        React.createElement("div", { style: { display: "flex", gap: 12 } },
          React.createElement("button", { style: s.backBtn, onClick: function() { setMode("menu"); } }, "\u2190 Change Topics"),
          React.createElement("button", { style: Object.assign({}, s.startBtn, { marginTop: 0, flex: 1 }), onClick: startQuiz }, "Quiz Again")
        ),
        React.createElement("div", { style: Object.assign({}, s.card, { marginTop: 20 }) },
          React.createElement("div", { style: { fontSize: 14, fontWeight: 600, marginBottom: 12, color: COLORS.textLight, textTransform: "uppercase", letterSpacing: "0.06em" } }, "Questions You Missed"),
          history.filter(function(h) { return !h.correct; }).length === 0
            ? React.createElement("div", { style: { fontSize: 14, color: COLORS.correct } }, "Perfect \u2014 you didn't miss any!")
            : history.filter(function(h) { return !h.correct; }).map(function(h, i) {
                return React.createElement("div", { key: i, style: { padding: "12px 0", borderBottom: "1px solid " + COLORS.border, fontSize: 14 } },
                  React.createElement("div", { style: { fontWeight: 600, marginBottom: 4 } }, h.q.q),
                  React.createElement("div", { style: { color: COLORS.wrong } }, "Your answer: " + h.q.options[h.picked]),
                  React.createElement("div", { style: { color: COLORS.correct } }, "Correct: " + h.q.options[h.q.correct]),
                  React.createElement("div", { style: { color: COLORS.textLight, marginTop: 4, fontSize: 13 } }, h.q.explain)
                );
              })
        )
      )
    );
  }

  return null;
}