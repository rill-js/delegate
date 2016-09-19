'use strict'

var closest = require('component-closest')
var EVENTS = process.env.NODE_ENV !== 'production' && require('./events.json')
var _listeners = {}

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
    // Reset event listeners once per request.
    for (var key in _listeners) {
      if (_listeners[key].length) {
        _listeners[key] = []
      }
    }

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

  // Add hanlder to registered event listeners.
  var listener = {
    selector: selector,
    handler: handler
  }
  _listeners[type].push(listener)

  /**
   * A function that will cancel the event listener.
   */
  return function cancel () {
    var listeners = _listeners[type]
    var index = listeners.indexOf(listener)
    if (index === -1) return
    listeners.splice(index, 1)
  }
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

  var cancel = on(type, selector, function (e) {
    cancel()
    handler(e)
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
  var type = e.type.toLowerCase()
  var target = e.target
  var listeners = _listeners[type]

  // Run all matched events.
  for (var i = 0, len = listeners.length; i < len && !e.defaultPrevented; i++) {
    var listener = listeners[i]
    var selector = listener.selector
    var handler = listener.handler
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
