'use strict'

var closest = require('component-closest')
var EVENTS = process.env.NODE_ENV !== 'production' && require('./events.json')
var _registered = {}

// Expose middleware.
module.exports = middleware

/**
 * @public
 * @description
 * Creates a rill middleware that ensures an event handler is started
 * of a given type that matches a given selector for the current request.
 * Each request resets all listeners to keep them isolated.
 *
 * @param {String} type - the type of event to listen for.
 * @param {String} [selector] - A valid css selector.
 * @param {Function} handler - The function called if the event is emitted.
 */
function middleware (type, selector, handler) {
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
  if (!_registered[type]) {
    _registered[type] = []
    document.addEventListener(type, onEvent, true)
  }

  // Store a hidden selector for use the delgator.
  handler._selector = selector

  return function (ctx, next) {
    // Reset event listeners once per request.
    if (!ctx._delegation_reset) {
      ctx._delegation_reset = true

      for (var key in _registered) {
        if (_registered[key].length) {
          _registered[key] = []
        }
      }
    }

    // Register the event listener for this request.
    _registered[type].push(handler)

    // Continue request.
    return next()
  }
}

/*
 * @private
 * @description
 * Handle and delegate global events.
 *
 * @param {Event} e - The DOM event being handled.
 */
function onEvent (e) {
  var type = e.type.toLowerCase()
  var target = e.target
  var handlers = _registered[type]

  // Run all matched events.
  for (var i = 0, len = handlers.length; i < len && !e.defaultPrevented; i++) {
    var handler = handlers[i]
    var selector = handler._selector
    if (selector) {
      // Setup current target which will match the delgated selector.
      Object.defineProperty(e, 'currentTarget', { value: closest(target, selector) })
      if (e.currentTarget) handler(e)
    } else {
      handler(e)
    }
  }
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
