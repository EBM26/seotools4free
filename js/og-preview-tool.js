(function () {
  var urlInput = document.getElementById('input-url');
  var titleInput = document.getElementById('input-title');
  var descriptionInput = document.getElementById('input-description');
  var imageInput = document.getElementById('input-image');
  var sitenameInput = document.getElementById('input-sitename');

  var ogMock = document.getElementById('og-mock');
  var mockImage = document.getElementById('og-mock-image');
  var mockDomain = document.getElementById('og-mock-domain');
  var mockTitle = document.getElementById('og-mock-title');
  var mockDescription = document.getElementById('og-mock-description');

  var platformButtons = document.querySelectorAll('[data-platform]');
  var btnReset = document.getElementById('btn-reset');
  var btnCopyTags = document.getElementById('btn-copy-tags');
  var btnShareLink = document.getElementById('btn-share-link');
  var feedback = document.getElementById('actions-feedback');

  var platform = 'facebook';
  var sitenameManuallyEdited = false;

  function showFeedback(message) {
    feedback.textContent = message;
    setTimeout(function () {
      if (feedback.textContent === message) feedback.textContent = '';
    }, 2500);
  }

  function deriveDomain(url) {
    if (!url) return '';
    try {
      var withProtocol = url.match(/^https?:\/\//) ? url : 'https://' + url;
      return new URL(withProtocol).hostname.replace(/^www\./, '');
    } catch (e) {
      return url;
    }
  }

  function escapeAttr(text) {
    return text.replace(/"/g, '&quot;');
  }

  function updateImage(imageUrl) {
    mockImage.innerHTML = '';
    if (!imageUrl) {
      mockImage.textContent = '1200 × 630 image';
      return;
    }
    var img = document.createElement('img');
    img.src = imageUrl;
    img.alt = '';
    img.onerror = function () {
      mockImage.innerHTML = '';
      mockImage.textContent = 'Image failed to load';
    };
    mockImage.appendChild(img);
  }

  function update() {
    var url = urlInput.value.trim();
    var title = titleInput.value.trim();
    var description = descriptionInput.value.trim();
    var image = imageInput.value.trim();

    if (!sitenameManuallyEdited) {
      sitenameInput.value = deriveDomain(url);
    }
    var sitename = sitenameInput.value.trim();

    mockDomain.textContent = sitename || 'example.com';
    mockTitle.textContent = title || 'Your page title will appear here';
    mockDescription.textContent = description || 'Your description will appear here, this is what shows below the title on most platforms.';

    updateImage(image);
  }

  function setPlatform(next) {
    platform = next;
    ogMock.classList.remove('is-facebook', 'is-twitter', 'is-linkedin');
    ogMock.classList.add('is-' + platform);
    platformButtons.forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-platform') === platform);
    });
  }

  function resetAll() {
    urlInput.value = '';
    titleInput.value = '';
    descriptionInput.value = '';
    imageInput.value = '';
    sitenameInput.value = '';
    sitenameManuallyEdited = false;
    history.replaceState(null, '', location.pathname);
    setPlatform('facebook');
    update();
  }

  function copyTags() {
    var url = urlInput.value.trim();
    var title = titleInput.value.trim();
    var description = descriptionInput.value.trim();
    var image = imageInput.value.trim();
    var sitename = sitenameInput.value.trim();

    if (!title && !description && !image && !url) {
      showFeedback('Nothing to copy yet.');
      return;
    }

    var lines = [];
    if (title) lines.push('<meta property="og:title" content="' + escapeAttr(title) + '" />');
    if (description) lines.push('<meta property="og:description" content="' + escapeAttr(description) + '" />');
    if (url) lines.push('<meta property="og:url" content="' + escapeAttr(url) + '" />');
    if (image) lines.push('<meta property="og:image" content="' + escapeAttr(image) + '" />');
    if (sitename) lines.push('<meta property="og:site_name" content="' + escapeAttr(sitename) + '" />');
    lines.push('<meta name="twitter:card" content="' + (image ? 'summary_large_image' : 'summary') + '" />');

    navigator.clipboard.writeText(lines.join('\n')).then(function () {
      showFeedback('Tags copied to clipboard.');
    }).catch(function () {
      showFeedback('Could not copy automatically, select and copy manually.');
    });
  }

  function shareLink() {
    var params = new URLSearchParams();
    if (urlInput.value.trim()) params.set('u', urlInput.value.trim());
    if (titleInput.value.trim()) params.set('t', titleInput.value.trim());
    if (descriptionInput.value.trim()) params.set('d', descriptionInput.value.trim());
    if (imageInput.value.trim()) params.set('i', imageInput.value.trim());
    if (sitenameInput.value.trim()) params.set('s', sitenameInput.value.trim());
    params.set('p', platform);

    var shareUrl = location.origin + location.pathname + '?' + params.toString();
    history.replaceState(null, '', shareUrl);

    navigator.clipboard.writeText(shareUrl).then(function () {
      showFeedback('Shareable link copied to clipboard.');
    }).catch(function () {
      showFeedback('Link updated in address bar, copy it from there.');
    });
  }

  function loadFromQueryString() {
    var params = new URLSearchParams(location.search);
    if (params.has('u')) urlInput.value = params.get('u');
    if (params.has('t')) titleInput.value = params.get('t');
    if (params.has('d')) descriptionInput.value = params.get('d');
    if (params.has('i')) imageInput.value = params.get('i');
    if (params.has('s')) { sitenameInput.value = params.get('s'); sitenameManuallyEdited = true; }
    if (params.has('p') && ['facebook', 'twitter', 'linkedin'].indexOf(params.get('p')) !== -1) {
      platform = params.get('p');
    }
  }

  urlInput.addEventListener('input', update);
  titleInput.addEventListener('input', update);
  descriptionInput.addEventListener('input', update);
  imageInput.addEventListener('input', update);
  sitenameInput.addEventListener('input', function () {
    sitenameManuallyEdited = true;
    update();
  });

  platformButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setPlatform(btn.getAttribute('data-platform'));
    });
  });

  btnReset.addEventListener('click', resetAll);
  btnCopyTags.addEventListener('click', copyTags);
  btnShareLink.addEventListener('click', shareLink);

  loadFromQueryString();
  setPlatform(platform);
  update();
})();
