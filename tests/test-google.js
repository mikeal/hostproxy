var hostproxy = require('../')
  , net = require('net')
  , request = require('request')
  ;

var s = hostproxy(function (host) {
  return net.connect(80, host)
})
s.listen(8080, function () {
  var r = request('http://localhost:8080/', {headers:{host:'www.google.com'}}, function (e, resp, body) {
    if (e) throw e
    if (resp.statusCode !== 200) throw new Error('Invalid status code '+resp.statusCode)
    s.close()
  })
})


