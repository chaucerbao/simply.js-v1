var Pin = (function(window, document) {
  'use strict';

  var extend = require('../lib/extend.js'),
    findParent = require('../lib/selector.js').findParent,
    computed = require('../lib/computed.js'),
    computedStyle = computed.style,
    computedPosition = computed.position,
    dom = require('../lib/dom.js'),
    domCreate = dom.create,
    domAttach = dom.attach,
    domAttachBefore = dom.attachBefore,
    addClass = dom.addClass,
    removeClass = dom.removeClass;

  var stack = [],
    isInitialized = false;

  var init = function() {
    if (!isInitialized) {
      (function renderLoop() {
        window.requestAnimationFrame(renderLoop);
        render();
      })();

      isInitialized = true;
    }
  };

  /* Bind all tooltips in the DOM */
  var bind = function(targets, options) {
    init();

    /* Merge the options argument with defaults */
    options = extend({
      container: ''
    }, options || {});

    var placeholder,
      element,
      elementStyle,
      container,
      containerStyle;

    if (!targets.length) { targets = [targets]; }
    for (var i = 0, length = targets.length; i < length; i++) {
      element = targets[i];
      elementStyle = computedStyle(element);
      element.style.width = elementStyle.width;

      /* Create a placeholder */
      placeholder = domCreate('div', 'pin-placeholder');
      placeholder.style.height = elementStyle.height;
      placeholder.style.marginTop = elementStyle.marginTop;
      placeholder.style.marginBottom = elementStyle.marginBottom;

      /* Wrap the placeholder around the element */
      domAttachBefore(element, placeholder);
      domAttach(placeholder, element);

      /* Get the container's dimensions */
      container = findParent(options.container, placeholder) || document.body;
      containerStyle = computedStyle(container);

      stack.push({
        element: element,
        originalY: computedPosition(element).top - parseFloat(elementStyle.marginTop),
        boundingY: computedPosition(container).top - parseFloat(containerStyle.marginTop) + parseFloat(containerStyle.height)
      });
    }
  };

  var render = function() {
    var pin,
      element,
      elementStyle,
      originalY,
      boundingY,
      currentY,
      pinnedBottom;

    for (var i = 0, length = stack.length; i < length; i++) {
      pin = stack[i];
      element = pin.element;
      originalY = pin.originalY;
      boundingY = pin.boundingY;

      currentY = window.pageYOffset;
      elementStyle = computedStyle(element);

      /* If the element is off-screen, don't render it */
      if (originalY > (currentY + window.innerHeight) || boundingY < currentY) {
        continue;
      }

      if (originalY < currentY) {
        addClass(element, 'pin-pinned');

        /* When the pinned element hits the bottom of the container, keep it inside */
        pinnedBottom = currentY + parseFloat(elementStyle.height) + parseFloat(elementStyle.marginTop) + parseFloat(elementStyle.marginBottom);
        element.style.top = (pinnedBottom > boundingY) ? -1 * (pinnedBottom - boundingY) + 'px' : 0;
      } else if (originalY > window.pageYOffset) {
        removeClass(element, 'pin-pinned');
      }
    }
  };

  return {
    bind: bind
  };
})(window, document);

module.exports = Pin;
