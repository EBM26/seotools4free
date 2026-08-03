Rename the following tool pages to new, more keyword-friendly URLs
across this repo. The site's domain is https://seotools4free.com — use
this as the base for all canonical URLs below (no trailing slash on the
domain, filenames appended directly, e.g.
https://seotools4free.com/ai-text-detector.html).

For each pair below, if the old file doesn't exist in this repo yet
(some tools may not be built yet), skip it and list it in a final
summary rather than erroring out — don't create a new empty file for a
tool that hasn't been built.

Old filename -> New filename
-----------------------------------------------------------
ai-content-detector.html      -> ai-text-detector.html
ai-cost-calculator.html       -> ai-api-cost-calculator.html
ai-phrase-checker.html        -> ai-text-humanizer.html
color-contrast-checker.html   -> wcag-contrast-checker.html
css-clamp-calculator.html     -> css-clamp-generator.html
markdown-cleaner.html         -> markdown-to-plain-text.html
og-preview-tool.html          -> og-image-preview.html
prompt-template-builder.html  -> ai-prompt-builder.html
prompt-token-counter.html     -> ai-token-calculator.html
readability-checker.html      -> readability-score-checker.html
serp-simulator.html           -> serp-preview-tool.html
system-prompt-analyzer.html   -> ai-prompt-analyzer.html

For each pair that exists, do ALL of the following:

1. Rename the HTML file itself (e.g. `git mv old-name.html
   new-name.html`, or plain rename if not using git yet). Do not leave
   a stub or redirect at the old filename — it should simply no longer
   exist after the rename.
2. Rename its matching JS file the same way (e.g. `js/old-name.js` ->
   `js/new-name.js`).
3. Inside the renamed HTML file, update the `<script src="js/old-
   name.js">` tag to point to the new JS filename.
4. Add or update a canonical tag in the renamed HTML file's `<head>`:
   `<link rel="canonical" href="https://seotools4free.com/new-
   name.html" />`. If a canonical tag already exists on that page,
   update its href to the new absolute URL rather than adding a
   duplicate tag.
5. Update every internal link pointing to the old filename anywhere in
   the repo: index.html's tool list, README.md (both the tool list
   section and any prose mentioning the filename), and any cross-links
   between tool pages if tools link to each other.
6. Do NOT change the page's visible content — title text, headings,
   eyebrow label, explainer copy — only the file path, the canonical
   tag, and the links pointing to it. The URL slug is changing, not the
   tool itself.

When finished, give a summary listing:
- Which pairs were renamed successfully
- Which pairs were skipped because the old file didn't exist yet
- Confirmation that index.html and README.md were both updated
- Confirmation that each renamed page has a correct canonical tag

===========================================================
ADDITIONAL: Canonical tags on every other existing page
===========================================================

Beyond the renamed pages above, add (or fix, if one already points to
a placeholder/localhost/relative URL) a canonical tag in the `<head>`
of every OTHER existing HTML page in this repo — every tool page not
in the rename list above, plus index.html — using the same domain:

`<link rel="canonical" href="https://seotools4free.com/{filename}.html" />`

For index.html specifically, use:
`<link rel="canonical" href="https://seotools4free.com/" />`
(the homepage should canonicalize to the root domain, not
index.html, since both URLs would otherwise serve the same content).

Do not touch visible page content for this step either, only add or
correct the canonical tag itself. Include in the final summary a list
of every page that got a canonical tag added or corrected under this
section, separate from the renamed-pages summary above.
