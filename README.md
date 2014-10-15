# Modal.js
A JavaScript modal library with just a few options.

## Features
* Style the modal and/or add animations with CSS3
* Stack modals on top of each other (go nuts!)
* Load content inline or inside an iframe

## Usage
**modal.open(target[, options])**

Creates a new modal, where `target` can be a URL or an element ID.

```javascript
/* Example */
modal.open('#my-dom-element', {
  iframe: true,
  onLoad: function(content) { console.log('Content is available.'); },
  onClose: function() { console.log('Closed this modal.'); }
});
```

There are a few options you can use to customize the modal.

```javascript
// Default options
options = {
  iframe: false,
  height: '100%',
  width: '100%',
  onLoad: function(content) {},
  onClose: function(content) {},
  onCancel: function(content) {}
};
```

---

**modal.close()**

Closes the latest modal and runs the `onClose` callback. Should be called programmatically after a successful user action. You may use the callback to access information inside the modal (e.g. append form data from inside the modal to a table on the outside).

---

**modal.cancel()**

Closes the latest modal and runs the `onCancel` callback. An opened modal can be canceled by pressing the `ESC` key or by clicking anywhere in the overlay.
