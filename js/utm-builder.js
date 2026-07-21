(function () {
  var urlInput = document.getElementById('input-url');
  var idInput = document.getElementById('input-id');
  var sourceInput = document.getElementById('input-source');
  var mediumInput = document.getElementById('input-medium');
  var nameInput = document.getElementById('input-name');
  var termInput = document.getElementById('input-term');
  var contentInput = document.getElementById('input-content');

  var outputUrl = document.getElementById('output-url');
  var btnCopy = document.getElementById('btn-copy-url');
  var btnReset = document.getElementById('btn-reset');
  var feedback = document.getElementById('actions-feedback');

  function showFeedback(message) {
    feedback.textContent = message;
    setTimeout(function () {
      if (feedback.textContent === message) feedback.textContent = '';
    }, 2500);
  }

  function buildUrl() {
    var url = urlInput.value.trim();
    var id = idInput.value.trim();
    var source = sourceInput.value.trim();
    var medium = mediumInput.value.trim();
    var name = nameInput.value.trim();
    var term = termInput.value.trim();
    var content = contentInput.value.trim();

    var hasNameOrId = name || id;

    if (!url || !source || !medium || !hasNameOrId) {
      outputUrl.value = 'Fill in the required fields above to generate your URL.';
      return;
    }

    var separator = url.indexOf('?') === -1 ? '?' : '&';
    var params = [
      'utm_source=' + encodeURIComponent(source),
      'utm_medium=' + encodeURIComponent(medium)
    ];

    if (name) params.push('utm_campaign=' + encodeURIComponent(name));
    if (id) params.push('utm_id=' + encodeURIComponent(id));
    if (term) params.push('utm_term=' + encodeURIComponent(term));
    if (content) params.push('utm_content=' + encodeURIComponent(content));

    outputUrl.value = url + separator + params.join('&');
  }

  function copyUrl() {
    if (!outputUrl.value || outputUrl.value.indexOf('Fill in') === 0) {
      showFeedback('Nothing to copy yet.');
      return;
    }
    navigator.clipboard.writeText(outputUrl.value).then(function () {
      showFeedback('URL copied to clipboard.');
    }).catch(function () {
      showFeedback('Could not copy automatically, select and copy manually.');
    });
  }

  function resetAll() {
    urlInput.value = '';
    idInput.value = '';
    sourceInput.value = '';
    mediumInput.value = '';
    nameInput.value = '';
    termInput.value = '';
    contentInput.value = '';
    buildUrl();
  }

  [urlInput, idInput, sourceInput, mediumInput, nameInput, termInput, contentInput].forEach(function (el) {
    el.addEventListener('input', buildUrl);
  });

  btnCopy.addEventListener('click', copyUrl);
  btnReset.addEventListener('click', resetAll);

  buildUrl();
})();
