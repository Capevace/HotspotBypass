const spawn = require('child_process').spawn;

function ifconfig() {
  return new Promise((resolve) => {
    // Force OS to populate arp tables by pinging host / router
    const ifconfigProcess = spawn('ifconfig');
    let dataBuffer = '';

    ifconfigProcess.stdout.on('data', buffer => {
      dataBuffer += buffer;
    });

    ifconfigProcess.on('close', () => {
      resolve(dataBuffer.toString());
    });
  });
}

function pingHost(hostAddress) {
  return new Promise((resolve) => {
    // Force OS to populate arp tables by pinging host / router
    const ping = spawn('ping', ['-c', '1', hostAddress]);

    ping.on('close', () => {
      // No bothering if ping failed or not

      resolve();
    });
  });
}

function fetchArp() {
  return new Promise(resolve => {
    const arp = spawn('arp', ['-a']);
    let resultStream = '';
    let errorStream = '';

    arp.stdout.on('data', buffer => {
      resultStream += buffer;
    });

    arp.stderr.on('data', errorBuffer => {
      errorStream += errorBuffer;
    });

    arp.on('close', () => {
      resolve(resultStream.toString());
    });
  });
}

function setEn1Ether(address) {
  return new Promise((resolve, reject) => {
    const setProcess = spawn('sudo', ['ifconfig', 'en1', 'ether', address]);

    setProcess.stderr.on('data', (data) => {
      reject(data);
    });

    setProcess.on('close', (code) => {
      if (code === 0) {
        resolve(address);
      }
    });
  });
}

module.exports.ifconfig = ifconfig;
module.exports.pingHost = pingHost;
module.exports.fetchArp = fetchArp;
module.exports.setEn1Ether = setEn1Ether;
