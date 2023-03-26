const path = require('path')
const fs = require('fs')
const selfsigned = require('selfsigned')

const TTL_DAYS = 30;
let cache = null;
module.exports = function() {
  if (cache) return cache;
  const keyPath = path.join(__dirname, './root.key');
  const certPath = path.join(__dirname, './root.cert')
  let certExists = fs.existsSync(certPath);
  if (certExists) {
    const daytime = 1000 * 60 * 60 * 24;
    const certTTL = TTL_DAYS * daytime;
    const certificateStat = fs.statSync(certPath)

    if (Date.now() - certificateStat.ctime > certTTL) {
      console.log(`SSL certificate is more than ${TTL_DAYS} days old. Removing`);
      fs.unlinkSync(keyPath)
      fs.unlinkSync(certPath)
      certExists = false;
    }
  }
  if (!certExists) {
    console.log('Cenerating SSL Ceriticate')
    const attributes = [{ name: 'commonName', value: '0.0.0.0' }]
    const pems = selfsigned.generate(attributes, {
      algorithm: 'sha256',
      days: TTL_DAYS,
      keySize: 2048
    });
    fs.writeFileSync(keyPath, pems.private, {
      encoding: 'utf-8'
    });
    fs.writeFileSync(certPath, pems.cert, {
      encoding: 'utf-8'
    });
  }

  cache = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  }
  return cache;
}
