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
        document.getElementById('imageFile').value = ''; // Clear the file input
        console.log('Upload canceled');
        // Optionally update UI to indicate cancellation
    });
});