$(document).ready(function() {
    let selectedEvent = "";
    let eventId = 0;
    // Use event delegation for dynamically added elements
    $('.database-wrapper').on('click', '.add-attendee-btn', function() {
        const button = $(this);
        eventId = button.data('event-id');
        console.log('Event ID:', eventId);  // For debugging

        const databaseItem = button.closest('tr') || button.closest('.database-item');

        if (databaseItem.length) {
            const nameElement = databaseItem.find('.UIC');
            if (nameElement.length) {
                const name = nameElement.text();
                selectedEvent = name;
                $.post("event_ajax", { eventName: name, _id: eventId }, function(data, status) {
                    if (status === "success") {
                        const memberNames = data.members.map(member => member.name);

                        // Populate the datalist
                        const datalist = $('#attendeeNames');
                        datalist.empty(); // Clear any existing options
                        memberNames.forEach(name => {
                            const option = $('<option>').val(name);
                            datalist.append(option);
                        });

                        // Populate the current registered users table
                        const registeredMembers = data.registeredMembers;
                        const tableBody = $("#registerAttendeePopup table tbody");
                        tableBody.empty(); // Clear existing rows
                        registeredMembers.forEach(member => {
                            const row = $('<tr>');
                            const nameCell = $('<td>').text(member.name);
                            const uicCell = $('<td>').text(member.uic_code);
                            row.append(nameCell).append(uicCell);
                            tableBody.append(row);
                        });

                        // Show the popup
                        $("#registerAttendeePopup").css('display', 'block');
                    }
                });
            }
        }
    });

    function validateInput() {
        const input = $('#person').val();
        const options = $('#attendeeNames option').map(function() {
            return this.value;
        }).get();
        return options.includes(input);
    }

    $('#add-btn').on('click', function() {
        const attendeeName = $('#person').val();
        if (validateInput()) {
            if (attendeeName) {
                $.post("event_user_ajax", { eventName: selectedEvent, attendeeName: attendeeName , _id: eventId }, function(data, status) {
                    if (status === "success") {
                        const memberNames = data.members.map(member => member.name);
                        console.log(memberNames);

                        // Populate the datalist
                        const datalist = $('#attendeeNames');
                        datalist.empty(); // Clear any existing options
                        memberNames.forEach(name => {
                            const option = $('<option>').val(name);
                            datalist.append(option);
                        });

                        // Populate the current registered users table
                        const registeredMembers = data.registeredMembers;
                        const tableBody = $("#registerAttendeePopup table tbody");
                        tableBody.empty(); // Clear existing rows
                        registeredMembers.forEach(member => {
                            const row = $('<tr>');
                            const nameCell = $('<td>').text(member.name);
                            const uicCell = $('<td>').text(member.uic_code);
                            row.append(nameCell).append(uicCell);
                            tableBody.append(row);
                        });

                        // Clear the input box
                        $('#person').val('');
                    }
                });
            }
        } else {
            alert("This user is invalid.");
        }
    });

    // Close the popup when clicking on the X button
    $('.close').on('click', function() {
        $("#registerAttendeePopup").css('display', 'none');
    });

    // Close the popup when clicking outside of it
    $(window).on('click', function(event) {
        const popup = $('#registerAttendeePopup');
        if (event.target === popup[0]) {
            popup.css('display', 'none');
        }
    });
});