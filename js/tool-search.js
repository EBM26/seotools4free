(function () {
  var searchInput = document.getElementById('tool-search');
  var items = document.querySelectorAll('.tool-list__item');
  var emptyMessage = document.getElementById('tool-search-empty');

  function filter() {
    var query = searchInput.value.trim().toLowerCase();
    var visibleCount = 0;

    items.forEach(function (item) {
      var name = item.querySelector('.tool-list__name').textContent.toLowerCase();
      var desc = item.querySelector('.tool-list__desc').textContent.toLowerCase();
      var matches = !query || name.indexOf(query) !== -1 || desc.indexOf(query) !== -1;
      item.style.display = matches ? '' : 'none';
      if (matches) visibleCount++;
    });

    emptyMessage.style.display = visibleCount === 0 ? 'block' : 'none';
  }

  searchInput.addEventListener('input', filter);
})();
