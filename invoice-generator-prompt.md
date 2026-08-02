Read README.md at the project root first — it documents the file
structure, design system, and conventions every tool on this site
follows (shared header/footer via fetch/inject, css/style.css design
tokens, .tool-card / .tool-explainer / .serp-actions patterns, README
update requirement, index.html tool list format). Follow those
conventions exactly, don't introduce new patterns. Match existing
design tokens by reading css/style.css rather than guessing at values.
After building, add it to index.html's tool list (next sequential
number, name, one-line description) and update README.md the same way
other entries are documented there. Run a basic syntax check on the new
JS before finishing.

===========================================================
TOOL: Invoice Generator
File: invoice-generator.html, js/invoice-generator.js
===========================================================

A tool that builds a formatted invoice from form fields and exports it
as a downloadable PDF. Fully client-side — no invoice data is ever sent
anywhere, no history is stored, each invoice is generated fresh from
whatever's currently in the form. Make this limitation clear in the
explainer section (no saved invoice history across sessions, since
there's no backend/database — this is a generate-and-download tool).

Functionality:

Business/client details:
- "From" fields: business name, address, email, phone (all optional
  except business name)
- "Bill to" fields: client name, address, email (all optional except
  client name)
- Invoice number, issue date, due date (date pickers), currency
  selector (a short list: USD, EUR, GBP, CAD, AUD is enough, symbol
  should update the preview accordingly)

Logo upload:
- A file input accepting image files, read client-side via the
  FileReader API (no upload to any server — note this explicitly in
  the explainer section as a privacy point).
- Enforce a max file size (reject anything over ~2MB with a clear
  inline message, don't just fail silently).
- Show a small thumbnail preview once uploaded, with a "Remove logo"
  button that clears it.
- The logo should appear in the live invoice preview (top of the
  invoice, reasonable max width/height, preserving aspect ratio — don't
  stretch it) and get embedded into the exported PDF via jsPDF's
  addImage() method, scaled the same way.

Line items:
- A dynamic table/list of line items, each with: description,
  quantity, rate, and an auto-calculated line total (qty × rate).
  "+ Add line item" button, a remove button per row, start with 2 empty
  rows by default (don't allow removing the last remaining row, just
  clear it).
- Below the line items: subtotal (sum of line totals), a tax rate
  input (percentage, applied to subtotal), an optional flat discount
  input, and a computed grand total. All of this recalculates live as
  line items or rates change.

Notes/terms:
- A free-text textarea for payment terms or notes (e.g. "Payment due
  within 30 days", bank details, thank-you note), shown at the bottom
  of the invoice preview if filled in.

Preview and export:
- A live-rendered invoice preview (reuse a card-style layout consistent
  with this site's design tokens) that updates as any field changes —
  should visually resemble an actual invoice document: logo top-left or
  top-right, from/to details, invoice number/dates, a line-item table,
  totals section, notes at the bottom.
- A "Download PDF" button that generates and downloads the invoice as a
  PDF using jsPDF, loaded via CDN script tag (cdnjs.cloudflare.com has
  jsPDF builds) — same established pattern as html2canvas on the SERP
  Simulator page, check that page for the exact script-loading
  convention used on this site. Note the internet-connection dependency
  for this one feature in the explainer section, same disclosure style
  used elsewhere on the site for CDN-dependent features.
- A "Reset" button that clears the whole form back to defaults
  (including removing any uploaded logo).

Explainer section (.tool-explainer, original wording) covering:
- That this tool generates a PDF locally in the browser — no data,
  including the logo image, is ever uploaded or sent to a server.
- That there's no saved invoice history, since there's no backend
  database behind this tool — each invoice is a one-time generation
  from the current form state, so the person should keep their own
  copies of important invoices.
- A brief, practical note that this is a formatting tool, not
  accounting or tax software, and that invoice numbering/legal
  requirements vary by jurisdiction, so the person should check what's
  required where they operate.
