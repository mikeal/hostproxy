var hostproxy = require('../')
  , net = require('net')
  , http = require('http')
  , request = require('request')
  ;

var s = hostproxy(function (host, addHeader, address) {
  addHeader('x-forwarded-for', address.address)
  return net.connect(8081, 'localhost')
}).listen(8080, function () {

  http.createServer(function (req, resp) {
    if (req.headers['x-forwarded-for'] !== '127.0.0.1') throw new Error('Invalid x-forwarded-for: '+req.headers['x-forwarded-for'])
    process.exit()
  }).listen(8081, function () {

    request('http://localhost:8080', function (e, resp, body) {
      // we'll never get here.
    })
  })
})
