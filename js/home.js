// Search + category filtering for the redesigned homepage.
(function () {
  var searchInput = document.getElementById('tool-search');
  var pills = document.querySelectorAll('.home-pill');
  var sections = document.querySelectorAll('.home-section');
  var emptyState = document.getElementById('home-empty');

  var query = '';
  var cat = 'all';

  function applyFilters() {
    var totalVisible = 0;

    sections.forEach(function (section) {
      var sectionCat = section.dataset.cat;
      var catMatch = cat === 'all' || cat === sectionCat;
      var visibleInSection = 0;

      section.querySelectorAll('.home-card').forEach(function (card) {
        var name = card.querySelector('.home-card__name').textContent.toLowerCase();
        var desc = card.querySelector('.home-card__desc').textContent.toLowerCase();
        var searchMatch = !query || name.indexOf(query) !== -1 || desc.indexOf(query) !== -1;
        var show = catMatch && searchMatch;
        card.style.display = show ? '' : 'none';
        if (show) visibleInSection++;
      });

      section.style.display = visibleInSection > 0 ? '' : 'none';
      totalVisible += visibleInSection;
    });

    if (emptyState) {
      emptyState.hidden = totalVisible !== 0;
      var queryEl = emptyState.querySelector('.home-empty__query');
      if (queryEl) queryEl.textContent = query;
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      query = searchInput.value.trim().toLowerCase();
      applyFilters();
    });
  }

  pills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      cat = pill.dataset.cat;
      pills.forEach(function (p) {
        p.classList.toggle('is-active', p === pill);
        p.setAttribute('aria-pressed', p === pill ? 'true' : 'false');
      });
      applyFilters();
    });
  });
})();
