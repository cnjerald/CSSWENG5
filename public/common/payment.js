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

    
    $('[name^="uic"]').on('input', function(){
        let uic = $("#uic1").val() + $("#uic2").val() + $("#uic3").val() + $("#uic4").val() + $("#uic5").val() + $("#uic6").val() + $("#uic7").val();
        
        if (uic.length === 14) {
            $.post(
                'membership_request',
                { input: uic },
                function(data, status) {
                    if(status==='success'){
                        $("label[for='name']").html("Name:" + data.name);
                        $("label[for='membership']").html("Membership Status:" + data.memberUntil);
                    }
                }
            );
        } else {
            console.log("UIC length is not 14.");
        }
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
