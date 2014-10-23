var Selector = (function(document) {
  'use strict';

  var regex = {
    id: /^\#-?[_a-z]+[_a-z0-9-]*$/i,
    class: /^\.-?[_a-z]+[_a-z0-9-]*$/i,
    tag: /^[a-z]+[1-6]?$/i
  };

  var selector = function(target, context) {
    var results;
    context = context || document;

    if (target.split(' ').length === 1) {
      if (regex.id.test(target)) {
        /* ID */
        results = context.getElementById(target.replace(/^#/, ''));
      } else if (regex.class.test(target)) {
        /* Class */
        results = context.getElementsByClassName(target.replace(/^\./, ''));
      } else if (regex.tag.test(target)) {
        /* Tag */
        results = context.getElementsByTagName(target);
      }
    }

    if (!results) {
      /* Fallback */
      results = context.querySelectorAll(target);
    }

    return results;
  };

  return selector;
})(document);

module.exports = Selector;
