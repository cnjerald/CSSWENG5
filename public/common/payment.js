$(document).ready(function() {
    $("#paymentButton").click(function() {
        $.post(
            'payment_request',
            { input: '100' },
            function(data, status) {
                if (status === 'success') {
                    renderWebsiteInIframe(data.link);
                }
            }
        );
    });

    //every 5 seconds
    function checkPaymentStatus() {
        $.post(
            'payment_checker',
            { input: '200' },
            function(data, status) {
                if (status === 'success') {
                    $("#paymentStatusContainer").text(data.paymentStatus);
                }
            }
        );
    }

    // Set an interval to call checkPaymentStatus every 5 seconds
    setInterval(checkPaymentStatus, 5000);

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