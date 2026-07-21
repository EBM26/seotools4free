(function () {
  var titleInput = document.getElementById('input-title');
  var descriptionInput = document.getElementById('input-description');
  var canonicalInput = document.getElementById('input-canonical');
  var imageInput = document.getElementById('input-image');
  var sitenameInput = document.getElementById('input-sitename');
  var twitterHandleInput = document.getElementById('input-twitter-handle');

  var outputTags = document.getElementById('output-tags');
  var btnCopy = document.getElementById('btn-copy-tags');
  var btnReset = document.getElementById('btn-reset');
  var feedback = document.getElementById('actions-feedback');

  function showFeedback(message) {
    feedback.textContent = message;
    setTimeout(function () {
      if (feedback.textContent === message) feedback.textContent = '';
    }, 2500);
  }

  function escapeAttr(text) {
    return text.replace(/"/g, '&quot;');
  }

  function buildTags() {
    var title = titleInput.value.trim();
    var description = descriptionInput.value.trim();
    var canonical = canonicalInput.value.trim();
    var image = imageInput.value.trim();
    var sitename = sitenameInput.value.trim();
    var twitterHandle = twitterHandleInput.value.trim();

    if (!title && !description && !canonical && !image && !sitename) {
      outputTags.value = 'Fill in the fields above to generate your tags.';
      return;
    }

    var lines = [];

    if (title) lines.push('<title>' + title + '</title>');
    if (description) lines.push('<meta name="description" content="' + escapeAttr(description) + '" />');
    if (canonical) lines.push('<link rel="canonical" href="' + escapeAttr(canonical) + '" />');

    lines.push('');
    lines.push('<!-- Open Graph -->');
    if (title) lines.push('<meta property="og:title" content="' + escapeAttr(title) + '" />');
    if (description) lines.push('<meta property="og:description" content="' + escapeAttr(description) + '" />');
    lines.push('<meta property="og:type" content="website" />');
    if (canonical) lines.push('<meta property="og:url" content="' + escapeAttr(canonical) + '" />');
    if (image) lines.push('<meta property="og:image" content="' + escapeAttr(image) + '" />');
    if (sitename) lines.push('<meta property="og:site_name" content="' + escapeAttr(sitename) + '" />');

    lines.push('');
    lines.push('<!-- Twitter Card -->');
    lines.push('<meta name="twitter:card" content="' + (image ? 'summary_large_image' : 'summary') + '" />');
    if (title) lines.push('<meta name="twitter:title" content="' + escapeAttr(title) + '" />');
    if (description) lines.push('<meta name="twitter:description" content="' + escapeAttr(description) + '" />');
    if (image) lines.push('<meta name="twitter:image" content="' + escapeAttr(image) + '" />');
    if (twitterHandle) lines.push('<meta name="twitter:site" content="' + escapeAttr(twitterHandle) + '" />');

    outputTags.value = lines.join('\n');
  }

  function copyTags() {
    if (!outputTags.value || outputTags.value.indexOf('Fill in') === 0) {
      showFeedback('Nothing to copy yet.');
      return;
    }
    navigator.clipboard.writeText(outputTags.value).then(function () {
      showFeedback('Tags copied to clipboard.');
    }).catch(function () {
      showFeedback('Could not copy automatically, select and copy manually.');
    });
  }

  function resetAll() {
    titleInput.value = '';
    descriptionInput.value = '';
    canonicalInput.value = '';
    imageInput.value = '';
    sitenameInput.value = '';
    twitterHandleInput.value = '';
    buildTags();
  }

  [titleInput, descriptionInput, canonicalInput, imageInput, sitenameInput, twitterHandleInput].forEach(function (el) {
    el.addEventListener('input', buildTags);
  });

  btnCopy.addEventListener('click', copyTags);
  btnReset.addEventListener('click', resetAll);

  buildTags();
})();
