(function () {
  var input = document.getElementById('input-task');
  var styleButtons = document.querySelectorAll('[data-style]');
  var output = document.getElementById('output-wrapped');
  var btnCopy = document.getElementById('btn-copy');
  var btnReset = document.getElementById('btn-reset');
  var feedback = document.getElementById('actions-feedback');

  var currentStyle = 'step-by-step';

  function showFeedback(message) {
    feedback.textContent = message;
    setTimeout(function () {
      if (feedback.textContent === message) feedback.textContent = '';
    }, 2500);
  }

  function wrapStepByStep(task) {
    return task + '\n\n' +
      'Think through this step by step, showing your reasoning before you commit to an answer. ' +
      'Once you have reasoned it through, give your final answer clearly marked after a line ' +
      'that says "Final answer:".';
  }

  function wrapNumbered(task) {
    return task + '\n\n' +
      'Break your reasoning into an explicit numbered list of steps, then end with a clear conclusion:\n\n' +
      '1. [First reasoning step]\n' +
      '2. [Next reasoning step]\n' +
      '3. [Continue as needed]\n\n' +
      'Conclusion: [your final answer]';
  }

  function wrapAlternatives(task) {
    return task + '\n\n' +
      'Before committing to an answer, list at least two possible approaches or answers. ' +
      'For each one, briefly note its pros and cons. Then state which one you are choosing and why.';
  }

  function wrap(task) {
    if (currentStyle === 'numbered') return wrapNumbered(task);
    if (currentStyle === 'alternatives') return wrapAlternatives(task);
    return wrapStepByStep(task);
  }

  function generate() {
    var task = input.value.trim();
    output.value = task === '' ? '' : wrap(task);
  }

  function setStyle(style) {
    currentStyle = style;
    styleButtons.forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-style') === style);
    });
    generate();
  }

  function copyOutput() {
    if (!output.value) {
      showFeedback('Nothing to copy yet.');
      return;
    }
    navigator.clipboard.writeText(output.value).then(function () {
      showFeedback('Wrapped prompt copied to clipboard.');
    }).catch(function () {
      showFeedback('Could not copy automatically, select and copy manually.');
    });
  }

  function resetAll() {
    input.value = '';
    setStyle('step-by-step');
  }

  styleButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setStyle(btn.getAttribute('data-style'));
    });
  });

  input.addEventListener('input', generate);
  btnCopy.addEventListener('click', copyOutput);
  btnReset.addEventListener('click', resetAll);

  generate();
})();
