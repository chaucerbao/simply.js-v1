# Simply.js
A simple library of common front-end modules where styling and animation are done through your own CSS. How often have you gotten a design where the modal/tooltip/etc match the design of some existing third-party library? Designers have their own ideas about what these should look like and how they should animate.

## Features
* No dependencies
* Small footprint
* Style and animation are controlled by your own CSS (examples included)

## Usage

### Select
A helper to find elements in the DOM.

```js
simply.select.find(target[, context])
```

Basically, a shortcut for `querySelectorAll()` with minor speed optimizations when possible.

```js
simply.select.findParent(target, element)
```

Finds an `element`'s nearest parent that matches the `target` ('#id', '.class', or 'tag').

### Ajax
A helper to make AJAX calls. Returns a promise, defined by Promises/A+, and passes the response to the callback.

```js
simply.ajax.get(url)
```

Issues an HTTP GET on a `url`.

### Modal
A modal library that supports having multiple layers of modals.

```js
simply.modal.open(target[, options])
```

Opens a modal containing the `target` ('#id', 'http://url/', '&lt;span&gt;Inline HTML&lt;/span&gt;') content.

```js
simply.modal.close()
```

Closes the modal on the top layer and runs the `onClose` callback. Programmatically call this function when a user successfully completes a desired action and you want to process the input.

```js
simply.modal.cancel()
```

Closes the modal on the top layer and runs the `onCancel` callback. Pressing ESC or clicking anywhere on the overlay will cancel that layer's modal.

```js
simply.modal.resize(width, height)
```

Resizes the modal on the top layer.

### Pin
A library that pins an element onto the top of the viewport when scrolling past. It can be confined within a container.


```js
simply.pin.bind(targets[, options])
```

Pins the `targets` (DOM element(s)) onto the viewport.

### Tooltip
A tooltip library

```js
simply.tooltip.bind(targets[, options])
```

Adds a tooltip to the `targets` (DOM element(s)) that activate on hover.
