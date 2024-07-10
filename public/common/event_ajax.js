$(document).ready(function() {
    let selectedEvent = "";
    document.querySelectorAll('.add-attendee-btn').forEach(button => {
        button.addEventListener('click', function() {
            // Find the closest database item
            const eventId = button.getAttribute('data-event-id');
            console.log('Event ID:', eventId);  // For debugging

            const databaseItem = button.closest('.database-item');

            if (databaseItem) {
                const nameElement = databaseItem.querySelector('.UIC');
                if (nameElement) {
                    const name = nameElement.textContent;
                    selectedEvent = name;
                    $.post("event_ajax", {eventName: name, _id: eventId}, function(data, status) {
                        if (status === "success") {
                            // Get the member names from the data
                            const memberNames = data.members.map(member => member.name);
    
                            // Populate the datalist
                            const datalist = document.getElementById('attendeeNames');
                            datalist.innerHTML = ''; // Clear any existing options
                            memberNames.forEach(name => {
                                const option = document.createElement('option');
                                option.value = name;
                                datalist.appendChild(option);
                            });
    
                            // Populate the current registered users table
                            const registeredMembers = data.registeredMembers;
                            const tableBody = document.querySelector("#registerAttendeePopup table tbody");
                            tableBody.innerHTML = ''; // Clear existing rows
                            registeredMembers.forEach(member => {
                                const row = document.createElement('tr');
                                const nameCell = document.createElement('td');
                                const uicCell = document.createElement('td');
                                nameCell.textContent = member.name;
                                uicCell.textContent = member.uic_code;
                                row.appendChild(nameCell);
                                row.appendChild(uicCell);
                                tableBody.appendChild(row);
                            });
    
                            // Show the popup
                            document.getElementById("registerAttendeePopup").style.display = "block";
                        }
                    });
                }
            }
        });
    });
    

    function validateInput() {
        const input = $('#person').val();
        const options = $('#attendeeNames option').map(function() {
            return this.value;
        }).get();
        return options.includes(input);
    }

    document.getElementById('add-btn').addEventListener('click', function() {
        const attendeeName = document.getElementById('person').value;
        if(validateInput()){
            if (attendeeName) {
                $.post("event_user_ajax", {eventName: selectedEvent, attendeeName: attendeeName}, function(data, status) {
                    if (status === "success") {

                        const memberNames = data.members.map(member => member.name);
                        console.log(memberNames);
                        // Populate the datalist
                        const datalist = document.getElementById('attendeeNames');
                        datalist.innerHTML = ''; // Clear any existing options
                        memberNames.forEach(name => {
                            const option = document.createElement('option');
                            option.value = name;
                            datalist.appendChild(option);
                        });

                        const registeredMembers = data.registeredMembers;
                        const tableBody = document.querySelector("#registerAttendeePopup table tbody");
                        tableBody.innerHTML = ''; // Clear existing rows
                        registeredMembers.forEach(member => {
                            const row = document.createElement('tr');
                            const nameCell = document.createElement('td');
                            const uicCell = document.createElement('td');
                            nameCell.textContent = member.name;
                            uicCell.textContent = member.uic_code;
                            row.appendChild(nameCell);
                            row.appendChild(uicCell);
                            tableBody.appendChild(row);
                        });
        
                        // Clear the input box
                        document.getElementById('person').value = '';
                    }
                });
            }
        } else{
            alert("This user is invalid.");
        }

    });
    

    window.addEventListener('click', function(event) {
        const popup = document.getElementById('registerAttendeePopup');
        if (event.target === popup) {
            popup.style.display = 'none';
        }
    });


    

});