(function () {
  var fgPicker = document.getElementById('input-foreground-picker');
  var fgText = document.getElementById('input-foreground');
  var bgPicker = document.getElementById('input-background-picker');
  var bgText = document.getElementById('input-background');
  var btnSwap = document.getElementById('btn-swap');

  var ratioEl = document.getElementById('stat-ratio');
  var badgeAaNormal = document.getElementById('badge-aa-normal');
  var badgeAaaNormal = document.getElementById('badge-aaa-normal');
  var badgeAaLarge = document.getElementById('badge-aa-large');
  var badgeAaaLarge = document.getElementById('badge-aaa-large');

  var previewBox = document.getElementById('preview-box');
  var previewLarge = document.getElementById('preview-large');
  var previewNormal = document.getElementById('preview-normal');

  function normalizeHex(value) {
    var hex = value.trim().replace(/^#/, '');
    if (/^[0-9a-fA-F]{3}$/.test(hex)) {
      hex = hex.split('').map(function (c) { return c + c; }).join('');
    }
    if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
    return '#' + hex.toLowerCase();
  }

  function hexToRgb(hex) {
    var normalized = normalizeHex(hex);
    if (!normalized) return null;
    var value = normalized.slice(1);
    return {
      r: parseInt(value.slice(0, 2), 16),
      g: parseInt(value.slice(2, 4), 16),
      b: parseInt(value.slice(4, 6), 16)
    };
  }

  function relativeLuminance(rgb) {
    var channels = [rgb.r, rgb.g, rgb.b].map(function (channel) {
      var c = channel / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  }

  function contrastRatio(hex1, hex2) {
    var rgb1 = hexToRgb(hex1);
    var rgb2 = hexToRgb(hex2);
    if (!rgb1 || !rgb2) return null;
    var l1 = relativeLuminance(rgb1);
    var l2 = relativeLuminance(rgb2);
    var lighter = Math.max(l1, l2);
    var darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function setBadge(el, pass) {
    el.textContent = pass ? 'Pass' : 'Fail';
    el.classList.toggle('contrast-fail', !pass);
  }

  function update() {
    var fgNormalized = normalizeHex(fgText.value);
    var bgNormalized = normalizeHex(bgText.value);

    if (fgNormalized) fgPicker.value = fgNormalized;
    if (bgNormalized) bgPicker.value = bgNormalized;

    if (!fgNormalized || !bgNormalized) {
      ratioEl.textContent = '—';
      return;
    }

    var ratio = contrastRatio(fgNormalized, bgNormalized);
    ratioEl.textContent = ratio.toFixed(2) + ':1';

    setBadge(badgeAaNormal, ratio >= 4.5);
    setBadge(badgeAaaNormal, ratio >= 7);
    setBadge(badgeAaLarge, ratio >= 3);
    setBadge(badgeAaaLarge, ratio >= 4.5);

    previewBox.style.background = bgNormalized;
    previewLarge.style.color = fgNormalized;
    previewNormal.style.color = fgNormalized;
  }

  function swapColors() {
    var fg = fgText.value;
    var bg = bgText.value;
    fgText.value = bg;
    bgText.value = fg;
    update();
  }

  fgPicker.addEventListener('input', function () { fgText.value = fgPicker.value; update(); });
  bgPicker.addEventListener('input', function () { bgText.value = bgPicker.value; update(); });
  fgText.addEventListener('input', update);
  bgText.addEventListener('input', update);
  btnSwap.addEventListener('click', swapColors);

  update();
})();
