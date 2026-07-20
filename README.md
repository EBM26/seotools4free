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
   library; everything else is fully self-contained).
2. Word Counter — done, see `word-counter.html`
3. Campaign URL Builder / UTM Builder
4. Meta Tag Generator
5. Slug Generator
6. Robots.txt Generator
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
