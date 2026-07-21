(function () {
  var input = document.getElementById('input-text');
  var wordsEl = document.getElementById('stat-words');
  var tokensEl = document.getElementById('stat-tokens');
  var sentencesEl = document.getElementById('stat-sentences');
  var avgSentenceEl = document.getElementById('stat-avg-sentence');
  var reportList = document.getElementById('report-list');

  var MIN_WORDS = 5;
  var CHARS_PER_TOKEN = 4;

  var CONTRADICTION_PAIRS = [
    ['always', 'never'],
    ['always', 'sometimes'],
    ['always', 'occasionally'],
    ['must', 'never'],
    ['must', 'optional'],
    ['required', 'optional'],
    ['never', 'sometimes']
  ];

  function tokenizeWords(text) {
    return text.toLowerCase().match(/[a-z0-9']+/g) || [];
  }

  function sentenceSplit(text) {
    return text.split(/[.!?]+/).map(function (s) { return s.trim(); }).filter(Boolean);
  }

  function estimateTokens(text) {
    return Math.ceil(text.length / CHARS_PER_TOKEN);
  }

  function truncate(text, maxLen) {
    return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
  }

  function findContradictions(sentences) {
    var findings = [];
    sentences.forEach(function (sentence) {
      var lower = sentence.toLowerCase();
      CONTRADICTION_PAIRS.forEach(function (pair) {
        var hasA = new RegExp('\\b' + pair[0] + '\\b', 'i').test(lower);
        var hasB = new RegExp('\\b' + pair[1] + '\\b', 'i').test(lower);
        if (hasA && hasB) {
          findings.push({ words: pair, sentence: sentence });
        }
      });
    });
    return findings;
  }

  function findRepeatedPhrases(words, n, minCount) {
    var counts = {};
    for (var i = 0; i + n <= words.length; i++) {
      var phrase = words.slice(i, i + n).join(' ');
      counts[phrase] = (counts[phrase] || 0) + 1;
    }
    return Object.keys(counts)
      .filter(function (phrase) { return counts[phrase] >= minCount; })
      .map(function (phrase) { return { phrase: phrase, count: counts[phrase] }; })
      .sort(function (a, b) { return b.count - a.count; });
  }

  function renderFindings(findings) {
    reportList.innerHTML = '';
    findings.forEach(function (finding) {
      var item = document.createElement('div');
      item.className = 'report-item' + (finding.type === 'warning' ? ' report-item--warning' : '');

      var title = document.createElement('div');
      title.className = 'report-item__title';
      title.textContent = finding.title;

      var detail = document.createElement('div');
      detail.className = 'report-item__detail';
      detail.textContent = finding.detail;

      item.appendChild(title);
      item.appendChild(detail);
      reportList.appendChild(item);
    });
  }

  function update() {
    var text = input.value;
    var words = tokenizeWords(text);
    var wordCount = words.length;
    var tokens = estimateTokens(text);
    var sentences = sentenceSplit(text);
    var sentenceCount = sentences.length;

    var sentenceWordCounts = sentences
      .map(function (s) { return (s.match(/[a-zA-Z0-9']+/g) || []).length; })
      .filter(function (n) { return n > 0; });
    var avgSentenceLength = sentenceWordCounts.length > 0
      ? sentenceWordCounts.reduce(function (a, b) { return a + b; }, 0) / sentenceWordCounts.length
      : 0;

    wordsEl.textContent = wordCount;
    tokensEl.textContent = tokens;
    sentencesEl.textContent = sentenceCount;
    avgSentenceEl.textContent = avgSentenceLength.toFixed(1);

    if (wordCount < MIN_WORDS) {
      reportList.innerHTML = '<p class="favicon-grid__empty">Paste a system prompt above to analyze it.</p>';
      return;
    }

    var findings = [];

    if (wordCount < 20) {
      findings.push({
        type: 'warning',
        title: 'Prompt may be too short',
        detail: 'At ' + wordCount + ' words, this may not give the model enough context, tone guidance, or constraints to reliably steer its behavior.'
      });
    } else if (wordCount > 600) {
      findings.push({
        type: 'warning',
        title: 'Prompt is very long',
        detail: 'At ' + wordCount + ' words (~' + tokens + ' estimated tokens), models can lose weight on earlier instructions in very long system prompts, and every request pays token cost for it.'
      });
    } else {
      findings.push({
        type: 'info',
        title: 'Length looks reasonable',
        detail: wordCount + ' words, an estimated ' + tokens + ' tokens.'
      });
    }

    if (avgSentenceLength > 30) {
      findings.push({
        type: 'warning',
        title: 'Sentences are long on average',
        detail: 'Average sentence length is ' + avgSentenceLength.toFixed(1) + ' words. Long, complex sentences are more likely to be partially misread or only partially followed.'
      });
    } else if (sentenceCount > 0) {
      findings.push({
        type: 'info',
        title: 'Sentence length looks reasonable',
        detail: 'Average sentence length is ' + avgSentenceLength.toFixed(1) + ' words across ' + sentenceCount + ' sentence' + (sentenceCount === 1 ? '' : 's') + '.'
      });
    }

    var contradictions = findContradictions(sentences);
    if (contradictions.length > 0) {
      contradictions.slice(0, 6).forEach(function (c) {
        findings.push({
          type: 'warning',
          title: 'Possibly contradictory instructions: "' + c.words[0] + '" / "' + c.words[1] + '"',
          detail: 'Found in the same sentence: "' + truncate(c.sentence, 140) + '"'
        });
      });
    } else {
      findings.push({
        type: 'info',
        title: 'No contradictory instruction pairs detected',
        detail: 'Checked for common opposites (like "always" / "never") appearing in the same sentence.'
      });
    }

    var repeated = findRepeatedPhrases(words, 4, 2);
    if (repeated.length > 0) {
      repeated.slice(0, 5).forEach(function (r) {
        findings.push({
          type: 'warning',
          title: 'Repeated phrase',
          detail: '"' + r.phrase + '" appears ' + r.count + ' times, consider stating it once.'
        });
      });
    } else {
      findings.push({
        type: 'info',
        title: 'No obviously repeated phrases detected',
        detail: 'Checked for 4-word phrases repeated more than once.'
      });
    }

    renderFindings(findings);
  }

  input.addEventListener('input', update);
  update();
})();
