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

**Ship first (static, no backend):**
1. Google SERP Simulator — done, see `serp-simulator.html`. Full-width page
   layout (`.tool-main--wide`, overrides the site's normal 1080px cap).
   Features: pixel-width title/description limits (canvas `measureText`
   against Arial, 600px title / 960px desktop & 680px mobile description),
   desktop/mobile toggle, bold-keyword highlighting, capitalize title,
   reset, copy-HTML, shareable link (state encoded in URL query string,
   read back on page load), save-as-image (via html2canvas CDN — this is
   the one tool on the site that needs an internet connection to load a
   library; everything else is fully self-contained). Explainer section
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
7. Open Graph Preview Tool
8. Keyword Density Checker
9. Schema Markup Generator
10. Lorem Ipsum / Placeholder Text Generator
11. CSS Clamp/Fluid Typography Calculator
12. Readability Score Checker
13. Color Contrast Checker

**Ship later (need a real backend — headless browser or server fetch):**
14. Web Page to Text
15. Responsive/Device Preview Tool (iPhone 14, iPad, Galaxy, etc.)
20. Broken Link Checker (scans a page's links, reports dead ones — needs
    server-side fetch since arbitrary cross-origin requests are blocked by
    CORS in the browser)

**AI-adjacent, still no backend needed:**
16. AI Prompt Character/Token Counter
17. Prompt Template Builder
18. AI Cost Calculator
19. Prompt Injection Checker

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
