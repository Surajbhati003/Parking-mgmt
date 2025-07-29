const authErrorMessage = document.getElementById('auth-error');
const parkingLotSelect = document.getElementById('parking-lots');
const slotsContainer = document.getElementById('slots-container');
const entryForm = document.getElementById('entry-form');
const exitForm = document.getElementById('exit-form');
const amountDisplay = document.getElementById('amount-display');
const viewParkingLotButton = document.getElementById('view-parking-lot');
const authForm = document.getElementById('auth-form'); // Ensure you have this line

let currentUser = null;
let firstAvailableSpaceId = null;

// Static user credentials
const users = [
    { username: 'admin', password: 'admin' },
    { username: 'user', password: 'user' }
];

// Function to authenticate user
function authenticate(username, password) {
    return users.find(user => user.username === username && user.password === password);
}

// Event listener for authentication form
if (authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = authForm.elements['username'].value;
        const password = authForm.elements['password'].value;
        const authenticatedUser = authenticate(username, password);

        if (authenticatedUser) {
            authErrorMessage.style.display = 'none';
            authForm.reset();
            currentUser = authenticatedUser; // Set the current user
            window.location.href = './parking-lots.html'; // Navigate to the parking lots page
        } else {
            authErrorMessage.style.display = 'block';
        }
    });
}

// Fetch parking lots and populate select options
async function fetchParkingLots() {
    try {
        const response = await fetch('/api/parking-lots');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const parkingLots = await response.json();
        parkingLotSelect.innerHTML = '<option value="">Select a parking lot</option>'; // Reset options
        parkingLots.forEach(lot => {
            const option = document.createElement('option');
            option.value = lot.parking_lot_id;
            option.textContent = lot.lot_name || 'Unnamed Lot'; // Ensure the name is set
            parkingLotSelect.appendChild(option);
            console.log(`Added lot: ${option.textContent}`); // Log the lot name
        });
    } catch (error) {
        console.error('Error fetching parking lots:', error);
    }
}

// Function to show parking lot details
async function showParkingLot() {
    const selectedLotId = parkingLotSelect.value;
    if (selectedLotId) {
        try {
            const response = await fetch(`/api/parking-lots/${selectedLotId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch parking lot details');
            }
            const data = await response.json();
            const lotDetails = document.getElementById('parking-lot-details');
            lotDetails.innerHTML = `
                <h2>${data[0].lot_name}</h2>
                <p>Location: ${data[0].location}</p>
            `;
            fetchAvailableSpaces(selectedLotId);
        } catch (error) {
            console.error('Error fetching parking lot details:', error);
        }
    } else {
        // Clear details if no parking lot selected
        const lotDetails = document.getElementById('parking-lot-details');
        lotDetails.innerHTML = '';
        slotsContainer.innerHTML = '';
    }
}

// Fetch available spaces for selected parking lot
async function fetchAvailableSpaces(parkingLotId) {
    try {
        const response = await fetch(`/api/available-spaces/${parkingLotId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch available spaces');
        }
        const data = await response.json();
        slotsContainer.innerHTML = '';
        firstAvailableSpaceId = null; // Reset first available space ID
        data.forEach(space => {
            const listItem = document.createElement('li');
            listItem.textContent = `Space ID: ${space.space_id}, Status: ${space.is_occupied ? 'Occupied' : 'Available'}`;
            slotsContainer.appendChild(listItem);
            if (!space.is_occupied && firstAvailableSpaceId === null) {
                firstAvailableSpaceId = space.space_id; // Save the first available space ID
            }
        });
        console.log(`First available space ID: ${firstAvailableSpaceId}`); // Log the first available space ID
    } catch (error) {
        console.error('Error fetching available spaces:', error);
    }
    setsid(firstAvailableSpaceId);
}

// Event listener for selecting a parking lot
if (parkingLotSelect) {
    parkingLotSelect.addEventListener('change', showParkingLot);
}

// Event listener for view parking lot button
if (viewParkingLotButton) {
    viewParkingLotButton.addEventListener('click', () => {
        const selectedLotId = parkingLotSelect.value;
        if (selectedLotId) {
            window.location.href = `./parking-lot.html?lotId=${selectedLotId}`;
        } else {
            alert('Please select a parking lot first.');
        }
    });
}

function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function setFasidCookie(fasid) {
    setCookie('fasid', fasid, 1); // Setting cookie to expire in 1 day
    console.log("fasid set in cookie:", fasid);
}

// Function to call when setting `fasid`
function setsid(sid) {
    console.log("Setting fasid:", sid);
    setFasidCookie(sid);
}

function getFasidFromCookie() {
    const fasid = getCookie('fasid');
    console.log("Retrieved fasid from cookie:", fasid);
    return fasid;
}

// Fetch parking lots on page load if the parking lot select exists
fetchParkingLots();

// Event listener for vehicle entry form
if (entryForm) {
    entryForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(entryForm);
        var data = Object.fromEntries(formData.entries());
        var { license_plate, owner_name, owner_contact, vehicle_type } = data;

        try {
            const response = await fetch('/api/vehicles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                throw new Error('Failed to submit vehicle entry');
            }
            const result = await response.json();
            alert(result.message);
            entryForm.reset();
        } catch (error) {
            console.error('Error submitting vehicle entry:', error);
            alert('Failed to submit vehicle entry');
        }

        const fasidValue = getFasidFromCookie();
        console.log("After Form Submission, fasid:", fasidValue);
        updateParkingSpace(fasidValue, 1);
        createLog(license_plate,fasidValue);
    });
}

