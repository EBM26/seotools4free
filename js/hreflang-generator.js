(function () {
  var rowsContainer = document.getElementById('hreflang-rows-container');
  var btnAddRow = document.getElementById('btn-add-row');
  var xdefaultInput = document.getElementById('input-xdefault');

  var output = document.getElementById('output-hreflang');
  var btnCopy = document.getElementById('btn-copy');
  var btnDownload = document.getElementById('btn-download');
  var btnReset = document.getElementById('btn-reset');
  var feedback = document.getElementById('actions-feedback');

  var PLACEHOLDER_MESSAGE = 'Add at least one row above to generate your tags.';

  var CODES = [
    'en', 'en-US', 'en-GB', 'en-AU', 'en-CA',
    'es', 'es-ES', 'es-MX', 'es-419',
    'fr', 'fr-FR', 'fr-CA',
    'de', 'de-DE', 'de-AT',
    'it-IT', 'pt', 'pt-PT', 'pt-BR',
    'nl-NL', 'ja-JP', 'ko-KR',
    'zh-Hans', 'zh-Hant', 'zh-CN', 'zh-TW',
    'ru-RU', 'ar', 'ar-SA', 'hi-IN',
    'pl-PL', 'tr-TR', 'sv-SE', 'da-DK', 'nb-NO', 'fi-FI'
  ];

  function showFeedback(message) {
    feedback.textContent = message;
    setTimeout(function () {
      if (feedback.textContent === message) feedback.textContent = '';
    }, 2500);
  }

  function escapeAttr(text) {
    return text.replace(/"/g, '&quot;');
  }

  function buildCodeOptions(selectedValue) {
    var options = CODES.map(function (code) {
      return '<option value="' + code + '"' + (code === selectedValue ? ' selected' : '') + '>' + code + '</option>';
    }).join('');
    options += '<option value="custom"' + (selectedValue === 'custom' ? ' selected' : '') + '>Custom…</option>';
    return options;
  }

  function makeRow(code, url) {
    var isCustom = code && CODES.indexOf(code) === -1;
    var row = document.createElement('div');
    row.className = 'hreflang-row';
    row.innerHTML =
      '<select class="hreflang-row__code">' + buildCodeOptions(isCustom ? 'custom' : (code || 'en-US')) + '</select>' +
      '<input type="text" class="hreflang-row__code-custom" placeholder="e.g. en-NZ" style="display: ' + (isCustom ? 'block' : 'none') + ';" />' +
      '<input type="text" class="hreflang-row__url" placeholder="e.g. https://example.com/en/" />' +
      '<button type="button" class="robots-remove-btn">Remove</button>';

    var codeSelect = row.querySelector('.hreflang-row__code');
    var codeCustom = row.querySelector('.hreflang-row__code-custom');
    var urlInput = row.querySelector('.hreflang-row__url');

    if (isCustom) codeCustom.value = code;
    urlInput.value = url || '';

    codeSelect.addEventListener('change', function () {
      codeCustom.style.display = codeSelect.value === 'custom' ? 'block' : 'none';
      generate();
    });
    codeCustom.addEventListener('input', generate);
    urlInput.addEventListener('input', generate);

    row.querySelector('.robots-remove-btn').addEventListener('click', function () {
      row.remove();
      generate();
    });

    return row;
  }

  function addRow(code, url) {
    rowsContainer.appendChild(makeRow(code, url));
    generate();
  }

  function collectRows() {
    var rows = [];
    rowsContainer.querySelectorAll('.hreflang-row').forEach(function (rowEl) {
      var select = rowEl.querySelector('.hreflang-row__code');
      var custom = rowEl.querySelector('.hreflang-row__code-custom');
      var url = rowEl.querySelector('.hreflang-row__url').value.trim();
      var code = (select.value === 'custom' ? custom.value : select.value).trim();
      if (code && url) rows.push({ code: code, url: url });
    });
    return rows;
  }

  function generate() {
    var rows = collectRows();
    var lines = rows.map(function (r) {
      return '<link rel="alternate" hreflang="' + escapeAttr(r.code) + '" href="' + escapeAttr(r.url) + '" />';
    });

    var xdefault = xdefaultInput.value.trim();
    if (xdefault) {
      lines.push('<link rel="alternate" hreflang="x-default" href="' + escapeAttr(xdefault) + '" />');
    }

    output.value = lines.length > 0 ? lines.join('\n') : PLACEHOLDER_MESSAGE;
  }

  function copyOutput() {
    if (!output.value || output.value === PLACEHOLDER_MESSAGE) {
      showFeedback('Nothing to copy yet.');
      return;
    }
    navigator.clipboard.writeText(output.value).then(function () {
      showFeedback('Tags copied to clipboard.');
    }).catch(function () {
      showFeedback('Could not copy automatically, select and copy manually.');
    });
  }

  function downloadOutput() {
    if (!output.value || output.value === PLACEHOLDER_MESSAGE) {
      showFeedback('Nothing to download yet.');
      return;
    }
    var blob = new Blob([output.value], { type: 'text/plain' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'hreflang-tags.html';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showFeedback('hreflang-tags.html downloaded.');
  }

  function resetAll() {
    xdefaultInput.value = '';
    rowsContainer.innerHTML = '';
    addRow('en-US', '');
  }

  btnAddRow.addEventListener('click', function () { addRow('en-US', ''); });
  xdefaultInput.addEventListener('input', generate);
  btnCopy.addEventListener('click', copyOutput);
  btnDownload.addEventListener('click', downloadOutput);
  btnReset.addEventListener('click', resetAll);

  addRow('en-US', '');
})();
