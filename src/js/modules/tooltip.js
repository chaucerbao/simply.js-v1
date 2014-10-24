var Tooltip = (function(window, document) {
  'use strict';

  var extend = require('../lib/extend.js'),
    computedStyle = require('../lib/computed-style.js'),
    load = require('../lib/load.js'),
    select = require('../lib/selector.js');

  var body = document.body,
    isInitialized = false,
    optionSets = [],
    moveEvent;

  var init = function() {
    if (!isInitialized) {
      /* Search parent elements recursively for the tooltip trigger */
      var findTrigger = function(element) {
        /* When mousing in/out of the browser window, you might hit an empty 'relatedTarget' */
        if (!element || element === document.documentElement) { return false; }
        if (element.classList.contains('tooltip-trigger')) { return element; }
        return findTrigger(element.parentNode);
      };

      /* Mousing over a tooltip shows its contents */
      body.addEventListener('mouseover', function(e) {
        var trigger = findTrigger(e.target);
        if (trigger) { show(trigger); }
      });

      /* Mousing out of a tooltip hides its contents */
      body.addEventListener('mouseout', function(e) {
        var trigger = findTrigger(e.target),
          related = findTrigger(e.relatedTarget);
        if (typeof trigger === 'object' && trigger !== related) { hide(trigger); }
      });

      /* Moving the mouse over a trigger will update the tooltip's position */
      var activeTooltip;
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

    var target;

    /* Merge the options argument with defaults */
    if (typeof options !== 'object') { options = {}; }
    options = extend({
      class: '',
      cache: false,
      iframe: false,
      position: 'top right cursor',
      onLoad: function() {},
      onHide: function() {}
    }, options);

    optionSets.push(options);

    if (!targets.length) { targets = [targets]; }
    for (var i = 0, length = targets.length; i < length; i++) {
      target = targets[i];

      target.classList.add('tooltip-trigger');
      target.setAttribute('data-tooltip-options', optionSets.length);
    }
  };

  /* Show the tooltip */
  var show = function(trigger) {
    var content = select('.tooltip-content', trigger),
      options = loadOptions(trigger),
      tooltip = (content.length) ? content[0] : createTooltip(options),
      target;

    if (!content.length) {
      /* Reposition the tooltip after content is loaded */
      var onLoad = options.onLoad;
      options.onLoad = function(tooltip) {
        /* Explicitly set the tooltip's dimensions to its content's size, so it doesn't resize when the position changes */
        tooltip.classList.add('dimensions');

        var dimensions = tooltip.getBoundingClientRect();
        tooltip.style.width = dimensions.width + 'px';
        tooltip.style.height = dimensions.height + 'px';

        tooltip.classList.remove('dimensions');

        onLoad(tooltip);
      };

      /* Need to append to DOM here, otherwise we can't access the 'contentWindow' of an iFrame */
      trigger.appendChild(tooltip);

      target = trigger.getAttribute('data-tooltip');

      /* Populate the tooltip with content */
      load(tooltip, target).then(function() {
        options.onLoad(tooltip);
      }, function(error) {
        console.log(error.message);
      });

    }

    /* Activate CSS transitions */
    tooltip.removeEventListener('transitionend', removeTooltip);
    setTimeout(function() { tooltip.classList.add('is-active'); }, 0);

    return tooltip;
  };

  /* Hide the tooltip */
  var hide = function(trigger) {
    var tooltip = select('.tooltip-content.is-active', trigger)[0];

    /* When hide() is triggered in quick succession, the cleanUp() from a previous call may remove the element before the current call completes */
    if (!tooltip) { return; }

    /* Remove the tooltip from the DOM */
    if (computedStyle(tooltip).transitionDuration === '0s') {
      removeTooltip(tooltip);
    } else {
      tooltip.addEventListener('transitionend', removeTooltip);
      tooltip.classList.remove('is-active');
    }
  };

  /* Generate a new tooltip */
  var createTooltip = function(options) {
    var tooltip = (options.iframe) ? document.createElement('iframe') : document.createElement('div');

    /* Add classes to each element */
    tooltip.classList.add('tooltip-content');
    if (options.class.length) { tooltip.classList.add(options.class); }

    return tooltip;
  };

  /* Remove an existing tooltip */
  var removeTooltip = function(tooltip) {
    tooltip = this || tooltip;

    var trigger = tooltip.parentNode,
      options = loadOptions(trigger);

    options.onHide(tooltip);

    if (!options.cache) { trigger.removeChild(tooltip); }

    /* Only run this callback once, in case of multiple transitions */
    tooltip.removeEventListener('transitionend', removeTooltip);
  };

  var reposition = function(tooltip) {
    if (!tooltip || !tooltip.parentNode) { return; }

    var trigger = tooltip.parentNode,
      options = loadOptions(trigger),
      positions = options.position.split(' '),
      style = computedStyle(tooltip),
      self, parent, top, left, offset, i, length;

    self = tooltip.getBoundingClientRect();
    parent = trigger.getBoundingClientRect();

    /* Center the tooltip by default, and allow the options to override */
    top = -(self.height - parent.height) / 2;
    left = -(self.width - parent.width) / 2;

    /* Update the position based on the options  */
    for (i = 0, length = positions.length; i < length; i++) {
      switch (positions[i]) {
        case 'top': top = -(self.height + parseFloat(style.marginBottom)); break;
        case 'bottom': top = (parent.height + parseFloat(style.marginTop)); break;
        case 'left': left = -(self.width + parseFloat(style.marginRight)); break;
        case 'right': left = (parent.width + parseFloat(style.marginLeft)); break;
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
