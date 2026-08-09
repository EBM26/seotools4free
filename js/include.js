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
        // Replace the wrapper div itself (not just its contents) so the
        // injected markup becomes a direct child of <body>. Leaving the
        // wrapper in place would nest .site-header inside a div exactly
        // as tall as itself, which breaks position: sticky (the sticky
        // element has no room to move within a parent that never grows
        // taller than it).
        var wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        var nodes = Array.prototype.slice.call(wrapper.childNodes);
        nodes.forEach(function (node) {
          target.parentNode.insertBefore(node, target);
        });
        target.remove();

        // Re-run any inline <script> tags from the injected partial,
        // since innerHTML does not execute them automatically.
        nodes.forEach(function (node) {
          if (node.nodeType === 1 && node.tagName === 'SCRIPT') {
            var newScript = document.createElement('script');
            if (node.src) {
              newScript.src = node.src;
            } else {
              newScript.textContent = node.textContent;
            }
            node.replaceWith(newScript);
          }
        });
      })
      .catch(function (err) {
        console.error(err);
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    inject('site-header', '/partials/header.html');
    inject('site-footer', '/partials/footer.html');
  });
})();
