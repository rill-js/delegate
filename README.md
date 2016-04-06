[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![Chat about Rill at https://gitter.im/rill-js/rill](https://badges.gitter.im/rill-js/rill.svg)](https://gitter.im/rill-js/rill?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# Rill Delegate
Isomorphic event delegation utility for Rill.

# Installation

#### Npm
```console
npm install @rill/delegate
```

# API

### on(event, selector, handler)

  Creates a middleware that registers an event listener for the request
  when in the browser. (Does nothing server side).

```javascript
const on = require("@rill/delegate");

app.get("/",
    // Here we listen for `keyup` events that match a `.search` element.
    on("keyup", ".search", e => {
        // `currentTarget` will be the element that matched the selector.
        const input = e.currentTarget;
        // Here we can handle the event.
        ...
    }),
    // Other middleware will run as normal.
    ...
);

// The above click event will not be handled if we navigate to a different route.
app.get("/contact", ...);
```

### Contributions

* Use `npm test` to run tests.

Please feel free to create a PR!
