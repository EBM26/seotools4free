(function () {
  var unitButtons = document.querySelectorAll('[data-unit]');
  var amountInput = document.getElementById('input-amount');
  var classicStartCheckbox = document.getElementById('input-classic-start');
  var output = document.getElementById('output-text');
  var btnCopy = document.getElementById('btn-copy');
  var btnRegenerate = document.getElementById('btn-regenerate');
  var btnReset = document.getElementById('btn-reset');
  var feedback = document.getElementById('actions-feedback');

  var WORDS = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing',
    'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore',
    'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam',
    'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi',
    'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure',
    'in', 'reprehenderit', 'voluptate', 'velit', 'esse', 'cillum', 'fugiat',
    'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat',
    'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt',
    'mollit', 'anim', 'id', 'est', 'laborum', 'at', 'vero', 'eos', 'accusamus',
    'iusto', 'odio', 'dignissimos', 'ducimus', 'blanditiis', 'praesentium'
  ];

  var CLASSIC_SENTENCE = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

  var unit = 'paragraphs';

  function showFeedback(message) {
    feedback.textContent = message;
    setTimeout(function () {
      if (feedback.textContent === message) feedback.textContent = '';
    }, 2500);
  }

  function randomWord() {
    return WORDS[Math.floor(Math.random() * WORDS.length)];
  }

  function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  function buildSentence() {
    var wordCount = 6 + Math.floor(Math.random() * 10);
    var words = [];
    for (var i = 0; i < wordCount; i++) words.push(randomWord());
    var sentence = words.join(' ');
    return capitalize(sentence) + '.';
  }

  function buildParagraph() {
    var sentenceCount = 3 + Math.floor(Math.random() * 4);
    var sentences = [];
    for (var i = 0; i < sentenceCount; i++) sentences.push(buildSentence());
    return sentences.join(' ');
  }

  function generateWords(count, classicStart) {
    var words = [];
    if (classicStart) {
      words = words.concat(CLASSIC_SENTENCE.replace('.', '').replace(',', '').toLowerCase().split(' '));
    }
    while (words.length < count) words.push(randomWord());
    words = words.slice(0, count);
    return capitalize(words.join(' ')) + '.';
  }

  function generateSentences(count, classicStart) {
    var sentences = [];
    for (var i = 0; i < count; i++) {
      sentences.push(i === 0 && classicStart ? CLASSIC_SENTENCE : buildSentence());
    }
    return sentences.join(' ');
  }

  function generateParagraphs(count, classicStart) {
    var paragraphs = [];
    for (var i = 0; i < count; i++) {
      if (i === 0 && classicStart) {
        var rest = buildParagraph();
        paragraphs.push(CLASSIC_SENTENCE + ' ' + rest);
      } else {
        paragraphs.push(buildParagraph());
      }
    }
    return paragraphs.join('\n\n');
  }

  function generate() {
    var amount = Math.max(1, Math.min(50, parseInt(amountInput.value, 10) || 1));
    var classicStart = classicStartCheckbox.checked;

    if (unit === 'words') {
      output.value = generateWords(amount, classicStart);
    } else if (unit === 'sentences') {
      output.value = generateSentences(amount, classicStart);
    } else {
      output.value = generateParagraphs(amount, classicStart);
    }
  }

  function setUnit(next) {
    unit = next;
    unitButtons.forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-unit') === unit);
    });
    generate();
  }

  function copyText() {
    if (!output.value) {
      showFeedback('Nothing to copy yet.');
      return;
    }
    navigator.clipboard.writeText(output.value).then(function () {
      showFeedback('Text copied to clipboard.');
    }).catch(function () {
      showFeedback('Could not copy automatically, select and copy manually.');
    });
  }

  function resetAll() {
    amountInput.value = 3;
    classicStartCheckbox.checked = true;
    setUnit('paragraphs');
  }

  unitButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setUnit(btn.getAttribute('data-unit'));
    });
  });

  amountInput.addEventListener('input', generate);
  classicStartCheckbox.addEventListener('change', generate);
  btnCopy.addEventListener('click', copyText);
  btnRegenerate.addEventListener('click', generate);
  btnReset.addEventListener('click', resetAll);

  generate();
})();
