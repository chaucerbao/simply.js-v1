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
        if (e.target && e.target.classList.contains('modal-cancel')) { cancel(); }
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
      frame = layer.frame,
      content = layer.content;

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
    if (layers.length === 0) return;

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
      zIndexOffset = parseInt(window.getComputedStyle(element).getPropertyValue('z-index')) || 100;
      body.removeChild(element);
    }
    overlay.style.zIndex = zIndexOffset + layers.length;
    frame.style.zIndex = (zIndexOffset + 1) + layers.length;

    /* Apply width/height dimensions to the frame */
    frame.style.width = options.width;
    frame.style.height = options.height;

    /* Construct the layer element */
    element.appendChild(overlay);
    element.appendChild(frame);
    frame.appendChild(content);
    frame.appendChild(cancel);

    return {
      element: element,
      overlay: overlay,
      frame: frame,
      content: content,
      options: options
    };
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
