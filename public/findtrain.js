function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function decryptData(encryptedData) {
    var key = CryptoJS.enc.Utf8.parse('etbc76358OMg7fgm456dsSFG');
    var decrypted = CryptoJS.AES.decrypt(encryptedData, key, { mode: CryptoJS.mode.ECB });
    return decrypted.toString(CryptoJS.enc.Utf8);
}

var fromStationCode = decryptData(getUrlParameter('from'));
var toStationCode = decryptData(getUrlParameter('to'));
var travelDate = decryptData(getUrlParameter('date'));
var travelDay = dateToDay(travelDate);

// console.log('From Station Code:', fromStationCode);
// console.log('To Station Code :', toStationCode);
// console.log('Travel Date :', travelDate);
// console.log('Travel Day :', travelDay);

window.onload = function () {
    searchTrainDetails(fromStationCode, toStationCode, travelDay);
};

async function searchTrainDetails(fromStationCode, toStationCode, travelDay) {
    if (!fromStationCode || !toStationCode) {
        displayError('Please provide Valid source and destination station.');
        return;
    }

    try {
        const response = await fetch('/api/searchTrain', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fromStationCode, toStationCode }),
        });

        const data = await response.json();
        console.log(data.error);

        // if (data==error && data.error.code=="ERR-0003"){
        //     error: "No resource found for given parameters."
        //     displayError(error)
        // }
        // const filteredTrains = filterTrainsByDay(data, travelDay);

        // if (filteredTrains.length === 0) {
        //     updateTrainContentNoTrains(travelDate, travelDay);
        // } else {
        //     updateTrainContent(filteredTrains);
        // }

        if (response.ok) {
            const filteredTrains = filterTrainsByDay(data, travelDay);

            if (filteredTrains.length === 0) {
                updateTrainContentNoTrains(travelDate, travelDay);
            } else {
                updateTrainContent(filteredTrains);
            }
        } else {
            displayError('Error searching for trains. No Trains Found On That Route.');
        }
    } catch (error) {
        console.error('Error searching for trains:', error);
    }
}

function filterTrainsByDay(data, travelDay) {
    return data.filter(train => {
        return (
            train &&
            train.trainRunsOn &&
            typeof train.trainRunsOn === 'object' &&
            ((train.trainRunsOn[travelDay.toLowerCase()] || train.trainRunsOn['tueday']) ||
                (typeof train.trainRunsOn['tuesday'] === 'string' &&
                    train.trainRunsOn['tuesday'].toLowerCase() === 'true'))
        );
    });
}

async function updateTrainContent(trainsData) {
    const container = document.getElementById('trainContainer');
    if (!container) {
        console.error('Container element not found');
        return;
    }
    container.innerHTML = '';

    const resultInfoDiv = document.createElement('div');
    resultInfoDiv.className = 'result-info';
    resultInfoDiv.innerHTML = `
    <p class="result-message">Showing train details on <strong>${dateToDayMain(travelDate)}</strong> (${travelDay}):</p>
    `;
    container.appendChild(resultInfoDiv);

    trainsData.forEach(train => {
        const colDiv = document.createElement('div');
        colDiv.className = 'row';

        colDiv.innerHTML = `
        <div class="col-4">
            <h6> <strong>${train.trainNumber} | ${train.trainName} </strong> <span><svg xmlns="http://www.w3.org/2000/svg" width="15"
                        height="15" fill="currentColor" class="bi bi-caret-right-fill" viewBox="0 0 16 16">
                        <path
                            d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z" />
                    </svg></span></h6>

            <h6><strong>${formatTime(train.stationFrom.departureTime)}</strong></h6>
            <p>${train.stationFrom.stationName}</p>
            <p>Pantry: ${hasPantry(train.hasPantry)}</p>

        </div>
        <div class="col-4 text-center align-self-center fade-color">

            <p><span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                        class="bi bi-arrow-left" viewBox="0 0 16 16">
                        <path fill-rule="evenodd"
                            d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8" />
                    </svg></span> ${train.duration} <span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                        fill="currentColor" class="bi bi-arrow-right" viewBox="0 0 16 16">
                        <path fill-rule="evenodd"
                            d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8" />
                    </svg></span></p>
            <p>${train.distance} km</p>
        </div>
        <div class="col-4 text-right">
        <h6 class="fade-color"> <strong>${getDaysOfWeek(train.trainRunsOn)}</strong> </h6>

            <h6><strong>${formatTime(train.stationTo.arrivalTime)}</strong></h6>
            <p>${train.stationTo.stationName}</p>
            <p><span class="coaches">${train.availableClasses}</p>
        </div>
    </div>
        `;

        container.appendChild(colDiv);
        
    });
    
}


