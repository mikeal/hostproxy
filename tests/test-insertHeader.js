var hostproxy = require('../')
  , net = require('net')
  , assert = require('assert')
  ;

var headers =
  [ 'GET /index.html HTTP/1.1'
  , 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:20.0) Gecko/20100101 Firefox/20.0Pragma:no-cache'
  , 'Connection: keep-alive'
  , 'Host: www.yammer.com'
  , 'Cache-Control: no-cache'
  , 'Accept-Language: en-US,en;q=0.5Accept-Encoding:gzip, deflate'
  , 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8,application/json'
  ]

var chunk = new Buffer(headers.join('\r\n'))

var x = hostproxy.insertHeader('x-forwarded-for', '122.123.123.2', chunk)

var newHeaders = x.toString().split('\r\n')

assert.equal(newHeaders.length, headers.length + 1)

assert.equal(headers[0], newHeaders[0])
assert.equal('x-forwarded-for: 122.123.123.2', newHeaders[1])
assert.equal(headers[1], newHeaders[2])
assert.equal(headers[2], newHeaders[3])
assert.equal(headers[3], newHeaders[4])
assert.equal(headers[4], newHeaders[5])
assert.equal(headers[5], newHeaders[6])
assert.equal(headers[6], newHeaders[7])
