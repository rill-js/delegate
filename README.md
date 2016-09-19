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
```bash
npm install @rill/delegate
```

# API

### delegate(options)

  Setups up a middleware that will reset event listeners once per request.
  This allows for page specific delegators.

```javascript
const app = require('rill')()
const delegate = require('@rill/delegate')

// Setup middleware.
app.use(delegate())
```

### delegate.on(event, [selector=document], handler)

  Registers a delegated event listener for the request.

```javascript
app.get('/', (ctx) => {
  // Here we listen for `keyup` events that match a `.search` element.
  delegate.on('keyup', '.search', e => {
      // `currentTarget` will be the element that matched the selector.
      const input = e.currentTarget;
      // Here we can handle the event.
      ...
  })

  // We can also add event listeners to the window by omitting the selector.
  delegate.on('scroll', e => ...)

  // Finally, #on returns a function which can be used to stop the listener.
  const cancel = delegate.on('scroll', e => ...)
});
```

### delegate.once(event, [selector=document], handler)

  Registers a delegated event listener for the request that is canceled after the first run.

```javascript
app.get('/', (ctx) => {
  // Scroll will only fire at most once per request.
  const cancel = delegate.once('scroll', e => ...)
});
```

### Contributions

* Use `npm test` to run tests.

Please feel free to create a PR!
