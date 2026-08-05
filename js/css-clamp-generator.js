(function () {
  var minViewportInput = document.getElementById('input-min-viewport');
  var maxViewportInput = document.getElementById('input-max-viewport');
  var minSizeInput = document.getElementById('input-min-size');
  var maxSizeInput = document.getElementById('input-max-size');
  var rootSizeInput = document.getElementById('input-root-size');

  var output = document.getElementById('output-clamp');
  var btnCopy = document.getElementById('btn-copy');
  var btnReset = document.getElementById('btn-reset');
  var feedback = document.getElementById('actions-feedback');

  var previewWidthInput = document.getElementById('input-preview-width');
  var previewReadout = document.getElementById('preview-readout');
  var previewBox = document.getElementById('preview-box');
  var previewText = document.getElementById('preview-text');

  function showFeedback(message) {
    feedback.textContent = message;
    setTimeout(function () {
      if (feedback.textContent === message) feedback.textContent = '';
    }, 2500);
  }

  function round(value, decimals) {
    var factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  function readValues() {
    return {
      minViewport: parseFloat(minViewportInput.value) || 0,
      maxViewport: parseFloat(maxViewportInput.value) || 0,
      minSize: parseFloat(minSizeInput.value) || 0,
      maxSize: parseFloat(maxSizeInput.value) || 0,
      rootSize: parseFloat(rootSizeInput.value) || 16
    };
  }

  function fontSizeAtWidth(width, v) {
    if (v.maxViewport === v.minViewport) return v.minSize;
    var slope = (v.maxSize - v.minSize) / (v.maxViewport - v.minViewport);
    var size = v.minSize + slope * (width - v.minViewport);
    var lo = Math.min(v.minSize, v.maxSize);
    var hi = Math.max(v.minSize, v.maxSize);
    return Math.min(hi, Math.max(lo, size));
  }

  function generate() {
    var v = readValues();

    if (v.maxViewport <= v.minViewport) {
      output.value = 'Max viewport width must be greater than min viewport width.';
      return;
    }

    var slope = (v.maxSize - v.minSize) / (v.maxViewport - v.minViewport);
    var slopeVw = slope * 100;
    var intersectionPx = v.minSize - slope * v.minViewport;

    var minRem = round(v.minSize / v.rootSize, 4);
    var maxRem = round(v.maxSize / v.rootSize, 4);
    var intersectionRem = round(intersectionPx / v.rootSize, 4);
    var slopeVwRounded = round(slopeVw, 4);

    var preferred = intersectionRem + 'rem + ' + slopeVwRounded + 'vw';
    output.value = 'font-size: clamp(' + minRem + 'rem, ' + preferred + ', ' + maxRem + 'rem);';

    updatePreview();
  }

  function updatePreview() {
    var v = readValues();
    var width = parseFloat(previewWidthInput.value) || v.minViewport;
    var size = fontSizeAtWidth(width, v);

    previewReadout.textContent = width + 'px → ' + round(size, 1) + 'px';
    previewText.style.fontSize = size + 'px';

    var containerWidth = previewBox.parentElement.clientWidth;
    previewBox.style.width = Math.min(width, containerWidth) + 'px';
  }

  function copyOutput() {
    if (!output.value || output.value.indexOf('Max viewport') === 0) {
      showFeedback('Nothing to copy yet.');
      return;
    }
    navigator.clipboard.writeText(output.value).then(function () {
      showFeedback('CSS copied to clipboard.');
    }).catch(function () {
      showFeedback('Could not copy automatically, select and copy manually.');
    });
  }

  function resetAll() {
    minViewportInput.value = 320;
    maxViewportInput.value = 1280;
    minSizeInput.value = 16;
    maxSizeInput.value = 24;
    rootSizeInput.value = 16;
    previewWidthInput.value = 320;
    generate();
  }

  [minViewportInput, maxViewportInput, minSizeInput, maxSizeInput, rootSizeInput].forEach(function (el) {
    el.addEventListener('input', generate);
  });
  previewWidthInput.addEventListener('input', updatePreview);
  window.addEventListener('resize', updatePreview);

  btnCopy.addEventListener('click', copyOutput);
  btnReset.addEventListener('click', resetAll);

  generate();
})();
