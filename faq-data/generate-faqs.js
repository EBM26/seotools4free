// One-time setup + recurring "publish N more FAQs" generator.
// See faq-generator-prompt.md at the repo root for the full spec this
// implements. Run with: node faq-data/generate-faqs.js [count]
// Defaults to publishing the next 10 unpublished FAQs.

const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const slugify = require('../js/slugify.js');

const ROOT = path.join(__dirname, '..');
const XLSX_PATH = path.join(ROOT, 'seotoolsFAQMaster.xlsx');
const PROGRESS_PATH = path.join(__dirname, 'progress.json');
const TEMPLATE_PATH = path.join(__dirname, 'faq-template.html');
const FAQ_DIR = path.join(ROOT, 'faq');
const FAQS_INDEX_PATH = path.join(ROOT, 'faqs.html');
const SITEMAP_PATH = path.join(ROOT, 'sitemap.xml');
const SITE = 'https://seotools4free.com';

const BATCH_SIZE = parseInt(process.argv[2], 10) || 10;

function readSpreadsheet() {
  const wb = xlsx.readFile(XLSX_PATH);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  const header = (rows[0] || []).map((h) => String(h).trim());
  if (header[0] !== 'Question' || header[1] !== 'Answer') {
    console.error(
      'STOP: expected columns "Question" and "Answer" but found ' +
        JSON.stringify(header) +
        '. Confirm the correct columns before proceeding.'
    );
    process.exit(1);
  }
  return rows
    .slice(1)
    .filter((r) => String(r[0]).trim() !== '' || String(r[1]).trim() !== '')
    .map((r) => ({ question: String(r[0]).trim(), answer: String(r[1]).trim() }));
}

function buildSlugsWithWarnings(qas) {
  const seen = new Map();
  const warnings = [];
  const entries = qas.map((qa, i) => {
    const base = slugify(qa.question, '-', true);
    const count = (seen.get(base) || 0) + 1;
    seen.set(base, count);
    const slug = count === 1 ? base : base + '-' + count;
    if (count > 1) {
      warnings.push({
        rowIndex: i,
        message:
          'Row ' + (i + 2) + ' ("' + qa.question + '") produces duplicate slug "' + base +
          '" — saved as "' + slug + '". Check whether this is an accidental duplicate question.',
      });
    }
    return { slug: slug, question: qa.question, answer: qa.answer };
  });
  return { entries: entries, warnings: warnings };
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function truncateAtWordBoundary(text, maxLen) {
  if (text.length <= maxLen) return text;
  const lastSpace = text.slice(0, maxLen).lastIndexOf(' ');
  return text.slice(0, lastSpace > 0 ? lastSpace : maxLen).trim();
}

function paragraphsHtml(answer) {
  return answer
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => '      <p>' + escapeHtml(chunk) + '</p>')
    .join('\n');
}

function loadProgress() {
  if (!fs.existsSync(PROGRESS_PATH)) return [];
  return JSON.parse(fs.readFileSync(PROGRESS_PATH, 'utf8'));
}

function loadSitemapLocs() {
  if (!fs.existsSync(SITEMAP_PATH)) return new Set();
  const xml = fs.readFileSync(SITEMAP_PATH, 'utf8');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  return new Set(locs);
}

function addSitemapEntries(newLocs) {
  let xml;
  if (!fs.existsSync(SITEMAP_PATH)) {
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>\n';
  } else {
    xml = fs.readFileSync(SITEMAP_PATH, 'utf8');
  }
  const existing = loadSitemapLocs();
  const toAdd = newLocs.filter((loc) => !existing.has(loc));
  if (toAdd.length === 0) return 0;
  const entries = toAdd.map((loc) => '  <url>\n    <loc>' + loc + '</loc>\n  </url>').join('\n');
  xml = xml.replace('</urlset>', entries + '\n</urlset>');
  fs.writeFileSync(SITEMAP_PATH, xml);
  return toAdd.length;
}

