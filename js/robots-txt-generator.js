(function () {
  var container = document.getElementById('groups-container');
  var sitemapInput = document.getElementById('input-sitemap');
  var output = document.getElementById('output-robots');
  var btnAddGroup = document.getElementById('btn-add-group');
  var btnCopy = document.getElementById('btn-copy');
  var btnDownload = document.getElementById('btn-download');
  var btnReset = document.getElementById('btn-reset');
  var feedback = document.getElementById('actions-feedback');
  var presetButtons = document.querySelectorAll('[data-preset]');

  function showFeedback(message) {
    feedback.textContent = message;
    setTimeout(function () {
      if (feedback.textContent === message) feedback.textContent = '';
    }, 2500);
  }

  function makeGroup(agent, disallow, allow) {
    var group = document.createElement('div');
    group.className = 'robots-group';
    group.innerHTML =
      '<div class="robots-group__header">' +
        '<label style="margin: 0;">User-agent</label>' +
        '<button type="button" class="robots-remove-btn">Remove</button>' +
      '</div>' +
      '<input type="text" class="robots-group__agent" placeholder="e.g. *, Googlebot, Bingbot" />' +
      '<div style="margin-top: 14px;">' +
        '<label>Disallow paths (one per line)</label>' +
        '<textarea class="robots-group__disallow" rows="3" placeholder="/admin/&#10;/cart/&#10;/*?sessionid="></textarea>' +
      '</div>' +
      '<div style="margin-top: 14px;">' +
        '<label>Allow paths (one per line, optional)</label>' +
        '<textarea class="robots-group__allow" rows="2" placeholder="/wp-admin/admin-ajax.php"></textarea>' +
      '</div>';

    group.querySelector('.robots-group__agent').value = agent || '';
    group.querySelector('.robots-group__disallow').value = disallow || '';
    group.querySelector('.robots-group__allow').value = allow || '';

    group.querySelectorAll('input, textarea').forEach(function (el) {
      el.addEventListener('input', generate);
    });
    group.querySelector('.robots-remove-btn').addEventListener('click', function () {
      group.remove();
      generate();
    });

    return group;
  }

  function addGroup(agent, disallow, allow) {
    container.appendChild(makeGroup(agent, disallow, allow));
    generate();
  }

  function clearGroups() {
    container.innerHTML = '';
  }

  function linesOf(textarea) {
    return textarea.value
      .split('\n')
      .map(function (line) { return line.trim(); })
      .filter(function (line) { return line.length > 0; });
  }

  function generate() {
    var groups = container.querySelectorAll('.robots-group');
    var blocks = [];

    groups.forEach(function (group) {
      var agent = group.querySelector('.robots-group__agent').value.trim() || '*';
      var disallowLines = linesOf(group.querySelector('.robots-group__disallow'));
      var allowLines = linesOf(group.querySelector('.robots-group__allow'));

      var lines = ['User-agent: ' + agent];
      if (disallowLines.length === 0 && allowLines.length === 0) {
        lines.push('Disallow:');
      } else {
        disallowLines.forEach(function (path) { lines.push('Disallow: ' + path); });
        allowLines.forEach(function (path) { lines.push('Allow: ' + path); });
      }
      blocks.push(lines.join('\n'));
    });

    var sitemap = sitemapInput.value.trim();
    if (sitemap) blocks.push('Sitemap: ' + sitemap);

    output.value = blocks.length > 0
      ? blocks.join('\n\n')
      : 'Add at least one user-agent group above.';
  }

  function copyOutput() {
    if (!output.value || output.value === 'Add at least one user-agent group above.') {
      showFeedback('Nothing to copy yet.');
      return;
    }
    navigator.clipboard.writeText(output.value).then(function () {
      showFeedback('robots.txt copied to clipboard.');
    }).catch(function () {
      showFeedback('Could not copy automatically, select and copy manually.');
    });
  }

  function downloadOutput() {
    if (!output.value || output.value === 'Add at least one user-agent group above.') {
      showFeedback('Nothing to download yet.');
      return;
    }
    var blob = new Blob([output.value], { type: 'text/plain' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'robots.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showFeedback('robots.txt file downloaded.');
  }

  function applyPreset(preset) {
    clearGroups();
    if (preset === 'allow-all') {
      addGroup('*', '', '');
    } else if (preset === 'block-all') {
      addGroup('*', '/', '');
    } else {
      addGroup('*', '', '');
    }
  }

  function resetAll() {
    sitemapInput.value = '';
    applyPreset('allow-all');
  }

  presetButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyPreset(btn.getAttribute('data-preset'));
    });
  });

  btnAddGroup.addEventListener('click', function () {
    addGroup('*', '', '');
  });
  sitemapInput.addEventListener('input', generate);
  btnCopy.addEventListener('click', copyOutput);
  btnDownload.addEventListener('click', downloadOutput);
  btnReset.addEventListener('click', resetAll);

  applyPreset('allow-all');
})();
