(function () {
  var urlInput = document.getElementById('input-url');
  var sitenameInput = document.getElementById('input-sitename');
  var titleInput = document.getElementById('input-title');
  var descriptionInput = document.getElementById('input-description');
  var boldInput = document.getElementById('input-bold');

  var titleLengthEl = document.getElementById('stat-title-length');
  var descriptionLengthEl = document.getElementById('stat-description-length');
  var titleWarning = document.getElementById('warning-title');
  var descriptionWarning = document.getElementById('warning-description');

  var previewUrl = document.getElementById('preview-url');
  var previewTitle = document.getElementById('preview-title');
  var previewDescription = document.getElementById('preview-description');
  var previewSitename = document.getElementById('preview-sitename');
  var previewFavicon = document.getElementById('preview-favicon');

  var serpMock = document.getElementById('serp-mock');
  var toggleDesktop = document.getElementById('toggle-desktop');
  var toggleMobile = document.getElementById('toggle-mobile');

  var btnCapitalize = document.getElementById('btn-capitalize');
  var btnReset = document.getElementById('btn-reset');
  var btnSaveImage = document.getElementById('btn-save-image');
  var btnCopyHtml = document.getElementById('btn-copy-html');
  var btnShareLink = document.getElementById('btn-share-link');
  var actionsFeedback = document.getElementById('actions-feedback');

  var isMobile = false;
  var sitenameManuallyEdited = false;

  var LIMITS = {
    desktop: { titlePx: 600, descriptionPx: 960 },
    mobile: { titlePx: 500, descriptionPx: 680 }
  };

  var measureCanvas = document.createElement('canvas');
  var measureCtx = measureCanvas.getContext('2d');

  function pixelWidth(text, font) {
    measureCtx.font = font;
    return Math.round(measureCtx.measureText(text).width);
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function applyBold(text, keywordsRaw) {
    var escaped = escapeHtml(text);
    var keywords = keywordsRaw
      .split(/[\s,]+/)
      .map(function (k) { return k.trim(); })
      .filter(function (k) { return k.length > 0; });

    if (keywords.length === 0) return escaped;

    keywords.forEach(function (keyword) {
      var escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      var regex = new RegExp('(' + escapedKeyword + ')', 'gi');
      escaped = escaped.replace(regex, '<strong>$1</strong>');
    });

    return escaped;
  }

  function deriveSiteName(url) {
    if (!url) return { name: '', initial: '?' };
    try {
      var withProtocol = url.match(/^https?:\/\//) ? url : 'https://' + url;
      var hostname = new URL(withProtocol).hostname.replace(/^www\./, '');
      var initial = hostname.charAt(0) || '?';
      return { name: hostname, initial: initial };
    } catch (e) {
      return { name: url, initial: url.charAt(0) || '?' };
    }
  }

  function update() {
    var url = urlInput.value.trim();
    var title = titleInput.value.trim();
    var description = descriptionInput.value.trim();
    var boldKeywords = boldInput.value.trim();
    var limits = isMobile ? LIMITS.mobile : LIMITS.desktop;

    if (!sitenameManuallyEdited) {
      var derived = deriveSiteName(url);
      sitenameInput.value = derived.name;
    }
    var sitename = sitenameInput.value.trim();

    var titlePx = pixelWidth(title, '20px arial');
    var descriptionPx = pixelWidth(description, '14px arial');

    titleLengthEl.textContent = title.length + ' chars (' + titlePx + ' / ' + limits.titlePx + 'px)';
    descriptionLengthEl.textContent = description.length + ' chars (' + descriptionPx + ' / ' + limits.descriptionPx + 'px)';

    titleWarning.classList.toggle('is-visible', titlePx > limits.titlePx);
    descriptionWarning.classList.toggle('is-visible', descriptionPx > limits.descriptionPx);

    var faviconSource = sitename || url;
    var faviconInitial = faviconSource ? faviconSource.replace(/^https?:\/\//, '').charAt(0) : '?';
    previewFavicon.textContent = faviconInitial || '?';
    previewSitename.textContent = sitename || 'example.com';
    previewUrl.textContent = url || 'https://example.com/page';

    previewTitle.innerHTML = title
      ? applyBold(title, boldKeywords)
      : 'Your page title will appear here';
    previewDescription.innerHTML = description
      ? applyBold(description, boldKeywords)
      : 'Your meta description will appear here, this is what shows below the title in Google results.';
  }

  function setDevice(mobile) {
    isMobile = mobile;
    serpMock.classList.toggle('is-mobile', mobile);
    toggleDesktop.classList.toggle('is-active', !mobile);
    toggleMobile.classList.toggle('is-active', mobile);
    update();
  }

  function showFeedback(message) {
    actionsFeedback.textContent = message;
    setTimeout(function () {
      if (actionsFeedback.textContent === message) {
        actionsFeedback.textContent = '';
      }
    }, 2500);
  }

  function capitalizeTitle() {
    var words = titleInput.value.split(' ');
    var minorWords = ['a', 'an', 'the', 'and', 'or', 'but', 'for', 'of', 'in', 'on', 'to', 'at'];
    titleInput.value = words.map(function (word, i) {
      if (word.length === 0) return word;
      var lower = word.toLowerCase();
      if (i !== 0 && minorWords.indexOf(lower) !== -1) return lower;
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
    update();
  }

  function resetAll() {
    urlInput.value = '';
    sitenameInput.value = '';
    titleInput.value = '';
    descriptionInput.value = '';
    boldInput.value = '';
    sitenameManuallyEdited = false;
    history.replaceState(null, '', location.pathname);
    update();
  }

  function copyHtml() {
    var title = titleInput.value.trim();
    var description = descriptionInput.value.trim();
    var snippet = '<title>' + title + '</title>\n<meta name="description" content="' + description + '" />';
    navigator.clipboard.writeText(snippet).then(function () {
      showFeedback('HTML copied to clipboard.');
    }).catch(function () {
      showFeedback('Could not copy automatically, select and copy manually.');
    });
  }

  function shareLink() {
    var params = new URLSearchParams();
    if (urlInput.value.trim()) params.set('u', urlInput.value.trim());
    if (sitenameInput.value.trim()) params.set('s', sitenameInput.value.trim());
    if (titleInput.value.trim()) params.set('t', titleInput.value.trim());
    if (descriptionInput.value.trim()) params.set('d', descriptionInput.value.trim());
    if (boldInput.value.trim()) params.set('b', boldInput.value.trim());

    var shareUrl = location.origin + location.pathname + '?' + params.toString();
    history.replaceState(null, '', shareUrl);

    navigator.clipboard.writeText(shareUrl).then(function () {
      showFeedback('Shareable link copied to clipboard.');
    }).catch(function () {
      showFeedback('Link updated in address bar, copy it from there.');
    });
  }

  function saveAsImage() {
    if (typeof html2canvas === 'undefined') {
      showFeedback('Image export failed to load, try again.');
      return;
    }
    showFeedback('Generating image…');
    html2canvas(serpMock, { backgroundColor: '#ffffff' }).then(function (canvas) {
      var link = document.createElement('a');
      link.download = 'serp-preview.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      showFeedback('Image downloaded.');
    }).catch(function () {
      showFeedback('Image export failed, try again.');
    });
  }

  function loadFromQueryString() {
    var params = new URLSearchParams(location.search);
    if (params.has('u')) urlInput.value = params.get('u');
    if (params.has('s')) { sitenameInput.value = params.get('s'); sitenameManuallyEdited = true; }
    if (params.has('t')) titleInput.value = params.get('t');
    if (params.has('d')) descriptionInput.value = params.get('d');
    if (params.has('b')) boldInput.value = params.get('b');
  }

  urlInput.addEventListener('input', update);
  sitenameInput.addEventListener('input', function () {
    sitenameManuallyEdited = true;
    update();
  });
  titleInput.addEventListener('input', update);
  descriptionInput.addEventListener('input', update);
  boldInput.addEventListener('input', update);

  toggleDesktop.addEventListener('click', function () { setDevice(false); });
  toggleMobile.addEventListener('click', function () { setDevice(true); });

  btnCapitalize.addEventListener('click', capitalizeTitle);
  btnReset.addEventListener('click', resetAll);
  btnCopyHtml.addEventListener('click', copyHtml);
  btnShareLink.addEventListener('click', shareLink);
  btnSaveImage.addEventListener('click', saveAsImage);

  loadFromQueryString();
  update();
})();
