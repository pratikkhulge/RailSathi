function decryptData(encryptedData) {
    var key = CryptoJS.enc.Utf8.parse('etbc76358OMg7fgm456dsSFG');
    var decrypted = CryptoJS.AES.decrypt(encryptedData, key, { mode: CryptoJS.mode.ECB });
    return decrypted.toString(CryptoJS.enc.Utf8);
}

(async function () {
    const loadingSpinner = document.getElementById('loadingContainer');

    try {
        const urlParams = new URLSearchParams(window.location.search);
        const pnrNumberFromURL = urlParams.get('pnr');
        if (pnrNumberFromURL) {
            loadingSpinner.style.display = 'block';
            const decryptedPNR = decryptData(pnrNumberFromURL);
            // console.log('Decrypted PNR:', decryptedPNR);
            // console.log('Loading Spinner Visible');            
            // alert('PNR from URL: ' + pnrNumberFromURL);
            const responseData = await fetchData(decryptedPNR);
            setSharedData(responseData);
            checkPNR(responseData, decryptedPNR);
        } else {
            alert('No PNR found in the URL.');
        }
    } catch (error) {
        console.error(error);
        alert('An error occurred. Please try again later.');
    } finally {
        loadingSpinner.style.display = 'none';
    }
})();

async function fetchData(pnrNumber) {
    try {
        const response = await axios.get(`/pnr-status/${pnrNumber}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch data from the server.');
    }
}

async function checkPNR(responseData, pnrNumber) {
    const container = document.getElementById("pnrDetailsContainer");
    const loadingSpinner = document.getElementById('loadingContainer');

    try {
        if (responseData.status === false) {
            const errorMessage = responseData.error || 'An error occurred. Please try again later.';
            const errorContent = `<div class="alert alert-danger mt-3 text-center" role="alert">${errorMessage}</div>`;
            container.innerHTML = errorContent;
        } else {
            updatePNRDetails(responseData, pnrNumber);
            localStorage.setItem('apiData', JSON.stringify(responseData));
        }
    } catch (error) {
        console.error(error);
        const errorMessage = 'An unexpected error occurred. Please try again later.';
        const errorContent = `<div class="alert alert-danger mt-3" role="alert">${errorMessage}</div>`;
        container.innerHTML = errorContent;
    } finally {
        loadingSpinner.style.display = 'none';
    }
}



function updatePNRDetails(data, pnrNumber) {
    const container = document.getElementById("pnrDetailsContainer");

    if (!data.data || !data.data.trainInfo || !data.data.boardingInfo || !data.data.destinationInfo) {
        console.error('Incomplete or missing data:', data);
        return;
    }

    const apiDate = data.data.trainInfo.dt;
    const [day, month, year] = apiDate.split('-').map(Number);
    const dateObject = new Date(year, month - 1, day);
    const options = { day: '2-digit', month: 'short' };
    const formattedDate = dateObject.toLocaleDateString('en-US', options);

    const dynamicContent = `
        <h4>PNR : ${pnrNumber}</h4>
        <br>
        <h5>${data.data.trainInfo.name ? data.data.trainInfo.name : 'Undefined'} - ${data.data.trainInfo.trainNo ? data.data.trainInfo.trainNo : 'Undefined'}</h5>
        <p>${data.data.boardingInfo.stationName ? data.data.boardingInfo.stationName : 'Undefined'}-${data.data.boardingInfo.stationCode ? data.data.boardingInfo.stationCode : 'Undefined'},${formatTime(data.data.boardingInfo.arrivalTime) ? formatTime(data.data.boardingInfo.arrivalTime) : 'Undefined'} 
            <span>
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="16" fill="currentColor" class="bi bi-arrow-right" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8" />
                </svg>
            </span> 
            ${data.data.destinationInfo.stationName ? data.data.destinationInfo.stationName : 'Undefined'}-${data.data.destinationInfo.stationCode ? data.data.destinationInfo.stationCode : 'Undefined'},${formatTime(data.data.destinationInfo.arrivalTime) ? formatTime(data.data.destinationInfo.arrivalTime) : 'Undefined'}
        </p>
        <p>${convertDayNumberToDay(data.data.boardingInfo.travellingDay) ? convertDayNumberToDay(data.data.boardingInfo.travellingDay) : 'Undefined'}, ${formattedDate} | SL | GN | Expected platform 
            <span class="badge badge-primary">${data.data.boardingInfo.platform ? data.data.boardingInfo.platform : 'Undefined'}</span>
        </p>
    `;

    container.innerHTML = dynamicContent;

    const passengerTable = document.getElementById("passengerTableBody");
    const passengerInfo = data.data.passengerInfo;
    if (passengerInfo && Array.isArray(passengerInfo) && passengerInfo.length > 0) {
        let passengerTableContent = '';
        passengerInfo.forEach((passenger, index) => {
            const currentStatus = `Coach: ${passenger.currentCoach}, Berth: ${passenger.currentBerthNo}`;
            const bookingStatus = 'N/A';
            const coachPosition = 'N/A';

            passengerTableContent += `
                <tr>
                    <th scope="row">${index + 1}</th>
                    <td>${currentStatus}</td>
                    <td>${bookingStatus}</td>
                    <td>${coachPosition}</td>
                </tr>
            `;
        });

        passengerTable.innerHTML = passengerTableContent;
    }
}

function formatTime(inputTime) {
    const [hours, minutes] = inputTime.split(':');
    const formattedTime = `${hours}:${minutes}`;
    return formattedTime;
}
function convertDayNumberToDay(dayNumber) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (dayNumber >= 1 && dayNumber <= 7) {
        return days[dayNumber - 1];
    } else {
        return 'Invalid day number. Please enter a number between 1 and 7.';
    }
}
