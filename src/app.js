const utils = require('./utils');
const hack = require('./hack');
const sudo = require('sudo-prompt');
const isOnline = require('is-online');

// On document loaded
utils.ready(() => {
  let timedInterval;

  // Add click handler for custom modification of mac address
  document
    .getElementById('custom-mac-submit')
    .addEventListener('click', () => {
      const customAddress = document.getElementById('custom-mac-address').value;

      // Validate Address as being valid
      if (hack.isValidMacAddress(customAddress)) {
        setMacAddress(customAddress);
      } else {
        // Temporary
        alert(`The provided MAC-Address '${customAddress}' is not valid.`);
      }
    });

  document
    .getElementById('timed-change-submit')
    .addEventListener('click', () => {
      const button = document.getElementById('timed-change-submit');
      const time = parseFloat(document.getElementById('timed-change-time').value, 10);

      if (timedInterval) {
        clearInterval(timedInterval);

        button.innerText = 'Start Cycle';
      } else {
        timedInterval = setInterval(() => {
          setMacAddress(hack.generateMacAddress());
        }, time * 60 * 1000);

        button.innerText = 'Stop Cycle';
      }
    });

  // Add refresh button click handler
  document
    .getElementById('mac-address-table-refresh')
    .addEventListener('click', () => {
      refetchMacAddresses();
    });

  // Set Label to 'fetching...' to
  document
    .getElementById('current-mac-address')
    .innerText = 'Fetching MAC-Address...';

  // Check every 10 seconds for online state
  setInterval(checkOnlineState, 5000);
  checkOnlineState();

  refetchMacAddresses();
  updateMacAddress();
});

function setMacAddress(address) {
  sudo.exec(`ifconfig en1 ether ${address}`, { name: 'HotspotBypass' }, () => {
    updateMacAddress();
  });
}

// Fetches last ifconfig then parses the en1 ether address and applies it to the label.
function updateMacAddress() {
  hack.getCurrentMacAddress()
    .then(address => {
      if (address === 'ff:ff:ff:ff:ff:ff') {
        document.getElementById('current-mac-address').innerText =
          'An error occurred fetching the address...';
      } else {
        document.getElementById('current-mac-address').innerText = address;
      }
    });
}

// Pings the en1 broadcast address and then parses the arp -a table to our ui table.
function refetchMacAddresses() {
  const table = document.getElementById('mac-address-table');
  const progress = document.getElementById('mac-address-table-progress-bar');
  const progressTask = document.querySelector('#mac-address-table-progress-bar .progress-task');
  const progressBar = document.querySelector('#mac-address-table-progress-bar .progress-bar');

  progress.style.display = 'block';
  progressTask.innerHTML = 'Requesting ping to network...';
  progressBar.value = 0;

  // Ping broadcast address and parse arp table.
  hack.getMacAddresses()
    // On ping start
    .on('ping', () => {
      progressTask.innerHTML = 'Pinging network...';
      progressBar.value = 33.3;
    })
    // On arp start
    .on('arp', () => {
      progressTask.innerHTML = 'Fetching ARP-table from kernel...';
      progressBar.value = 66.6;
    })
    // On data received
    .on('data', addresses => {
      progressTask.innerHTML = 'Received ARP-data.';
      progressBar.value = 100;
      progress.style.display = 'none';
      table.style.display = 'table';

      const tbody = table.querySelector('tbody');
      tbody.innerHTML = '';

      // Create table
      addresses.forEach((address) => {
        const row = document.createElement('tr');

        row.appendChild(utils.createCell(address.name));
        row.appendChild(utils.createCell(`<code>${address.address}</code>`));

        // Create 'steal'-button to be able to directly use that address.
        const button = document.createElement('button');
        button.className = 'button is-small';
        button.innerText = 'Steal Address';
        button.addEventListener('click', () => {
          if (confirm(
            'Stealing addresses is not recommended!\n' +
            'It will most likely break the network or break your connection to it.\n' +
            'Are you sure you want to steal this address?'
          )) {
            setMacAddress(address.address);
          }
        });

        // Add button to row
        row.appendChild(utils.createCell(button));

        tbody.appendChild(row);
      });
    });
}

function checkOnlineState() {
  isOnline((err, online) => {
    const box = document.getElementById('connection-state');
    const state = box.querySelector('.state');

    if (online) {
      if (!utils.hasClass(box, 'connected')) {
        utils.addClass(box, 'connected');
      }

      state.innerText = 'Internet Connection valid';
    } else {
      if (utils.hasClass(box, 'connected')) {
        utils.removeClass(box, 'connected');
      }

      state.innerText = 'No Internet Connection';
    }
  });
}
