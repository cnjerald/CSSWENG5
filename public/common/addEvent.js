document.addEventListener('DOMContentLoaded', (event) => {
    const addEventBtn = document.getElementById('addEventBtn');
    const popupForm = document.getElementById('popupForm');
    const closeBtn = document.getElementsByClassName('close')[0];

    // Show the popup form
    addEventBtn.onclick = function() {
        popupForm.style.display = 'block';
    }

    // Hide the popup form when the close button is clicked
    closeBtn.onclick = function() {
        popupForm.style.display = 'none';
    }

    // Hide the popup form when clicking outside of the form
    window.onclick = function(event) {
        if (event.target == popupForm) {
            popupForm.style.display = 'none';
        }
    }

    // Handle form submission
    document.getElementById('eventForm').onsubmit = function(event) {
        event.preventDefault();
        const eventName = document.getElementById('eventName').value;
        const eventDate = document.getElementById('eventDate').value;

        console.log(`Event Name: ${eventName}, Event Date: ${eventDate}`);
        
        // Prepare data to be sent
        const eventData = {
            eventName: eventName,
            eventDate: eventDate
        };

        // Send data to the server
        fetch('/api/add-event', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            // After successful addition, close the popup, clear the form, and refresh the page
            popupForm.style.display = 'none';
            document.getElementById('eventForm').reset();
            window.location.reload(); // Refresh the page
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }



    // Close popup
    document.querySelectorAll(".popup-form .close").forEach(closeBtn => {
        closeBtn.addEventListener("click", function () {
            this.parentElement.parentElement.style.display = "none";
        });
    });



});