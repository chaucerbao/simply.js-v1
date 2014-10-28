var Tooltip = (function(window, document) {
  'use strict';

  var extend = require('../lib/extend.js'),
    computedStyle = require('../lib/computed-style.js'),
    load = require('../lib/load.js'),
    select = require('../lib/selector.js'),
    dom = require('../lib/dom.js'),
    domCreate = dom.create,
    domAttach = dom.attach,
    domDetach = dom.detach,
    addClass = dom.addClass,
    removeClass = dom.removeClass,
    hasClass = dom.hasClass;

  var optionSets = [],
    body = document.body,
    isInitialized = false,
    activeTooltip,
    moveEvent;

  var init = function() {
    if (!isInitialized) {
      /* Search parent elements recursively for the tooltip trigger */
      var findTrigger = function(element) {
        /* When mousing in/out of the browser window, you might hit an empty 'relatedTarget' */
        if (!element || element === document.documentElement) { return null; }
        if (hasClass(element, 'tooltip-trigger')) { return element; }
        return findTrigger(element.parentNode);
      };

      /* Mousing over a tooltip shows its contents */
      body.addEventListener('mouseover', function(e) {
        var element = e.target,
          trigger = findTrigger(element);

        if (trigger) {
          var related = findTrigger(e.relatedTarget),
            isInteractive = loadOptions(trigger).interactive;

            if (hasClass(element, 'tooltip-trigger') || (trigger === related && isInteractive)) {
              show(trigger);
            }
        }
      });

      /* Mousing out of a tooltip hides its contents */
      body.addEventListener('mouseout', function(e) {
        var trigger = findTrigger(e.target);

        if (trigger) {
          var related = findTrigger(e.relatedTarget),
            isInteractive = loadOptions(trigger).interactive;

          if (!(trigger === related && isInteractive)) {
            hide(trigger);
          }
        }
      });

      /* Moving the mouse over a trigger will update the tooltip's position */
      body.addEventListener('mousemove', function(e) {
        var trigger = findTrigger(e.target);
        moveEvent = e;
        activeTooltip = (trigger) ? select('.tooltip-content.is-active', trigger)[0] : null;
      });

      (function renderLoop() {
        window.requestAnimationFrame(renderLoop);
        reposition(activeTooltip);
      })();

      isInitialized = true;
    }
  };

  /* Bind all tooltips in the DOM */
  var bind = function(targets, options) {
    init();

    /* Merge the options argument with defaults */
    options = extend({
      class: '',
      cache: false,
      iframe: false,
      interactive: false,
      position: 'top right cursor',
      onLoad: function() {},
      onHide: function() {}
    }, options || {});

    optionSets.push(options);

    if (!targets.length) { targets = [targets]; }
    for (var i = 0, length = targets.length; i < length; i++) {
      addClass(targets[i], 'tooltip-trigger');
      targets[i].setAttribute('data-tooltip-options', optionSets.length);
    }
  };

  /* Show the tooltip associated with the trigger */
  var show = function(trigger) {
    var content = select('.tooltip-content', trigger),
      options = loadOptions(trigger),
      tooltip = (content.length) ? content[0] : createTooltip(options);

    /* Unset the 'unload' event handler */
    tooltip.removeEventListener('transitionend', unload);

    if (!content.length) {
      /* Need to append to DOM here, otherwise we can't access the 'contentWindow' of an iFrame */
      domAttach(trigger, tooltip);

      /* Populate the tooltip with content */
      load(tooltip, trigger.getAttribute('data-tooltip')).then(function() {
        /* Explicitly set the tooltip's dimensions to its content's size, so it doesn't resize when the position changes */
        addClass(tooltip, 'dimensions');
        var dimensions = tooltip.getBoundingClientRect();
        tooltip.style.width = dimensions.width + 'px';
        tooltip.style.height = dimensions.height + 'px';
        removeClass(tooltip, 'dimensions');

        /* Reposition the tooltip after dimensions are calculated */
        reposition(tooltip);

        options.onLoad(tooltip);
      }, function(error) {
        console.log(error.message);
      });
    }

    /* Activate CSS transitions */
    setTimeout(function() { addClass(tooltip, 'is-active'); }, 0);

    return tooltip;
  };

  /* Hide the tooltip associated with the trigger */
  var hide = function(trigger) {
    var tooltip = select('.tooltip-content.is-active', trigger)[0];
    if (!tooltip) { return; }

    /* Get the total number of transitions to expect */
    if (!tooltip.transitionsTotal) {
      var tooltipStyle = computedStyle(tooltip);
      tooltip.transitionsTotal = (tooltipStyle.transitionDuration === '0s') ? 0 : tooltipStyle.transitionProperty.split(',').length;
    }

    if (!tooltip.transitionsTotal) {
      unload(tooltip);
    } else {
      delete tooltip.transitionCount;
      tooltip.addEventListener('transitionend', unload);
    }

    /* Activate CSS transitions */
    removeClass(tooltip, 'is-active');
  };

  var unload = function(tooltip) {
    tooltip = this || tooltip;

    var transitionCount = tooltip.transitionCount || 0,
      transitionsTotal = tooltip.transitionsTotal;

    /* Count the number of transitions that have occurred */
    tooltip.transitionCount = ++transitionCount;

    /* When the total is reached, unload the tooltip */
    if (transitionCount === transitionsTotal || !transitionsTotal) {
      var trigger = tooltip.parentNode,
        options = loadOptions(trigger);

      options.onHide(tooltip);

      if (!options.isCached) { domDetach(trigger, tooltip); }
    }
  };

  /* Generate a new tooltip */
  var createTooltip = function(options) {
    var tooltip = (options.iframe) ? domCreate('iframe') : domCreate('div'),
      customClass = options.class;

    addClass(tooltip, 'tooltip-content');
    if (customClass.length) { addClass(tooltip, customClass); }

    return tooltip;
  };

  var reposition = function(tooltip) {
    if (!tooltip || !tooltip.parentNode) { return; }

    var trigger = tooltip.parentNode,
      options = loadOptions(trigger),
      positions = options.position.split(' '),
      tooltipStyle = computedStyle(tooltip),
      self, parent, top, left, offset, i, length;

    self = tooltip.getBoundingClientRect();
    parent = trigger.getBoundingClientRect();

    /* Center the tooltip by default, and allow the options to override */
    top = -(self.height - parent.height) / 2;
    left = -(self.width - parent.width) / 2;

    /* Update the position based on the options  */
    for (i = 0, length = positions.length; i < length; i++) {
      switch (positions[i]) {
        case 'top': top = -(self.height + parseFloat(tooltipStyle.marginBottom)); break;
        case 'bottom': top = (parent.height + parseFloat(tooltipStyle.marginTop)); break;
        case 'left': left = -(self.width + parseFloat(tooltipStyle.marginRight)); break;
        case 'right': left = (parent.width + parseFloat(tooltipStyle.marginLeft)); break;
      }
    }

    if (/cursor/.test(options.position)) {
      var e = moveEvent;
      for (i = 0, length = positions.length; i < length; i++) {
        switch (positions[i]) {
          case 'top': top -= window.scrollY + parent.top - e.pageY; break;
          case 'bottom': top -= window.scrollY + parent.top + parent.height - e.pageY; break;
          case 'left': left -= window.scrollX + parent.left - e.pageX; break;
          case 'right': left -= window.scrollX + parent.left + parent.width - e.pageX; break;
        }
      }
    }

    /* Keep the tooltip within the viewport, favoring the top and left to be visible (the order of these matter) */
    offset = parent.top + top + self.height - document.documentElement.clientHeight;
    if (offset > 0) { top -= offset; }
    offset = parent.top + top;
    if (offset < 0) { top -= offset; }
    offset = parent.left + left + self.width - document.documentElement.clientWidth;
    if (offset > 0) { left -= offset; }
    offset = parent.left + left;
    if (offset < 0) { left -= offset; }

    /* Update the tooltip position */
    tooltip.style.top = top + 'px';
    tooltip.style.left = left + 'px';
  };

  /* Get the options associated with a trigger */
  var loadOptions = function(trigger) {
    return optionSets[parseInt(trigger.getAttribute('data-tooltip-options')) - 1];
  };

  return {
    bind: bind
  };
})(window, document);

module.exports = Tooltip;
