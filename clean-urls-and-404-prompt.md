Read README.md at the project root first — it documents the file
structure, design system, and conventions this site follows (shared
header/footer via fetch/inject, css/style.css design tokens,
.tool-card / .tool-explainer / .serp-actions patterns, README update
requirement, index.html tool list format). Follow those conventions
exactly for the 404 page below, don't introduce new patterns. Match
existing design tokens by reading css/style.css rather than guessing at
values. This work covers three related changes — do all three.

===========================================================
PART 1: Strip .html from every internal link
===========================================================

GitHub Pages automatically resolves extensionless URLs to their .html
file (e.g. a request to /word-counter serves word-counter.html, with no
redirect and no server config needed — this is default GitHub Pages
behavior). Do NOT rename any HTML files themselves, only change how
they're linked to.

Find and update every internal link across the repo that currently
points to a page with a .html extension, removing the extension:
- index.html's tool list (every <a href="...">)
- partials/header.html and partials/footer.html (nav links, logo link)
- Any cross-links between tool pages, if any tool links to another
- Any other internal navigation links anywhere in the codebase

Do NOT strip .html from:
- External links (anything pointing to a different domain)
- <script src="js/*.js"> tags — those are JS files, not pages, leave
  them exactly as they are
- <link rel="stylesheet" href="css/style.css"> — same reasoning
- Any reference to the actual filename on disk (e.g. in comments or
  documentation describing which file to edit)

This means links like href="word-counter.html" become href="word-counter"
and href="/word-counter.html" (if any absolute-path links exist) become
href="/word-counter". Preserve relative vs absolute path style exactly
as it currently is, only remove the extension.

Important local-testing note (mention this in your final summary, don't
skip it): this extensionless resolution ONLY works on GitHub Pages
itself. If testing locally with `python3 -m http.server` or similar,
these links will 404 locally even though they work correctly once
deployed. This is expected, not a bug — flag it clearly in your summary
so it isn't mistaken for something broken.

===========================================================
PART 2: Update canonical tags to match
===========================================================

Every page's canonical tag currently points to an absolute URL ending
in .html (e.g. https://seotools4free.com/word-counter.html). Update all
of them to drop the .html extension too, for consistency with the links
now pointing to the extensionless versions:
https://seotools4free.com/word-counter.html
  -> https://seotools4free.com/word-counter

Leave index.html's canonical tag as-is if it already points to just
https://seotools4free.com/ (the bare root) — that one doesn't need
changing.

===========================================================
PART 3: Custom 404 page
===========================================================

File: 404.html (at the repo root — GitHub Pages automatically serves
this file for any unresolved URL, no configuration needed).

Build this using the site's existing design system and shared
header/footer (same fetch/inject pattern as every other page, via
js/include.js), not a bare unstyled page. Content:
- A short, friendly heading (e.g. "Page not found") — original wording,
  not a generic error-page cliché.
- One or two sentences explaining the page doesn't exist, might have
  moved, or the link might be outdated.
- A prominent link back to the homepage (index.html, extensionless per
  Part 1 above).
- A short list of 3-4 of the site's most useful/popular tools as direct
  links, so someone landing here from a dead link has an easy way back
  into something useful rather than just bouncing off the site
  entirely. Pick reasonable ones based on what's in index.html's
  current tool list.
- Keep it visually consistent with the rest of the site: same
  .tool-card style container, same fonts/colors from css/style.css, no
  new one-off styles.

After finishing all three parts, give a summary covering:
- How many links were updated in Part 1, and which files they were in
- Confirmation every canonical tag was updated in Part 2
- Confirmation 404.html was created and uses the shared header/footer
- A reminder of the local-testing caveat from Part 1
