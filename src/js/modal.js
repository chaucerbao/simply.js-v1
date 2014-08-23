;(function(w, d) {
  'use strict';

  var body = d.body,
    overlay = d.createElement('div'),
    content,
    request = new XMLHttpRequest();

  /* Extend an object */
  var extend = function(out) {
    out = out || {};

    for (var i = 1; i < arguments.length; i++) {
      if (!arguments[i]) {
        continue;
      }

      for (var key in arguments[i]) {
        if (arguments[i].hasOwnProperty(key)) {
          out[key] = arguments[i][key];
        }
      }
    }

    return out;
  };

  /* The modal object */
  var modal = {
    open: function(target, options, callback) {
      /* Allow flexible arguments */
      if (typeof arguments[1] === 'function') { callback = arguments[1]; }
      if (typeof options !== 'object') { options = {}; }
      if (typeof callback !== 'function') { callback = function() {}; }

      /* Merge the given options with defaults */
      options = extend({
        iframe: false,
        height: '100%',
        width: '100%'
      }, options);

      /* Set up the content container */
      content = (options.iframe) ? d.createElement('iframe') : d.createElement('div');
      content.id = 'modal-content';
      content.style.width = options.width;
      content.style.height = options.height;
      d.body.appendChild(content);

      /* Populate the content */
      if (target.match(/^#/)) {
        /* From an element ID */
        var t = d.getElementById(target.replace(/^#/, ''));

        if (options.iframe) {
          content.contentWindow.document.write(t.innerHTML);
        } else {
          content.innerHTML = t.innerHTML;
        }

        callback();
      } else {
        /* From a URL */
        if (options.iframe) {
          content.src = target;
          content.addEventListener('load', callback);
        } else {
          /* Get the content through AJAX */
          request.open('GET', target, true);
          request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
              content.innerHTML = request.responseText;
              callback();
            } else {
              content.innerHTML = 'Unable to reach the content';
            }
          };
          request.onerror = function() {
            d.body.removeChild(content);
          };

          request.send();
        }
      }

      /* Make overlay and content visible */
      body.classList.add('no-scroll');
      overlay.classList.add('is-active');
      content.classList.add('is-active');
    },

    close: function() {
      request.abort();

      /* Make overlay and content invisible */
      content.classList.remove('is-active');
      overlay.classList.remove('is-active');
      body.classList.remove('no-scroll');

      d.body.removeChild(content);
    }
  };

  /* Set up the overlay */
  overlay.id = 'modal-overlay';
  overlay.addEventListener('click', function() { w.modal.close(); });
  d.body.appendChild(overlay);

  /* Let <ESC> close the modal */
  d.addEventListener('keydown', function(e) {
    if (d.getElementById('modal-content') && e.keyCode === 27) { w.modal.close(); }
  });

  /* Reveal the modal to global space */
  w.modal = modal;
})(window, document);
