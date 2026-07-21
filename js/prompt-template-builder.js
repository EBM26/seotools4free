(function () {
  var templateInput = document.getElementById('input-template');
  var variablesContainer = document.getElementById('variables-container');
  var variablesEmptyHint = document.getElementById('variables-empty-hint');
  var output = document.getElementById('output-prompt');
  var btnCopy = document.getElementById('btn-copy');
  var btnReset = document.getElementById('btn-reset');
  var feedback = document.getElementById('actions-feedback');

  var VARIABLE_PATTERN = /\{\{\s*([^{}]+?)\s*\}\}/g;

  var values = {};
  var renderedNames = [];

  function showFeedback(message) {
    feedback.textContent = message;
    setTimeout(function () {
      if (feedback.textContent === message) feedback.textContent = '';
    }, 2500);
  }

  function extractVariableNames(template) {
    var names = [];
    var seen = {};
    var match;
    VARIABLE_PATTERN.lastIndex = 0;
    while ((match = VARIABLE_PATTERN.exec(template)) !== null) {
      var name = match[1];
      if (!seen[name]) {
        seen[name] = true;
        names.push(name);
      }
    }
    return names;
  }

  function renderVariableFields(names) {
    var namesChanged = names.length !== renderedNames.length ||
      names.some(function (name, i) { return name !== renderedNames[i]; });

    if (!namesChanged) return;
    renderedNames = names;

    variablesContainer.innerHTML = '';
    variablesEmptyHint.style.display = names.length === 0 ? 'block' : 'none';

    names.forEach(function (name, index) {
      if (values[name] === undefined) values[name] = '';

      var wrapper = document.createElement('div');
      if (index > 0) wrapper.style.marginTop = '16px';

      var label = document.createElement('label');
      label.setAttribute('for', 'var-' + index);
      label.textContent = name;

      var field = document.createElement('input');
      field.type = 'text';
      field.id = 'var-' + index;
      field.value = values[name];
      field.addEventListener('input', function () {
        values[name] = field.value;
        generate();
      });

      wrapper.appendChild(label);
      wrapper.appendChild(field);
      variablesContainer.appendChild(wrapper);
    });
  }

  function generate() {
    var template = templateInput.value;
    var names = extractVariableNames(template);
    renderVariableFields(names);

    var result = template.replace(VARIABLE_PATTERN, function (fullMatch, name) {
      var value = values[name];
      return value ? value : fullMatch;
    });

    output.value = result;
  }

  function copyOutput() {
    if (!output.value) {
      showFeedback('Nothing to copy yet.');
      return;
    }
    navigator.clipboard.writeText(output.value).then(function () {
      showFeedback('Prompt copied to clipboard.');
    }).catch(function () {
      showFeedback('Could not copy automatically, select and copy manually.');
    });
  }

  function resetAll() {
    templateInput.value = '';
    values = {};
    renderedNames = [];
    generate();
  }

  templateInput.addEventListener('input', generate);
  btnCopy.addEventListener('click', copyOutput);
  btnReset.addEventListener('click', resetAll);

  generate();
})();
