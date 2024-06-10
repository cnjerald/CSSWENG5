$(document).ready(function() {
    // Variable to hold the interval reference
    var intervalId;

    $("#paymentButton").click(function() {
        $.post(
            'payment_request',
            { input: '100' },
            function(data, status) {
                if (status === 'success') {
                    renderWebsiteInIframe(data.link);
                    // Start the interval when payment request is successful
                    intervalId = setInterval(checkPaymentStatus, 1000);
                }
            }
        );
    });

    function checkPaymentStatus() {
        $.post(
            'payment_checker',
            { input: '200' },
            function(data, status) {
                if (status === 'success') {
                    if(data.paymentStatus === 'paid'){
                        // Stop the interval when payment is paid
                        clearInterval(intervalId);
                    }
                    $("#paymentStatusContainer").text(data.paymentStatus);
                }
            }
        );
    }

    function renderWebsiteInIframe(url) {
        // Create an iframe element
        var iframe = document.createElement('iframe');

        // Set attributes for the iframe
        iframe.src = url;
        iframe.width = '100%';
        iframe.height = '600px';
        iframe.frameBorder = '0';

        // Append the iframe to a container element on your page
        document.getElementById('iframeContainer').appendChild(iframe);
    }
});
