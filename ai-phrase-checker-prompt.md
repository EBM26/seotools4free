I have a static HTML/CSS/JS site of free SEO/dev tools (repo: seotools4free).
Read README.md at the project root first — it documents the exact file
structure, design system, and conventions every tool follows (shared
header/footer via fetch/inject, css/style.css design tokens, .tool-card /
.tool-explainer patterns, README update requirement, etc). Follow those
conventions exactly, don't introduce a new pattern.

Build a new tool called "AI Phrase Checker" (file: ai-phrase-checker.html,
js/ai-phrase-checker.js). This is NOT an AI-content detector — it doesn't
claim to identify whether text was AI-written, since that's unreliable
even with a real model behind it. It's an editing aid: paste text, and it
highlights words/phrases/structural patterns that are disproportionately
common in AI-generated writing, so a writer can spot and revise them.

Functionality:
- A textarea for pasting text.
- Live highlighting (on input, debounced) of any matched words/phrases
  from the seed list below, using a <mark> or <span> wrapped in the
  rendered text (build this as a separate read-only "highlighted" view
  below or overlaying the textarea, since a plain textarea can't render
  inline highlights — mirror the common editor pattern of a
  contenteditable div or a textarea+overlay approach, whichever fits this
  site's existing vanilla-JS style best).
- A summary stat panel (reuse the site's .tool-output / .stat pattern):
  total flagged terms, flagged terms per 100 words as a rough density
  score, a breakdown by category (vocabulary / stock phrases /
  structural patterns), plus separate raw counts for em dash usage and
  emoji usage (these are frequency signals, not something to
  highlight inline in the text).
- Do NOT present the density score as a verdict ("this is AI-written") —
  frame it as "X flagged phrases per 100 words" only, purely descriptive.
- Copy button for the highlighted-terms list. Reset button.
- Explainer section (.tool-explainer) at the bottom, written in original
  wording, covering: what this tool does and doesn't claim, why AI models
  produce this vocabulary/structure disproportionately (a very brief,
  accurate explanation — it's about statistically "safe" language
  patterns, not that AI is incapable of good writing), and that the goal
  is more natural, varied prose, not gaming AI detectors.

Seed word/phrase list to build the matcher from (organize the JS data
structure by these three categories, feel free to expand modestly but
keep the core list intact):

VOCABULARY: delve, tapestry, boast, boasts, testament, underscore, underscores,
pivotal, robust, crucial, seamless, cutting-edge, game-changer, elevate,
foster, intricate, landscape, realm, navigate, unlock, unleash, embark,
journey, treasure trove, vibrant, holistic, comprehensive, meticulous,
invaluable, paramount, multifaceted, nuanced, dynamic, synergy, leverage,
streamline, bespoke, curated, actually (as sentence-opening filler),
folks, adhere, amplify, resonate, enhance, expertise, offerings,
endeavour, endeavor, esteemed, shed light, deep understanding, insights,
enlightening, relentless, groundbreaking, systemic, inherent, peril,
pertinent, explore, empower

STOCK PHRASES: "in today's fast-paced world", "in the realm of", "in this
digital age", "it's important to note that", "it's worth noting", "at the
end of the day", "in conclusion", "overall,", "to sum up", "i hope this
message finds you well"

STRUCTURAL PATTERNS (regex-based, not literal string match):
- "not only ... but also ..." constructions
- rule-of-three adjective lists (three comma-separated adjectives/short
  phrases before "and")
- vague attribution phrases: "studies show", "experts say", "observers
  have noted" (with no named source following)
- "from X to Y" false-range phrasing
- sentences ending in a dangling "-ing" clause after a comma (e.g.
  "..., improving convenience.")
- heavy em dash usage (flag em dash count separately in the stats panel,
  since this is a frequency signal, not a per-instance flag)
- excessive emoji density (also a frequency/count signal, not per-instance)

Match case-insensitively. Whole-word match for the vocabulary list (don't
flag "robust" inside "robustness" as a separate hit if that's confusing,
your call on whether to also catch word variants).

After building it:
1. Add it to index.html's tool list, following the existing pattern
   (next sequential number, name, one-line description).
2. Update README.md: mark it done under the appropriate section, describe
   what was built the same way other entries do, and add it to the tool
   list if it's not already itemized there under a placeholder name.
3. Run a basic syntax check on the new JS before finishing.

Match the site's existing design tokens exactly (colors, fonts, spacing)
by reading css/style.css rather than guessing at values.
