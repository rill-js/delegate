'use strict'
// Delegation is a noop on the server.
noop.on = listenNoop
noop.once = listenNoop
module.exports = noop
function listenNoop () { return function noop () {} }
function noop () {}
