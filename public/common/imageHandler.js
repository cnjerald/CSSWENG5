$(document).ready(function() {
    // Handle file input change to automatically upload
    document.getElementById('imageFile').addEventListener('change', function(event) {
        let formData = new FormData(); // Create FormData object to store form data
        let imageFile = event.target.files[0]; // Get the file selected by the user

        if (imageFile) {
            formData.append('imageFile', imageFile); // Append the file to FormData object with key 'imageFile'

            // Send the image data to the backend using Ajax
            fetch('/upload/image', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // Assuming backend returns JSON response
            })
            .then(data => {
                // Handle the response from the backend
                console.log('Success:', data);
                // Optionally update UI to indicate success
            })
            .catch(error => {
                console.error('Error:', error);
                // Handle errors, show user feedback
            });
        }
    });

    // Handle cancel button click
    document.getElementById('cancelButton').addEventListener('click', function(event) {
        // Prevent the default form submission behavior
        event.preventDefault();
    
        // Clear the file input
        document.getElementById('imageFile').value = '';
        console.log('Upload canceled');
    
        // Send a request to update the session with a null profile picture path
        fetch('/upload/cancel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action: 'cancel' })
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
    });

    document.getElementById('imageFileSigniture').addEventListener('change', function(event) {
        let formData = new FormData(); // Create FormData object to store form data
        let imageFile = event.target.files[0]; // Get the file selected by the user

        if (imageFile) {
            formData.append('imageFileSigniture', imageFile); // Append the file to FormData object with key 'imageFile'

            // Send the image data to the backend using Ajax
            fetch('/upload/imageSigniture', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); // Assuming backend returns JSON response
            })
            .then(data => {
                // Handle the response from the backend
                console.log('Success:', data);
                // Optionally update UI to indicate success
            })
            .catch(error => {
                console.error('Error:', error);
                // Handle errors, show user feedback
            });
        }
    });

    // Handle cancel button click
    document.getElementById('cancelButtonSigniture').addEventListener('click', function(event) {
        // Prevent the default form submission behavior
        event.preventDefault();
    
        // Clear the file input
        document.getElementById('imageFileSigniture').value = '';
        console.log('Upload canceled');
    
        // Send a request to update the session with a null profile picture path
        fetch('/upload/cancelSigniture', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action: 'cancel' })
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
    });
    
});