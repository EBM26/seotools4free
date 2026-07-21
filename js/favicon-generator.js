(function () {
  var fileInput = document.getElementById('input-image');
  var grid = document.getElementById('favicon-grid');
  var outputHtml = document.getElementById('output-html');
  var btnCopyHtml = document.getElementById('btn-copy-html');
  var btnDownloadZip = document.getElementById('btn-download-zip');
  var btnReset = document.getElementById('btn-reset');
  var feedback = document.getElementById('actions-feedback');

  var SIZES = [
    { size: 16, filename: 'favicon-16x16.png', label: 'Favicon' },
    { size: 32, filename: 'favicon-32x32.png', label: 'Favicon' },
    { size: 48, filename: 'favicon-48x48.png', label: 'Favicon' },
    { size: 180, filename: 'apple-touch-icon.png', label: 'Apple touch icon' },
    { size: 192, filename: 'android-chrome-192x192.png', label: 'Android / PWA' },
    { size: 512, filename: 'android-chrome-512x512.png', label: 'Android / PWA' }
  ];

  var ICO_SIZES = [16, 32, 48];

  var generatedResults = [];

  function showFeedback(message) {
    feedback.textContent = message;
    setTimeout(function () {
      if (feedback.textContent === message) feedback.textContent = '';
    }, 2500);
  }

  function resizeToCanvas(img, size) {
    var canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext('2d');

    var scale = Math.min(size / img.naturalWidth, size / img.naturalHeight);
    var drawWidth = img.naturalWidth * scale;
    var drawHeight = img.naturalHeight * scale;
    var offsetX = (size - drawWidth) / 2;
    var offsetY = (size - drawHeight) / 2;

    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    return canvas;
  }

  function canvasToBlob(canvas) {
    return new Promise(function (resolve) {
      canvas.toBlob(function (blob) { resolve(blob); }, 'image/png');
    });
  }

  function buildIco(entries) {
    return Promise.all(entries.map(function (entry) {
      return entry.blob.arrayBuffer();
    })).then(function (buffers) {
      var headerSize = 6 + 16 * entries.length;
      var totalSize = headerSize;
      buffers.forEach(function (buf) { totalSize += buf.byteLength; });

      var outBuffer = new ArrayBuffer(totalSize);
      var view = new DataView(outBuffer);

      view.setUint16(0, 0, true);
      view.setUint16(2, 1, true);
      view.setUint16(4, entries.length, true);

      var offset = headerSize;
      entries.forEach(function (entry, i) {
        var entryOffset = 6 + i * 16;
        var dimension = entry.size === 256 ? 0 : entry.size;
        view.setUint8(entryOffset, dimension);
        view.setUint8(entryOffset + 1, dimension);
        view.setUint8(entryOffset + 2, 0);
        view.setUint8(entryOffset + 3, 0);
        view.setUint16(entryOffset + 4, 1, true);
        view.setUint16(entryOffset + 6, 32, true);
        view.setUint32(entryOffset + 8, buffers[i].byteLength, true);
        view.setUint32(entryOffset + 12, offset, true);

        new Uint8Array(outBuffer, offset, buffers[i].byteLength).set(new Uint8Array(buffers[i]));
        offset += buffers[i].byteLength;
      });

      return new Blob([outBuffer], { type: 'image/x-icon' });
    });
  }

  function renderPreviewGrid(results) {
    grid.innerHTML = '';
    results.forEach(function (result) {
      var box = document.createElement('div');
      box.className = 'favicon-swatch';

      var img = document.createElement('img');
      img.src = result.dataUrl;
      img.alt = result.filename;
      box.appendChild(img);

      var label = document.createElement('div');
      label.className = 'favicon-swatch__label';
      label.textContent = result.size + '×' + result.size;
      box.appendChild(label);

      var sublabel = document.createElement('div');
      sublabel.className = 'favicon-swatch__sublabel';
      sublabel.textContent = result.label;
      box.appendChild(sublabel);

      grid.appendChild(box);
    });
  }

  function generateHtmlSnippet() {
    outputHtml.value = [
      '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">',
      '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">',
      '<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">',
      '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">',
      '<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">',
      '<link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">',
      '<link rel="shortcut icon" href="/favicon.ico">'
    ].join('\n');
  }

  function processImage(img) {
    generatedResults = SIZES.map(function (entry) {
      var canvas = resizeToCanvas(img, entry.size);
      return {
        size: entry.size,
        filename: entry.filename,
        label: entry.label,
        canvas: canvas,
        dataUrl: canvas.toDataURL('image/png')
      };
    });

    renderPreviewGrid(generatedResults);
    generateHtmlSnippet();
    showFeedback('Favicon sizes generated.');
  }

  function handleFileChange(e) {
    var file = e.target.files[0];
    if (!file) return;

    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () { processImage(img); };
      img.onerror = function () {
        showFeedback('Could not load that image, try a different file.');
      };
      img.src = reader.result;
    };
    reader.onerror = function () {
      showFeedback('Could not read that file, try again.');
    };
    reader.readAsDataURL(file);
  }

  function copyHtml() {
    if (!outputHtml.value) {
      showFeedback('Upload an image first.');
      return;
    }
    navigator.clipboard.writeText(outputHtml.value).then(function () {
      showFeedback('HTML copied to clipboard.');
    }).catch(function () {
      showFeedback('Could not copy automatically, select and copy manually.');
    });
  }

  function downloadZip() {
    if (generatedResults.length === 0) {
      showFeedback('Upload an image first.');
      return;
    }
    if (typeof JSZip === 'undefined') {
      showFeedback('ZIP library failed to load, check your connection and try again.');
      return;
    }

    showFeedback('Building ZIP…');
    var zip = new JSZip();

    Promise.all(generatedResults.map(function (result) {
      return canvasToBlob(result.canvas).then(function (blob) {
        zip.file(result.filename, blob);
        return { size: result.size, blob: blob };
      });
    })).then(function (allBlobs) {
      var icoEntries = ICO_SIZES.map(function (size) {
        return allBlobs.filter(function (b) { return b.size === size; })[0];
      });
      return buildIco(icoEntries);
    }).then(function (icoBlob) {
      zip.file('favicon.ico', icoBlob);
      return zip.generateAsync({ type: 'blob' });
    }).then(function (content) {
      var url = URL.createObjectURL(content);
      var link = document.createElement('a');
      link.href = url;
      link.download = 'favicon-package.zip';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      showFeedback('favicon-package.zip downloaded.');
    }).catch(function () {
      showFeedback('Could not build the ZIP, try again.');
    });
  }

  function resetAll() {
    fileInput.value = '';
    generatedResults = [];
    grid.innerHTML = '<p class="favicon-grid__empty">Upload an image above to generate favicon sizes.</p>';
    outputHtml.value = '';
  }

  fileInput.addEventListener('change', handleFileChange);
  btnCopyHtml.addEventListener('click', copyHtml);
  btnDownloadZip.addEventListener('click', downloadZip);
  btnReset.addEventListener('click', resetAll);
})();
