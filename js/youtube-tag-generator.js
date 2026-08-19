(function () {
  var topicInput = document.getElementById('input-topic');
  var keywordsInput = document.getElementById('input-keywords');
  var tagList = document.getElementById('tag-list');
  var tagCountLabel = document.getElementById('tag-count-label');
  var charCountWrap = document.getElementById('char-count-wrap');
  var charCount = document.getElementById('char-count');
  var charWarning = document.getElementById('char-warning');
  var outputTags = document.getElementById('output-tags');
  var btnCopy = document.getElementById('btn-copy');
  var btnReset = document.getElementById('btn-reset');
  var feedback = document.getElementById('actions-feedback');

  var CHAR_LIMIT = 500;
  var NEAR_LIMIT_RATIO = 0.9;
  var EMPTY_OUTPUT_MESSAGE = 'Enter a topic above to generate your tag list.';

  var removed = {};
  var currentTags = [];

  var TOPIC_TEMPLATES = [
    function (t) { return t; },
    function (t) { return t + ' tutorial'; },
    function (t) { return 'how to ' + t; },
    function (t) { return t + ' for beginners'; },
    function (t) { return t + ' tips'; },
    function (t) { return t + ' tips and tricks'; },
    function (t) { return t + ' guide'; },
    function (t) { return t + ' complete guide'; },
    function (t) { return 'best ' + t; },
    function (t) { return t + ' 2026'; },
    function (t) { return t + ' explained'; },
    function (t) { return t + ' step by step'; },
    function (t) { return 'easy ' + t; },
    function (t) { return 'quick ' + t; },
    function (t) { return t + ' review'; },
    function (t) { return t + ' walkthrough'; },
    function (t) { return t + ' breakdown'; },
    function (t) { return t + ' comparison'; },
    function (t) { return 'top 10 ' + t; },
    function (t) { return 'DIY ' + t; },
    function (t) { return t + ' ideas'; },
    function (t) { return t + ' for dummies'; },
    function (t) { return t + ' basics'; },
    function (t) { return t + ' made easy'; },
    function (t) { return t + ' secrets'; },
    function (t) { return t + ' mistakes to avoid'; },
    function (t) { return t + ' step by step guide'; },
    function (t) { return t + ' 101'; },
    function (t) { return 'learn ' + t; },
    function (t) { return t + ' walkthrough guide'; }
  ];

  function keywordCombos(topic, keyword) {
    return [
      topic + ' ' + keyword,
      keyword + ' ' + topic,
      keyword + ' ' + topic + ' tutorial',
      topic + ' ' + keyword + ' tips',
      'how to ' + topic + ' ' + keyword,
      keyword + ' ' + topic + ' guide'
    ];
  }

  function dedupe(list) {
    var seen = {};
    var result = [];
    list.forEach(function (tag) {
      var cleaned = tag.trim().replace(/\s+/g, ' ');
      if (!cleaned) return;
      var key = cleaned.toLowerCase();
      if (!seen[key]) {
        seen[key] = true;
        result.push(cleaned);
      }
    });
    return result;
  }

  function generate() {
    var topic = topicInput.value.trim().replace(/\s+/g, ' ');
    if (!topic) return [];

    var tags = TOPIC_TEMPLATES.map(function (fn) { return fn(topic); });

    var keywords = keywordsInput.value.split(',')
      .map(function (k) { return k.trim(); })
      .filter(Boolean);

    keywords.forEach(function (keyword) {
      tags = tags.concat(keywordCombos(topic, keyword));
    });

    return dedupe(tags);
  }

  function renderChips(tags) {
    tagList.innerHTML = '';

    if (tags.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'hashtag-empty';
      empty.textContent = 'Enter a topic above to generate tags.';
      tagList.appendChild(empty);
      return;
    }

    tags.forEach(function (tag) {
      var chip = document.createElement('span');
      chip.className = 'tag-chip';

      var label = document.createElement('span');
      label.textContent = tag;
      chip.appendChild(label);

      var removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'tag-chip__remove';
      removeBtn.setAttribute('aria-label', 'Remove tag ' + tag);
      removeBtn.textContent = '×';
      removeBtn.addEventListener('click', function () {
        removed[tag.toLowerCase()] = true;
        update();
      });
      chip.appendChild(removeBtn);

      tagList.appendChild(chip);
    });
  }

  function update() {
    var allTags = generate();
    currentTags = allTags.filter(function (tag) {
      return !removed[tag.toLowerCase()];
    });

    renderChips(currentTags);
    tagCountLabel.textContent = currentTags.length ? currentTags.length + ' tags' : '';

    var tagString = currentTags.join(', ');
    outputTags.value = currentTags.length ? tagString : EMPTY_OUTPUT_MESSAGE;

    var length = tagString.length;
    charCount.textContent = length;

    var isNear = length >= CHAR_LIMIT * NEAR_LIMIT_RATIO && length <= CHAR_LIMIT;
    var isOver = length > CHAR_LIMIT;
    charCountWrap.classList.toggle('is-near-limit', isNear);
    charCountWrap.classList.toggle('is-over-limit', isOver);
    charWarning.classList.toggle('is-visible', isOver);
  }

  function copyTags() {
    if (!currentTags.length) {
      showFeedback('Nothing to copy yet.');
      return;
    }
    navigator.clipboard.writeText(currentTags.join(', ')).then(function () {
      showFeedback('Tags copied to clipboard.');
    }).catch(function () {
      showFeedback('Could not copy automatically, select and copy manually.');
    });
  }

  function showFeedback(message) {
    feedback.textContent = message;
    setTimeout(function () {
      if (feedback.textContent === message) feedback.textContent = '';
    }, 2500);
  }

  function resetAll() {
    topicInput.value = '';
    keywordsInput.value = '';
    removed = {};
    update();
  }

  topicInput.addEventListener('input', update);
  keywordsInput.addEventListener('input', update);
  btnCopy.addEventListener('click', copyTags);
  btnReset.addEventListener('click', resetAll);

  update();
})();
