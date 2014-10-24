var ComputedStyle = (function(window) {
  'use strict';

  var computedStyle = function(element, property) {
    var style = window.getComputedStyle(element, null);
    return (property) ? style.getPropertyValue(property) : style;
  };

  return computedStyle;
})(window);

module.exports = ComputedStyle;
