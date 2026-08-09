Read README.md at the project root first — it documents the file
structure, design system, and conventions this site follows (shared
header/footer via fetch/inject, css/style.css design tokens,
.tool-card / .tool-explainer patterns, README update requirement,
index.html tool list format, extensionless internal links per the most
recent update, canonical tags using https://seotools4free.com). Follow
these conventions exactly for everything below.

The site's domain is https://seotools4free.com. Internal links across
this site are extensionless (e.g. /word-counter, not /word-counter.html)
— GitHub Pages resolves these automatically without a redirect. Keep
this convention for every FAQ page and every link to them.

INPUT: a CSV file at the repo root (I'll tell you the exact filename —
if you don't see one, ask me rather than guessing) with two columns:
`Question` and `Answer`. Each row is one FAQ. There are approximately
74 rows.

===========================================================
STEP 1: Write a one-time generator script
===========================================================

Write a Node.js script (e.g. scripts/generate-faqs.js) that:

1. Reads the CSV (use a simple manual CSV parser or a lightweight
   dependency-free approach — don't add a heavy npm dependency for
   this, the site has no build step and should stay that way for
   everything except this one generation script).
2. For each row, derives a URL slug from the Question text using the
   SAME slugify logic as this site's existing Slug Generator tool
   (js/slug-generator.js) — lowercase, strip accents, replace
   non-alphanumeric characters with hyphens, collapse repeated
   hyphens. Read that file and reuse its actual logic rather than
   reimplementing it differently.
3. Handles duplicate slugs by appending -2, -3, etc. rather than
   overwriting a previous file. Log a warning for any duplicates
   found, so I can review whether two questions were accidentally
   near-duplicates.
4. For each row, generates an HTML file at /{slug}.html using a single
   shared template (build the template as a separate function/string
   in the script, not 74 hand-written files) where:
   - <title> is the Question text
   - <h1> (via .tool-title or equivalent existing heading class) is
     the Question text
   - The Answer text is rendered as the page's main content, wrapped
     in the site's existing .tool-card style
   - Canonical tag: https://seotools4free.com/{slug}
   - Meta description: use the Answer text, truncated to a reasonable
     length (~155 characters) if longer, don't just dump the full
     answer into the meta description if it's long
   - Includes the shared header/footer via the existing
     partials/header.html + partials/footer.html + js/include.js
     pattern
   - Includes a "Back to all FAQs" link pointing to /faqs
5. Generates one FAQs index page at /faqs.html listing all 74
   questions as links (question text as link text, linking to each
   generated slug), grouped alphabetically or in spreadsheet order —
   your judgment on whichever reads better, note which you chose in
   the summary.
6. Updates partials/header.html to add an "FAQs" link in the nav,
   pointing to /faqs.
7. Generates or updates sitemap.xml at the repo root, adding an entry
   for every FAQ page and the /faqs index page (in addition to
   whatever pages are already in it, if it exists — if it doesn't
   exist yet, create one covering the entire site: homepage, every
   tool page, and every FAQ page). Use standard sitemap.xml format
   with <loc> as the extensionless absolute URL for each page.

===========================================================
STEP 2: Run the script
===========================================================

Run the generator script now against the CSV. After it runs, verify:
- The correct number of FAQ pages were created (should match CSV row
  count, accounting for any duplicate-slug handling)
- /faqs.html lists all of them with working links
- sitemap.xml includes every page on the site, not just the new FAQ
  ones
- partials/header.html has the new FAQs nav link

===========================================================
STEP 3: Update README.md
===========================================================

Document in README.md: that FAQ pages exist and how they were
generated (point to scripts/generate-faqs.js and the CSV), and how to
add more FAQs in the future (add rows to the CSV, re-run the script) —
this is important since I'll likely add more FAQs later and future-you
(or future-me) needs to know this isn't a manual process.

===========================================================
When finished, give me a summary covering:
===========================================================
- How many FAQ pages were generated
- Any duplicate-slug warnings that came up
- Confirmation /faqs.html, the nav link, and sitemap.xml were all
  updated
- Confirmation README.md documents the regeneration process
