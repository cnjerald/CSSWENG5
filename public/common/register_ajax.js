$(document).ready(function(){   
    $("#submit-btn").click(function(){

        var entries = [];
        var medications = [];
        var conditions = [];

        const membership = getSelectedMembership();
        let membershipDetails = '';
    
        if (membership === 'Registered') {
            membershipDetails = getRegisteredStatus();
        } else if (membership === 'Community Member') {
            membershipDetails = getCommunityServices();
        }

        // Collect education entries
        $("#entries > .divider").each(function(index) {
            var entry = {
                school: $(this).find("input[name='school[]']").val(),
                course: $(this).find("input[name='course[]']").val(),
                educationYear: $(this).find("select[name='education-year[]']").val()
            };
            entries.push(entry);
        });

        $("#medications > .divider").each(function(index) {
            var entry = {
                medication: $(this).find("input[name='medication[]']").val(),
                startDate: $(this).find("input[name='startDate[]']").val()
            };
            medications.push(entry);        
        });
        
        $("#conditions > .divider").each(function(index) {
            var entry = {
                condition: $(this).find("input[name='condition[]']").val()
            };
            conditions.push(entry);
        });

        //concat uic inputs
        var uic = $("#uic1").val() + $("#uic2").val() + $("#uic3").val() + $("#uic4").val()+ $("#uic5").val()+ $("#uic6").val()+ $("#uic7").val();

        $.post(
            'register-checker',
            {   
                uic_code:uic, //just to have access to full uic in the database
                lname: $("#lname").val(),
                fname: $("#fname").val(),
                mname: $("#mname").val(),
                gender: $("#gender").val(),
                sex: $("#sex").val(),
                keyPopulation: $("#keyPopulation").val(),
                bday: $("#bday").val(),
                contact_number: $("#contact-number").val(),
                email_address: $("#email-address").val(),
                facebook_address: $("#facebook-address").val(),
                barangay: $("#barangay").val(),
                location:$("#location").val(),
                civil_status: $('#civil-status').val(),
                citizenship: $("#citizenship").val(),
                occupation: $("#occupation").val(),
                designation: $("#designation").val(),
                company: $("#company").val(),
                entries: entries,
                medications: medications,
                conditions: conditions,
                ePerson: $("#contactPerson").val(),
                eContact: $("#contactPersonContact").val(),
                eRelationship: $("#relationship").val(),
                eAddress: $("#contactAddress").val(),
                comments: $("#comments").val(),
                membership: membership,
                membershipDetails: membershipDetails,
                renewalDate: $("#payment_date").val()
            },
            function(data,status){
                if (status === "success"){
                    if(data.msg === 'Data saved successfully'){
                        window.location.href = "/mainpage"; // Redirect to home page
                    } else{
                        if (data.arr[0] === 0) {
                            $("label[for='uic']").html("Unique Identifier Code: Insufficient characters").css("color", "red");
                        } else if (data.arr[1] === 0) {
                            $("label[for='uic']").html("Unique Identifier Code: First 4 characters must be letters").css("color", "red");
                        } else if (data.arr[2] === 0) {
                            $("label[for='uic']").html("Unique Identifier Code: Last 4 characters must be numbers").css("color", "red");
                        } else {
                            $("label[for='uic']").html("Unique Identifier Code: ").css("color", ""); // Reset color
                        }

                        if (data.arr[5] === 0) {
                            $("label[for='bday']").html("Birthday: This field is required").css("color", "red");
                        } else if (data.arr[10] === 0) {
                            $("label[for='bday']").html("Birthday: The input is invalid").css("color", "red");
                        } else {
                            $("label[for='bday']").html("Birthday:").css("color", "");
                        }

                        if (data.arr[6] === 0) {
                            $("label[for='contact-number']").html("Contact Number: This field is required").css("color", "red");
                        } else if (data.arr[11] === 0) {
                            $("label[for='contact-number']").html("Contact Number: Should only contain numbers").css("color", "red");
                        } else {
                            $("label[for='contact-number']").html("Contact Number:").css("color", "");
                        }

                        if(data.arr[7] === 0) {
                            $("label[for='email']").html("Email Address: This field is required").css("color", "red");
                        } else if (data.arr[12] === 0 ){
                            $("label[for='email']").html("Email Address: Invalid Email Format").css("color", "red")
                        } else{
                            $("label[for='email']").html("Email Address:").css("color", "");
                        }
                        console.log(data.arr[13]);
                        if(data.arr[13] === 0) {
                            $("label[for='prof_pic']").html("No photo selected.").css("color", "red");
                        } else{
                            $("label[for='prof_pic']").html("Upload a profile picture").css("color", "");
                        }

                        data.arr[3] === 0 ? $("label[for='mname']").html("This field is required").css("color", "red") : $("label[for='mname']").html("Middle name:");
                        data.arr[3] === 0 ? $("label[for='fname']").html("This field is required").css("color", "red") : $("label[for='fname']").html("First name:");
                        data.arr[4] === 0 ? $("label[for='sex']").html("Sex: This field is required").css("color", "red") : $("label[for='sex']").html("Sex:");
                        data.arr[8] === 0 ? $("label[for='civil-status']").html("Civil Status: This field is required").css("color", "red") : $("label[for='civil-status']").html("Civil Status:");
                        data.arr[9] === 0 ? $("label[for='citizenship']").html("Citizenship: This field is required").css("color", "red") : $("label[for='citizenship']").html("Citizenship:");

                        $('html, body').animate({ scrollTop: 0 }, 'slow');
                        }
                    }

                }


        )

    })

    function getSelectedMembership() {
        if (document.getElementById('registered').checked) {
            return 'Registered';
        } else if (document.getElementById('community-member').checked) {
            return 'Community Member';
        }
        return '';
    }
    
    function getRegisteredStatus() {
        let status = '';
        document.getElementsByName('registered-status').forEach(radio => {
            if (radio.checked) {
                status = radio.nextSibling.nodeValue.trim();
            }
        });
        return status;
    }
    
    function getCommunityServices() {
        let services = [];
        document.getElementsByName('community-services').forEach(checkbox => {
            if (checkbox.checked) {
                services.push(checkbox.nextSibling.nodeValue.trim());
            }
        });
        return services.join(', ');
    }

})