function loadFaqsIndex() {
  if (fs.existsSync(FAQS_INDEX_PATH)) {
    return fs.readFileSync(FAQS_INDEX_PATH, 'utf8');
  }
  return [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '  <meta charset="UTF-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    '  <title>Frequently Asked Questions — seotools4free</title>',
    '  <meta name="description" content="Answers to common questions about SEO, schema markup, AI tokens, and the free tools on seotools4free." />',
    '  <link rel="preconnect" href="https://fonts.googleapis.com" />',
    '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />',
    '  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />',
    '  <link rel="stylesheet" href="css/style.css" />',
    '  <link rel="canonical" href="' + SITE + '/faqs" />',
    '  <link rel="icon" href="favicon.svg" type="image/svg+xml" />',
    '  <link rel="alternate icon" href="favicon.ico" />',
    '  <link rel="apple-touch-icon" href="apple-touch-icon.png" />',
    '</head>',
    '<body>',
    '',
    '  <div id="site-header"></div>',
    '',
    '  <main>',
    '    <div class="tool-eyebrow">FAQ</div>',
    '    <h1 class="tool-title">Frequently Asked Questions</h1>',
    '    <p class="tool-description">Answers to common questions about SEO, schema markup, AI tokens, and the tools on this site.</p>',
    '',
    '    <div class="tool-list">',
    '<!-- FAQ_LIST_START -->',
    '<!-- FAQ_LIST_END -->',
    '    </div>',
    '  </main>',
    '',
    '  <div id="site-footer"></div>',
    '',
    '  <script src="js/include.js"></script>',
    '</body>',
    '</html>',
    '',
  ].join('\n');
}

function faqsIndexItem(entry, index, answerPreview) {
  return (
    '      <a href="/faq/' + entry.slug + '" class="tool-list__item">\n' +
    '        <span class="tool-list__index">' + index + '</span>\n' +
    '        <div>\n' +
    '          <div class="tool-list__name">' + escapeHtml(entry.question) + '</div>\n' +
    '          <div class="tool-list__desc">' + escapeHtml(answerPreview) + '</div>\n' +
    '        </div>\n' +
    '      </a>'
  );
}

