# Modal.js

A Javascript modal library with just a couple options. Styling is handled in the CSS.

## Usage

`modal.open(target[, options]);` creates a modal, where `target` is a URL or a DOM ID, like `#my-element`.

```javascript
// Defaults
options = {
  iframe: false,
  height: '100%',
  width: '100%',
  onLoad: function(content) {},
  onClose: function(content) {},
  onCancel: function(content) {}
};
```

`modal.close();` closes the modal and runs the `onClose` callback.

`modal.cancel();` closes the modal and runs the `onCancel` callback.
