### Pure TCP HTTP Proxy

[![Greenkeeper badge](https://badges.greenkeeper.io/mikeal/hostproxy.svg)](https://greenkeeper.io/)

`hostproxy` is a pure TCP proxy for HTTP. It does not fully parse HTTP, it simply searches for the `Host` header and injects other headers in to the stream.

#### API

```javascript
var hostproxy = require('hostproxy')
  , net = require('net')
  ;

hostproxy(function (host) {
  if (host === 'mysite.com') return net.connect(80, 'mysite.com')
  return net.connect(80, 'fallback.com')
}).listen(80)
```

If no host header is present then host will be null.

```javascript
hostproxy(function (host) {
  if (!host) return // returning nothing will force disconnect the client
  return net.connect(80, host)
}).listen(80)
```

What about adding headers?

```javascript
hostproxy(function (host, addHeader, address) {
  addHeader('x-forwarded-for', address.address)
  return net.connect(80, host || 'fallback.com')
}).listen(80)
```

The `address` param is the return value from [socket.address()](http://nodejs.org/api/net.html#net_socket_address).


