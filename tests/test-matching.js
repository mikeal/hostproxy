var hostproxy = require('../')
  , headerString
  , events = require('events')
  , util = require('util')
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

function FakeSocket (response) {
  this.chunks = []
  this.response = response
  if (!response) throw new Error('requires response')
}
util.inherits(FakeSocket, events.EventEmitter)
FakeSocket.prototype.write = function (chunk) {
  this.chunks.push(chunk)
}
FakeSocket.prototype.destroy = function () {
  this.destroyed = true
}
FakeSocket.prototype.read = function () {
  var self = this
  var chunk = this.response.shift() || null
  if (!chunk) {
    setImmediate(function () {
      self.emit('readable')
    })
  }
  return chunk
}
FakeSocket.prototype.pipe = function (dest) {
  this.dest = dest
}
FakeSocket.prototype.address = function () {return {}}

headerString = headers.join('\r\n') + '\r\n\r\n'

var index = headerString.indexOf('Host: ') + 'Host: '.length + 'www.yammer.com'.length + '\r\n'.length

function testChunks (i, chunks, headerString){
  var proxy = new FakeSocket([])
    ;
  listener = hostproxy.getListener(function (host, addHeader) {
    assert.equal(host, 'www.yammer.com')

    setImmediate(function () {
      if (i >= index) {
        assert.equal(Buffer.concat(proxy.chunks).toString(), headerString.slice(0, i))
        return
      }
      assert.equal(Buffer.concat(proxy.chunks).toString(), headerString)
    })

    return proxy
  })
  socket = new FakeSocket(chunks)
  listener(socket)
}

function testTwoWrites (i, headerString) {
  var chunk1 = headerString.slice(0, i)
    , chunk2 = headerString.slice(i)
    , listener
    , socket
    ;

  testChunks(i, [new Buffer(chunk1), new Buffer(chunk2)], headerString)
  testChunks(i, [null, new Buffer(chunk1), new Buffer(chunk2)], headerString)
  testChunks(i, [null, new Buffer(chunk1), null, new Buffer(chunk2)], headerString)
}

for (var i = 1; i < headerString.length; i++ ) {
  testTwoWrites(i, headerString)
}

function testThreeWrites (i, i2, headerString) {
  var chunk1 = headerString.slice(0, i)
    , chunk2 = headerString.slice(i, i2)
    , chunk3 = headerString.slice(i2)
    , listener
    , socket
    ;

  testChunks(i >= index ? i : i2, [new Buffer(chunk1), new Buffer(chunk2), new Buffer(chunk3)], headerString)
  testChunks(i >= index ? i : i2, [null, new Buffer(chunk1), new Buffer(chunk2), new Buffer(chunk3)], headerString)
  testChunks(i >= index ? i : i2, [null, new Buffer(chunk1), null, new Buffer(chunk2), null, new Buffer(chunk3)], headerString)
}

for (var i = (index - 20); i < headerString.length; i++ ) {
  for (var i2 = (i + 1); i2 < index + 40; i2++) {
    testThreeWrites(i, i2, headerString)
  }
}

for (var i = (index - 20); i < headerString.length; i++ ) {
  for (var i2 = (i + 1); i2 < index + 40; i2++) {
    testThreeWrites(i, i2, headerString.toLowerCase())
  }
}
