(function () {
  var input = document.getElementById('input-text');
  var preview = document.getElementById('preview-text');
  var btnCopy = document.getElementById('btn-copy');
  var btnReset = document.getElementById('btn-reset');
  var feedback = document.getElementById('actions-feedback');

  var totalEl = document.getElementById('stat-total');
  var densityEl = document.getElementById('stat-density');
  var emDashEl = document.getElementById('stat-em-dash');
  var emojiEl = document.getElementById('stat-emoji');
  var countVocabEl = document.getElementById('count-vocabulary');
  var countStockEl = document.getElementById('count-stock');
  var countStructuralEl = document.getElementById('count-structural');

  var DEBOUNCE_MS = 250;
  var debounceTimer = null;

  var tooltip = document.createElement('div');
  tooltip.className = 'pc-tooltip';
  document.body.appendChild(tooltip);

  function showTooltip(mark) {
    var reason = mark.getAttribute('data-reason');
    if (!reason) return;
    tooltip.textContent = reason;
    tooltip.classList.add('is-visible');

    var markRect = mark.getBoundingClientRect();
    var tooltipRect = tooltip.getBoundingClientRect();
    var left = markRect.left + markRect.width / 2 - tooltipRect.width / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8));
    var top = markRect.top - tooltipRect.height - 8;
    if (top < 8) top = markRect.bottom + 8;
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
  }

  function hideTooltip() {
    tooltip.classList.remove('is-visible');
  }

  function showFeedback(message) {
    feedback.textContent = message;
    setTimeout(function () {
      if (feedback.textContent === message) feedback.textContent = '';
    }, 2500);
  }

  // Single words and short phrases that show up disproportionately often in
  // AI-generated writing. "actually" is handled separately below since it's
  // only a flag as a sentence-opening filler, not in general use.
  var VOCABULARY = [
    'delve', 'tapestry', 'boast', 'boasts', 'testament', 'underscore', 'underscores',
    'pivotal', 'robust', 'crucial', 'seamless', 'cutting-edge', 'game-changer', 'elevate',
    'foster', 'intricate', 'landscape', 'realm', 'navigate', 'unlock', 'unleash', 'embark',
    'journey', 'treasure trove', 'vibrant', 'holistic', 'comprehensive', 'meticulous',
    'invaluable', 'paramount', 'multifaceted', 'nuanced', 'dynamic', 'synergy', 'leverage',
    'streamline', 'bespoke', 'curated', 'folks', 'adhere', 'amplify', 'resonate', 'enhance',
    'expertise', 'offerings', 'endeavour', 'endeavor', 'esteemed', 'shed light',
    'deep understanding', 'insights', 'enlightening', 'relentless', 'groundbreaking',
    'systemic', 'inherent', 'peril', 'pertinent', 'explore', 'empower'
  ];

  var STOCK_PHRASES = [
    "in today's fast-paced world", 'in the realm of', "in this digital age",
    "it's important to note that", "it's worth noting", 'at the end of the day',
    'in conclusion', 'overall,', 'to sum up', 'i hope this message finds you well'
  ];

  var ATTRIBUTION_PHRASES = ['studies show', 'experts say', 'observers have noted'];

  // One-line "why this is flagged" text, shown as a tooltip on each highlight.
  var VOCAB_REASONS = {
    'delve': 'A high-frequency "explore in depth" filler word used for almost any topic.',
    'tapestry': 'A stock metaphor used to sound elevated instead of stating what’s actually being described.',
    'boast': 'A formal substitute for "has," inflating a plain feature into a claim.',
    'boasts': 'A formal substitute for "has," inflating a plain feature into a claim.',
    'testament': 'Filler ("a testament to") standing in for a direct, causal statement.',
    'underscore': 'A formal stand-in for "shows" or "highlights."',
    'underscores': 'A formal stand-in for "shows" or "highlights."',
    'pivotal': 'Inflates importance without saying what specifically makes it important.',
    'robust': 'A vague strength-signaling adjective that rarely specifies what’s actually robust.',
    'crucial': 'A generic importance-signaling adjective, often unearned by the sentence around it.',
    'seamless': 'A stock claim of smoothness rarely backed by a concrete detail.',
    'cutting-edge': 'A vague innovation-signaling adjective with no specific claim behind it.',
    'game-changer': 'An overused hype phrase that asserts significance instead of demonstrating it.',
    'elevate': 'A vague improvement verb standing in for a specific, concrete change.',
    'foster': 'A formal, vague verb for "encourage" or "help create."',
    'intricate': 'A vague complexity-signaling adjective.',
    'landscape': 'A stock metaphor for "situation" or "field," reached for almost automatically.',
    'realm': 'A stock metaphor for "area" or "field."',
    'navigate': 'A metaphorical stand-in for "deal with" or "handle."',
    'unlock': 'A hype verb implying hidden potential without specifics.',
    'unleash': 'A hype verb implying a dramatic release of value without specifics.',
    'embark': 'A formal stand-in for "start," usually paired with "journey."',
    'journey': 'An overused metaphor for any multi-step process.',
    'treasure trove': 'A cliché metaphor for "a lot of" or "a good source of."',
    'vibrant': 'A vague positive-energy adjective applied to almost anything.',
    'holistic': 'A vague completeness-signaling adjective, rarely defined.',
    'comprehensive': 'A vague completeness claim, often unearned.',
    'meticulous': 'A vague care-signaling adjective, rarely backed by specifics.',
    'invaluable': 'A vague, unquantified value claim.',
    'paramount': 'An inflated importance-signaling adjective.',
    'multifaceted': 'A vague complexity-signaling adjective.',
    'nuanced': 'A vague sophistication-signaling adjective, often used without elaborating the nuance.',
    'dynamic': 'A vague, all-purpose positive adjective.',
    'synergy': 'Vague business-speak for "working well together."',
    'leverage': 'A formal stand-in for "use."',
    'streamline': 'A vague improvement verb for "make simpler," rarely specific.',
    'bespoke': 'A formal stand-in for "custom," often for things that aren’t really bespoke.',
    'curated': 'Implies careful selection without demonstrating it.',
    'folks': 'A faux-casual address models overuse when reaching for warmth.',
    'adhere': 'A formal stand-in for "follow" or "stick to."',
    'amplify': 'A hype verb for "increase," used for almost anything.',
    'resonate': 'A vague emotional-impact claim standing in for a specific reaction.',
    'enhance': 'A vague improvement verb, rarely specific about what changed.',
    'expertise': 'A generic credibility claim, rarely backed by specifics.',
    'offerings': 'Corporate stand-in for "products" or "services."',
    'endeavour': 'A formal stand-in for "effort" or "project."',
    'endeavor': 'A formal stand-in for "effort" or "project."',
    'esteemed': 'An inflated, generic praise adjective.',
    'shed light': 'A cliché stand-in for "explain" or "clarify."',
    'deep understanding': 'A vague competence claim, rarely demonstrated.',
    'insights': 'A vague stand-in for "information" or "findings," used even when nothing new is revealed.',
    'enlightening': 'An inflated praise adjective for "informative."',
    'relentless': 'A hype adjective for "persistent," used for almost any effort.',
    'groundbreaking': 'An inflated novelty claim, rarely justified.',
    'systemic': 'A formal stand-in for "widespread" or "built into the system."',
    'inherent': 'A formal stand-in for "built-in" or "natural."',
    'peril': 'A dramatic stand-in for "risk" or "danger."',
    'pertinent': 'A formal stand-in for "relevant."',
    'explore': 'A vague stand-in for "discuss" or "look at," used for almost any topic.',
    'empower': 'A vague, feel-good stand-in for "let" or "help," rarely specific about what changes.',
    'actually': 'Sentence-opening filler that adds no meaning, a tic models fall back on.'
  };

  var STOCK_REASONS = {
    "in today's fast-paced world": 'A generic scene-setting opener that fits literally any topic.',
    'in the realm of': 'Formal filler for "in" or "within."',
    "in this digital age": 'A generic scene-setting opener that rarely adds information.',
    "it's important to note that": 'Throat-clearing filler before a claim; the claim usually stands fine without it.',
    "it's worth noting": 'Throat-clearing filler that delays the actual point.',
    'at the end of the day': 'A vague, filler transition into a summary point.',
    'in conclusion': 'A mechanical essay-structure transition rarely needed in normal prose.',
    'overall,': 'A mechanical summary transition, often unnecessary.',
    'to sum up': 'A mechanical summary transition, often unnecessary.',
    'i hope this message finds you well': 'Generic email-opening filler that says nothing about the actual message.'
  };

  var STRUCTURAL_REASONS = {
    'not only ... but also': 'A stock two-part emphasis construction models reach for by default, even when a plain sentence would read better.',
    'rule-of-three list': 'A three-item comma list before "and" is a rhythmic pattern models overuse regardless of whether three items is the right fit.',
    'studies show': 'Cites a claim to an unnamed source, a hedge pattern used instead of a specific, checkable citation.',
    'experts say': 'Cites a claim to an unnamed source, a hedge pattern used instead of a specific, checkable citation.',
    'observers have noted': 'Cites a claim to an unnamed source, a hedge pattern used instead of a specific, checkable citation.',
    'from ... to ...': 'A sweeping "from X to Y" range/journey framing that sounds dramatic without being precise (also fires on genuine ranges, so check before revising).',
    'dangling -ing clause': 'A comma followed by an "-ing" clause tacked onto the sentence end is a rhythm models fall into for restating a benefit instead of integrating it into the sentence.'
  };

  function getReason(match) {
    var key = match.label.toLowerCase();
    if (match.category === 'vocabulary') {
      return VOCAB_REASONS[key] || 'A word that shows up disproportionately often in AI-generated writing.';
    }
    if (match.category === 'stock') {
      return STOCK_REASONS[key] || 'A stock transition phrase common in AI-generated writing.';
    }
    return STRUCTURAL_REASONS[key] || 'A sentence structure that shows up disproportionately often in AI-generated writing.';
  }

  function normalizeQuotes(text) {
    return text.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
  }

  function isWordChar(ch) {
    return !!ch && /[a-z0-9]/i.test(ch);
  }

  // Finds every case-insensitive occurrence of `phrase` in `lowerText` that
  // isn't glued to surrounding letters/digits (a poor man's word boundary
  // that also works for phrases ending in punctuation, like "overall,").
  function findLiteralMatches(lowerText, phrase, category) {
    var results = [];
    var needle = phrase.toLowerCase();
    var searchFrom = 0;
    while (true) {
      var found = lowerText.indexOf(needle, searchFrom);
      if (found === -1) break;
      var before = found > 0 ? lowerText[found - 1] : '';
      var after = lowerText[found + needle.length] || '';
      var lastNeedleChar = needle[needle.length - 1];
      var beforeOk = !isWordChar(before);
      var afterOk = isWordChar(lastNeedleChar) ? !isWordChar(after) : true;
      if (beforeOk && afterOk) {
        results.push({ start: found, end: found + needle.length, category: category, label: phrase });
      }
      searchFrom = found + needle.length;
    }
    return results;
  }

  // "actually" only counts as filler when it opens a sentence (or the text).
  function findSentenceOpenerMatches(text, word) {
    var results = [];
    var re = new RegExp('(^|[.!?]\\s+)(' + word + ')\\b', 'gi');
    var m;
    while ((m = re.exec(text)) !== null) {
      var start = m.index + m[1].length;
      var end = start + m[2].length;
      results.push({ start: start, end: end, category: 'vocabulary', label: word });
    }
    return results;
  }

  function findNotOnlyButAlso(text) {
    var results = [];
    var re = /\bnot only\b[^.!?]{0,100}?\bbut also\b/gi;
    var m;
    while ((m = re.exec(text)) !== null) {
      results.push({ start: m.index, end: m.index + m[0].length, category: 'structural', label: 'not only ... but also' });
    }
    return results;
  }

  // Rule-of-three: "fast, reliable, and secure" style comma lists ending in "and".
  function findRuleOfThree(text) {
    var results = [];
    var re = /\b([A-Za-z]+(?:[- ][A-Za-z]+)?),\s*([A-Za-z]+(?:[- ][A-Za-z]+)?),?\s+and\s+([A-Za-z]+(?:[- ][A-Za-z]+)?)\b/g;
    var m;
    while ((m = re.exec(text)) !== null) {
      results.push({ start: m.index, end: m.index + m[0].length, category: 'structural', label: 'rule-of-three list' });
    }
    return results;
  }

  // "studies show"/"experts say" style claims with no named source right after.
  function findVagueAttribution(text) {
    var results = [];
    ATTRIBUTION_PHRASES.forEach(function (phrase) {
      var re = new RegExp('\\b' + phrase.replace(/ /g, '\\s+') + '\\b', 'gi');
      var m;
      while ((m = re.exec(text)) !== null) {
        var after = text.slice(m.index + m[0].length, m.index + m[0].length + 60);
        var namedSource = /\baccording to\b/i.test(after) || /\b[A-Z][a-zA-Z.]+\s+[A-Z][a-zA-Z.]+\b/.test(after);
        if (!namedSource) {
          results.push({ start: m.index, end: m.index + m[0].length, category: 'structural', label: phrase });
        }
      }
    });
    return results;
  }

  // "from X to Y" false-range phrasing (a heuristic, catches real ranges too).
  function findFromToRange(text) {
    var results = [];
    var re = /\bfrom\s+[A-Za-z0-9][\w'-]*(?:\s+[A-Za-z0-9][\w'-]*){0,2}\s+to\s+[A-Za-z0-9][\w'-]*(?:\s+[A-Za-z0-9][\w'-]*){0,2}\b/gi;
    var m;
    while ((m = re.exec(text)) !== null) {
      results.push({ start: m.index, end: m.index + m[0].length, category: 'structural', label: 'from ... to ...' });
    }
    return results;
  }

  // Sentences ending in a dangling "-ing" clause after a comma, e.g. "..., improving convenience."
  function findDanglingIng(text) {
    var results = [];
    var re = /,\s+[a-z]+ing\b[^,.!?]{0,40}[.!?]/gi;
    var m;
    while ((m = re.exec(text)) !== null) {
      results.push({ start: m.index, end: m.index + m[0].length, category: 'structural', label: 'dangling -ing clause' });
    }
    return results;
  }

  function collectMatches(text) {
    var normalized = normalizeQuotes(text);
    var lower = normalized.toLowerCase();
    var matches = [];

    VOCABULARY.forEach(function (word) {
      matches = matches.concat(findLiteralMatches(lower, word, 'vocabulary'));
    });
    matches = matches.concat(findSentenceOpenerMatches(normalized, 'actually'));

    STOCK_PHRASES.forEach(function (phrase) {
      matches = matches.concat(findLiteralMatches(lower, phrase, 'stock'));
    });

    matches = matches.concat(findNotOnlyButAlso(normalized));
    matches = matches.concat(findRuleOfThree(normalized));
    matches = matches.concat(findVagueAttribution(normalized));
    matches = matches.concat(findFromToRange(normalized));
    matches = matches.concat(findDanglingIng(normalized));

    matches.sort(function (a, b) {
      if (a.start !== b.start) return a.start - b.start;
      return (b.end - b.start) - (a.end - a.start);
    });

    var selected = [];
    var lastEnd = -1;
    matches.forEach(function (match) {
      if (match.start >= lastEnd) {
        selected.push(match);
        lastEnd = match.end;
      }
    });

    return selected;
  }

  function countWords(text) {
    var matches = text.match(/[A-Za-z']+/g);
    return matches ? matches.length : 0;
  }

  function countEmDashes(text) {
    var matches = text.match(/—/g);
    return matches ? matches.length : 0;
  }

  var EMOJI_PATTERN = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu;

  function countEmoji(text) {
    var matches = text.match(EMOJI_PATTERN);
    return matches ? matches.length : 0;
  }

  function renderPreview(text, matches) {
    preview.innerHTML = '';
    if (!text) return;

    var cursor = 0;
    matches.forEach(function (match) {
      if (match.start > cursor) {
        preview.appendChild(document.createTextNode(text.slice(cursor, match.start)));
      }
      var mark = document.createElement('mark');
      mark.className = 'pc-mark pc-mark--' + match.category;
      mark.textContent = text.slice(match.start, match.end);
      mark.tabIndex = 0;
      mark.setAttribute('data-reason', getReason(match));
      preview.appendChild(mark);
      cursor = match.end;
    });
    if (cursor < text.length) {
      preview.appendChild(document.createTextNode(text.slice(cursor)));
    }
  }

  function update() {
    var text = input.value;

    // A re-render replaces the marks currently in the DOM; if one was being
    // hovered, its element is gone before a mouseout can fire, so drop any
    // stale tooltip explicitly rather than leaving it stuck on screen.
    hideTooltip();

    if (!text.trim()) {
      preview.innerHTML = '';
      totalEl.textContent = '0';
      densityEl.textContent = '0.0';
      emDashEl.textContent = '0';
      emojiEl.textContent = '0';
      countVocabEl.textContent = '0';
      countStockEl.textContent = '0';
      countStructuralEl.textContent = '0';
      return;
    }

    var matches = collectMatches(text);
    var wordCount = countWords(text);
    var density = wordCount > 0 ? (matches.length / (wordCount / 100)) : 0;

    var vocabCount = matches.filter(function (m) { return m.category === 'vocabulary'; }).length;
    var stockCount = matches.filter(function (m) { return m.category === 'stock'; }).length;
    var structuralCount = matches.filter(function (m) { return m.category === 'structural'; }).length;

    renderPreview(text, matches);
    totalEl.textContent = matches.length;
    densityEl.textContent = density.toFixed(1);
    emDashEl.textContent = countEmDashes(text);
    emojiEl.textContent = countEmoji(text);
    countVocabEl.textContent = vocabCount;
    countStockEl.textContent = stockCount;
    countStructuralEl.textContent = structuralCount;

    input.dataset.lastMatches = JSON.stringify(matches.map(function (m) { return { label: m.label, category: m.category }; }));
  }

  function copyFlaggedTerms() {
    var raw = input.dataset.lastMatches;
    var matches = raw ? JSON.parse(raw) : [];
    if (matches.length === 0) {
      showFeedback('Nothing flagged yet, paste text above first.');
      return;
    }

    var groups = { vocabulary: {}, stock: {}, structural: {} };
    matches.forEach(function (m) {
      var key = m.label.toLowerCase();
      groups[m.category][key] = (groups[m.category][key] || 0) + 1;
    });

    var labels = { vocabulary: 'Vocabulary', stock: 'Stock phrases', structural: 'Structural patterns' };
    var lines = [];
    ['vocabulary', 'stock', 'structural'].forEach(function (category) {
      var entries = Object.keys(groups[category]);
      if (entries.length === 0) return;
      lines.push(labels[category] + ':');
      entries.forEach(function (term) {
        lines.push('  ' + term + ' (' + groups[category][term] + ')');
      });
    });

    navigator.clipboard.writeText(lines.join('\n')).then(function () {
      showFeedback('Flagged terms copied to clipboard.');
    }).catch(function () {
      showFeedback('Could not copy automatically, select and copy manually.');
    });
  }

  function resetAll() {
    input.value = '';
    delete input.dataset.lastMatches;
    update();
    input.focus();
  }

  input.addEventListener('input', function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(update, DEBOUNCE_MS);
  });
  btnCopy.addEventListener('click', copyFlaggedTerms);
  btnReset.addEventListener('click', resetAll);

  preview.addEventListener('mouseover', function (e) {
    var mark = e.target.closest('.pc-mark');
    if (mark) showTooltip(mark);
  });
  preview.addEventListener('mouseout', function (e) {
    if (e.target.closest('.pc-mark')) hideTooltip();
  });
  preview.addEventListener('focusin', function (e) {
    var mark = e.target.closest('.pc-mark');
    if (mark) showTooltip(mark);
  });
  preview.addEventListener('focusout', function (e) {
    if (e.target.closest('.pc-mark')) hideTooltip();
  });

  update();
})();
