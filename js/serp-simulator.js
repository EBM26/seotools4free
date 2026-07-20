(function () {
  var titleInput = document.getElementById('input-title');
  var urlInput = document.getElementById('input-url');
  var descriptionInput = document.getElementById('input-description');

  var titleLengthEl = document.getElementById('stat-title-length');
  var descriptionLengthEl = document.getElementById('stat-description-length');

  var previewUrl = document.getElementById('preview-url');
  var previewTitle = document.getElementById('preview-title');
  var previewDescription = document.getElementById('preview-description');

  var TITLE_LIMIT = 60;
  var DESCRIPTION_LIMIT = 160;

  function truncate(text, limit) {
    if (text.length <= limit) return text;
    return text.slice(0, limit - 1).trim() + '…';
  }

  function setLengthStat(el, length, limit) {
    el.textContent = length + ' / ' + limit;
    el.style.color = length > limit ? 'var(--color-warn)' : 'var(--color-accent)';
  }

  function update() {
    var title = titleInput.value.trim();
    var url = urlInput.value.trim();
    var description = descriptionInput.value.trim();

    setLengthStat(titleLengthEl, title.length, TITLE_LIMIT);
    setLengthStat(descriptionLengthEl, description.length, DESCRIPTION_LIMIT);

    previewUrl.textContent = url || 'https://example.com/page';
    previewTitle.textContent = title ? truncate(title, TITLE_LIMIT) : 'Your page title will appear here';
    previewDescription.textContent = description
      ? truncate(description, DESCRIPTION_LIMIT)
      : 'Your meta description will appear here, this is what shows below the title in Google results.';
  }

  titleInput.addEventListener('input', update);
  urlInput.addEventListener('input', update);
  descriptionInput.addEventListener('input', update);
  update();
})();
