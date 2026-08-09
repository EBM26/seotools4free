The custom 404.html page is loading with no styling and no header/footer
when triggered on a nested/unmatched URL (e.g. visiting a deep broken
link). This is because its asset references use relative paths, which
break for a 404 page specifically, since GitHub Pages can serve it at
any arbitrary URL depth, and the browser resolves relative paths
against that (fake) URL, not the file's actual location on disk.

Fix ONLY in 404.html (every other page on the site can safely stay
relative, since they're always genuinely served at the root):

1. Change the CSS link from a relative path (e.g. "css/style.css") to
   an absolute path: "/css/style.css"
2. Change any <script src="..."> references (e.g. "js/include.js") to
   absolute paths: "/js/include.js"
3. Inside js/include.js itself, check how it fetches the header/footer
   partials (likely "partials/header.html" and "partials/footer.html").
   If those fetch paths are relative too, either:
   a) Change them to absolute ("/partials/header.html") if that
      doesn't break header/footer injection on any other existing
      page (check word-counter.html or another simple page still
      renders correctly after this change), or
   b) If include.js is shared across all pages and changing it
      globally to absolute paths is safe (since every page is at the
      root, absolute and relative paths would resolve identically for
      them), just make the paths in include.js absolute across the
      board — simpler than maintaining two versions of the file.
4. Also check any other internal links on 404.html itself (the "Back
   to homepage" link and the tool links) — make sure those are
   absolute paths too (e.g. "/" for home, "/word-counter" for tools),
   not relative, for the same reason.

After fixing, confirm 404.html renders correctly with full styling and
a working header/footer when tested by visiting a genuinely
non-existent nested path on the live GitHub Pages site (not local
testing, since GitHub Pages' 404 behavior doesn't trigger the same way
with a local static server).
