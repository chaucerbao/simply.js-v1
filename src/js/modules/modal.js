var Modal = (function(window, document) {
  'use strict';

  var extend = require('../lib/extend.js'),
    computedStyle = require('../lib/computed-style.js'),
    load = require('../lib/load.js');

  var layers = [],
    body = document.body,
    isInitialized = false,
    isTransitioning = false,
    zIndexOffset;

  var init = function() {
    if (!isInitialized) {
      /* Let <ESC> cancel the modal */
      document.addEventListener('keydown', function(e) {
        if (e.keyCode === 27 && layers.length) { cancel(); }
      });

      /* Clicking the overlay cancels the modal */
      body.addEventListener(('ontouchend' in window) ? 'touchend' : 'click', function(e) {
        if (e.target && e.target.classList.contains('modal-cancel')) {
          e.preventDefault();
          cancel();
        }
      });

      isInitialized = true;
    }
  };

  /* Open a modal */
  var open = function(target, options) {
    init();

    /* Merge the options argument with defaults */
    if (typeof options !== 'object') { options = {}; }
    options = extend({
      class: '',
      iframe: false,
      height: 'auto',
      width: 'auto',
      onLoad: function() {},
      onClose: function() {},
      onCancel: function() {}
    }, options);

    var layer = createLayer(options),
      overlay = layer.overlay,
      frame = layer.frame,
      content = layer.content;

    /* Resize the frame after content is loaded in case width/height is set to 'auto' */
    var onLoad = options.onLoad;
    options.onLoad = function(content) {
      resize(options.width, options.height, layer);
      onLoad(content);
    };

    /* Need to append to DOM here, otherwise we can't access the 'contentWindow' of an iFrame */
    body.appendChild(layer.element);

    /* Populate the content element */
    load(content, target).then(function() {
      options.onLoad(content);
    }, function(error) {
      console.log(error.message);
    });

    /* Activate CSS transitions */
    body.classList.add('no-scroll');
    setTimeout(function() {
      overlay.classList.add('is-active');
      frame.classList.add('is-active');
    }, 0);

    /* Add layer to the stack */
    layers.push(layer);

    return layer;
  };

  /* Close the modal */
  var close = function(runCallback) {
    /* Return immediately if there are no layers (a user may click the overlay/cancel while it's still transitioning out) */
    if (isTransitioning || !layers.length) { return; }

    var layer = layers.pop(),
      overlay = layer.overlay,
      frame = layer.frame,
      content = layer.content;

    /* Remove the modal layer from the DOM */
    var cleanUp = function(runCallback) {
      if (typeof runCallback === 'undefined') { runCallback = true; }
      if (runCallback) {
        layer.options.onClose(content);
      } else {
        layer.options.onCancel(content);
      }

      body.removeChild(layer.element);
    };
    if (computedStyle(overlay).transitionDuration === '0s') {
      cleanUp(runCallback);
    } else {
      isTransitioning = true;

      overlay.addEventListener('transitionend', function() {
        isTransitioning = false;
        cleanUp(runCallback);
      });

      /* Activate CSS transitions */
      frame.classList.remove('is-active');
      overlay.classList.remove('is-active');
    }

    body.classList.remove('no-scroll');

    return layer;
  };

  /* Cancel the modal */
  var cancel = function() {
    return close(false);
  };

  /* Generate a new modal layer */
  var createLayer = function(options) {
    var width = options.width,
      height = options.height,
      isFrame = options.iframe,
      element = document.createElement('div'),
      overlay = document.createElement('div'),
      frame = document.createElement('div'),
      content = (isFrame) ? document.createElement('iframe') : document.createElement('div'),
      cancel = document.createElement('a');

    /* Add classes to each element */
    element.classList.add('modal-layer');
    overlay.classList.add('modal-overlay', 'modal-cancel');
    frame.classList.add('modal-frame');
    content.classList.add('modal-content');
    cancel.classList.add('modal-cancel');
    if (options.class.length) { element.classList.add(options.class); }

    cancel.setAttribute('href', '#cancel');

    /* Calculate the z-index for the layer */
    if (!zIndexOffset) {
      body.appendChild(element);
      zIndexOffset = parseInt(computedStyle(element).zIndex) || 100;
      body.removeChild(element);
    }
    overlay.style.zIndex = zIndexOffset + layers.length;
    frame.style.zIndex = (zIndexOffset + 1) + layers.length;

    /* Construct the layer element */
    element.appendChild(overlay);
    element.appendChild(frame);
    if (isFrame && /iP(ad|hone|od)/.test(navigator.userAgent)) {
      /* iOS Safari needs this extra layer to allow proper rendering and scrolling of iFrames : http://stackoverflow.com/questions/23337986/iframe-modal-scrolling-on-ipad-iphone */
      var boundry = document.createElement('div');
      boundry.classList.add('modal-boundry');
      frame.appendChild(boundry);
      boundry.appendChild(content);
    } else {
      frame.appendChild(content);
    }
    frame.appendChild(cancel);

    /* Set the initial frame dimensions (the iFrame dimensions of 300x150 are CSS2 standard dimensions for 'auto' width/height) */
    if (width === 'auto' && isFrame) { width = '300px'; }
    if (height === 'auto' && isFrame) { height = '150px'; }

    frame.style.width = width;
    frame.style.height = height;

    return {
      element: element,
      overlay: overlay,
      frame: frame,
      content: content,
      options: options
    };
  };

  /* Resize a modal */
  var resize = function(width, height, layer) {
    if (!layer) {
      if (!layers.length) { return; }
      layer = layers[layers.length - 1];
    }

    var isFrame = layer.options.iframe,
      content = (isFrame) ? layer.content.contentWindow.document.body : layer.content,
      frame = layer.frame;

    /* If width/height is set to 'auto', find the dimensions of the contents */
    if (isFrame) {
      if (width === 'auto') { width = content.scrollWidth + 'px'; }
      if (height === 'auto') { height = content.scrollHeight + 'px'; }
    } else {
      content.classList.add('dimensions');

      var dimensions = content.getBoundingClientRect();
      if (width === 'auto') { width = dimensions.width + 'px'; }
      if (height === 'auto') { height = dimensions.height + 'px'; }

      content.classList.remove('dimensions');
    }

    frame.style.width = width;
    frame.style.height = height;

    return {
      width: width,
      height: height
    };
  };

  return {
    open: open,
    close: close,
    cancel: cancel,
    resize: resize
  };
})(window, document);

module.exports = Modal;
