var hostproxy = require('../')
  , net = require('net')
  ;

var headers =
  [ 'GET /index.html HTTP/1.1'
  , 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:20.0) Gecko/20100101 Firefox/20.0Pragma:no-cache'
  , 'Connection: keep-alive'
  , 'Cache-Control: no-cache'
  , 'Accept-Language: en-US,en;q=0.5Accept-Encoding:gzip, deflate'
  , 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8,application/json'
  , ''
  , 'body'
  ]


var s = hostproxy(function (host) {
  if (host !== null) throw new Error('Host header is set to '+host)
  process.exit()
})
s.listen(8080, function () {
  var client = net.connect(8080, 'localhost')
  client.write(headers.join('\r\n'))
})


