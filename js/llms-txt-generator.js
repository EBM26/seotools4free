(function () {
  var nameInput = document.getElementById('input-name');
  var descriptionInput = document.getElementById('input-description');
  var summaryInput = document.getElementById('input-summary');
  var sectionsContainer = document.getElementById('sections-container');
  var btnAddSection = document.getElementById('btn-add-section');

  var preview = document.getElementById('llms-preview');
  var output = document.getElementById('output-llms');
  var btnCopy = document.getElementById('btn-copy');
  var btnDownload = document.getElementById('btn-download');
  var btnReset = document.getElementById('btn-reset');
  var feedback = document.getElementById('actions-feedback');

  var PLACEHOLDER_MESSAGE = 'Fill in the site name above to generate llms.txt.';

  function showFeedback(message) {
    feedback.textContent = message;
    setTimeout(function () {
      if (feedback.textContent === message) feedback.textContent = '';
    }, 2500);
  }

  function makeLinkRow(label, url) {
    var row = document.createElement('div');
    row.className = 'llms-link-row';
    row.innerHTML =
      '<input type="text" class="llms-link-label" placeholder="e.g. Getting Started Guide" />' +
      '<input type="text" class="llms-link-url" placeholder="e.g. https://example.com/docs/start" />' +
      '<button type="button" class="robots-remove-btn">Remove</button>';

    row.querySelector('.llms-link-label').value = label || '';
    row.querySelector('.llms-link-url').value = url || '';

    row.querySelectorAll('input').forEach(function (el) {
      el.addEventListener('input', generate);
    });
    row.querySelector('.robots-remove-btn').addEventListener('click', function () {
      row.remove();
      generate();
    });

    return row;
  }

  function makeSection(header, links) {
    var section = document.createElement('div');
    section.className = 'robots-group';
    section.innerHTML =
      '<div class="robots-group__header">' +
        '<label style="margin: 0;">Section header</label>' +
        '<button type="button" class="robots-remove-btn" data-remove-section>Remove section</button>' +
      '</div>' +
      '<input type="text" class="llms-section-header" placeholder="e.g. Docs, Examples, Optional" />' +
      '<div class="llms-section__links"></div>' +
      '<button type="button" class="btn btn--secondary btn--small" data-add-link style="margin-top: 12px;">+ Add link</button>';

    section.querySelector('.llms-section-header').value = header || '';
    section.querySelector('.llms-section-header').addEventListener('input', generate);

    var linksContainer = section.querySelector('.llms-section__links');
    var initialLinks = (links && links.length > 0) ? links : [{ label: '', url: '' }];
    initialLinks.forEach(function (link) {
      linksContainer.appendChild(makeLinkRow(link.label, link.url));
    });

    section.querySelector('[data-add-link]').addEventListener('click', function () {
      linksContainer.appendChild(makeLinkRow('', ''));
      generate();
    });
    section.querySelector('[data-remove-section]').addEventListener('click', function () {
      section.remove();
      generate();
    });

    return section;
  }

  function addSection(header, links) {
    sectionsContainer.appendChild(makeSection(header, links));
    generate();
  }

  function collectSections() {
    var sections = [];
    sectionsContainer.querySelectorAll(':scope > .robots-group').forEach(function (sectionEl) {
      var header = sectionEl.querySelector('.llms-section-header').value.trim();
      var links = [];
      sectionEl.querySelectorAll('.llms-link-row').forEach(function (row) {
        var label = row.querySelector('.llms-link-label').value.trim();
        var url = row.querySelector('.llms-link-url').value.trim();
        if (label && url) links.push({ label: label, url: url });
      });
      if (links.length > 0) sections.push({ header: header, links: links });
    });
    return sections;
  }

  function renderPreview(name, description, summary, sections) {
    preview.innerHTML = '';

    if (!name) {
      var empty = document.createElement('p');
      empty.className = 'llms-preview__empty';
      empty.textContent = 'Fill in the fields above to see a preview.';
      preview.appendChild(empty);
      return;
    }

    var h1 = document.createElement('h1');
    h1.textContent = name;
    preview.appendChild(h1);

    if (description) {
      var blockquote = document.createElement('blockquote');
      blockquote.textContent = description;
      preview.appendChild(blockquote);
    }

    if (summary) {
      var p = document.createElement('p');
      p.textContent = summary;
      preview.appendChild(p);
    }

    sections.forEach(function (section) {
      if (section.header) {
        var h2 = document.createElement('h2');
        h2.textContent = section.header;
        preview.appendChild(h2);
      }
      var ul = document.createElement('ul');
      section.links.forEach(function (link) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = link.url;
        a.textContent = link.label;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        li.appendChild(a);
        ul.appendChild(li);
      });
      preview.appendChild(ul);
    });
  }

  function generate() {
    var name = nameInput.value.trim();
    var description = descriptionInput.value.trim();
    var summary = summaryInput.value.trim();
    var sections = collectSections();

    renderPreview(name, description, summary, sections);

    if (!name) {
      output.value = PLACEHOLDER_MESSAGE;
      return;
    }

    var lines = ['# ' + name];

    if (description) {
      lines.push('');
      lines.push('> ' + description);
    }

    if (summary) {
      lines.push('');
      lines.push(summary);
    }

    sections.forEach(function (section) {
      lines.push('');
      if (section.header) lines.push('## ' + section.header);
      section.links.forEach(function (link) {
        lines.push('- [' + link.label + '](' + link.url + ')');
      });
    });

    output.value = lines.join('\n');
  }

  function copyOutput() {
    if (!output.value || output.value === PLACEHOLDER_MESSAGE) {
      showFeedback('Nothing to copy yet.');
      return;
    }
    navigator.clipboard.writeText(output.value).then(function () {
      showFeedback('llms.txt copied to clipboard.');
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
    link.download = 'llms.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showFeedback('llms.txt file downloaded.');
  }

  function resetAll() {
    nameInput.value = '';
    descriptionInput.value = '';
    summaryInput.value = '';
    sectionsContainer.innerHTML = '';
    addSection('Docs', [{ label: '', url: '' }]);
  }

  nameInput.addEventListener('input', generate);
  descriptionInput.addEventListener('input', generate);
  summaryInput.addEventListener('input', generate);
  btnAddSection.addEventListener('click', function () { addSection('', []); });
  btnCopy.addEventListener('click', copyOutput);
  btnDownload.addEventListener('click', downloadOutput);
  btnReset.addEventListener('click', resetAll);

  addSection('Docs', [{ label: '', url: '' }]);
})();