// Function to update parking space status
async function updateParkingSpace(space_id, is_occupied) {
    const data = {
        space_id: space_id,
        is_occupied: is_occupied
    };

    try {
        const response = await fetch(`/api/update-parking-spaces`, { // Use PUT
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error('Failed to update parking space');
        }
        const result = await response.json();
        console.log(result.message);
    } catch (error) {
        console.error(error);
        alert('Failed to update parking space');
    }
}


var createLog = async (license_plate, space_id) => {
    const date = new Date();
    const entry_time = date.toTimeString().split(' ')[0]; // Extracting HH:MM:SS format
    console.log('Entry time:', entry_time); 

    const data = {
        license_plate,
        space_id,
        entry_time
    };

    console.log('Data to be sent:', data);
    dat1=JSON.stringify(data);
    try {
        const response = await fetch('/api/logs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: dat1
        });

        if (!response.ok) {
            throw new Error('Failed to create log entry');
        }

        const result = await response.json();
        console.log(result.message); // Optional: log success message or handle response
        return result; // Optionally return any response data
    } catch (error) {
        console.error('Error creating log entry:', error);
        throw new Error('Failed to create log entry');
    }
};



// Event listener for vehicle exit form (dummy function)
if (exitForm) {
    exitForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(exitForm);
        const data = Object.fromEntries(formData.entries());
        var { license_plate } = data;
        console.log("hello");
        try {
            // Set exit time
            console.log("hello1");

            const date = new Date();
            const exit_time = date.toTimeString().split(' ')[0];
            console.log(exit_time);
            console.log(license_plate);

            console.log(data);


            // Update log entry with exit time and update parking space status
            const updateResponse = await fetch(`/api/logs`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ license_plate, exit_time })
            });
            if (!updateResponse.ok) {
                console.log("hello3");

                throw new Error('Failed to update log entry');
            }

            // const result = await updateResponse.json();

            // // Calculate parking fee
            // const { entry_time, space_id } = result;
            // const fee = calculateFee(entry_time, exit_time);
            // amountDisplay.textContent = `Total Amount: $${fee}`;

            alert('Vehicle exit recorded');
            exitForm.reset();
        } catch (error) {
            console.log("hello4");

            console.error('Error updating log:', error);
            alert('Failed to record vehicle exit');
        }
    });
}


// Function to toggle the menu
window.toggleMenu = function() {
    const menuContent = document.querySelector('.menu-content');
    menuContent.classList.toggle('show');
};

// Function to handle logout
window.logout = function() {
    currentUser = null;
    window.location.href = 'index.html';
};

// Add event listener to close menu when clicking outside of it
document.addEventListener('click', function(event) {
    const menuContent = document.querySelector('.menu-content');
    const menuIcon = document.querySelector('.menu-icon');
    if (menuContent && menuIcon && !menuContent.contains(event.target) && !menuIcon.contains(event.target)) {
        menuContent.classList.remove('show');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const fasidValue = getFasidFromCookie();
    console.log("On Page Load, fasid:", fasidValue);
    // Use `fasidValue` as needed
});
