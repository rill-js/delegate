'use strict'

var closest = require('closest')
var matches = require('matches-selector')
var fetch = require('@rill/http/adapter/browser').fetch
var EVENTS = process.env.NODE_ENV !== 'production' && require('./events.json')
var _listeners = {}
var _server = null

// Expose api.
delegate.on = on
delegate.once = once
module.exports = delegate

/**
 * @public
 * @description
 * Creates a middleware that attaches a 'delegate' function to the rill context.
 * This allows for creating request specific event listeners in the browser.
 */
function delegate (options) {
  return function delegateMiddleware (ctx, next) {
    // Store reference to server for later.
    _server = ctx.req.original.socket.server
    // Clear all listeners.
    for (var type in _listeners) _listeners[type] = []
    // Continue request.
    return next()
  }
}

/**
 * @public
 * @description
 * Registers an event delegator function for the browser.
 *
 * @param {String} type - the type of event to listen for.
 * @param {String} [selector] - A valid css selector.
 * @param {Function} handler - The function called if the event is emitted.
 */
function on (type, selector, handler) {
  // Make selector optional (defaults to window).
  if (typeof selector === 'function') {
    handler = selector
    selector = null
  }

  assert(typeof type === 'string', 'Event name must be a string')
  assert(typeof handler === 'function', 'Event handler must be a function')
  if (process.env.NODE_ENV !== 'production') {
    assert(~EVENTS.indexOf(type), 'Unknown event type "' + type + '".')
  }

  // Lazily register event delegators.
  if (!_listeners[type]) {
    _listeners[type] = []
    document.addEventListener(type, onEvent, true)
  }

  // Store selector on handler function.
  handler.selector = selector

  // Register handler.
  var handlers = _listeners[type]
  var index = handlers.push(handler) - 1

  /**
   * A function that will cancel the event listener once.
   */
  return function cancel () { cancel.done = cancel.done || handlers.splice(index, 1).length }
}

/**
 * @public
 * @description
 * Registers an event delegator function for the browser that will only run once.
 *
 * @param {String} type - the type of event to listen for.
 * @param {String} [selector] - A valid css selector.
 * @param {Function} handler - The function called if the event is emitted.
 */
function once (type, selector, handler) {
  // Make selector optional (defaults to window).
  if (typeof selector === 'function') {
    handler = selector
    selector = null
  }

  assert(typeof handler === 'function', 'Event handler must be a function')

  // Wrap #on but cancel after first run.
  var cancel = on(type, selector, function (e, go) {
    cancel()
    handler(e, go)
  })

  return cancel
}

/*
 * @private
 * @description
 * Handle and delegate global events.
 *
 * @param {Event} e - The DOM event being handled.
 */
function onEvent (e) {
  var handler, selector
  var type = e.type.toLowerCase()
  var target = e.target
  var handlers = _listeners[type]

  // Run all matched events.
  for (var i = 0, len = handlers.length; i < len && !e.defaultPrevented; i++) {
    handler = handlers[i]
    selector = handler.selector

    if (selector) {
      // Setup current target which will match the delgated selector.
      Object.defineProperty(e, 'currentTarget', {
        configurable: true,
        value: e.bubbles
          ? closest(target, selector, true)
          : matches(target, selector) && target
      })
      if (e.currentTarget) handler(e, go)
    } else {
      handler(e, go)
    }
  }
}

/**
 * Tells Rill to navigate to a new route.
 *
 * @param {string} url - The url to navigate to.
 * @param {object} [options] - The options for the request.
 * @param {object} [options.method=GET] - The http verb to request.
 * @param {object} [options.body] - A body to pass through the request as is.
 * @param {object} [options.files] - A files to pass through request as is.
 * @param {HTMLElement} [options.form] - A form to parse and pass through as the request body/files.
 * @param {boolean} [options.scroll=true] - Should the request trigger a page scroll.
 * @param {boolean} [options.history=true] - Should the request update the page url (only for get requests).
 * @param {string|false} [opts.redirect='follow'] - Should we follow any redirects.
 */
function go (url, options) {
  assert(_server, 'Could not navigate because Rill server was missing.')
  fetch(_server, url, options)
}

/**
 * @description
 * Assert that a val is truthy and throw an error if not.
 *
 * @param {*} val - the value to test for truthyness.
 * @param {String} msg - the message that will be thrown on failure.
 * @throws {TypeError} err - throws an error if the value is not truthy.
 */
function assert (val, msg) {
  if (val) return
  throw new TypeError('@rill/delegate: ' + msg)
}
