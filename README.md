# SEO & Dev Tools Site

A collection of free, no-signup SEO and developer utility tools. Each tool is
its own static HTML page (no SPA framework) so every tool is independently
indexable/SEO-friendly.

## Stack

- Plain HTML/CSS/JS. No build step, no framework.
- Shared header/footer are separate partial files, fetched and injected at
  runtime via `js/include.js` (see `partials/header.html`, `partials/footer.html`).
- All paths are relative (not `/css/...`) so the site works from any root,
  including a GitHub Pages subpath like `username.github.io/reponame/`.
- Homepage (`index.html`) tool list is a 2-column CSS grid (`.tool-list`,
  collapses to 1 column under 700px) with a live client-side search box
  above it (`js/tool-search.js`) that filters `.tool-list__item` entries by
  name/description substring match, no build step or index file involved.

## Design direction

- **Aesthetic:** instrument-panel / precision. Off-white background, one
  accent color (teal-green, `#1F6F5C`), corner-bracket framing on tool cards.
- **Typography:** sans-serif (General Sans / Inter) for headings and body
  text. Monospace (JetBrains Mono) for every number/output the tools
  produce — this is the core visual rule: what you *type* is sans-serif,
  what the tool *outputs* is monospace.
- **Layout:** desktop max content width is `1080px` (single CSS variable
  `--max-width` in `css/style.css`, controls header/main/footer).
- **Header:** solid accent-colored background, white logo/nav text.
- **Explainer sections:** every tool page ends with an "About this tool" /
  reference card (`.tool-explainer`, or `.utm-reference` table for
  parameter-style content) — short, originally-worded context on what the
  tool measures and why, not copied from any reference site. Keep this
  pattern going for every new tool.

## Tool list

Numbering note: the numbers in this list are catalog/roadmap order, they
don't necessarily match the `Tool NN` eyebrow label or index badge on
each tool's own page and on `index.html` — those instead reflect actual
shipped order on the site. Items 14/15/20 (need a real backend) are
skipped on the site for now, and the Favicon Generator and llms.txt
Generator were added outside the catalog entirely, so catalog items
16-19 shipped as site items 15-18.

