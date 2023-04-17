const forge = require('node-forge')
const pki = forge.pki
const getCert = require('../cert')

const ca = getCert();
module.exports = function (domain) {
  const keys = pki.rsa.generateKeyPair(2048)
  const cert = pki.createCertificate()
  cert.publicKey = keys.publicKey

  const now = new Date()
  cert.serialNumber = `${now.getTime()}`
  cert.validity.notBefore = new Date()
  cert.validity.notBefore.setFullYear(now.getFullYear() - 1)
  cert.validity.notAfter = new Date()
  cert.validity.notAfter.setFullYear(now.getFullYear() + 1)

  cert.setIssuer(caCert.subject)
}
