const https = require('https')
const http = require('http')
const fs = require('fs')
const url = require('url')
const forge = require('node-forge')
const pki = forge.pki
const tls = require('tls')
const net = require('net')

const CA_KEY = fs.readFileSync('/home/afei/.WhistleAppData/.whistle/certs/root.key', 'utf-8');
const CA_CERT = fs.readFileSync('/home/afei/.WhistleAppData/.whistle/certs/root.crt', 'utf-8');

const caCert = pki.certificateFromPem(CA_CERT);
const caKey = pki.privateKeyFromPem(CA_KEY);
const port = 8080

const proxyServer = http.createServer();

proxyServer.listen(port, () => {
  console.log("proxy listening on", port)
})

proxyServer.on('connect', (req, socket, head) => {
  const serverUrl = url.parse(`http://${req.url}`)
  const certObj = createCert(serverUrl.hostname);

  const mockServer = https.createServer({
    key: pki.privateKeyToPem(certObj.key),
    cert: pki.certificateToPem(certObj.cert),
    SNICallback: (hostname, done) => {
      const certObj = createCert(hostname);
      done(null, tls.createSecureContext({
        key: pki.privateKeyToPem(certObj.key),
        cert: pki.certificateToPem(certObj.cert)
      }))
    }
  })

  mockServer.listen(0, () => {
    const address = mockServer.address();
    console.log("address.port", address.port);
    const serverSocket = net.connect(address.port, '127.0.0.1', () => {
      socket.write('HTTP/1.1 200 Connection Established\r\nProxy-agent: MITM-proxy\r\n\r\n')
      serverSocket.write(head);
      serverSocket.pipe(socket);
      socket.pipe(serverSocket);
    })
  })
  mockServer.on('request', (req, res) => {
    const urlObj = url.parse(req.url)
    let options = {
      protocol: 'https',
      hostname: req.headers.host.split(':')[0],
      method: req.method,
      port: req.headers.host?.split(':')[1] || 80,
      path: urlObj.path,
      headers: req.headers
    };
    res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' })
    res.write(`<html><body>I am fake ${options.protocol}:${options.hostname}</body></html>`)
    res.end();
  })
  mockServer.on('error', (err) => {
    console.error(err)
  })
});

const createCert = (domain) => {
  const keys = pki.rsa.generateKeyPair(2048);
  const cert = pki.createCertificate();
  cert.publicKey = keys.publicKey;

  cert.serialNumber = `${Date.now()}`
  cert.validity.notBefore = new Date();
  cert.validity.notBefore.setFullYear(cert.validity.notBefore.getFullYear() - 1);
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notAfter.getFullYear() + 1);

  cert.setIssuer(caCert.subject.attributes);
  cert.setSubject([
    { name: 'commonName', value: domain },
  ])
  cert.setExtensions([{
    name: 'basicConstraints',
    critical: true,
    cA: false
  },
  {
    name: 'keyUsage',
    critical: true,
    digitalSignature: true,
    contentCommitment: true,
    keyEncipherment: true,
    dataEncipherment: true,
    keyAgreement: true,
    keyCertSign: true,
    cRLSign: true,
    encipherOnly: true,
    decipherOnly: true
  },
  {
    name: 'subjectAltName',
    altNames: [{
      type: 2,
      value: domain
    }]
  },
  {
    name: 'subjectKeyIdentifier'
  },
  {
    name: 'extKeyUsage',
    serverAuth: true,
    clientAuth: true,
    codeSigning: true,
    emailProtection: true,
    timeStamping: true
  },
  {
    name: 'authorityKeyIdentifier'
  }]);
  cert.sign(caKey, forge.md.sha256.create())

  return {
    key: keys.privateKey,
    cert: cert
  }
}
