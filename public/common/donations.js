$(document).ready(function() {
    var $popup = $('#registerAttendeePopup');
    const popupForm = $('#registerAttendeePopup');

    // Function to close the popup
    function closePopup() {
        $popup.hide();
    }

    // Event listener for clicks outside the popup
    $(window).on('click', function(event) {
        if ($(event.target).is($popup)) {
            closePopup();
        }
    });

    const closeBtn = document.getElementsByClassName('close')[0];
    // Hide the popup form when the close button is clicked
    closeBtn.onclick = function() {
        closePopup();
    }


    // Example of how to open the popup (attached to some button or event)
    $("#addEventBtn").click(function(){
        $.post("ajax_getAllMembers", {}, function(data, status) {
            const members = data.members.map(member => ({
                name: member.name,
                uic_code: member.uic_code
            }));
            console.log(members);
            
            // Populate the datalist
            const datalist = $('#attendeeNames');
            datalist.empty(); // Clear any existing options
            members.forEach(member => {
                const option = $('<option>').val(`${member.name} (${member.uic_code})`);
                datalist.append(option);
            });

            $popup.show(); // Show the popup
        });
    });

    $("#add-btn").click(function() {
        var input = $("#person").val();
        var input_uic = input.slice(input.length - 15, input.length - 1);
        var input_name = input.slice(0, input.length - 17);

        $.post("ajax_queryMemberDonations", { name: input_name, uic: input_uic }, function(data, status) {
            if (status === "success") {
                populateTable(data.donations);
            }
        });
    });

    function populateTable(transactions) {
        var tbody = $("#payment-history");
        tbody.empty();  // Clear existing rows

        // Ensure the input and button are added only once
if (!$('#input-section').length) {
    // Add a payment date input and a submit button above the table
    var inputSection = "<div id='input-section'>" +
                        "Amount: <input type='text' id='donation-amount'>" +
                        "<button id='submit-amount'>Submit</button>" +
                        "</div>";
        tbody.before(inputSection);
    }

        var headerRow = "<tr>" +
                        "<td>Admin</td>" +
                        "<td>Date Created</td>" +
                        "<td>User ID</td>" +
                        "<td>Donation Amount</td>" +
                        "<td></td>" +  // Added Delete button
                       "</tr>";
        tbody.append(headerRow);

        var totalAmount = 0;

        transactions.forEach(function(transaction) {
            var row = "<tr>" +
                        "<td>" + transaction.admin + "</td>" +
                        "<td>" + transaction.date_created + "</td>" +
                        "<td>" + transaction.user + "</td>" +
                        "<td>" + transaction.amount + "</td>" +
                        "<td><button class='delete-btn' data-id='" + transaction._id + "'>X</button></td>" +  // Added Delete button
                      "</tr>";
            tbody.append(row);
            totalAmount += parseFloat(transaction.amount);
        });
    
        var totalRow = "<tr>" +
                       "<td colspan='3'><strong>Total</strong></td>" +
                       "<td><strong>" + totalAmount.toFixed(2) + "</strong></td>" +
                       "<td></td>" +  // No delete button for the total row
                       "</tr>";
        tbody.append(totalRow);

        // Remove any existing click event listener for the delete button to avoid duplication
        tbody.off('click', '.delete-btn');

        // Add click event listener for the delete button using event delegation
        tbody.on('click', '.delete-btn', function() {
            var id = $(this).data('id');
            var input = $("#person").val();
            var input_uic = input.slice(input.length - 15, input.length - 1);
            var input_name = input.slice(0, input.length - 17);
            $.post('deleteDonation_ajax',{id:id, name : input_name, uic: input_uic},function(data,status){
                if (status === "success") {
                    populateTable(data.donations); // Update the table with the new transactions
                }
            })
        });

        // Remove any existing click event listener for the submit button to avoid duplication
        $('#submit-amount').off('click');

        // Add click event listener for the submit button
        $('#submit-amount').click(function() {
            var donation = $('#donation-amount').val();
            var input = $("#person").val();
            var input_uic = input.slice(input.length - 15, input.length - 1);
            var input_name = input.slice(0, input.length - 17);

            $.post("addDonation_ajax", { donationAmount: donation, uic: input_uic, name: input_name }, function(data, status) {
                if (status === "success") {
                    // Assuming the data returned contains the updated transactions
                    populateTable(data.donations); // Update the table with the new transactions
                }
            });

            // Handle the submission logic here
        });
    }
});
