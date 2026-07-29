(function () {
  var container = document.getElementById('examples-container');
  var formatSelect = document.getElementById('select-format');
  var output = document.getElementById('output-examples');
  var btnAddExample = document.getElementById('btn-add-example');
  var btnCopy = document.getElementById('btn-copy');
  var btnReset = document.getElementById('btn-reset');
  var feedback = document.getElementById('actions-feedback');

  var DEFAULT_ROW_COUNT = 3;

  function showFeedback(message) {
    feedback.textContent = message;
    setTimeout(function () {
      if (feedback.textContent === message) feedback.textContent = '';
    }, 2500);
  }

  function makeRow() {
    var row = document.createElement('div');
    row.className = 'robots-group';
    row.innerHTML =
      '<div class="robots-group__header">' +
        '<label style="margin: 0;">Example</label>' +
        '<button type="button" class="robots-remove-btn">Remove</button>' +
      '</div>' +
      '<div>' +
        '<label>Input</label>' +
        '<textarea class="fewshot-row__input" rows="2" placeholder="e.g. Translate to French: Good morning"></textarea>' +
      '</div>' +
      '<div style="margin-top: 14px;">' +
        '<label>Output</label>' +
        '<textarea class="fewshot-row__output" rows="2" placeholder="e.g. Bonjour"></textarea>' +
      '</div>';

    row.querySelectorAll('textarea').forEach(function (el) {
      el.addEventListener('input', generate);
    });
    row.querySelector('.robots-remove-btn').addEventListener('click', function () {
      var rows = container.querySelectorAll('.robots-group');
      if (rows.length <= 1) {
        row.querySelector('.fewshot-row__input').value = '';
        row.querySelector('.fewshot-row__output').value = '';
      } else {
        row.remove();
      }
      generate();
    });

    return row;
  }

  function addRow() {
    container.appendChild(makeRow());
  }

  function clearRows() {
    container.innerHTML = '';
  }

  function resetToDefaultRows() {
    clearRows();
    for (var i = 0; i < DEFAULT_ROW_COUNT; i++) addRow();
  }

  function collectPairs() {
    var rows = container.querySelectorAll('.robots-group');
    var pairs = [];
    rows.forEach(function (row) {
      var inputVal = row.querySelector('.fewshot-row__input').value.trim();
      var outputVal = row.querySelector('.fewshot-row__output').value.trim();
      if (inputVal === '' && outputVal === '') return;
      pairs.push({ input: inputVal, output: outputVal });
    });
    return pairs;
  }

  function formatLabeled(pairs) {
    return pairs.map(function (pair) {
      return 'Input: ' + pair.input + '\nOutput: ' + pair.output;
    }).join('\n\n');
  }

  function formatNumbered(pairs) {
    return pairs.map(function (pair, index) {
      return 'Example ' + (index + 1) + ':\nInput: ' + pair.input + '\nOutput: ' + pair.output;
    }).join('\n\n');
  }

  function formatJson(pairs) {
    return JSON.stringify(pairs, null, 2);
  }

  function generate() {
    var pairs = collectPairs();
    if (pairs.length === 0) {
      output.value = '';
      return;
    }

    var format = formatSelect.value;
    if (format === 'numbered') {
      output.value = formatNumbered(pairs);
    } else if (format === 'json') {
      output.value = formatJson(pairs);
    } else {
      output.value = formatLabeled(pairs);
    }
  }

  function copyOutput() {
    if (!output.value) {
      showFeedback('Nothing to copy yet.');
      return;
    }
    navigator.clipboard.writeText(output.value).then(function () {
      showFeedback('Few-shot block copied to clipboard.');
    }).catch(function () {
      showFeedback('Could not copy automatically, select and copy manually.');
    });
  }

  function resetAll() {
    resetToDefaultRows();
    generate();
  }

  btnAddExample.addEventListener('click', addRow);
  formatSelect.addEventListener('change', generate);
  btnCopy.addEventListener('click', copyOutput);
  btnReset.addEventListener('click', resetAll);

  resetToDefaultRows();
  generate();
})();
