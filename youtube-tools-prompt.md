# YouTube Hashtag Extractor & Tag Generator — Prompt for Claude Code

## Context
This is the seotools4free.com repo (plain static HTML/CSS/JS, no framework,
no build step). Read `README.md` at the repo root first for build
conventions. Key facts you need:

- Shared header/footer via `partials/header.html` / `partials/footer.html`,
  injected by `js/include.js`. Every page includes both.
- Internal links are extensionless (`/youtube-tag-generator`, not
  `/youtube-tag-generator.html`). Files on disk still end in `.html` — only
  the *links* drop the extension.
- Canonical tags point to `https://seotools4free.com/{slug}` (no `.html`).
- Design system: off-white background `#FAFAF8`, near-black text `#14171C`,
  muted gray secondary text `#5B6472`, teal-green accent `#1F6F5C`. Headings/
  body use General Sans/Inter; **JetBrains Mono for every value a tool
  outputs** (this applies here — generated tags and extracted hashtags are
  tool output, so render them in the mono font, same as every other tool).
- Both of these ARE tools (unlike the FAQ pages) — use the existing
  `.tool-card` component with its corner-bracket framing, and each needs a
  required "About this tool" explainer section in original wording at the
  bottom of the page, matching the pattern on every existing tool page.
- Both tools are fully self-contained — no external API calls, no backend,
  no CORS-dependent fetches. Everything happens client-side with plain JS
  logic and lookup tables defined in the script itself.

---

## Tool 1: YouTube Hashtag Extractor

**Files**: `youtube-hashtag-extractor.html`, `js/youtube-hashtag-extractor.js`

### What it does
Takes a pasted video title/description and extracts every hashtag used in
it, since creators often want to check what they actually wrote — count,
duplicates, and whether they've gone over YouTube's real limits.

### Fields & layout
- A textarea for pasting title/description text (placeholder: paste your
  video description here)
- Live extraction as the user types (no submit button needed, same pattern
  as your other live-updating tools)

### Extraction logic
- Match every substring matching `#` followed by word characters (letters,
  numbers, underscores) — a standard hashtag regex, e.g. `/#[\w]+/g`
- Deduplicate case-insensitively, but preserve the casing and order of the
  *first* occurrence of each
- Ignore a bare `#` with nothing after it

### The two things that make this actually useful (don't skip these)
1. **First 3 hashtags display above the video title on YouTube.** Visually
   separate/highlight the first 3 extracted hashtags from the rest — label
   this group clearly (e.g. "These 3 will show above your title") since
   that's the highest-value real estate.
2. **YouTube ignores everything past 15 total hashtags in a description.**
   If more than 15 are found, show a clear warning stating the count and
   that hashtags beyond #15 won't be recognized by YouTube at all, and
   visually distinguish which ones (16+) fall outside the limit.

### Output
- The full deduped list rendered in JetBrains Mono, each hashtag as a chip
  or line item
- A copy button that copies all extracted hashtags space-separated (ready
  to paste back into a description)
- A count line: "X hashtags found" plus the 3-shown / 15-limit warnings
  described above when relevant
- A reset button

---

## Tool 2: YouTube Tag Generator

**Files**: `youtube-tag-generator.html`, `js/youtube-tag-generator.js`

### What it does
Takes a topic and generates a comma-separated tag list for YouTube's video
tags field, using keyword-combination templates — no external API, so
results are algorithmic suggestions to edit, not scraped live data (say
this plainly in the explainer section, don't imply these are pulled from
YouTube itself).

### Fields & layout
- Main topic input (required) — e.g. "sourdough bread"
- Secondary keywords input, optional, comma-separated — e.g. "beginner,
  no knead"
- Live generation as the user types

### Generation logic
Combine the main topic against a modifier bank to produce roughly 30-50
tags. Use a modifier list along these lines (expand naturally, keep it
broad enough to feel non-repetitive):

```
Prefix/suffix modifiers: how to, tutorial, guide, tips, tips and tricks,
for beginners, step by step, explained, review, vs, comparison, best,
top 10, easy, quick, DIY, 2026, complete guide, walkthrough, breakdown

Combination patterns to generate per topic:
- "{topic}"
- "{topic} tutorial"
- "how to {topic}"
- "{topic} for beginners"
- "{topic} tips"
- "{topic} guide"
- "best {topic}"
- "{topic} 2026"
- "{topic} explained"
- "{topic} step by step"
- "easy {topic}"
- "{topic} review"
(and so on — vary systematically rather than hardcoding a small fixed set)
```

If secondary keywords are provided, also generate pairwise combinations
between the main topic and each secondary keyword (e.g. "sourdough bread
no knead", "no knead bread tutorial"), not just modifiers applied to the
main topic alone.

Deduplicate the final list case-insensitively.

### The detail that makes this actually useful (don't skip this)
**YouTube's tag field has a real 500-character total limit** (all tags
joined by ", " counted together) — tags past that limit get silently
dropped when pasted in. Show a live character count of the currently
generated/selected tag string against a 500 cap, styled as a warning
(e.g. the accent turns to the warning yellow already used elsewhere on the
site) once it's close to or over the limit. This is the single most
important feature of this tool — don't just generate a list and stop
there.

### Output
- Comma-separated tag string in a JetBrains Mono textarea (this is the
  copy-paste-ready format for YouTube's tag field)
- Live character counter against the 500-character limit
- Copy button
- Reset button
- Consider letting users remove individual tags from the generated set
  before copying (a small "x" per tag chip) if that fits cleanly within
  the existing component patterns — not required if it overcomplicates the
  layout, use your judgment

---

## Site-wide integration (do this for both tools)

1. Add both to `index.html`'s tool list, following the existing
   `.tool-list__item` pattern (index number, name, one-line description).
2. Add both to `sitemap.xml` with extensionless absolute URLs.
3. Add "About this tool" explainer sections in original wording — for the
   extractor: cover what hashtags do on YouTube and the 3-shown/15-limit
   rules; for the generator: cover that tags are a minor/legacy ranking
   signal today (title, description, and thumbnail matter far more) but
   still worth filling in, and the 500-character limit.
4. Update `README.md`'s tool list to mark both as done, same format as
   existing entries.

## Do NOT
- Do not call any external API or YouTube endpoint for either tool — both
  must work fully offline once the page is loaded.
- Do not imply the Tag Generator's output is pulled from real YouTube
  search/autocomplete data — it's template-based and the explainer section
  should say so honestly.
- Do not skip the 3-shown/15-limit warnings on the extractor or the
  500-character limit on the generator — these are the core value of each
  tool, not optional polish.
