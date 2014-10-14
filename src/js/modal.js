var Modal = (function(window, document) {
  'use strict';

  var layers = [],
    body = document.body,
    request = new XMLHttpRequest(),
    isInitialized = false,
    zIndexOffset;

  var init = function() {
    if (!isInitialized) {
      /* Let <ESC> cancel the modal */
      document.addEventListener('keydown', function(e) {
        if (layers.length && e.keyCode === 27) { cancel(); }
      });

      /* Clicking the overlay cancels the modal */
      body.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('modal-overlay')) { cancel(); }
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
      height: '100%',
      width: '100%',
      onLoad: function(content) {},
      onClose: function(content) {},
      onCancel: function(content) {}
    }, options);

    var layer = createLayer(options),
      overlay = layer.overlay,
      content = layer.content;

    /* Need to append to DOM here, otherwise we can't access the 'contentWindow' of an iFrame */
    body.appendChild(layer.element);

    /* Populate the content element */
    if (target.match(/^#/)) {
      /* Using content from an existing element ID */
      var t = document.getElementById(target.replace(/^#/, ''));

      if (options.iframe) {
        content.contentWindow.document.write(t.innerHTML);
      } else {
        content.innerHTML = t.innerHTML;
      }

      options.onLoad(content);
    } else {
      /* Using content from a URL */
      if (options.iframe) {
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
    }

    /* Activate CSS transitions */
    body.classList.add('no-scroll');
    setTimeout(function() {
      overlay.classList.add('is-active');
      content.classList.add('is-active');
    }, 0);

    return layer;
  };

  /* Close the modal */
  var close = function(runCallback) {
    var layer = layers.pop(),
      overlay = layer.overlay,
      content = layer.content;

    /* Stop any existing XHR requests */
    request.abort();

    /* Make overlay and content invisible */
    content.classList.remove('is-active');
    overlay.classList.remove('is-active');
    body.classList.remove('no-scroll');

    /* Remove the modal layer from the DOM */
    overlay.addEventListener('transitionend', function() {
      if (typeof runCallback === 'undefined') { runCallback = true; }
      if (runCallback) {
        layer.options.onClose(content);
      } else {
        layer.options.onCancel(content);
      }

      body.removeChild(layer.element);
    });

    return layer;
  };

  /* Cancel the modal */
  var cancel = function() {
    return close(false);
  };

  /* Create a new modal layer and push it onto the stack */
  var createLayer = function(options) {
    var layer = document.createElement('div'),
      overlay = document.createElement('div'),
      content = (options.iframe) ? document.createElement('iframe') : document.createElement('div');

    layer.classList.add('modal-layer');
    overlay.classList.add('modal-overlay');
    content.classList.add('modal-content');

    if (typeof zIndexOffset === 'undefined') {
      body.appendChild(layer);
      zIndexOffset = parseInt(window.getComputedStyle(layer).getPropertyValue('z-index')) || 100;
      body.removeChild(layer);
    }
    overlay.style.zIndex = zIndexOffset + layers.length;
    content.style.zIndex = (zIndexOffset + 1) + layers.length;

    content.style.width = options.width;
    content.style.height = options.height;

    layer.appendChild(overlay);
    layer.appendChild(content);

    layers.push({
      element: layer,
      overlay: overlay,
      content: content,
      options: options
    });

    return layers[layers.length - 1];
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
    cancel: cancel
  };
})(window, document);

window.modal = Modal;
