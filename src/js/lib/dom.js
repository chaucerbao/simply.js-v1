var DOM = (function(document, Array) {
  'use strict';

  var create = function(tag, classes) {
    var element = document.createElement(tag);
    if (classes) { addClass(element, classes); }
    return element;
  };

  var attach = function(target, element) {
    target.appendChild(element);
  };

  var attachBefore = function(target, element) {
    target.parentNode.insertBefore(element, target);
  };

  var detach = function(target, element) {
    target.removeChild(element);
  };

  var addClass = function(element, classes) {
    var classList = element.classList;
    if (!Array.isArray(classes)) { classes = [classes]; }
    classList.add.apply(classList, classes);
  };

  var removeClass = function(element, classes) {
    var classList = element.classList;
    if (!Array.isArray(classes)) { classes = [classes]; }
    classList.remove.apply(classList, classes);
  };

  var hasClass = function(element, name) {
    return element.classList.contains(name);
  };

  return {
    create: create,
    attach: attach,
    attachBefore: attachBefore,
    detach: detach,
    addClass: addClass,
    removeClass: removeClass,
    hasClass: hasClass
  };
})(document, Array);

module.exports = DOM;
