(function () {
  var input = document.getElementById('input-text');
  var wordsEl = document.getElementById('stat-words');
  var charsEl = document.getElementById('stat-characters');
  var charsNoSpaceEl = document.getElementById('stat-characters-no-space');
  var sentencesEl = document.getElementById('stat-sentences');
  var readingTimeEl = document.getElementById('stat-reading-time');

  var WORDS_PER_MINUTE = 200;

  function update() {
    var text = input.value;

    var words = text.trim().length === 0 ? [] : text.trim().split(/\s+/);
    var characters = text.length;
    var charactersNoSpace = text.replace(/\s/g, '').length;
    var sentences = text.trim().length === 0
      ? []
      : text.split(/[.!?]+/).filter(function (s) { return s.trim().length > 0; });

    var minutes = Math.max(1, Math.ceil(words.length / WORDS_PER_MINUTE));

    wordsEl.textContent = words.length;
    charsEl.textContent = characters;
    charsNoSpaceEl.textContent = charactersNoSpace;
    sentencesEl.textContent = sentences.length;
    readingTimeEl.textContent = words.length === 0 ? '0 min' : minutes + ' min';
  }

  input.addEventListener('input', update);
  update();
})();
