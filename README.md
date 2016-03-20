# @rill/delegate

Isomorphic event delegation utility for Rill.

# Installation

#### Npm
```console
npm install @rill/delegate
```

# Example

```javascript
const on     = require("@rill/delegate");
const app    = require("rill")();

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

* Use gulp to run tests.

Please feel free to create a PR!
