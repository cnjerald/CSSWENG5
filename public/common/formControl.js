$(document).ready(function() {
    // Initially hide page 2 and 3
    $("#page2, #page3").hide();
    disablePageFields("#page2, #page3");

    // Show page 2 when clicking on page 2 button, hide page 1
    $("#page2Button").click(function() {
        togglePages("#page1", "#page2");
    });

    // Show page 1 when clicking on page 1 button, hide page 2
    $("#page1Button").click(function() {
        togglePages("#page2", "#page1");
    });

    // Show page 3 when clicking on page 3 button, hide page 2
    $("#page3Button").click(function() {
        togglePages("#page2", "#page3");
    });

    // Show page 2 when clicking on page 4 button, hide page 3
    $("#page4Button").click(function() {
        togglePages("#page3", "#page2");
    });

    $("#submit-btn").click(function(event) {
        // Check if all required fields on all pages are filled
        var allFieldsFilled = true;
        $(".form-page").each(function() {
            $(this).find(':input').each(function() {
                if ($(this).prop('required') && $.trim($(this).val()) === '') {
                    allFieldsFilled = false;
                    return false; // Exit loop if any required field is unfilled
                }
            });
            if (!allFieldsFilled) return false; // Exit loop if any required field is unfilled
        });
    
        if (!allFieldsFilled) {
            // If any required field is unfilled, prevent form submission
            alert('Please fill out all required fields.');
            event.preventDefault();
        } else {
            // If all required fields are filled, show all pages
            $(".form-page").show();
        }
    });

    // Automatically move focus to the next input field when maxlength is reached
    $('.uic-box').on('input', function() {
        var maxLength = parseInt($(this).attr('maxlength'));
        var currentLength = $(this).val().length;
        if (currentLength === maxLength) {
            $(this).next('.uic-box').focus();
        }
    });

    // Function to toggle pages and manage form field states
    function togglePages(hidePage, showPage) {
        $(hidePage).hide();
        disablePageFields(hidePage);
        $(showPage).show();
        enablePageFields(showPage);
    }

    // Disable form fields in the specified page
    function disablePageFields(page) {
        $(page).find(':input').prop('disabled', true);
    }

    // Enable form fields in the specified page
    function enablePageFields(page) {
        $(page).find(':input').prop('disabled', false);
    }
});
