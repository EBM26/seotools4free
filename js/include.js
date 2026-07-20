// Fetches shared header/footer partials and injects them into any page
// that has <div id="site-header"></div> and <div id="site-footer"></div>.
//
// NOTE: fetch() for local files requires a real HTTP server (CORS blocks
// fetch over file://). Run a local server while developing, e.g.:
//   python3 -m http.server 8000
// then visit http://localhost:8000/word-counter.html

(function () {
  function inject(targetId, url) {
    var target = document.getElementById(targetId);
    if (!target) return;
    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load ' + url);
        return res.text();
      })
      .then(function (html) {
        target.innerHTML = html;
        // Re-run any inline <script> tags from the injected partial,
        // since innerHTML does not execute them automatically.
        var scripts = target.querySelectorAll('script');
        scripts.forEach(function (oldScript) {
          var newScript = document.createElement('script');
          if (oldScript.src) {
            newScript.src = oldScript.src;
          } else {
            newScript.textContent = oldScript.textContent;
          }
          oldScript.replaceWith(newScript);
        });
      })
      .catch(function (err) {
        console.error(err);
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    inject('site-header', 'partials/header.html');
    inject('site-footer', 'partials/footer.html');
  });
})();
