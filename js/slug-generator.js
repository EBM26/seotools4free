(function () {
  var textInput = document.getElementById('input-text');
  var separatorSelect = document.getElementById('input-separator');
  var lowercaseCheckbox = document.getElementById('input-lowercase');
  var outputSlug = document.getElementById('output-slug');
  var btnCopy = document.getElementById('btn-copy');
  var btnReset = document.getElementById('btn-reset');
  var feedback = document.getElementById('actions-feedback');

  function showFeedback(message) {
    feedback.textContent = message;
    setTimeout(function () {
      if (feedback.textContent === message) feedback.textContent = '';
    }, 2500);
  }

  function slugify(text, separator, lowercase) {
    var result = text.trim();
    if (lowercase) result = result.toLowerCase();

    // Normalize accented characters (e.g. café -> cafe)
    result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Replace anything that isn't a letter, number, or existing separator with a space
    result = result.replace(/[^a-zA-Z0-9\-_\s]/g, ' ');

    // Collapse whitespace and existing separators into the chosen separator
    result = result.trim().replace(/[\s\-_]+/g, separator);

    return result;
  }

  function update() {
    var text = textInput.value;
    var separator = separatorSelect.value;
    var lowercase = lowercaseCheckbox.checked;

    if (!text.trim()) {
      outputSlug.textContent = 'your-title-here';
      return;
    }

    outputSlug.textContent = slugify(text, separator, lowercase);
  }

  function copySlug() {
    var slug = outputSlug.textContent;
    if (!slug || slug === 'your-title-here') {
      showFeedback('Nothing to copy yet.');
      return;
    }
    navigator.clipboard.writeText(slug).then(function () {
      showFeedback('Slug copied to clipboard.');
    }).catch(function () {
      showFeedback('Could not copy automatically, select and copy manually.');
    });
  }

  function resetAll() {
    textInput.value = '';
    separatorSelect.value = '-';
    lowercaseCheckbox.checked = true;
    update();
  }

  textInput.addEventListener('input', update);
  separatorSelect.addEventListener('change', update);
  lowercaseCheckbox.addEventListener('change', update);
  btnCopy.addEventListener('click', copySlug);
  btnReset.addEventListener('click', resetAll);

  update();
})();
