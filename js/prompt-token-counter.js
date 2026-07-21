(function () {
  var input = document.getElementById('input-text');
  var charactersEl = document.getElementById('stat-characters');
  var wordsEl = document.getElementById('stat-words');
  var tokensEl = document.getElementById('stat-tokens');
  var modelRows = document.getElementById('model-rows');

  var CHARS_PER_TOKEN = 4;

  var MODELS = [
    { name: 'GPT-3.5 Turbo', contextWindow: 16000 },
    { name: 'GPT-4o', contextWindow: 128000 },
    { name: 'Claude (Sonnet / Opus)', contextWindow: 200000 },
    { name: 'Gemini 1.5 Pro', contextWindow: 1000000 },
    { name: 'Llama 3.1', contextWindow: 128000 }
  ];

  function formatNumber(n) {
    return n.toLocaleString('en-US');
  }

  function renderModelRows(estimatedTokens) {
    modelRows.innerHTML = '';
    MODELS.forEach(function (model) {
      var percent = model.contextWindow ? (estimatedTokens / model.contextWindow * 100) : 0;
      var displayPercent = percent < 0.1 && percent > 0 ? '<0.1' : percent.toFixed(1);
      var barWidth = Math.min(100, percent);

      var row = document.createElement('tr');

      var nameCell = document.createElement('td');
      nameCell.textContent = model.name;

      var windowCell = document.createElement('td');
      windowCell.textContent = formatNumber(model.contextWindow) + ' tokens';

      var usageCell = document.createElement('td');
      var bar = document.createElement('div');
      bar.className = 'token-bar';
      var fill = document.createElement('div');
      fill.className = 'token-bar__fill';
      fill.style.width = barWidth + '%';
      bar.appendChild(fill);
      var percentLabel = document.createElement('span');
      percentLabel.textContent = displayPercent + '%';
      usageCell.appendChild(bar);
      usageCell.appendChild(percentLabel);

      row.appendChild(nameCell);
      row.appendChild(windowCell);
      row.appendChild(usageCell);
      modelRows.appendChild(row);
    });
  }

  function update() {
    var text = input.value;
    var trimmed = text.trim();

    var characters = text.length;
    var words = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
    var estimatedTokens = Math.ceil(characters / CHARS_PER_TOKEN);

    charactersEl.textContent = formatNumber(characters);
    wordsEl.textContent = formatNumber(words);
    tokensEl.textContent = formatNumber(estimatedTokens);

    renderModelRows(estimatedTokens);
  }

  input.addEventListener('input', update);
  update();
})();
