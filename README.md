<h1 align="center">
  <!-- Logo -->
  <img src="https://raw.githubusercontent.com/rill-js/rill/master/Rill-Icon.jpg" alt="Rill"/>
  <br/>
  @rill/delegate
	<br/>

  <!-- Stability -->
  <a href="https://nodejs.org/api/documentation.html#documentation_stability_index">
    <img src="https://img.shields.io/badge/stability-stable-brightgreen.svg?style=flat-square" alt="API stability"/>
  </a>
  <!-- Standard -->
  <a href="https://github.com/feross/standard">
    <img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square" alt="Standard"/>
  </a>
  <!-- NPM version -->
  <a href="https://npmjs.org/package/@rill/delegate">
    <img src="https://img.shields.io/npm/v/@rill/delegate.svg?style=flat-square" alt="NPM version"/>
  </a>
  <!-- Downloads -->
  <a href="https://npmjs.org/package/@rill/delegate">
    <img src="https://img.shields.io/npm/dm/@rill/delegate.svg?style=flat-square" alt="Downloads"/>
  </a>
  <!-- Gitter Chat -->
  <a href="https://gitter.im/rill-js/rill">
    <img src="https://img.shields.io/gitter/room/rill-js/rill.svg?style=flat-square" alt="Gitter Chat"/>
  </a>
</h1>

Isomorphic event delegation utility for Rill. This allows for isomorphic DOM event binding with any templating language.

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
const app = require('rill')()
const on = require('@rill/delegate')

app.get('/',
    // Here we listen for `keyup` events that match a `.search` element.
    on('keyup', '.search', e => {
        // `currentTarget` will be the element that matched the selector.
        const input = e.currentTarget;
        // Here we can handle the event.
        ...
    }),
    // Other middleware will run as normal.
    ...
);

// The above click event will not be handled if we navigate to a different route.
app.get('/contact', ...);
```

### Contributions

* Use `npm test` to run tests.

Please feel free to create a PR!
