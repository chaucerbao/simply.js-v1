var Simply = (function() {
  'use strict';

  return {
    modal: require('./modules/modal.js'),
    tooltip: require('./modules/tooltip.js')
  };
})();

window.simply = Simply;
