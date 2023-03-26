var http = require('http'),

    httpProxy = require('http-proxy');
var fs = require('fs')

var getCert = require('../cert/getCert');
httpProxy.createServer({
  target: {
    host: 'localhost',
    port: 9000
  },
  ssl: {
    key: fs.readFileSync('../cert/root.key'),
    cert: fs.readFileSync('../cert/root.cert')
  }
}).listen(8009);

http.createServer(function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write('request successfully proxied!' + '\n' + JSON.stringify(req.headers, true, 2));
  res.end();
}).listen(9000);

