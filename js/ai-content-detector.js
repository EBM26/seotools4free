(function () {
  var input = document.getElementById('input-text');
  var btnScan = document.getElementById('btn-scan');
  var btnReset = document.getElementById('btn-reset');
  var feedback = document.getElementById('actions-feedback');
  var staleNote = document.getElementById('stale-note');
  var aiPercentEl = document.getElementById('stat-ai-percent');
  var humanPercentEl = document.getElementById('stat-human-percent');
  var verdictEl = document.getElementById('verdict-label');
  var rowsBody = document.getElementById('breakdown-rows');

  var MIN_WORDS = 50;
  var lastScannedText = null;

  function showFeedback(message) {
    feedback.textContent = message;
    setTimeout(function () {
      if (feedback.textContent === message) feedback.textContent = '';
    }, 2500);
  }

  var AI_PHRASES = [
    'in conclusion', 'in summary', 'to summarize', 'it is important to note',
    "it's important to note", 'it is worth noting', "it's worth noting",
    'furthermore', 'moreover', 'additionally', "in today's fast-paced world",
    "in today's digital age", 'in the realm of', 'when it comes to',
    'delve into', 'delving into', 'navigate the complexities',
    'unlock the potential', 'harness the power', 'seamless integration',
    'plays a pivotal role', 'plays a crucial role', 'a testament to',
    'stands as a testament', 'ever-evolving', 'ever-changing landscape',
    'game-changer', 'game changer', 'cutting-edge', 'state-of-the-art',
    'holistic approach', 'paradigm shift', 'in essence',
    'at the end of the day', 'on the other hand', 'that being said',
    'needless to say', 'it goes without saying', 'as previously mentioned',
    'in other words', 'in a nutshell', 'rich tapestry', 'tapestry of',
    'multifaceted', 'underscore the importance', 'underscores the importance',
    'shed light on', 'foster a', 'fostering a', 'robust framework',
    'leverage the', 'utilize the', 'a myriad of', 'plethora of'
  ];

  function clamp(value, lo, hi) {
    return Math.max(lo, Math.min(hi, value));
  }

  function mean(arr) {
    return arr.reduce(function (a, b) { return a + b; }, 0) / arr.length;
  }

  function stdDev(arr, avg) {
    var variance = arr.reduce(function (sum, v) { return sum + Math.pow(v - avg, 2); }, 0) / arr.length;
    return Math.sqrt(variance);
  }

  function tokenize(text) {
    var matches = text.match(/[A-Za-z']+/g);
    return matches ? matches.map(function (w) { return w.toLowerCase(); }) : [];
  }

  function sentenceWordCounts(text) {
    var sentences = text.split(/[.!?]+/).map(function (s) { return s.trim(); }).filter(Boolean);
    return sentences
      .map(function (s) { return (s.match(/[A-Za-z']+/g) || []).length; })
      .filter(function (n) { return n > 0; });
  }

  function burstinessSignal(sentenceLengths) {
    if (sentenceLengths.length < 4) return null;
    var avg = mean(sentenceLengths);
    var sd = stdDev(sentenceLengths, avg);
    var cv = avg > 0 ? sd / avg : 0;
    var score = clamp(100 - (cv / 0.6) * 100, 0, 100);
    return {
      label: 'Sentence length variance (burstiness)',
      value: 'CV = ' + cv.toFixed(2),
      score: score,
      note: score > 60
        ? 'Sentence lengths are fairly uniform, a pattern more common in AI-generated text.'
        : 'Sentence lengths vary noticeably, more typical of human writing.'
    };
  }

  function consistencySignal(sentenceLengths) {
    if (sentenceLengths.length < 8) return null;
    var chunkCount = 4;
    var chunkSize = Math.floor(sentenceLengths.length / chunkCount);
    var chunkMeans = [];
    for (var i = 0; i < chunkCount; i++) {
      var start = i * chunkSize;
      var end = (i === chunkCount - 1) ? sentenceLengths.length : start + chunkSize;
      var slice = sentenceLengths.slice(start, end);
      if (slice.length > 0) chunkMeans.push(mean(slice));
    }
    var avg = mean(chunkMeans);
    var sd = stdDev(chunkMeans, avg);
    var cv = avg > 0 ? sd / avg : 0;
    var score = clamp(100 - (cv / 0.4) * 100, 0, 100);
    return {
      label: 'Section-level pacing consistency',
      value: 'CV = ' + cv.toFixed(2),
      score: score,
      note: score > 60
        ? 'Average sentence length stays nearly constant across the whole text.'
        : 'Pacing shifts noticeably between sections.'
    };
  }

  function phrasingSignal(text, wordCount) {
    var lower = text.toLowerCase();
    var matched = [];
    var totalMatches = 0;
    AI_PHRASES.forEach(function (phrase) {
      var count = lower.split(phrase).length - 1;
      if (count > 0) {
        matched.push(phrase);
        totalMatches += count;
      }
    });
    var rate = wordCount > 0 ? totalMatches / (wordCount / 100) : 0;
    var score = clamp(rate * 20, 0, 100);
    var note = matched.length > 0
      ? 'Found: ' + matched.slice(0, 8).join(', ') + (matched.length > 8 ? '…' : '')
      : 'No common stock phrases detected.';
    return {
      label: 'Common AI phrasing',
      value: totalMatches + ' match' + (totalMatches === 1 ? '' : 'es') + ' (' + rate.toFixed(1) + '/100 words)',
      score: score,
      note: note
    };
  }

  function vocabSignal(words) {
    if (words.length < 30) return null;
    var unique = new Set(words).size;
    var ttr = unique / words.length;
    var score = clamp(100 - ((ttr - 0.3) / 0.4) * 100, 0, 100);
    return {
      label: 'Vocabulary diversity (type-token ratio)',
      value: 'TTR = ' + ttr.toFixed(2),
      score: score,
      note: score > 60
        ? 'Vocabulary repeats more than typical varied writing.'
        : 'Vocabulary is fairly varied.'
    };
  }

  function scoreLabel(score) {
    if (score < 35) return 'Likely human-written';
    if (score < 65) return 'Mixed / inconclusive signals';
    return 'Signals consistent with AI involvement';
  }

  function renderRows(signals) {
    rowsBody.innerHTML = '';
    signals.forEach(function (signal) {
      var row = document.createElement('tr');

      var labelCell = document.createElement('td');
      labelCell.textContent = signal.label;

      var valueCell = document.createElement('td');
      valueCell.textContent = signal.value;

      var scoreCell = document.createElement('td');
      scoreCell.textContent = Math.round(signal.score);

      var noteCell = document.createElement('td');
      noteCell.textContent = signal.note;

      row.appendChild(labelCell);
      row.appendChild(valueCell);
      row.appendChild(scoreCell);
      row.appendChild(noteCell);
      rowsBody.appendChild(row);
    });
  }

  function resetResults(message) {
    aiPercentEl.textContent = '—';
    humanPercentEl.textContent = '—';
    verdictEl.textContent = '';
    rowsBody.innerHTML = '<tr><td colspan="4">' + message + '</td></tr>';
  }

  function scan() {
    var text = input.value;
    var words = tokenize(text);
    var wordCount = words.length;

    lastScannedText = text;
    staleNote.style.display = 'none';

    if (wordCount < MIN_WORDS) {
      showFeedback('Paste at least ' + MIN_WORDS + ' words to scan.');
      resetResults('Paste at least ' + MIN_WORDS + ' words to see the breakdown.');
      return;
    }

    var sentenceLengths = sentenceWordCounts(text);

    var signals = [
      burstinessSignal(sentenceLengths),
      phrasingSignal(text, wordCount),
      vocabSignal(words),
      consistencySignal(sentenceLengths)
    ].filter(Boolean);

    var totalScore = signals.reduce(function (sum, s) { return sum + s.score; }, 0) / signals.length;
    var aiPercent = Math.round(totalScore);
    var humanPercent = 100 - aiPercent;

    aiPercentEl.textContent = aiPercent + '%';
    humanPercentEl.textContent = humanPercent + '%';
    verdictEl.textContent = scoreLabel(totalScore);
    renderRows(signals);
  }

  function checkStale() {
    if (lastScannedText !== null && input.value !== lastScannedText) {
      staleNote.style.display = 'block';
    }
  }

  function resetAll() {
    input.value = '';
    lastScannedText = null;
    staleNote.style.display = 'none';
    resetResults('Paste text above and click Scan Text to see the breakdown.');
    input.focus();
  }

  btnScan.addEventListener('click', scan);
  btnReset.addEventListener('click', resetAll);
  input.addEventListener('input', checkStale);

  resetResults('Paste text above and click Scan Text to see the breakdown.');
})();
