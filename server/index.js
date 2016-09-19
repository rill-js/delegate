'use strict'
// Delegation is a noop on the server.
noop.listen = listenNoop
module.exports = noop
function listenNoop () { return noop }
function noop () {}