**Ship first (static, no backend):**
1. Google SERP Simulator — done, see `serp-simulator.html`. Full-width page
   layout (`.tool-main--wide`, overrides the site's normal 1080px cap).
   Features: pixel-width title/description limits (canvas `measureText`
   against Arial, 600px title / 960px desktop & 680px mobile description),
   desktop/mobile toggle, bold-keyword highlighting, capitalize title,
   reset, copy-HTML, shareable link (state encoded in URL query string,
   read back on page load), save-as-image (via html2canvas CDN — one of
   two tools on the site that need an internet connection to load a
   library, the Favicon Generator's JSZip dependency being the other;
   everything else is fully self-contained). Explainer section
   covers why pixel width (not character count) drives truncation, and
   why bold keywords appear in real Google results.
2. Word Counter — done, see `word-counter.html`. Includes an explainer
   section covering the 200wpm reading-time assumption and common length
   guidelines (tweets, meta descriptions, blog intros).
3. Campaign URL Builder / UTM Builder — done, see `utm-builder.html`.
   Fields match a common reference layout: URL, Campaign ID (optional),
   source, medium, name (either name or ID required), term, content — each
   with helper caption text. Builds a live UTM query string,
   copy-to-clipboard, reset, plus a parameter reference table at the
   bottom.
4. Meta Tag Generator — done, see `meta-tag-generator.html`. Generates
   title, meta description, canonical link, Open Graph, and Twitter Card
   tags from one shared set of fields (title/description/image reused
   across OG and Twitter). Copy-to-clipboard, reset, plus a reference
   table explaining what each tag does and where it shows up.
5. Slug Generator — done, see `slug-generator.html`. Lowercase toggle,
   hyphen/underscore separator choice, strips accents and unsafe
   characters, collapses repeated separators. Copy-to-clipboard, reset.
6. Robots.txt Generator — done, see `robots-txt-generator.html`. Preset
   starting points (allow all / block all / start from scratch), add/remove
   repeatable user-agent groups (agent name, disallow paths, allow paths),
   optional sitemap URL field. Copy-to-clipboard, download as `robots.txt`,
   reset. Explainer section
   covers User-agent/Disallow/Allow syntax, the Sitemap directive, why
   Crawl-delay is left out (ignored by Google), and why robots.txt is the
   wrong tool for keeping a page out of search results (use noindex instead).
7. Open Graph Preview Tool — done, see `og-preview-tool.html`. Toggle
   between Facebook / Twitter (X) / LinkedIn card layouts for the same
   title/description/image/URL input, each with its own layout quirks
   (LinkedIn drops the description, Twitter keeps a white body vs.
   Facebook's grey one). Domain auto-derived from the URL (editable
   override), broken image URLs fall back to a text placeholder,
   copy-tags, shareable link (state in URL query string, same pattern as
   the SERP simulator).
8. Keyword Density Checker — done, see `keyword-density-checker.html`.
   Toggle between single-word, 2-word, and 3-word phrase tables (top 15
   by count), optional common-word filtering for the single-word view
   only, plus a focus-keyword field that reports its own count/density
   independent of the toggle. Density is count divided by total word
   count throughout, kept consistent across word lengths.
9. Schema Markup Generator — done, see `schema-markup-generator.html`.
   Content-type dropdown (Article, Product, FAQ Page, Local Business)
   swaps which field panel is shown; FAQ Page reuses the same
   add/remove repeatable-group pattern as the Robots.txt Generator's
   user-agent groups (`.robots-group` CSS, shared not duplicated).
   Output is a full `<script type="application/ld+json">` block with
   empty fields and empty nested objects (e.g. an author with no name)
   pruned before serializing. Copy-to-clipboard, download as bare
   `schema.json` (unwrapped, valid JSON — separate from the
   `<script>`-wrapped textarea content), reset.
10. Lorem Ipsum / Placeholder Text Generator — done, see
    `lorem-ipsum-generator.html`. Toggle between paragraphs / sentences /
    words as the unit, amount field (1-50), optional classic
    "Lorem ipsum dolor sit amet..." opening, regenerate button (new
    random text without changing settings), copy-to-clipboard, reset.
11. CSS Clamp/Fluid Typography Calculator — done, see
    `css-clamp-calculator.html`. Min/max viewport width + min/max font
    size fields plus a root-font-size field for px-to-rem conversion,
    outputs a `font-size: clamp(...)` line. Live preview section with a
    width slider (200-2000px) that recomputes sample-text font size
    using the same linear formula, so you can see the floor/ceiling
    clamp behavior on both ends without leaving the page. Also extended
    the shared `.tool-card` input styling in `css/style.css` to cover
    `input[type=number]`, `input[type=date]`, `input[type=range]`, and
    `select` (previously only text/url inputs and textareas were
    covered, so number/date/select fields in earlier tools relied on
    repeated inline styles — new tools should no longer need that).
12. Readability Score Checker — done, see `readability-checker.html`.
    Live word/sentence/syllable counts, Flesch Reading Ease (0-100,
    labeled Very easy through Very difficult) and Flesch-Kincaid Grade
    Level, both computed from the same syllable-counting heuristic
    (vowel-group pattern matching, not a pronunciation dictionary), plus
    a reference table mapping score ranges to US grade levels.
13. Color Contrast Checker — done, see `color-contrast-checker.html`.
    Paired hex text input + native color picker for text and background
    colors (kept in sync both directions), swap button, live contrast
    ratio using the standard WCAG relative-luminance formula, and four
    pass/fail badges (AA/AAA × normal/large text) plus a live text
    preview rendered in the actual chosen colors. Explainer covers what
    it doesn't check (images/gradients behind text, non-text UI element
    contrast, color-as-sole-signal issues).

**Ship later (need a real backend — headless browser or server fetch):**
14. Web Page to Text
15. Responsive/Device Preview Tool (iPhone 14, iPad, Galaxy, etc.)
20. Broken Link Checker (scans a page's links, reports dead ones — needs
    server-side fetch since arbitrary cross-origin requests are blocked by
    CORS in the browser)

**AI-adjacent, still no backend needed:**
16. AI Prompt Character/Token Counter — done, see
    `prompt-token-counter.html` (site item 15). Character/word counts
    plus an estimated token count (4 chars/token heuristic), and a
    context-window usage table across 5 common model families with a
    percent-fill bar per row. Explainer is explicit that this is an
    estimate, not an exact tokenizer count.
17. Prompt Template Builder — done, see `prompt-template-builder.html`
    (site item 16). Type a template using `{{double curly brace}}`
    placeholders, matching fill-in fields appear automatically (dedup'd
    by name, same name twice fills both spots). Blank fields leave the
    placeholder text visible in the final prompt rather than blanking
    it, so it's obvious what's still unfilled. No localStorage/save
    feature, kept stateless like the rest of the site.
