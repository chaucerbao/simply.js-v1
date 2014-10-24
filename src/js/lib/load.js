var Load = (function(document, Promise) {
  'use strict';

  var ajax = require('./ajax.js');

  var load = function(element, target) {
    var isFrame = (element.tagName === 'IFRAME');

    return new Promise(function(resolve, reject) {
      /* Populate the element with content */
      if (target.match(/^([a-z]+:)?\/\//i) || target.match(/^[\w\-. \/]+$/)) {
        /* From a URL or file */
        if (isFrame) {
          element.addEventListener('load', function() { resolve(element); });
          element.src = target;
        } else {
          ajax.get(target).then(function(response) {
            element.innerHTML = response.responseText;
            resolve(element);
          }, function(error) {
            reject(error);
          });
        }
      } else {
        /* From an element ID or the literal value of 'target' */
        var html = (target.match(/^#-?[_a-z]+[_a-z0-9-]*$/i)) ? document.getElementById(target.replace(/^#/, '')).innerHTML : target;

        if (isFrame) {
          element.contentWindow.document.write(html);
        } else {
          element.innerHTML = html;
        }

        resolve(element);
      }
    });

  };

  return load;
})(document, Promise);

module.exports = Load;
