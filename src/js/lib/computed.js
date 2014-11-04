var Computed = (function(window) {
  'use strict';

  var style = function(element, property) {
    var style = window.getComputedStyle(element, null);
    return (property) ? style.getPropertyValue(property) : style;
  };

  /* Calculate the absolute position of an element */
  var position = function(element) {
    var rect = element.getBoundingClientRect();

    return {
      left: window.pageXOffset + rect.left,
      top: window.pageYOffset + rect.top
    };
  };

  return {
    style: style,
    position: position
  };
})(window);

module.exports = Computed;
