# Modal.js
A JavaScript modal library for developers who need to customize their modal designs. It handles the modal, and leaves the styling up to you.

## Features
* No dependencies, 3.5kb minified, 1.5kb minified + gzip'd
* Style the modal and add animations with CSS3
* Stack modals on top of each other (go nuts!)
* Load content directly inline or use an iframe
* Automatically resize the modal to match the content width/height

## Usage
Include `modal.css` in your page and take a look at `customize.css` and/or use it as a template for your own designs.

---

**modal.open(target[, options])**

Creates a new modal, where `target` can be a URL, an element ID, or literal HTML (great for using with template libraries).

```javascript
/* Example */
modal.open('#my-dom-element', {
  class: 'my-class',
  iframe: true,
  width: '80%',
  height: '80%',
  onLoad: function() { console.log('Content is available.'); },
  onClose: function() { console.log('Closed this modal.'); }
});
```

There are a few options you can use to customize the modal.

```javascript
// Default options
options = {
  class: '',
  iframe: false,
  height: 'auto',
  width: 'auto',
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

---

**modal.resize(width, height)**

Resizes the modal window to the specified width and height. A value of 'auto' for either dimension will attempt to resize that dimension to the content's width/height.
