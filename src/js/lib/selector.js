var Selector = (function(document) {
  'use strict';

  var regex = {
    id: /^#-?[_a-z]+[_a-z0-9-]*$/i,
    class: /^\.-?[_a-z]+[_a-z0-9-\.]*$/i,
    tag: /^[a-z]+[1-6]?$/i
  };

  var find = function(target, context) {
    var results;
    context = context || document;

    if (target.split(' ').length === 1) {
      if (regex.id.test(target)) {
        /* ID */
        results = context.getElementById(target.replace(/^#/, ''));
      } else if (regex.class.test(target)) {
        /* Class */
        results = context.getElementsByClassName(target.replace(/^\./, '').replace(/\./, ' '));
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

  var findParent = function(target, element) {
    var parentNode, targetName, targetRegex;

    do {
      parentNode = element.parentNode;
      targetName = target.replace(/^[#\.]/, '');
      targetRegex = new RegExp('^' + targetName + '$', 'i');

      if (
        regex.id.test(target) && targetRegex.test(element.id) ||
        regex.class.test(target) && element.classList.contains(targetName) ||
        regex.tag.test(target) && targetRegex.test(element.tagName)
      ) {
        return element;
      }

      element = parentNode;
    } while (element !== document.documentElement);

    return null;
  };


  return {
    find: find,
    findParent: findParent
  };
})(document);

module.exports = Selector;
