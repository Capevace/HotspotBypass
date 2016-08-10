const xRegExp = require('xregexp');

function parseArpList(arpData) {
  let addresses;

  if (!arpData || arpData === '') {
    addresses = [{
      name: 'no name',
      address: 'ff:ff:ff:ff:ff:ff'
    }];
  } else {
    const macAddressMatch = /(([0-9a-fA-F]{1,2})[:-]){5}([0-9a-fA-F]{1,2})/gmi;
    const parsedAddresses = arpData.match(macAddressMatch);
    addresses = parsedAddresses.map((address) => ({
      name: 'Unnamed',
      address
    }));
  }

  return addresses;
}

function parseEn1Ether(input) {
  // UGLY CODE, TEMP!!!
  const match =
    xRegExp.exec(
      input,
      xRegExp('en1.*ether (([0-9a-fA-F]{1,2})[:-]){5}([0-9a-fA-F]{1,2}){1}', 'gs')
    );
  if (match[0]) {
    const secondMatch = match[0].match(/(([0-9a-fA-F]{1,2})[:-]){5}([0-9a-fA-F]{1,2})/gmi);
    if (secondMatch[0]) {
      return secondMatch[0];
    }
  }

  return 'ff:ff:ff:ff:ff:ff';
}

function parseBroadcastIp(ifconfig) {
  const regex = /broadcast\s((?:[0-9]{1,3}\.){3}[0-9]{1,3})/g;
  return regex.exec(ifconfig)[1];
}

// MAC regex /(([0-9a-fA-F]{1,2})[:-]){5}([0-9a-fA-F]{1,2})/gmi
// broadcast regex /broadcast\s((?:[0-9]{1,3}\.){3}[0-9]{1,3})/g
// ether\s(([0-9a-fA-F]{1,2})[:-]){5}([0-9a-fA-F]{1,2})

function generateMacAddress() {
  let mac = '';
  for (let i = 0; i < 12; i++) {
    if (i % 2 === 0 && i !== 0) mac += ':';
    mac += Math.floor(Math.random() * 16).toString(16);
  }

  return mac;
}

module.exports.parseArpList = parseArpList;
module.exports.parseBroadcastIp = parseBroadcastIp;
module.exports.parseEn1Ether = parseEn1Ether;
module.exports.generateMacAddress = generateMacAddress;
