(function () {
  var input = document.getElementById('input-prompt');
  var output = document.getElementById('output-compressed');

  var originalCharsEl = document.getElementById('stat-original-chars');
  var compressedCharsEl = document.getElementById('stat-compressed-chars');
  var reductionEl = document.getElementById('stat-reduction');
  var originalTokensEl = document.getElementById('stat-original-tokens');
  var compressedTokensEl = document.getElementById('stat-compressed-tokens');

  var btnCopy = document.getElementById('btn-copy');
  var btnReset = document.getElementById('btn-reset');
  var feedback = document.getElementById('actions-feedback');

  var CHARS_PER_TOKEN = 4;
  var DEBOUNCE_MS = 300;
  var debounceTimer = null;

  // Longer, more specific phrases first so a shorter phrase never eats part
  // of one that should have matched as a whole (e.g. "please" vs a phrase
  // that happens to contain it).
  var WORDY_SWAPS = [
    ['due to the fact that', 'because'],
    ['in order to', 'to'],
    ['at this point in time', 'now'],
    ['in the event that', 'if'],
    ['for the purpose of', 'to'],
    ['with regard to', 'about'],
    ['in a manner that is', 'that is'],
    ['it is important that you', ''],
    ['make sure to', '']
  ];

  var FILLER_PHRASES = [
    'i would like you to',
    'i need you to',
    'could you please',
    'if you could',
    'just to let you know',
    'please',
    'kindly'
  ];

  var QUALIFIERS = ['very', 'really', 'just', 'actually', 'basically', 'simply', 'quite'];

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function matchCase(match, replacement) {
    if (!replacement) return '';
    var firstChar = match.charAt(0);
    if (firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase()) {
      return replacement.charAt(0).toUpperCase() + replacement.slice(1);
    }
    return replacement;
  }

  function removePhrase(text, phrase) {
    var regex = new RegExp('\\b' + escapeRegex(phrase) + '\\b\\s*', 'gi');
    return text.replace(regex, '');
  }

  function cleanupWhitespace(text) {
    var out = text;
    out = out.replace(/[ \t]+/g, ' ');
    out = out.replace(/ +\n/g, '\n');
    out = out.replace(/\n +/g, '\n');
    out = out.replace(/ ([,.!?;:])/g, '$1');
    out = out.split('\n').map(function (line) { return line.replace(/^\s+|\s+$/g, ''); }).join('\n');
    out = out.replace(/\n{3,}/g, '\n\n');
    out = out.trim();
    out = out.replace(/(^|[.!?]\s+)([a-z])/g, function (m, prefix, letter) {
      return prefix + letter.toUpperCase();
    });
    return out;
  }

  function compress(text) {
    var result = text;

    WORDY_SWAPS.forEach(function (pair) {
      var phrase = pair[0];
      var replacement = pair[1];
      if (replacement === '') {
        result = removePhrase(result, phrase);
        return;
      }
      var regex = new RegExp('\\b' + escapeRegex(phrase) + '\\b', 'gi');
      result = result.replace(regex, function (match) {
        return matchCase(match, replacement);
      });
    });

    FILLER_PHRASES.forEach(function (phrase) {
      result = removePhrase(result, phrase);
    });

    QUALIFIERS.forEach(function (word) {
      result = removePhrase(result, word);
    });

    return cleanupWhitespace(result);
  }

  function estimateTokens(text) {
    return text.length === 0 ? 0 : Math.ceil(text.length / CHARS_PER_TOKEN);
  }

  function showFeedback(message) {
    feedback.textContent = message;
    setTimeout(function () {
      if (feedback.textContent === message) feedback.textContent = '';
    }, 2500);
  }

  function update() {
    var original = input.value;
    var compressed = original.trim() === '' ? '' : compress(original);
    output.value = compressed;

    var originalChars = original.length;
    var compressedChars = compressed.length;
    var reduction = originalChars > 0 ? (1 - compressedChars / originalChars) * 100 : 0;

    originalCharsEl.textContent = originalChars.toLocaleString('en-US');
    compressedCharsEl.textContent = compressedChars.toLocaleString('en-US');
    reductionEl.textContent = Math.max(0, reduction).toFixed(0) + '%';
    originalTokensEl.textContent = estimateTokens(original).toLocaleString('en-US');
    compressedTokensEl.textContent = estimateTokens(compressed).toLocaleString('en-US');
  }

  function scheduleUpdate() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(update, DEBOUNCE_MS);
  }

  function copyOutput() {
    if (!output.value) {
      showFeedback('Nothing to copy yet.');
      return;
    }
    navigator.clipboard.writeText(output.value).then(function () {
      showFeedback('Compressed prompt copied to clipboard.');
    }).catch(function () {
      showFeedback('Could not copy automatically, select and copy manually.');
    });
  }

  function resetAll() {
    clearTimeout(debounceTimer);
    input.value = '';
    update();
  }

  input.addEventListener('input', scheduleUpdate);
  btnCopy.addEventListener('click', copyOutput);
  btnReset.addEventListener('click', resetAll);

  update();
})();
