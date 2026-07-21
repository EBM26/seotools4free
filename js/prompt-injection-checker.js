(function () {
  var input = document.getElementById('input-text');
  var findingsCountEl = document.getElementById('stat-findings');
  var hiddenCharsCountEl = document.getElementById('stat-hidden-chars');
  var rowsBody = document.getElementById('findings-rows');

  var PATTERNS = [
    {
      label: 'Instruction override',
      severity: 'High',
      regex: /\b(ignore|disregard|forget)\b[^.\n]{0,40}\b(previous|prior|above|all|earlier)\b[^.\n]{0,20}\b(instructions?|prompts?|rules?)\b/gi
    },
    {
      label: 'System prompt extraction',
      severity: 'High',
      regex: /\b(reveal|show|print|repeat|what is|what are)\b[^.\n]{0,30}\b(your|the)\b[^.\n]{0,15}\b(system prompt|instructions|rules|guidelines)\b/gi
    },
    {
      label: 'Role / persona override',
      severity: 'High',
      regex: /\byou are now\b[^.\n]{0,60}|\back as if you (have|had) no\b[^.\n]{0,40}|\bpretend (that )?you (are|have)\b[^.\n]{0,40}\b(no rules|no restrictions|no filters|unfiltered)/gi
    },
    {
      label: 'Known jailbreak reference',
      severity: 'Medium',
      regex: /\bDAN\b|do anything now|developer mode|jailbreak(ed)?/gi
    },
    {
      label: 'Safety bypass request',
      severity: 'High',
      regex: /\bbypass\b[^.\n]{0,20}\b(safety|content|filter|moderation|guardrail)/gi
    },
    {
      label: 'Fake system/developer message',
      severity: 'Medium',
      regex: /\[?\b(system|developer)\b\]?\s*:\s*/gi
    },
    {
      label: 'Suspicious long encoded blob',
      severity: 'Low',
      regex: /\b[A-Za-z0-9+/]{60,}={0,2}\b/g
    }
  ];

  // Zero-width space (U+200B), ZWNJ (U+200C), ZWJ (U+200D), LRM (U+200E),
  // RLM (U+200F), and byte-order mark / zero-width no-break space (U+FEFF).
  var HIDDEN_CHAR_PATTERN = /[\u200B\u200C\u200D\u200E\u200F\uFEFF]/g;

  function escapeForDisplay(text) {
    return text.length > 80 ? text.slice(0, 80) + '…' : text;
  }

  function severityRank(severity) {
    return severity === 'High' ? 0 : severity === 'Medium' ? 1 : 2;
  }

  function scan(text) {
    var findings = [];

    PATTERNS.forEach(function (pattern) {
      pattern.regex.lastIndex = 0;
      var match;
      var seenForPattern = {};
      while ((match = pattern.regex.exec(text)) !== null) {
        var snippet = match[0].trim();
        if (!snippet || seenForPattern[snippet]) {
          if (match[0].length === 0) pattern.regex.lastIndex++;
          continue;
        }
        seenForPattern[snippet] = true;
        findings.push({
          label: pattern.label,
          severity: pattern.severity,
          snippet: escapeForDisplay(snippet)
        });
      }
    });

    findings.sort(function (a, b) { return severityRank(a.severity) - severityRank(b.severity); });
    return findings;
  }

  function renderFindings(findings) {
    rowsBody.innerHTML = '';
    if (findings.length === 0) {
      var emptyRow = document.createElement('tr');
      var emptyCell = document.createElement('td');
      emptyCell.colSpan = 3;
      emptyCell.textContent = 'No common prompt injection patterns detected.';
      emptyRow.appendChild(emptyCell);
      rowsBody.appendChild(emptyRow);
      return;
    }

    findings.forEach(function (finding) {
      var row = document.createElement('tr');

      var severityCell = document.createElement('td');
      severityCell.textContent = finding.severity;

      var labelCell = document.createElement('td');
      labelCell.textContent = finding.label;

      var snippetCell = document.createElement('td');
      var code = document.createElement('code');
      code.textContent = finding.snippet;
      snippetCell.appendChild(code);

      row.appendChild(severityCell);
      row.appendChild(labelCell);
      row.appendChild(snippetCell);
      rowsBody.appendChild(row);
    });
  }

  function update() {
    var text = input.value;

    if (!text.trim()) {
      findingsCountEl.textContent = '0';
      hiddenCharsCountEl.textContent = '0';
      rowsBody.innerHTML = '<tr><td colspan="3">Paste text above to scan it.</td></tr>';
      return;
    }

    var findings = scan(text);
    var hiddenMatches = text.match(HIDDEN_CHAR_PATTERN);
    var hiddenCount = hiddenMatches ? hiddenMatches.length : 0;

    if (hiddenCount > 0) {
      findings.unshift({
        label: 'Hidden/invisible Unicode characters',
        severity: 'High',
        snippet: hiddenCount + ' character' + (hiddenCount === 1 ? '' : 's') + ' found (zero-width or byte-order-mark)'
      });
    }

    findingsCountEl.textContent = findings.length;
    hiddenCharsCountEl.textContent = hiddenCount;
    renderFindings(findings);
  }

  input.addEventListener('input', update);
  update();
})();
