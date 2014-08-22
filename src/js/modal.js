(function(d, w) {
  var body = d.body,
    overlay = d.createElement('div'),
    content,
    request = new XMLHttpRequest();

  /* Set up the overlay */
  overlay.id = 'modal-overlay';
  overlay.addEventListener('click', function() {
    modal.close();
  });
  d.body.appendChild(overlay);

  var extend = function(out) {
    out = out || {};

    for (var i = 1; i < arguments.length; i++) {
      if (!arguments[i])
        continue;

      for (var key in arguments[i]) {
        if (arguments[i].hasOwnProperty(key))
          out[key] = arguments[i][key];
      }
    }

    return out;
  };

  w.modal = {
    open: function(target, options) {
      options = extend({
        iframe: false
      }, options);

      content = (options.iframe) ? d.createElement('iframe') : d.createElement('div');
      content.id = 'modal-content';
      d.body.appendChild(content);

      /* Populate the content */
      if (target.match(/^#/)) {
        /* An ID */
        var t = d.getElementById(target.replace(/^#/, ''));

        if (options.iframe) {
          content.contentWindow.document.write(t.innerHTML);
        } else {
          content.innerHTML = t.innerHTML;
        }
      } else {
        /* A URL */
        if (options.iframe) {
          content.src = target;
        } else {
          /* AJAX */
          request.open('GET', target, true);
          request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
              /* Success */
              content.innerHTML = request.responseText;
            } else {
              /* Server returned an error */
              content.innerHTML = 'Unable to reach the content';
            }

            /* Center the content vertically */
            content.style.top = (w.innerHeight - content.offsetHeight) / 2 + 'px';
          };
          request.onerror = function() {
            // There was a connection error of some sort
            d.body.removeChild(content);
          };

          request.send();
        }
      }

      /* Center the content vertically */
      content.style.top = (w.innerHeight - content.offsetHeight) / 2 + 'px';

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
})(document, window);
