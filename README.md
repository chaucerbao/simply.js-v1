# Modal.js

A Javascript modal library with just a couple options. Styling is handled in the CSS, where it should be.

## Usage

`modal.open(target[, options[, callback]]);` creates a modal, where `target` is a URL or a DOM ID, like `#my-element`.

```javascript
// Defaults
options = {
  iframe: false,
  height: '100%',
  width: '100%'
};
```

`modal.close();` closes the modal.
