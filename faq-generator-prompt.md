# FAQ Pages Generator — Prompt for Claude Code

## Context
This is the seotools4free.com repo (plain static HTML/CSS/JS, no framework,
no build step). Read `README.md` at the repo root first for build
conventions. Key facts you need:

- Shared header/footer via `partials/header.html` / `partials/footer.html`,
  injected by `js/include.js`. Every page includes both.
- Internal links are extensionless (`/word-counter`, not `/word-counter.html`).
  Files on disk still end in `.html` — only the *links* drop the extension.
  This only resolves correctly on live GitHub Pages, not local testing.
- Canonical tags point to `https://seotools4free.com/{slug}` (no `.html`).
- Design system: off-white background `#FAFAF8`, near-black text `#14171C`,
  muted gray secondary text `#5B6472`, teal-green accent `#1F6F5C`. Headings/
  body use General Sans/Inter; JetBrains Mono is reserved for tool
  input/output values only — FAQ pages don't use monospace anywhere.
- **FAQ pages use a plain content layout, NOT the corner-bracket `.tool-card`
  styling used on tool pages.** Simple heading + paragraphs, matching the
  site's type system and max-width, but no bracket framing, no "About this
  tool" explainer section — these are content pages, not tools.

## One-time setup (do this on the FIRST run only)

1. **Source data**: `seotoolsFAQMaster.xlsx` at the repo root, with columns
   `Question` and `Answer` (if the column headers differ, stop and ask
   rather than guessing which columns are which).
2. **Reading the spreadsheet**: this is `.xlsx`, not `.csv` — it's a
   zipped/binary format, not something to hand-parse. Use a small, standard
   library for this one generator script only (e.g. the `xlsx` / SheetJS
   package via `npm install xlsx --save-dev`). This is a dev-only
   dependency for the build script — it does not get shipped to the site
   itself, so it doesn't violate the site's no-dependencies convention for
   the actual pages.
3. **Slugify**: reuse the exact slugify function already in
   `js/slug-generator.js` — do not write a new one. Extract or import that
   logic so FAQ slugs are generated identically to the Slug Generator tool's
   own output.
4. **Duplicate slugs**: if two questions produce the same slug, append `-2`,
   `-3`, etc. rather than overwriting a previously generated file, and log a
   warning in your summary so I can check whether two questions were
   accidental near-duplicates.
5. **Progress tracking**: create `faq-data/progress.json`, an array of
   objects `{ "slug": "...", "question": "...", "published": true }` — one
   entry per row in the spreadsheet, all starting `published: false`. This
   file is the single source of truth for what's live vs. queued. Do not
   regenerate it on later runs — only update it.
6. **Page template**: create a reusable template (e.g.
   `faq-data/faq-template.html`) so every FAQ page is generated consistently.
   Each page needs:
   - `<title>` = the question, verbatim
   - `<h1>` = the question, verbatim
   - `<meta name="description">` = first ~155 characters of the answer,
     truncated at a word boundary, no mid-sentence cutoff
   - Canonical tag = `https://seotools4free.com/faq/{slug}`
   - Body: the answer split on blank lines, each chunk wrapped in its own
     `<p>` tag
   - A "← Back to all FAQs" link to `/faqs`
   - Standard header/footer includes via `include.js`, same as every other
     page
   - Files live at `faq/{slug}.html` on disk, linked as `/faq/{slug}`
   - At the bottom of the page, a "previous" and "next" navigation row using
     the actual neighboring question text as the link label (not the words
     "next"/"previous"), each with an arrow — e.g. `← {previous question}`
     and `{next question} →`. Order matches **spreadsheet row order** (i.e.
     original order, same order used on `/faqs` and the same order pages
     get published in) — NOT alphabetical. This means each page's neighbors
     are permanent once set: publishing later batches only ever appends new
     pages after the current last one, so no already-published page's
     prev/next ever needs to change except the single most-recently-published
     page gaining a "next" arrow once the following batch goes live. The
     first page in the spreadsheet has no "previous" arrow; the most recently
     published page has no "next" arrow until the next batch is published.
7. **FAQ index page**: create `faqs.html` (site root, linked as `/faqs`,
   canonical tag `https://seotools4free.com/faqs`) — list of links in the
   **same order as the spreadsheet** (i.e. publish order, NOT alphabetical),
   same simple list-item pattern as the homepage's tool list, only listing
   FAQs where `published: true`.
8. **Nav update**: add one "FAQs" link to `partials/header.html`. This is a
   single shared-file edit — do not touch it again on later runs.
9. **Sitemap — first run only**: if `sitemap.xml` doesn't exist yet, generate
   one covering the **entire site** — homepage, every existing tool page,
   `/faqs`, and any FAQ pages already marked `published: true` after this
   run. If `sitemap.xml` already exists, just add entries for the FAQ pages
   this run publishes; don't touch unrelated existing entries. Use
   extensionless absolute URLs in `<loc>` for every entry, matching the
   site's link convention.
10. **README**: add a short section to `README.md` documenting that FAQ
    pages exist, how they're generated (`seotoolsFAQMaster.xlsx` +
    `faq-data/progress.json`, published incrementally), and how to add more
    FAQs later (append rows to the spreadsheet, ask Claude Code to "add 10
    more FAQs"). This is a one-time addition — don't rewrite it on later
    runs.

## Recurring instruction (what I'll say every few days)

When I say **"add 10 more FAQs"**, do the following:

1. Read `faq-data/progress.json`, find the next 10 entries where
   `published: false` (in the same order they appear in the original
   spreadsheet).
2. Generate `faq/{slug}.html` for each, using the template and rules above.
   Set each new page's previous/next arrows based on spreadsheet row order
   among this batch and the immediately adjacent already-published pages.
3. **One exception to "don't touch published pages"**: the page that was
   previously the last published one currently has no "next" arrow — add
   its "next" arrow now, pointing to the first page in this new batch. This
   is the only edit ever made to an already-published page.
4. Add those 10 to `faqs.html`'s list, appended in spreadsheet row order
   after the current entries (not inserted, not resorted).
5. Add those 10 URLs to `sitemap.xml`.
6. Flip those 10 entries to `published: true` in `progress.json`.
7. Do NOT touch already-published pages beyond the single next-arrow
   exception above, the nav, or unrelated sitemap entries.
8. Show me a short summary: which 10 questions were published, and how many
   remain in the queue.
9. Commit with a message like `Add FAQ pages 21-30 of 74`.

If fewer than 10 unpublished entries remain, publish whatever's left and say
so explicitly instead of erroring.

## Do NOT

- Do not regenerate `faqs.html` or `sitemap.xml` from scratch on recurring
  runs — only append.
- Do not edit already-published pages except the single next-arrow exception
  described in the recurring instructions.
- Do not add the `.tool-card` corner-bracket styling or an "About this tool"
  section to FAQ pages.
- Do not write a second slugify implementation — reuse the existing one.
