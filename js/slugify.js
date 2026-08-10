// Shared slugify logic used by the Slug Generator tool (js/slug-generator.js)
// and by the FAQ page generator (faq-data/generate-faqs.js), so both produce
// identical slugs from the same input. Do not duplicate this function
// elsewhere — import it instead.
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.slugify = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  function slugify(text, separator, lowercase) {
    var result = text.trim();
    if (lowercase) result = result.toLowerCase();

    // Normalize accented characters (e.g. café -> cafe)
    result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Replace anything that isn't a letter, number, or existing separator with a space
    result = result.replace(/[^a-zA-Z0-9\-_\s]/g, ' ');

    // Collapse whitespace and existing separators into the chosen separator
    result = result.trim().replace(/[\s\-_]+/g, separator);

    return result;
  }

  return slugify;
});
