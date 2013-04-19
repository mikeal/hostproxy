var net = require('net')
  , matches =
    [ [new Buffer('\r'), new Buffer('\r')]
    , [new Buffer('\n'), new Buffer('\n')]
    , [new Buffer('H'), new Buffer('h')]
    , [new Buffer('o'), new Buffer('O')]
    , [new Buffer('s'), new Buffer('S')]
    , [new Buffer('t'), new Buffer('T')]
    , [new Buffer(':'), new Buffer(':')]
    , [new Buffer(' '), new Buffer(' ')]
    ]
  , term = [new Buffer('\r'), new Buffer('\n')]
  ;


function matchHost (buff) {
  var matchIndex = 0
    , begin = 0
    ;
  for (var i = 0; i < buff.length; i++) {
    if (begin) {
      // Once we've matched host read the host to line terminator
      if (buff[i] === term[0][0] && buff[i + 1] === term[1][0]) {
        return buff.slice(begin, i)
      }
    } else if (buff[i] === matches[matchIndex][0][0] || buff[i] === matches[matchIndex][1][0]) {
      // check if the next character matches host
      matchIndex = matchIndex + 1
      if (matchIndex === matches.length) {
        begin = i + 1
      }

      if ( matchIndex === 1 &&
          buff[i] === term[0][0] &&
          buff[i+1] === term[1][0] &&
          buff[i+2] === term[0][0] &&
          buff[i+3] === term[1][0]
         ) {
        return -1
      }

    } else {
      // bounds check if we've hit the end of the headers

      matchIndex = 0
    }
  }

  return false
}

function insertHeader (name, value, chunk) {
  var header = new Buffer(name + ': ' + value + '\r\n')
  for (var i=0; i < chunk.length; i++) {
    if (chunk[i] === term[0][0] && chunk[i+1] === term[1][0]) {
      var b = new Buffer.concat([chunk.slice(0, i+2), header, chunk.slice(i+2)],  chunk.length + header.length)
      return b
    }
  }
  throw new Error('Chunk did not include a complete set of headers')
}

module.exports = function (forward, limit) {
  var listener = module.exports.getListener(forward, limit)

  var server = net.createServer(listener)

  return server
}

module.exports.getListener = function (forward, limit) {
  limit = limit || 2000

  function listener (socket) {
    var previous = null

    function merge (chunk) {
      if (previous) {
        var buff = Buffer.concat([previous, chunk])
        previous = buff
        return buff
      }
      previous = chunk
      return chunk
    }

    function read () {
      var chunk = socket.read()

      if (chunk) {
        chunk = merge(chunk)
        var host = matchHost(chunk)
        if (host.toString() === 'keep-alive') console.error(chunk.toString())
        if (host) {
          socket.removeListener('readable', read)
          function addHeader (key, value) {
            chunk = insertHeader(key, value, chunk)
          }
          var proxy = forward(host === -1 ? null : host.toString(), addHeader, socket.address())
          if (!proxy) return socket.destroy() // no proxy was returned
          proxy.write(chunk)
          socket.pipe(proxy)
          proxy.pipe(socket)
          return // Do not call read() again
        }
        // Did not match
        if (chunk.length > limit) return socket.destroy() // exceeded size limit for matching
        read() // read again, we need to read until null
      }
    }

    socket.on('readable', read)
    read()

  }
  return listener
}

module.exports.insertHeader = insertHeader

