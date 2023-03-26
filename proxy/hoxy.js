var hoxy = require('hoxy');
var fs = require('fs');
var proxy = hoxy.createServer({
  certAuthority: {
    key: fs.readFileSync('/home/afei/.WhistleAppData/.whistle/certs/root.key'),
    cert: fs.readFileSync('/home/afei/.WhistleAppData/.whistle/certs/root.crt')
  }
}).listen(8080);
proxy.intercept({

  // intercept during the response phase
  phase: 'response',

  // only intercept html pages
  mimeType: 'text/html',

  // expose the response body as a cheerio object
  // (cheerio is a jQuery clone)
  as: '$'
}, function(req, resp) {

  resp.$('title').text('Unicorns!');
  // all page titles will now say "Unicorns!"
});
