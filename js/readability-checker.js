(function () {
  var input = document.getElementById('input-text');
  var wordsEl = document.getElementById('stat-words');
  var sentencesEl = document.getElementById('stat-sentences');
  var syllablesEl = document.getElementById('stat-syllables');
  var wordsPerSentenceEl = document.getElementById('stat-words-per-sentence');
  var fleschScoreEl = document.getElementById('stat-flesch-score');
  var fleschLabelEl = document.getElementById('stat-flesch-label');
  var gradeLevelEl = document.getElementById('stat-grade-level');

  function countSyllables(word) {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (!word) return 0;
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    var matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }

  function update() {
    var text = input.value;
    var trimmed = text.trim();

    var words = trimmed.length === 0 ? [] : trimmed.match(/[a-zA-Z']+/g) || [];
    var sentences = trimmed.length === 0
      ? []
      : text.split(/[.!?]+/).filter(function (s) { return s.trim().length > 0; });

    var syllableCount = words.reduce(function (sum, word) { return sum + countSyllables(word); }, 0);
    var wordCount = words.length;
    var sentenceCount = sentences.length;

    wordsEl.textContent = wordCount;
    sentencesEl.textContent = sentenceCount;
    syllablesEl.textContent = syllableCount;

    if (wordCount === 0 || sentenceCount === 0) {
      wordsPerSentenceEl.textContent = '0';
      fleschScoreEl.textContent = '0';
      fleschLabelEl.textContent = 'Flesch Reading Ease';
      gradeLevelEl.textContent = '0';
      return;
    }

    var wordsPerSentence = wordCount / sentenceCount;
    var syllablesPerWord = syllableCount / wordCount;

    wordsPerSentenceEl.textContent = wordsPerSentence.toFixed(1);

    var fleschScore = 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;
    fleschScore = Math.max(0, Math.min(100, fleschScore));

    var gradeLevel = 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;
    gradeLevel = Math.max(0, gradeLevel);

    fleschScoreEl.textContent = fleschScore.toFixed(1);
    fleschLabelEl.textContent = 'Flesch Reading Ease — ' + fleschToLabel(fleschScore);
    gradeLevelEl.textContent = gradeLevel.toFixed(1);
  }

  function fleschToLabel(score) {
    if (score >= 90) return 'Very easy';
    if (score >= 80) return 'Easy';
    if (score >= 70) return 'Fairly easy';
    if (score >= 60) return 'Standard';
    if (score >= 50) return 'Fairly difficult';
    if (score >= 30) return 'Difficult';
    return 'Very difficult';
  }

  input.addEventListener('input', update);
  update();
})();
