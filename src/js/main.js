var Simply = (function() {
  'use strict';

  return {
    /* Libs */
    select: require('./lib/selector.js'),
    ajax: require('./lib/ajax.js'),

    /* Modules */
    modal: require('./modules/modal.js'),
    pin: require('./modules/pin.js'),
    tooltip: require('./modules/tooltip.js')
  };
})();

window.simply = Simply;
