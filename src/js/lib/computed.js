var Computed = (function(window) {
  'use strict';

  var style = function(element, property) {
    var style = window.getComputedStyle(element, null);
    return (property) ? style.getPropertyValue(property) : style;
  };

  /* Calculate the absolute position of an element */
  var offset = function(element) {
    var elementStyle = style(element),
      left = -parseFloat(elementStyle.marginLeft),
      top = -parseFloat(elementStyle.marginTop);

    if (element.offsetParent) {
      do {
        left += element.offsetLeft;
        top += element.offsetTop;
        element = element.offsetParent;
      } while (element);
    }

    return {
      left: left,
      top: top
    };
  };

  return {
    style: style,
    offset: offset
  };
})(window);

module.exports = Computed;
