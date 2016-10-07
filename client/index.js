'use strict'

var closest = require('closest')
var matches = require('matches-selector')
var EVENTS = process.env.NODE_ENV !== 'production' && require('./events.json')
var _listeners = {}
var _activeHandlers = []
var _cancelHandlers = null

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
    // Reset old event handlers once per request by marking them as canceled.
    ctx.res.original.once('finish', cancelPreviousHandlers)
    _cancelHandlers = _activeHandlers
    _activeHandlers = []

    // Continue request.
    return next()
  }

  /**
   * Cancels all hanlders that have been placed in the '_cancelHandlers' array.
   */
  function cancelPreviousHandlers () {
    for (var i = _cancelHandlers.length, cancel; i--;) {
      cancel = _cancelHandlers[i]
      cancel()
    }
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
  var canceled = false
  var listener = {
    selector: selector,
    handler: handler
  }

  _listeners[type].push(listener)
  _activeHandlers.push(cancel)
  return cancel

  /**
   * A function that will cancel the event listener.
   */
  function cancel () {
    if (canceled) return
    var listeners = _listeners[type]
    var index = listeners.indexOf(listener)
    if (index !== -1) listeners.splice(index, 1)
    canceled = true
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
  for (var i = 0, len = listeners.length; i < len; i++) {
    if (e.defaultPrevented) return
    var listener = listeners[i]
    if (!listener) continue
    var selector = listener.selector
    var handler = listener.handler
    if (selector) {
      // Setup current target which will match the delgated selector.
      Object.defineProperty(e, 'currentTarget', {
        configurable: true,
        value: e.bubbles
          ? closest(target, selector, true)
          : matches(target, selector) && target
      })
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
