var Selector = (function(document) {
  'use strict';

  var selector = function(target, context) {
    var results;
    context = context || document;

    if (target.split(' ').length === 1) {
      if (/^#/.test(target)) {
        /* ID */
        results = context.getElementById(target.replace(/^#/, ''));
      } else if (/^\./.test(target)) {
        /* Class */
        results = context.getElementsByClassName(target.replace(/^\./, ''));
      } else {
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
