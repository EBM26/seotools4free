(function () {
  var input = document.getElementById('input-text');
  var focusInput = document.getElementById('input-focus');
  var focusResult = document.getElementById('focus-result');
  var wordsEl = document.getElementById('stat-words');
  var uniqueEl = document.getElementById('stat-unique');
  var lengthButtons = document.querySelectorAll('[data-length]');
  var excludeCommonCheckbox = document.getElementById('input-exclude-common');
  var stopwordOption = document.getElementById('stopword-option');
  var tableHeader = document.getElementById('table-header');
  var rowsBody = document.getElementById('density-rows');

  var STOPWORDS = [
    'a', 'an', 'the', 'and', 'or', 'but', 'if', 'so', 'to', 'of', 'in', 'on',
    'at', 'for', 'with', 'as', 'by', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'it', 'its', 'this', 'that', 'these', 'those', 'i', 'you', 'he',
    'she', 'we', 'they', 'them', 'his', 'her', 'our', 'your', 'their', 'not',
    'from', 'up', 'down', 'out', 'about', 'into', 'than', 'then', 'do', 'does',
    'did', 'can', 'will', 'just', 'also', 'has', 'have', 'had', 'no', 'yes'
  ];

  var currentLength = 1;

  function tokenize(text) {
    var matches = text.toLowerCase().match(/[a-z0-9']+/g);
    return matches || [];
  }

  function ngramCounts(words, n) {
    var counts = {};
    for (var i = 0; i + n <= words.length; i++) {
      var phrase = words.slice(i, i + n).join(' ');
      counts[phrase] = (counts[phrase] || 0) + 1;
    }
    return counts;
  }

  function topEntries(counts, totalWords, limit) {
    return Object.keys(counts)
      .map(function (phrase) { return { phrase: phrase, count: counts[phrase] }; })
      .sort(function (a, b) { return b.count - a.count || a.phrase.localeCompare(b.phrase); })
      .slice(0, limit)
      .map(function (entry) {
        return {
          phrase: entry.phrase,
          count: entry.count,
          density: totalWords ? (entry.count / totalWords * 100) : 0
        };
      });
  }

  function renderRows(entries) {
    rowsBody.innerHTML = '';
    if (entries.length === 0) {
      var emptyRow = document.createElement('tr');
      var emptyCell = document.createElement('td');
      emptyCell.colSpan = 3;
      emptyCell.textContent = 'Paste content above to see results.';
      emptyRow.appendChild(emptyCell);
      rowsBody.appendChild(emptyRow);
      return;
    }
    entries.forEach(function (entry) {
      var row = document.createElement('tr');

      var phraseCell = document.createElement('td');
      var code = document.createElement('code');
      code.textContent = entry.phrase;
      phraseCell.appendChild(code);

      var countCell = document.createElement('td');
      countCell.textContent = entry.count;

      var densityCell = document.createElement('td');
      densityCell.textContent = entry.density.toFixed(2) + '%';

      row.appendChild(phraseCell);
      row.appendChild(countCell);
      row.appendChild(densityCell);
      rowsBody.appendChild(row);
    });
  }

  function updateFocusResult(rawWords, totalWords) {
    var focusRaw = focusInput.value.trim();
    if (!focusRaw) {
      focusResult.textContent = '';
      return;
    }
    var focusWords = tokenize(focusRaw);
    if (focusWords.length === 0) {
      focusResult.textContent = '';
      return;
    }
    var n = focusWords.length;
    var counts = ngramCounts(rawWords, n);
    var phrase = focusWords.join(' ');
    var count = counts[phrase] || 0;
    var density = totalWords ? (count / totalWords * 100) : 0;
    focusResult.textContent = 'Appears ' + count + ' time' + (count === 1 ? '' : 's') +
      ' — ' + density.toFixed(2) + '% density.';
  }

  function update() {
    var text = input.value;
    var rawWords = tokenize(text);
    var totalWords = rawWords.length;

    wordsEl.textContent = totalWords;
    uniqueEl.textContent = Object.keys(ngramCounts(rawWords, 1)).length;

    var excludeCommon = excludeCommonCheckbox.checked;
    var words = (currentLength === 1 && excludeCommon)
      ? rawWords.filter(function (w) { return STOPWORDS.indexOf(w) === -1; })
      : rawWords;

    var counts = ngramCounts(words, currentLength);
    var entries = topEntries(counts, totalWords, 15);
    renderRows(entries);

    updateFocusResult(rawWords, totalWords);
  }

  function setLength(next) {
    currentLength = parseInt(next, 10);
    lengthButtons.forEach(function (btn) {
      btn.classList.toggle('is-active', parseInt(btn.getAttribute('data-length'), 10) === currentLength);
    });
    tableHeader.textContent = currentLength === 1 ? 'Word' : 'Phrase';
    stopwordOption.style.display = currentLength === 1 ? 'flex' : 'none';
    update();
  }

  input.addEventListener('input', update);
  focusInput.addEventListener('input', update);
  excludeCommonCheckbox.addEventListener('change', update);
  lengthButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setLength(btn.getAttribute('data-length'));
    });
  });

  setLength(currentLength);
})();