function hasPantry(data) {
    if (data) {
        return '<span style="color: green;">YES</span>';
    } else {
        return '<span style="color: red;">NO</span>';
    }
}

function formatTime(inputTime) {
    if (!inputTime) {
        return '';
    }

    const [hours, minutes] = inputTime.split(':');
    const formattedTime = `${hours}:${minutes}`;
    return formattedTime;
}



function getDaysOfWeek(daysOfWeek) {
    const days = ['sunday', 'monday', 'tueday', 'wednesday', 'thursday', 'friday', 'saturday'];

    if (typeof daysOfWeek !== 'object' || !daysOfWeek.hasOwnProperty) {
        console.error('Invalid daysOfWeek object:', daysOfWeek);
        return days.join(' ');
    }

    return days.map((day, index) => {
        const isDayActive = daysOfWeek[day]; 

        if (isDayActive === true) {
            return `<span style="color: darkgreen; text-shadow: 0 0 5px #00ff00; font-weight: bold;">${day.charAt(0).toUpperCase()}</span>`;
        } else {
            return `<span style="color: red;">${day.charAt(0).toUpperCase()}</span>`;
        }
    }).join(' ');
}


function dateToDay(dateString) {
    const dateObject = new Date(dateString);
    const dayOfWeek = dateObject.toLocaleDateString('en-US', { weekday: 'long' });
    return dayOfWeek;
}

function displayError(message) {
    const container = document.getElementById('trainContainer');
    if (!container) {
        console.error('Container element not found');
        return;
    }

    container.innerHTML = `
        <div class="error-message">
        <img src="images/sad.png" alt="Sad Emoji" class="emoji">
            <p>${message}</p>
        </div>
    `;

    const style = document.createElement('style');
    style.innerHTML = `
        .error-message {
            text-align: center;
            margin: 20px;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 8px;
            background-color: #f8d7da;
            color: #721c24;
            position: relative;
            animation: fadeInUp 0.5s ease-out;
        }
        .emoji {
            width: 50px;
            height: 50px;
            margin-bottom: 10px;
        }

        @keyframes fadeInUp {
            0% {
                opacity: 0;
                transform: translateY(20px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;

    document.head.appendChild(style);
}

function updateTrainContentNoTrains(date, day) {
    const container = document.getElementById('trainContainer');
    if (!container) {
        console.error('Container element not found');
        return;
    }

    container.innerHTML = `
        <div class="no-trains-message">
            <img src="images/sad.png" alt="Sad Emoji" class="emoji">
            <p>We're sorry, but no trains are available on ${day}, ${date}.</p>
            <p>Please check other dates or adjust your travel plans.</p>
        </div>
    `;

    // Add CSS for styling and animation
    const style = document.createElement('style');
    style.innerHTML = `
        .no-trains-message {
            text-align: center;
            margin: 20px;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 8px;
            background-color: #f8d7da;
            color: #721c24;
            position: relative;
            animation: fadeInUp 0.5s ease-out;
        }

        .emoji {
            width: 50px;
            height: 50px;
            margin-bottom: 10px;
        }

        @keyframes fadeInUp {
            0% {
                opacity: 0;
                transform: translateY(20px);
            }
            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;

    document.head.appendChild(style);
}

function dateToDayMain(dateString) {
    const dateObject = new Date(dateString);
    const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(dateObject);
    const day = dateObject.getDate();
    return `${month} ${day}`;
}