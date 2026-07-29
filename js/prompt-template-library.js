(function () {
  var searchInput = document.getElementById('template-search');
  var catButtons = document.querySelectorAll('[data-cat]');
  var cards = document.querySelectorAll('.template-card');
  var emptyState = document.getElementById('templates-empty');

  var query = '';
  var cat = 'all';

  function applyFilters() {
    var visibleCount = 0;

    cards.forEach(function (card) {
      var cardCat = card.getAttribute('data-cat');
      var catMatch = cat === 'all' || cat === cardCat;

      var title = card.querySelector('.template-card__title').textContent.toLowerCase();
      var desc = card.querySelector('.template-card__desc').textContent.toLowerCase();
      var body = card.querySelector('.template-card__body').textContent.toLowerCase();
      var searchMatch = !query || title.indexOf(query) !== -1 || desc.indexOf(query) !== -1 ||
        cardCat.indexOf(query) !== -1 || body.indexOf(query) !== -1;

      var show = catMatch && searchMatch;
      card.style.display = show ? '' : 'none';
      if (show) visibleCount++;
    });

    emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
  }

  function copyTemplate(card, button) {
    var text = card.querySelector('.template-card__body').textContent;
    navigator.clipboard.writeText(text).then(function () {
      var original = button.textContent;
      button.textContent = 'Copied!';
      setTimeout(function () {
        button.textContent = original;
      }, 1500);
    }).catch(function () {
      var original = button.textContent;
      button.textContent = 'Copy failed';
      setTimeout(function () {
        button.textContent = original;
      }, 1500);
    });
  }

  searchInput.addEventListener('input', function () {
    query = searchInput.value.trim().toLowerCase();
    applyFilters();
  });

  catButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      cat = btn.getAttribute('data-cat');
      catButtons.forEach(function (b) {
        b.classList.toggle('is-active', b === btn);
      });
      applyFilters();
    });
  });

  cards.forEach(function (card) {
    var button = card.querySelector('.template-card__copy');
    button.addEventListener('click', function () {
      copyTemplate(card, button);
    });
  });

  applyFilters();
})();
