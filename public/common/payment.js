$(document).ready(function() {
    // Variable to hold the interval reference
    var intervalId;



    
    $('[name^="uic"]').on('input', function(){
        let uic = $("#uic1").val() + $("#uic2").val() + $("#uic3").val() + $("#uic4").val() + $("#uic5").val() + $("#uic6").val() + $("#uic7").val();
        
        if (uic.length === 14) {
            $.post(
                'membership_request',
                { input: uic },
                function(data, status) {
                    if(status==='success'){
                        $("label[for='name']").html("Name:" + data.name);
                        $("label[for='membership']").html("Membershaip Status:" + data.memberUntil);
                    }
                }
            );
        } else {
            console.log("UIC length is not 14.");
        }
    });

    // Click event handler for the payment button
    $("#paymentButton").click(function() {
        $.post(
            '/payment_request',  // Adjusted URL endpoint assuming it's relative to the current domain
            { input: '100' },
            function(data, status) {
                if (status === 'success') {
                    renderWebsiteInIframe(data.link);
                    // Start the interval to check payment status
                    intervalId = setInterval(checkPaymentStatus, 1000);
                }
            }
        ).fail(function() {
            clearInterval(intervalId);  // Clear interval on failure to start
        });
    });

    // Function to check payment status
    function checkPaymentStatus() {
        $.post(
            '/payment_checker',  // Adjusted URL endpoint assuming it's relative to the current domain
            { input: '200', uic: $("#uic1").val() + $("#uic2").val() + $("#uic3").val() + $("#uic4").val() + $("#uic5").val() + $("#uic6").val() + $("#uic7").val() },
            function(data, status) {
                if (status === 'success') {
                    if (data.paymentStatus === 'paid') {
                        // Stop the interval when payment is paid
                        clearInterval(intervalId);
                        $('#iframeContainer').empty();
                        $("#paymentStatusContainer").text(data.paymentStatus + "You may now close this window").css("color", "green");
                    }
                    $("#paymentStatusContainer").text(data.paymentStatus + "Do not close this window").css("color", "red");
                }
            }
        ).fail(function() {
            clearInterval(intervalId);  // Clear interval on failure to check status
        });
    }

    function renderWebsiteInIframe(url) {
        // Create an iframe element
        var iframe = document.createElement('iframe');

        // Set attributes for the iframe
        iframe.src = url;
        iframe.width = '100%';
        iframe.height = '600';
        iframe.frameBorder = '0';

        // Append the iframe to a container element on your page
        document.getElementById('iframeContainer').appendChild(iframe);
    }
});
