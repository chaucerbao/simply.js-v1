var Modal = (function(window, document) {
  'use strict';

  var extend = require('../lib/extend.js'),
    computedStyle = require('../lib/computed-style.js'),
    load = require('../lib/load.js'),
    dom = require('../lib/dom.js'),
    domCreate = dom.create,
    domAttach = dom.attach,
    domDetach = dom.detach,
    addClass = dom.addClass,
    removeClass = dom.removeClass,
    hasClass = dom.hasClass;

  var layers = [],
    body = document.body,
    isInitialized = false,
    zIndexOffset;

  var init = function() {
    if (!isInitialized) {
      /* Let <ESC> cancel the modal */
      document.addEventListener('keydown', function(e) {
        if (e.keyCode === 27 && layers.length) { cancel(); }
      });

      /* Clicking the overlay cancels the modal */
      body.addEventListener(('ontouchend' in window) ? 'touchend' : 'click', function(e) {
        var element = e.target;
        if (element && hasClass(element, 'modal-cancel')) {
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
    options = extend({
      class: '',
      iframe: false,
      height: 'auto',
      width: 'auto',
      onLoad: function() {},
      onClose: function() {},
      onCancel: function() {}
    }, options || {});

    var layer = createLayer(options),
      overlay = layer.overlay,
      frame = layer.frame,
      content = layer.content;

    /* Need to append to DOM here, otherwise we can't access the 'contentWindow' of an iFrame */
    domAttach(body, layer.element);

    /* Populate the content element */
    load(content, target).then(function() {
      resize(options.width, options.height, layer);
      options.onLoad(content);
    }, function(error) {
      console.log(error.message);
    });

    /* Activate CSS transitions */
    addClass(body, 'no-scroll');
    setTimeout(function() {
      addClass(overlay, 'is-active');
      addClass(frame, 'is-active');
    }, 0);

    /* Add layer to the stack */
    layers.push(layer);

    return layer;
  };

  /* Close the modal */
  var close = function(isClosed) {
    var layer = topLayer();

    /* Return immediately if there are no layers (a user may click the overlay/cancel while it's still transitioning out) */
    if (!layer || layer.isTransitioning) { return; }
    layer.isTransitioning = true;

    var overlay = layer.overlay,
      frame = layer.frame,
      content = layer.content,
      options = layer.options,
      overlayStyle = computedStyle(overlay),
      transitionsTotal = (overlayStyle.transitionDuration === '0s') ? 0 : overlayStyle.transitionProperty.split(',').length;

    if (!transitionsTotal) {
      destroyLayer();
    } else {
      var transitionCount = 0;

      overlay.addEventListener('transitionend', function() {
        transitionCount++;

        if (transitionCount === transitionsTotal) {
          if (typeof isClosed === 'undefined') { isClosed = true; }

          /* Run the callback */
          if (isClosed) {
            options.onClose(content);
          } else {
            options.onCancel(content);
          }

          destroyLayer();
        }
      });

      /* Activate CSS transitions */
      removeClass(frame, 'is-active');
      removeClass(overlay, 'is-active');
    }

    removeClass(body, 'no-scroll');

    return layer;
  };

  /* Cancel the modal */
  var cancel = function() {
    return close(false);
  };

  /* Resize a modal */
  var resize = function(width, height, layer) {
    layer = layer || topLayer();

    var isFrame = layer.options.iframe,
      content = (isFrame) ? layer.content.contentWindow.document.body : layer.content,
      frame = layer.frame,
      frameStyle = frame.style;

    /* If width/height is set to 'auto', find the dimensions of the contents */
    addClass(content, 'dimensions');
    var dimensions = content.getBoundingClientRect();
    if (width === 'auto') { width = (isFrame ? content.scrollWidth : dimensions.width) + 'px'; }
    if (height === 'auto') { height = (isFrame ? content.scrollHeight : dimensions.height) + 'px'; }
    removeClass(content, 'dimensions');

    frameStyle.width = width;
    frameStyle.height = height;

    return {
      width: width,
      height: height
    };
  };

  /* Generate a new modal layer */
  var createLayer = function(options) {
    var width = options.width,
      height = options.height,

      isFrame = options.iframe,
      customClass = options.class,

      element = domCreate('div', 'modal-layer'),
      overlay = domCreate('div', ['modal-overlay', 'modal-cancel']),
      frame = domCreate('div', 'modal-frame'),
      content = (isFrame) ? domCreate('iframe') : domCreate('div'),
      cancel = domCreate('a', 'modal-cancel');

    addClass(content, 'modal-content');
    cancel.setAttribute('href', '#cancel');
    if (customClass.length) { addClass(element, customClass); }

    /* Calculate the z-index for the layer */
    if (!zIndexOffset) {
      domAttach(body, element);
      zIndexOffset = parseInt(computedStyle(element).zIndex) || 100;
      domDetach(body, element);
    }
    overlay.style.zIndex = zIndexOffset + layers.length;
    frame.style.zIndex = zIndexOffset + layers.length + 1;

    /* Construct the layer element */
    domAttach(element, overlay);
    domAttach(element, frame);
    if (isFrame && /iP(ad|hone|od)/.test(navigator.userAgent)) {
      /* iOS Safari needs this extra layer to allow proper rendering and scrolling of iFrames : http://stackoverflow.com/questions/23337986/iframe-modal-scrolling-on-ipad-iphone */
      var boundry = domCreate('div', 'modal-boundry');
      domAttach(frame, boundry);
      domAttach(boundry, content);
    } else {
      domAttach(frame, content);
    }
    domAttach(frame, cancel);

    /* Set the initial frame dimensions (the iFrame dimensions of 300x150 are CSS2 standard dimensions for 'auto' width/height) */
    if (isFrame && width === 'auto') { width = '300px'; }
    if (isFrame && height === 'auto') { height = '150px'; }

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

  /* Remove a modal layer from the DOM */
  var destroyLayer = function() {
    var layer = layers.pop();
    domDetach(body, layer.element);
  };

  /* Get the top modal layer on the stack */
  var topLayer = function() {
    var count = layers.length;
    return (count) ? layers[count - 1] : null;
  };

  return {
    open: open,
    close: close,
    cancel: cancel,
    resize: resize
  };
})(window, document);

module.exports = Modal;
