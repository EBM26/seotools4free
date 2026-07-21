(function () {
  var input = document.getElementById('input-markdown');
  var output = document.getElementById('output-plaintext');

  var inputTokensEl = document.getElementById('stat-input-tokens');
  var outputTokensEl = document.getElementById('stat-output-tokens');
  var tokensSavedEl = document.getElementById('stat-tokens-saved');
  var percentSavedEl = document.getElementById('stat-percent-saved');

  var btnCopy = document.getElementById('btn-copy');
  var btnReset = document.getElementById('btn-reset');
  var feedback = document.getElementById('actions-feedback');

  var CHARS_PER_TOKEN = 4;

  function showFeedback(message) {
    feedback.textContent = message;
    setTimeout(function () {
      if (feedback.textContent === message) feedback.textContent = '';
    }, 2500);
  }

  function estimateTokens(text) {
    return Math.ceil(text.length / CHARS_PER_TOKEN);
  }

  function stripCodeFences(text) {
    return text
      .split('\n')
      .filter(function (line) { return !/^\s*```/.test(line); })
      .join('\n');
  }

  function cleanMarkdown(text) {
    var result = text;

    result = stripCodeFences(result);

    // Inline code
    result = result.replace(/`([^`]+)`/g, '$1');

    // Headers
    result = result.replace(/^#{1,6}\s+/gm, '');

    // Images: keep alt text, drop the URL
    result = result.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1');

    // Links (inline and reference-style): keep visible text, drop the URL/ref
    result = result.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
    result = result.replace(/\[([^\]]+)\]\[[^\]]*\]/g, '$1');

    // Bold+italic, then bold, then italic
    result = result.replace(/\*\*\*([^*]+)\*\*\*/g, '$1');
    result = result.replace(/___([^_]+)___/g, '$1');
    result = result.replace(/\*\*([^*]+)\*\*/g, '$1');
    result = result.replace(/__([^_]+)__/g, '$1');
    result = result.replace(/\*([^*]+)\*/g, '$1');
    result = result.replace(/_([^_]+)_/g, '$1');

    // Bullet markers (unordered lists)
    result = result.replace(/^(\s*)[-*+]\s+/gm, '$1');

    // Collapse 3+ blank lines down to a single blank line, trim edges
    result = result.replace(/\n{3,}/g, '\n\n');
    result = result.split('\n').map(function (line) { return line.replace(/\s+$/, ''); }).join('\n');
    result = result.trim();

    return result;
  }

  function update() {
    var markdown = input.value;
    var plainText = cleanMarkdown(markdown);
    output.value = plainText;

    var inputTokens = estimateTokens(markdown);
    var outputTokens = estimateTokens(plainText);
    var saved = Math.max(0, inputTokens - outputTokens);
    var percentSaved = inputTokens > 0 ? (saved / inputTokens * 100) : 0;

    inputTokensEl.textContent = inputTokens.toLocaleString('en-US');
    outputTokensEl.textContent = outputTokens.toLocaleString('en-US');
    tokensSavedEl.textContent = saved.toLocaleString('en-US');
    percentSavedEl.textContent = percentSaved.toFixed(0) + '%';
  }

  function copyOutput() {
    if (!output.value) {
      showFeedback('Nothing to copy yet.');
      return;
    }
    navigator.clipboard.writeText(output.value).then(function () {
      showFeedback('Plain text copied to clipboard.');
    }).catch(function () {
      showFeedback('Could not copy automatically, select and copy manually.');
    });
  }

  function resetAll() {
    input.value = '';
    update();
  }

  input.addEventListener('input', update);
  btnCopy.addEventListener('click', copyOutput);
  btnReset.addEventListener('click', resetAll);

  update();
})();
