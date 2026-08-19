(function () {
  var input = document.getElementById('input-text');
  var statCount = document.getElementById('stat-count');
  var limitWarning = document.getElementById('limit-warning');
  var warningCount = document.getElementById('warning-count');
  var warningExtra = document.getElementById('warning-extra');
  var firstThreeEmpty = document.getElementById('first-three-empty');
  var firstThreeList = document.getElementById('first-three-list');
  var allList = document.getElementById('all-hashtags-list');
  var btnCopy = document.getElementById('btn-copy');
  var btnReset = document.getElementById('btn-reset');
  var feedback = document.getElementById('actions-feedback');

  var YT_HASHTAG_LIMIT = 15;
  var extracted = [];

  function showFeedback(message) {
    feedback.textContent = message;
    setTimeout(function () {
      if (feedback.textContent === message) feedback.textContent = '';
    }, 2500);
  }

  function extractHashtags(text) {
    var matches = text.match(/#[\w]+/g) || [];
    var seen = {};
    var result = [];
    matches.forEach(function (tag) {
      var key = tag.toLowerCase();
      if (!seen[key]) {
        seen[key] = true;
        result.push(tag);
      }
    });
    return result;
  }

  function makeChip(tag, index) {
    var chip = document.createElement('span');
    chip.className = 'tag-chip';
    if (index >= YT_HASHTAG_LIMIT) {
      chip.classList.add('tag-chip--over-limit');
    }
    chip.textContent = tag;
    return chip;
  }

  function render() {
    allList.innerHTML = '';
    firstThreeList.innerHTML = '';

    if (extracted.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'hashtag-empty';
      empty.textContent = 'Paste text above to see extracted hashtags.';
      allList.appendChild(empty);
      firstThreeEmpty.style.display = '';
    } else {
      firstThreeEmpty.style.display = 'none';

      extracted.forEach(function (tag, index) {
        allList.appendChild(makeChip(tag, index));
      });

      extracted.slice(0, 3).forEach(function (tag) {
        var chip = document.createElement('span');
        chip.className = 'tag-chip';
        chip.textContent = tag;
        firstThreeList.appendChild(chip);
      });
    }

    statCount.textContent = extracted.length;

    if (extracted.length > YT_HASHTAG_LIMIT) {
      warningCount.textContent = extracted.length;
      warningExtra.textContent = extracted.length - YT_HASHTAG_LIMIT;
      limitWarning.classList.add('is-visible');
    } else {
      limitWarning.classList.remove('is-visible');
    }
  }

  function update() {
    extracted = extractHashtags(input.value);
    render();
  }

  function copyHashtags() {
    if (extracted.length === 0) {
      showFeedback('Nothing to copy yet.');
      return;
    }
    navigator.clipboard.writeText(extracted.join(' ')).then(function () {
      showFeedback('Hashtags copied to clipboard.');
    }).catch(function () {
      showFeedback('Could not copy automatically, select and copy manually.');
    });
  }

  function resetAll() {
    input.value = '';
    update();
  }

  input.addEventListener('input', update);
  btnCopy.addEventListener('click', copyHashtags);
  btnReset.addEventListener('click', resetAll);

  update();
})();
