'use strict'
// Delegation is a noop on the server.
noop.listen = noop
module.exports = noop
function noop () {}
