var Modal = (function(window, document) {
  'use strict';

  var layers = [],
    body = document.body,
    request = new XMLHttpRequest(),
    isInitialized = false,
    isTransitioning = false,
    zIndexOffset;

  var init = function() {
    if (!isInitialized) {
      /* Let <ESC> cancel the modal */
      document.addEventListener('keydown', function(e) {
        if (layers.length && e.keyCode === 27) { cancel(); }
      });

      /* Clicking the overlay cancels the modal */
      body.addEventListener('click', function(e) {
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

    /* Resize the frame after content is loaded if either dimension is set to 'auto' */
    if (options.width === 'auto' || options.height === 'auto') {
      var onLoad = options.onLoad;
      options.onLoad = function(content) {
        resize(options.width, options.height, layer);
        onLoad(content);
      };
    }

    /* Need to append to DOM here, otherwise we can't access the 'contentWindow' of an iFrame */
    body.appendChild(layer.element);

    /* Populate the content element */
    if (target.match(/^([a-z]+:)?\/\//i) || target.match(/^[\w\-. ]+$/)) {
      /* Using content from a URL or file */
      if (options.iframe) {
        /* Set the iFrame source to this target */
        content.src = target;
        content.addEventListener('load', function() { options.onLoad(content); });
      } else {
        /* Get the content through AJAX */
        request.open('GET', target, true);
        request.onload = function() {
          if (request.status >= 200 && request.status < 400) {
            content.innerHTML = request.responseText;
            options.onLoad(content);
          } else {
            content.innerHTML = 'Unable to reach the content';
          }
        };
        request.onerror = function() {
          content.innerHTML = 'Unable to reach the content';
        };

        request.send();
      }
    } else {
      /* Using the content inside an element ID or the 'target' parameter value as the content */
      var html = (target.match(/^#[a-zA-Z][\w:.-]*$/)) ? document.getElementById(target.replace(/^#/, '')).innerHTML : target;

      if (options.iframe) {
        content.contentWindow.document.write(html);
      } else {
        content.innerHTML = html;
      }

      options.onLoad(content);
    }

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
    if (isTransitioning || layers.length === 0) { return; }

    var layer = layers.pop(),
      overlay = layer.overlay,
      frame = layer.frame,
      content = layer.content;

    /* Stop any existing XHR requests */
    request.abort();

    /* Make overlay and content invisible */
    frame.classList.remove('is-active');
    overlay.classList.remove('is-active');
    body.classList.remove('no-scroll');

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
    if (computed(overlay, 'transition-duration') === '0s') {
      cleanUp(runCallback);
    } else {
      isTransitioning = true;
      overlay.addEventListener('transitionend', function() {
        isTransitioning = false;
        cleanUp(runCallback);
      });
    }

    return layer;
  };

  /* Cancel the modal */
  var cancel = function() {
    return close(false);
  };

  /* Generate a new modal layer */
  var createLayer = function(options) {
    var element = document.createElement('div'),
      overlay = document.createElement('div'),
      frame = document.createElement('div'),
      content = (options.iframe) ? document.createElement('iframe') : document.createElement('div'),
      cancel = document.createElement('a');

    /* Add classes to each element */
    element.classList.add('modal-layer');
    overlay.classList.add('modal-overlay', 'modal-cancel');
    frame.classList.add('modal-frame');
    content.classList.add('modal-content');
    cancel.classList.add('modal-cancel');

    cancel.setAttribute('href', '#cancel');

    /* Calculate the z-index for the layer */
    if (typeof zIndexOffset === 'undefined') {
      body.appendChild(element);
      zIndexOffset = parseInt(computed(element, 'z-index')) || 100;
      body.removeChild(element);
    }
    overlay.style.zIndex = zIndexOffset + layers.length;
    frame.style.zIndex = (zIndexOffset + 1) + layers.length;

    /* Construct the layer element */
    element.appendChild(overlay);
    element.appendChild(frame);
    frame.appendChild(content);
    frame.appendChild(cancel);

    /* Set the initial frame dimensions */
    if (options.iframe) {
      /* The iFrame dimensions of 300x150 are CSS2 standard dimensions for 'auto' width/height */
      if (options.width === 'auto') { frame.style.width = '300px'; }
      if (options.height === 'auto') { frame.style.height = '150px'; }
    }
    if (options.width !== 'auto') { frame.style.width = options.width; }
    if (options.height !== 'auto') { frame.style.height = options.height; }

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
    if (typeof layer === 'undefined') {
      if (layers.length === 0) { return; }
      layer = layers[layers.length - 1];
    }

    var options = layer.options,
      content = (options.iframe) ? layer.content.contentWindow.document.body : layer.content,
      frame = layer.frame;

    /* If width/height is set to 'auto', find the dimensions of the contents */
    content.classList.add('dimensions');
    if (width === 'auto') { width = (options.iframe) ? content.scrollWidth + 'px' : computed(content, 'width'); }
    if (height === 'auto') { height = (options.iframe) ? content.scrollHeight + 'px' : computed(content, 'height'); }
    content.classList.remove('dimensions');

    frame.style.width = width;
    frame.style.height = height;

    return {
      width: width,
      height: height
    };
  };

  /* Get the computed value for a style property */
  var computed = function(element, property) {
    return window.getComputedStyle(element).getPropertyValue(property);
  };

  /* Extend an object */
  var extend = function(out) {
    out = out || {};

    for (var i = 1, length = arguments.length; i < length; i++) {
      if (!arguments[i]) { continue; }

      for (var key in arguments[i]) {
        if (arguments[i].hasOwnProperty(key)) { out[key] = arguments[i][key]; }
      }
    }

    return out;
  };

  return {
    open: open,
    close: close,
    cancel: cancel,
    resize: resize
  };
})(window, document);

window.modal = Modal;
