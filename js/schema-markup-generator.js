(function () {
  var typeSelect = document.getElementById('input-schema-type');
  var panels = document.querySelectorAll('.schema-panel');
  var output = document.getElementById('output-schema');
  var btnCopy = document.getElementById('btn-copy');
  var btnDownload = document.getElementById('btn-download');
  var btnReset = document.getElementById('btn-reset');
  var feedback = document.getElementById('actions-feedback');

  var lastJsonString = '';

  var faqContainer = document.getElementById('faq-groups-container');
  var btnAddFaq = document.getElementById('btn-add-faq');

  function showFeedback(message) {
    feedback.textContent = message;
    setTimeout(function () {
      if (feedback.textContent === message) feedback.textContent = '';
    }, 2500);
  }

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function prune(obj) {
    Object.keys(obj).forEach(function (key) {
      var value = obj[key];
      if (value === '' || value === null || value === undefined) {
        delete obj[key];
      } else if (Array.isArray(value)) {
        obj[key] = value.filter(function (item) { return item && Object.keys(item).length > 0; });
        if (obj[key].length === 0) delete obj[key];
      } else if (typeof value === 'object') {
        prune(value);
        var remainingKeys = Object.keys(value).filter(function (k) { return k !== '@type'; });
        if (remainingKeys.length === 0) delete obj[key];
      }
    });
    return obj;
  }

  function makeFaqGroup(question, answer) {
    var group = document.createElement('div');
    group.className = 'robots-group';
    group.innerHTML =
      '<div class="robots-group__header">' +
        '<label style="margin: 0;">Question</label>' +
        '<button type="button" class="robots-remove-btn">Remove</button>' +
      '</div>' +
      '<input type="text" class="faq-question" placeholder="e.g. Is this tool free to use?" />' +
      '<div style="margin-top: 14px;">' +
        '<label>Answer</label>' +
        '<textarea class="faq-answer" rows="2" placeholder="e.g. Yes, every tool on this site is free, no signup required."></textarea>' +
      '</div>';

    group.querySelector('.faq-question').value = question || '';
    group.querySelector('.faq-answer').value = answer || '';

    group.querySelectorAll('input, textarea').forEach(function (el) {
      el.addEventListener('input', generate);
    });
    group.querySelector('.robots-remove-btn').addEventListener('click', function () {
      group.remove();
      generate();
    });

    return group;
  }

  function addFaqGroup(question, answer) {
    faqContainer.appendChild(makeFaqGroup(question, answer));
    generate();
  }

  function buildArticle() {
    return prune({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: val('article-headline'),
      description: val('article-description'),
      image: val('article-image'),
      author: { '@type': 'Person', name: val('article-author') },
      publisher: { '@type': 'Organization', name: val('article-publisher') },
      datePublished: val('article-date'),
      mainEntityOfPage: val('article-url')
    });
  }

  function buildProduct() {
    var price = val('product-price');
    return prune({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: val('product-name'),
      description: val('product-description'),
      image: val('product-image'),
      brand: { '@type': 'Brand', name: val('product-brand') },
      sku: val('product-sku'),
      offers: price ? {
        '@type': 'Offer',
        price: price,
        priceCurrency: val('product-currency'),
        availability: 'https://schema.org/' + val('product-availability')
      } : {}
    });
  }

  function buildFaq() {
    var groups = faqContainer.querySelectorAll('.robots-group');
    var mainEntity = [];
    groups.forEach(function (group) {
      var question = group.querySelector('.faq-question').value.trim();
      var answer = group.querySelector('.faq-answer').value.trim();
      if (!question && !answer) return;
      mainEntity.push({
        '@type': 'Question',
        name: question,
        acceptedAnswer: { '@type': 'Answer', text: answer }
      });
    });
    return prune({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: mainEntity
    });
  }

  function buildLocalBusiness() {
    return prune({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: val('lb-name'),
      description: val('lb-description'),
      image: val('lb-image'),
      url: val('lb-url'),
      telephone: val('lb-phone'),
      priceRange: val('lb-pricerange'),
      address: {
        '@type': 'PostalAddress',
        streetAddress: val('lb-street'),
        addressLocality: val('lb-city'),
        addressRegion: val('lb-region'),
        postalCode: val('lb-postal'),
        addressCountry: val('lb-country')
      }
    });
  }

  var BUILDERS = {
    article: buildArticle,
    product: buildProduct,
    faq: buildFaq,
    localbusiness: buildLocalBusiness
  };

  function hasAnyContent(obj) {
    var keys = Object.keys(obj).filter(function (k) { return k !== '@context' && k !== '@type'; });
    return keys.length > 0;
  }

  function generate() {
    var type = typeSelect.value;
    var data = BUILDERS[type]();

    if (!hasAnyContent(data)) {
      output.value = 'Fill in the fields above to generate your schema markup.';
      lastJsonString = '';
      return;
    }

    lastJsonString = JSON.stringify(data, null, 2);
    output.value = '<script type="application/ld+json">\n' +
      lastJsonString +
      '\n<' + '/script>';
  }

  function setType(type) {
    panels.forEach(function (panel) {
      panel.style.display = panel.getAttribute('data-panel') === type ? 'block' : 'none';
    });
    generate();
  }

  function copyOutput() {
    if (!output.value || output.value.indexOf('Fill in') === 0) {
      showFeedback('Nothing to copy yet.');
      return;
    }
    navigator.clipboard.writeText(output.value).then(function () {
      showFeedback('Code copied to clipboard.');
    }).catch(function () {
      showFeedback('Could not copy automatically, select and copy manually.');
    });
  }

  function downloadOutput() {
    if (!lastJsonString) {
      showFeedback('Nothing to download yet.');
      return;
    }
    var blob = new Blob([lastJsonString], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'schema.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showFeedback('schema.json file downloaded.');
  }

  function resetAll() {
    document.querySelectorAll('.schema-panel input[type="text"], .schema-panel input[type="date"], .schema-panel textarea').forEach(function (el) {
      el.value = '';
    });
    document.getElementById('product-currency').value = 'USD';
    document.getElementById('product-availability').value = 'InStock';
    faqContainer.innerHTML = '';
    addFaqGroup('', '');
    typeSelect.value = 'article';
    setType('article');
  }

  typeSelect.addEventListener('change', function () { setType(typeSelect.value); });
  document.querySelectorAll('.schema-panel input, .schema-panel textarea, .schema-panel select').forEach(function (el) {
    el.addEventListener('input', generate);
    el.addEventListener('change', generate);
  });

  btnAddFaq.addEventListener('click', function () { addFaqGroup('', ''); });
  btnCopy.addEventListener('click', copyOutput);
  btnDownload.addEventListener('click', downloadOutput);
  btnReset.addEventListener('click', resetAll);

  addFaqGroup('', '');
  setType('article');
})();