function main() {
  const isFirstRun = !fs.existsSync(PROGRESS_PATH);
  const qas = readSpreadsheet();
  const { entries: allEntries, warnings } = buildSlugsWithWarnings(qas);

  const oldProgress = loadProgress();
  const oldLength = oldProgress.length;
  const newWarnings = warnings.filter((w) => w.rowIndex >= oldLength);

  const progress = oldProgress.slice();
  for (let i = oldLength; i < allEntries.length; i++) {
    progress.push({ slug: allEntries[i].slug, question: allEntries[i].question, published: false });
  }

  // Find next BATCH_SIZE unpublished entries, in spreadsheet order.
  const batchIndexes = [];
  for (let i = 0; i < progress.length && batchIndexes.length < BATCH_SIZE; i++) {
    if (!progress[i].published) batchIndexes.push(i);
  }

  if (batchIndexes.length === 0) {
    fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2) + '\n');
    console.log('No unpublished FAQs remain. Nothing to do.');
    return;
  }

  const fewerThanRequested = batchIndexes.length < BATCH_SIZE;

  fs.mkdirSync(FAQ_DIR, { recursive: true });
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

  // Was there a previously-published last page that currently has no "next"?
  const firstBatchIndex = batchIndexes[0];
  const priorLastIndex = firstBatchIndex - 1;
  const priorLastWasPublished = priorLastIndex >= 0 && progress[priorLastIndex].published;

  const published = [];

  batchIndexes.forEach((i) => {
    const entry = allEntries[i];
    const prevIndex = i - 1;
    const nextIndex = i + 1;
    const hasPrev = prevIndex >= 0;
    const hasNext = nextIndex < progress.length && (batchIndexes.includes(nextIndex) || progress[nextIndex].published);

    const prevLink = hasPrev
      ? '      <a href="/faq/' + progress[prevIndex].slug + '" class="faq-nav__prev">&larr; ' +
        escapeHtml(progress[prevIndex].question) + '</a>\n'
      : '';
    const nextLink = hasNext
      ? '      <a href="/faq/' + progress[nextIndex].slug + '" class="faq-nav__next">' +
        escapeHtml(allEntries[nextIndex].question) + ' &rarr;</a>\n'
      : '';

    const html = template
      .replace(/{{TITLE}}/g, escapeHtml(entry.question))
      .replace(/{{META_DESCRIPTION}}/g, escapeHtml(truncateAtWordBoundary(entry.answer, 155)))
      .replace(/{{SLUG}}/g, entry.slug)
      .replace(/{{QUESTION}}/g, escapeHtml(entry.question))
      .replace(/{{BODY_PARAGRAPHS}}/g, paragraphsHtml(entry.answer))
      .replace(/{{PREV_LINK}}/g, prevLink)
      .replace(/{{NEXT_LINK}}/g, nextLink);

    fs.writeFileSync(path.join(FAQ_DIR, entry.slug + '.html'), html);
    progress[i].published = true;
    published.push(entry);
  });

  // The single exception: give the previously-last-published page its "next" arrow.
  if (priorLastWasPublished) {
    const priorEntry = allEntries[priorLastIndex];
    const priorSlug = progress[priorLastIndex].slug;
    const firstNewEntry = allEntries[firstBatchIndex];
    const priorPagePath = path.join(FAQ_DIR, priorSlug + '.html');
    let priorHtml = fs.readFileSync(priorPagePath, 'utf8');
    if (!priorHtml.includes('faq-nav__next')) {
      const nextLink =
        '      <a href="/faq/' + allEntries[firstBatchIndex].slug + '" class="faq-nav__next">' +
        escapeHtml(firstNewEntry.question) + ' &rarr;</a>\n';
      priorHtml = priorHtml.replace('    </div>\n  </main>', '    ' + nextLink + '</div>\n  </main>');
      fs.writeFileSync(priorPagePath, priorHtml);
    }
  }

  // faqs.html — append newly-published entries in spreadsheet order.
  let faqsHtml = loadFaqsIndex();
  const startIndex = (faqsHtml.match(/tool-list__item/g) || []).length + 1;
  const newItems = published
    .map((entry, n) => faqsIndexItem(entry, startIndex + n, truncateAtWordBoundary(entry.answer, 120)))
    .join('\n');
  faqsHtml = faqsHtml.replace('<!-- FAQ_LIST_END -->', newItems + '\n<!-- FAQ_LIST_END -->');
  fs.writeFileSync(FAQS_INDEX_PATH, faqsHtml);

  // sitemap.xml — add /faqs (once) and the newly published FAQ pages.
  const sitemapAdds = [];
  if (isFirstRun) sitemapAdds.push(SITE + '/faqs');
  published.forEach((entry) => sitemapAdds.push(SITE + '/faq/' + entry.slug));
  addSitemapEntries(sitemapAdds);

  fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2) + '\n');

  const remaining = progress.filter((p) => !p.published).length;

  console.log('--- FAQ generation summary ---');
  console.log('Published ' + published.length + ' FAQ page(s):');
  published.forEach((e, n) => console.log('  ' + (startIndex + n) + '. ' + e.question));
  console.log('Remaining unpublished: ' + remaining + ' of ' + progress.length);
  if (fewerThanRequested) {
    console.log('Note: fewer than ' + BATCH_SIZE + ' unpublished entries were available.');
  }
  if (newWarnings.length) {
    console.log('Duplicate-slug warnings:');
    newWarnings.forEach((w) => console.log('  - ' + w.message));
  }
}

main();
