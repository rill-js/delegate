'use strict'

var closest = require('component-closest')
var EVENTS = require('./events.json')
var _handlers = {}

// Initialize a listener for all events to start delegation.
EVENTS.forEach(function (type) { document.addEventListener(type, onEvent, true) })

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
 * @param {String} selector - A valid css selector.
 * @param {Function} handler - The function called if the event is emitted.
 */
function middleware (type, selector, handler) {
  if (!~EVENTS.indexOf(type)) {
    throw new Error('@rill/delegate: Unknown event type "' + type + '".')
  }

  if (typeof selector !== 'string') {
    throw new TypeError('@rill/delegate: Selector must be a string')
  }

  if (typeof handler !== 'function') {
    throw new TypeError('@rill/delegate: Event handler must be a function.')
  }

  // Store a hidden selector for use the delgator.
  handler._selector = selector

  return function (ctx, next) {
    // Reset event listeners once per request.
    if (!ctx._delegation_reset) {
      _handlers = {}
      ctx._delegation_reset = true
    }

    // Ensure handlers for the current event type exist.
    var handlers = _handlers[type] = (_handlers[type] || [])
    // Add the current handler.
    handlers.push(handler)
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
  var handlers = _handlers[type]
  if (!handlers || !handlers.length) return

  var handler
  var len = handlers.length

  // Run all matched events.
  for (var i = 0; i < len; i++) {
    handler = handlers[i]
    // Setup current target which will match the delgated selector.
    Object.defineProperty(e, 'currentTarget', { value: closest(e.target, handler._selector) })
    if (e.currentTarget) handler(e)
  }
}
