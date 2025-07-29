$(document).ready(function () {
    // Handle Add Parking Lot form submission
    $('#addParkingLotForm').on('submit', function (event) {
        event.preventDefault();
        const data = $(this).serialize();
        $.post('/api/parking-lots', data, function (response) {
            alert('Parking lot added successfully!');
            window.location.href = '/';
        }).fail(function () {
            alert('Error adding parking lot');
        });
    });

    // Populate available spaces based on selected parking lot
    $('#parkingLotId').on('change', function () {
        const parkingLotId = $(this).val();
        if (parkingLotId) {
            $.get(`/api/available-spaces/${parkingLotId}`, function (data) {
                const spaceSelect = $('#spaceId');
                spaceSelect.empty();
                data.forEach(space => {
                    spaceSelect.append(new Option(`Space ${space.space_number}`, space.space_id));
                });
            });
        }
    });

    // Handle Vehicle Entry form submission
    $('#entryForm').on('submit', function (event) {
        event.preventDefault();
        const vehicleData = {
            license_plate: $('#licensePlate').val(),
            vehicle_type: $('#vehicleType').val()
        };

        $.post('/api/vehicles', vehicleData, function (vehicleResponse) {
            const logData = {
                vehicle_id: vehicleResponse.id,
                space_id: $('#spaceId').val(),
                entry_time: new Date().toISOString()
            };

            $.post('/api/logs', logData, function (logResponse) {
                alert('Vehicle added successfully!');
                window.location.href = '/';
            });
        }).fail(function () {
            alert('Error adding vehicle');
        });
    });

    // Populate vehicle dropdown for exit form
    $.get('/api/vehicles', function (data) {
        const vehicleSelect = $('#vehicleId');
        data.forEach(vehicle => {
            vehicleSelect.append(new Option(`Vehicle ID ${vehicle.vehicle_id} - ${vehicle.license_plate}`, vehicle.vehicle_id));
        });
    });

    
    // Handle Vehicle Exit form submission
    $('#exitForm').on('submit', function (event) {
        event.preventDefault();
        const vehicleId = $('#vehicleId').val();

        $.get(`/api/logs?vehicle_id=${vehicleId}`, function (logs) {
            if (logs.length > 0) {
                const log = logs[0];
                $.ajax({
                    url: `/api/logs/${log.log_id}`,
                    type: 'DELETE',
                    success: function (response) {
                        alert('Vehicle removed successfully!');
                        window.location.href = '/';
                    },
                    error: function () {
                        alert('Error removing vehicle');
                    }
                });
            } else {
                alert('No logs found for this vehicle');
            }
        });
    });
});
