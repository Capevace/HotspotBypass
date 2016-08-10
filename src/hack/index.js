const processes = require('./processes');
const utils = require('./utils');
const EventEmitter = require('events');

function getMacAddresses(hostAddress) {
  const eventEmitter = new EventEmitter();

  // Callback of starting of ping
  eventEmitter.emit('ping');
  // Ping host address
  processes.pingHost(hostAddress)
    // Callback of starting of arp -a
    .then(() => eventEmitter.emit('arp'))
    // Do arp -a
    .then(processes.fetchArp)
    // Parse list to array
    .then(arpData => utils.parseArpList(arpData))
    // Callback with data
    .then(arpList => eventEmitter.emit('data', arpList));

  return eventEmitter;
}

function getBroadcastIp() {
  return processes.ifconfig()
    .then(data => utils.parseBroadcastIp(data));
}

function getCurrentMacAddress() {
  return processes.ifconfig()
    .then(data => utils.parseEn1Ether(data));
}

function setMacAddress(address) {
  processes.setEn1Ether(address);
}

function isValidMacAddress(address) {
  return (
    address.length === 17
    && address.match(/(([0-9a-fA-F]{2})[:-]){5}([0-9a-fA-F]{2})/gi)
  );
}

module.exports.getMacAddresses = getMacAddresses;
module.exports.getBroadcastIp = getBroadcastIp;
module.exports.getCurrentMacAddress = getCurrentMacAddress;
module.exports.setMacAddress = setMacAddress;
module.exports.isValidMacAddress = isValidMacAddress;
module.exports.generateMacAddress = utils.generateMacAddress;
