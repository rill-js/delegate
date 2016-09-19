var assert = require('assert')
var agent = require('supertest')
var Rill = require('rill')
var delegate = require('../client')
var on = delegate.on
var once = delegate.once

describe('Rill/Delegate', function () {
  it('should handle events for the current request', function (done) {
    document.body.innerHTML = '<div class="item"></div>'

    var item = document.body.firstChild
    var clicks = 0

    var request = agent(Rill()
      .use(delegate())
      .get('/1', function (ctx) {
        on('click', '.item', function (e) { clicks += 1 })
      })
      .get('/2', function (ctx) {
        once('click', '.item', function (e) { clicks += 2 })
      })
      .listen())

    request
      .get('/1')
      .expect(function () {
        assert.equal(clicks, 0)
        item.click()
        assert.equal(clicks, 1)
        item.click()
        assert.equal(clicks, 2)
      })
      .end(function (err) {
        if (err) return done(err)
        request
          .get('/2')
          .expect(function () {
            assert.ok(item)
            assert.equal(clicks, 2)
            item.click()
            assert.equal(clicks, 4)
            item.click()
            assert.equal(clicks, 4)
          })
          .end(done)
      })
  })
})
