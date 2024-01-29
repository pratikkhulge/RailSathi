document.addEventListener('DOMContentLoaded', function () {
  var exchangeButton = document.getElementById('exchange');

  exchangeButton.addEventListener('click', function () {
      var fromInput = document.querySelector('#collapseTwo input[placeholder="Enter Start station"]');
      var toInput = document.querySelector('#collapseTwo input[placeholder="Enter Destination"]');

      var temp = fromInput.value;
      fromInput.value = toInput.value;
      toInput.value = temp;
  });
});
function Checkstatus() {
  var pnrValue = document.getElementById('pnrInput').value;
  var encryptedPnr = encryptData(pnrValue);
  if (pnrValue.trim() !== '') {
      var url = 'main.html?pnr=' + encodeURIComponent(encryptedPnr);
      window.location.href = url;
  } else {
      alert('Please enter a valid PNR number.');
  }
}

let timeout;

async function getStations(type) {
  const inputElement = document.getElementById(`${type}Station`);
  const listElement = document.getElementById(`${type}StationList`);
  const inputValue = inputElement.value.trim();

  if (inputValue.length === 0) {
      listElement.innerHTML = '';
      return;
  }

  clearTimeout(timeout);

  timeout = setTimeout(async () => {
      try {
          const response = await fetch(`/api/stations?q=${inputValue}&limit=10`);
          const data = await response.json();

          listElement.innerHTML = '';

          data.data.forEach(station => {
              const listItem = document.createElement('li');
              listItem.textContent = `${station.stationName} (${station.stationCode})`;
              listItem.addEventListener('click', () => {
                  inputElement.value = `${station.stationName} (${station.stationCode})`;
                  listElement.innerHTML = '';
              });
              listElement.appendChild(listItem);
          });
      } catch (error) {
          // console.error('Error fetching stations:', error.message);
          listElement.innerHTML = '<li>No such stations found</li>';
      }
  }, 600);
}

// Search Trains
function encryptData(data) {
  var key = CryptoJS.enc.Utf8.parse('etbc76358OMg7fgm456dsSFG');
  var encrypted = CryptoJS.AES.encrypt(data, key, { mode: CryptoJS.mode.ECB });
  return encrypted.toString();
}
function extractStationCode(input) {
  var match = /\(([^)]+)\)/.exec(input);
  return match ? match[1] : null;
}

function searchTrains() {
  var fromInput = document.getElementById('sourceStation').value;
  var toInput = document.getElementById('destinationStation').value;
  var travelDate = document.getElementById('travelDate').value;
  var fromStationCode = extractStationCode(fromInput);
  var toStationCode = extractStationCode(toInput);

  var encryptedFrom = encryptData(fromStationCode);
  var encryptedTo = encryptData(toStationCode);
  var encryptedDate = encryptData(travelDate);
  var redirectUrl = 'findtrain.html?from=' + encodeURIComponent(encryptedFrom) +
      '&to=' + encodeURIComponent(encryptedTo) +
      '&date=' + encodeURIComponent(encryptedDate);

  window.location.href = redirectUrl;
}