18. AI Cost Calculator — done, see `ai-cost-calculator.html` (site item
    17). Deliberately provider-agnostic: no hardcoded per-model prices,
    since real pricing changes often and a stale hardcoded number would
    be actively misleading. Instead takes input/output token counts,
    your own entered per-1M-token rates (with clearly-labeled example
    placeholder values, not a real quote), and a request count, and
    calculates cost per request plus totals. Links to the AI Prompt
    Token Counter for the token-count half of the estimate. Explainer
    is explicit about what it doesn't model (volume/cache/batch
    discounts, minimums, free tiers).
19. Prompt Injection Checker — done, see `prompt-injection-checker.html`
    (site item 18). Pattern-matches pasted text against a curated list
    of injection/jailbreak phrasings (instruction override, system
    prompt extraction, role override, known jailbreak references,
    safety-bypass requests, fake system/developer message markers) plus
    a separate check for hidden zero-width/BOM Unicode characters
    sometimes used to smuggle text past a casual read. Explicitly
    framed as a heuristic first-pass signal, not a security guarantee —
    explainer covers why pattern matching can't catch a determined,
    reworded attempt, and points at the actual mitigations (privilege
    separation, scoped tool permissions, treating retrieved/user content
    as data never instructions).

**Added outside the original roadmap:**
21. Favicon Generator — done, see `favicon-generator.html` (site item
    14, placed right before the AI-adjacent tools per request). Upload
    one PNG/JPG/WebP/SVG, canvas-resize it into 16/32/48/180/192/512px
    PNGs (aspect-ratio preserved, centered on a transparent square
    rather than cropped), preview grid of all six with a CSS
    checkerboard behind each to show transparency. "Download All (ZIP)"
    (JSZip via CDN, the site's second tool needing a CDN library after
    the SERP Simulator's html2canvas) bundles the six PNGs plus a
    hand-built `favicon.ico` — no image library needed for the ICO
    itself, it's a minimal from-scratch ICONDIR/ICONDIRENTRY writer
    that embeds the 16/32/48px PNGs directly (Vista+ ICO files can
    contain PNG-compressed entries instead of raw bitmaps). Also
    outputs the exact `<link>` tags to paste in `<head>`. Everything
    runs client-side, nothing is uploaded to a server.
22. llms.txt Generator — done, see `llms-txt-generator.html` (site item
    19). Not part of the original numbered catalog above, requested
    directly. Site name (→ H1), one-line description (→ blockquote
    summary), optional detailed summary (→ plain paragraph), and
    repeatable "sections" (add/remove, `.robots-group` pattern reused
    from the Robots.txt Generator) each with an optional header (→ H2,
    omitted entirely if left blank) and a nested repeatable list of
    label+URL link rows (→ `- [label](url)`). Live preview panel
    rendered from the same data as the markdown output (not a markdown
    parser — built directly as DOM nodes). Copy, download as
    `llms.txt`, reset. Explainer is upfront that this is an emerging,
    unofficial convention with no guaranteed adoption by AI providers.
23. AI Content Detector — done, see `ai-content-detector.html` (site
    item 20). Four independent heuristic signals, each producing its
    own 0-100 sub-score, averaged into an overall score that's then
    displayed as a complementary pair — "Likely AI-written" /
    "Likely human-written" percentages that sum to 100 — plus a
    qualitative label (a signal is dropped from the average, not
    zeroed, if there isn't enough text to measure it reliably —
    burstiness/consistency need several sentences, TTR needs ~30+
    words): sentence-length burstiness (coefficient of
    variation across sentences), common AI stock-phrase matching
    (curated list, e.g. "in today's fast-paced world", "plays a pivotal
    role"), vocabulary diversity (type-token ratio), and section-level
    pacing consistency (CV of average sentence length across four
    chunks of the text, distinct from burstiness which looks at
    sentence-to-sentence variance rather than chunk-to-chunk). A
    permanently visible disclaimer banner (not a dismissible warning —
    reuses `.serp-warning` but with `is-visible` hardcoded on) sits
    above the input, and the explainer repeats it: this is a loose
    statistical signal, not a verdict, and none of the four signals are
    unique to AI-generated text. Scanning is explicitly button-triggered
    (`Scan Text`), not live-on-keystroke like most other tools on this
    site — editing the text after a scan shows a "results are stale"
    note rather than clearing or silently re-running. A `Reset` button
    clears the textarea and results back to the initial empty state.
24. Markdown to Plain Text Converter — done, see `markdown-cleaner.html`
    (site item 21). Side-by-side input/output via `.markdown-layout`
    (new 1fr/1fr grid, collapses to 1 column under 800px — distinct from
    `.serp-layout`'s asymmetric 440px/1fr split, since here both panes
    are equally important). Live-updating (not button-triggered like
    the AI Content Detector, this is cheap regex work so live is fine):
    strips code fences (keeps fenced content, drops just the ` ``` `
    lines), inline code backticks, headers, images/links (keeps
    visible/alt text, drops the URL — handles both inline and
    reference-style `[text][ref]` links), bold/italic markers (triple
    before double before single, to handle `***bold italic***`
    correctly), and unordered-list bullet markers, then collapses
    3+ blank lines and trims trailing whitespace per line. Token
    estimates (chars/4 heuristic, same as the AI Prompt Token Counter)
    shown for both input and output plus tokens-saved and percent
    reduction. Copy button, reset. Explainer is upfront that this is
    regex-based pattern matching, not a real markdown parser, so things
    like `snake_case_names` can occasionally get mis-treated as italic
    markup, and reference-style link *definitions*, tables, and nested
    blockquotes aren't specifically handled.
25. System Prompt Analyzer — done, see `system-prompt-analyzer.html`
    (site item 22). Deliberately outputs a readable list of findings
    (`.report-item` cards, info vs. warning styled by a modifier class)
    rather than a single score, per explicit request — a score would
    imply more precision than these heuristics can support. Stats row
    (words, estimated tokens via the same chars/4 heuristic as other AI
    tools, sentence count, average words/sentence) always shown; below
    it, one finding per check: overall length (warns under 20 words or
    over 600), average sentence length (warns over 30 words/sentence),
    contradictory instruction pairs (curated opposite-word list like
    always/never, must/optional — flagged when both words of a pair
    land in the *same sentence*, shown with that sentence as context),
    and repeated phrases (4-word phrases repeated 2+ times, reusing the
    n-gram counting approach from the Keyword Density Checker). Every
    check that finds nothing still renders an explicit "no issues
    found" info card, so a clean prompt gets a visibly complete report,
    not a blank page. Live-updating, no button needed (cheap regex/loop
    work, same reasoning as the Markdown Cleaner). Explainer is explicit
    that a triggered warning isn't automatically wrong — it names an
    example (a legitimate "always ask before you never skip
    confirmation" style sentence) where the heuristic would still fire.
26. Hreflang Tag Generator — done, see `hreflang-generator.html` (site
    item 23). Repeatable rows (add/remove, reusing `.robots-remove-btn`)
    each pairing a language/region code with a URL — code picker is a
    `<select>` of ~35 common BCP47 codes (plain language codes like
    `es` alongside region variants like `es-MX`, plus special cases
    like `es-419` and script-subtag `zh-Hans`/`zh-Hant`) with a
    "Custom…" option that reveals a free-text code input. Separate,
    always-visible `x-default` URL field, appended as its own tag at
    the end of the output rather than folded into the row list, since
    it isn't a real language code. Output is live-updating, one
    `<link rel="alternate" hreflang="...">` per valid row (both code and
    URL required) plus the x-default line if filled in. Copy, download
    as `hreflang-tags.html`, reset. Explainer is explicit that the same
    full tag set belongs on every page in the group, including a
    self-referencing link back to that page, not just on one "main"
    version — a common real-world hreflang mistake.

## Adding a new tool

1. Copy `word-counter.html` as a starting template.
2. Swap the `<title>`, meta description, eyebrow label, heading, and form
   fields for the new tool.
3. Write a new `js/{tool-name}.js` file with that tool's logic, isolated
   from other tools' scripts.
4. Add the tool to `index.html`'s tool list and to this README.

## Open decisions

- Site name not finalized. Considering either a brandable name (e.g.
  something evoking measurement/precision, matching the design direction)
  or a keyword-descriptive domain. Candidate domains found so far:
  marketingtoolsforfree.com, marketingtools4free.com, seotools4free.com,
  websitetools4free.com.
- Hosting: leaning GitHub Pages. Note tools 14/15/20 will need separate
  backend hosting (e.g. Vercel/Railway) since GitHub Pages is static-only.
- Global "related tools" section (a shared list of other tools shown on
  every tool page) is planned but not yet built — will follow the same
  partial + inject pattern as the header/footer.
