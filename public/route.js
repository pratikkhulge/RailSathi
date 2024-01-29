const storedData = localStorage.getItem('apiData');
const sharedDataRoute = storedData ? JSON.parse(storedData) : null;

function updateRouteDetails(data) {
    const RouteTable = document.getElementById("RouteTableBody");

    if (data && data.data && data.data.trainRoutes && data.data.trainRoutes.length > 0) {
        data.data.trainRoutes.forEach((route, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <th scope="row">${index + 1}</th>
                <td>${route.stationName}</td>
                <td>${route.stationCode}</td>
                <td>${formatTime(route.arrivalTime)}</td>
                <td>${formatTime(route.haltTime)}</td>
                <td>${formatTime(route.departureTime)}</td>
                <td>${convertDayNumberToDay(route.travellingDay)}</td>
                <td>${route.distance}</td>
                <td>${route.platform}</td>
            `;
            RouteTable.appendChild(row);
        });        
    } else {
        alert("Data Not Present");
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

updateRouteDetails(sharedDataRoute);