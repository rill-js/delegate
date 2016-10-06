'use strict'

var closest = require('component-closest')
var EVENTS = process.env.NODE_ENV !== 'production' && require('./events.json')
var _pendingListeners = {}
var _activeListeners = {}

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
    // After a request is finished make all of the registered event handlers active.
    ctx.res.original.once('finish', updateEventHandlers)

    // Reset pending event listeners once per request.
    for (var key in _pendingListeners) {
      if (_pendingListeners[key].length) {
        _pendingListeners[key] = []
      }
    }

    // Continue request.
    return next()
  }

  /**
   * Copy over pending event handlers to the active event handlers.
   */
  function updateEventHandlers () {
    // Add new pending handlers.
    for (var key in _pendingListeners) {
      _activeListeners[key] = _pendingListeners[key]
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
  if (!_pendingListeners[type]) {
    _pendingListeners[type] = []
    document.addEventListener(type, onEvent, true)
  }

  // Add hanlder to registered event listeners.
  var listener = {
    selector: selector,
    handler: handler
  }
  _pendingListeners[type].push(listener)

  /**
   * A function that will cancel the event listener.
   */
  return function cancel () {
    // Check if the handler is still pending.
    var pending = _pendingListeners[type]
    var pendingIndex = pending.indexOf(listener)
    if (pendingIndex !== -1) {
      pending.splice(pendingIndex, 1)
    }

    // Check for an active handler.
    var active = _activeListeners[type]
    var activeIndex = active.indexOf(listener)
    if (activeIndex !== -1) {
      active.splice(activeIndex, 1)
    }
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
  var listeners = _activeListeners[type]

  // Run all matched events.
  for (var i = 0, len = listeners.length; i < len; i++) {
    if (e.defaultPrevented) return
    var listener = listeners[i]
    if (!listener) continue
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
