(function () {
  var tokensInInput = document.getElementById('input-tokens-in');
  var tokensOutInput = document.getElementById('input-tokens-out');
  var priceInInput = document.getElementById('input-price-in');
  var priceOutInput = document.getElementById('input-price-out');
  var requestsInput = document.getElementById('input-requests');

  var costPerRequestEl = document.getElementById('stat-cost-per-request');
  var inputCostEl = document.getElementById('stat-input-cost');
  var outputCostEl = document.getElementById('stat-output-cost');
  var totalCostEl = document.getElementById('stat-total-cost');

  function formatCurrency(amount) {
    if (amount < 0.01 && amount > 0) return '$' + amount.toFixed(6);
    return '$' + amount.toFixed(2);
  }

  function update() {
    var tokensIn = Math.max(0, parseFloat(tokensInInput.value) || 0);
    var tokensOut = Math.max(0, parseFloat(tokensOutInput.value) || 0);
    var priceIn = Math.max(0, parseFloat(priceInInput.value) || 0);
    var priceOut = Math.max(0, parseFloat(priceOutInput.value) || 0);
    var requests = Math.max(1, parseFloat(requestsInput.value) || 1);

    var inputCostPerRequest = (tokensIn / 1000000) * priceIn;
    var outputCostPerRequest = (tokensOut / 1000000) * priceOut;
    var costPerRequest = inputCostPerRequest + outputCostPerRequest;

    var totalInputCost = inputCostPerRequest * requests;
    var totalOutputCost = outputCostPerRequest * requests;
    var totalCost = costPerRequest * requests;

    costPerRequestEl.textContent = formatCurrency(costPerRequest);
    inputCostEl.textContent = formatCurrency(totalInputCost);
    outputCostEl.textContent = formatCurrency(totalOutputCost);
    totalCostEl.textContent = formatCurrency(totalCost);
  }

  [tokensInInput, tokensOutInput, priceInInput, priceOutInput, requestsInput].forEach(function (el) {
    el.addEventListener('input', update);
  });

  update();
})();
