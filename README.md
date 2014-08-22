# Modal.js

A Javascript modal library with one option. Styling is handled in the CSS.

## Usage

`modal.open(target, options);` creates a modal, where `target` is a URL or a DOM ID, like `#my-element`.

```javascript
// Defaults
options = {
  iframe: false
};
```

`modal.close();` closes the modal.
