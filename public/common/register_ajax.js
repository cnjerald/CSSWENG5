$(document).ready(function(){
   
    $("#submit-btn").click(function(){

        var entries = [];

        // Collect education entries
        $("#entries > .divider").each(function(index) {
            var entry = {
                school: $(this).find("input[name='school[]']").val(),
                course: $(this).find("input[name='course[]']").val(),
                educationYear: $(this).find("select[name='education-year[]']").val()
            };
            entries.push(entry);
        });

        //concat uic inputs
        var uic = $("#uic1").val() + $("#uic2").val() + $("#uic3").val() + $("#uic4").val();

        $.post(
            'register-checker',
            {   
                uic_code:uic, //just to have access to full uic in the database
                uic1: $("#uic1").val(), 
                uic2: $("#uic2").val(), 
                uic3: $("#uic3").val(), 
                uic4: $("#uic4").val(),
                lname: $("#lname").val(),
                fname: $("#fname").val(),
                mname: $("#mname").val(),
                gender: $("#gender").val(),
                sex: $("#sex").val(),
                bday: $("#bday").val(),
                contact_number: $("#contact-number").val(),
                email_address: $("#email-address").val(),
                facebook_address: $("#facebook-address").val(),
                civil_status: $('#civil-status').val(),
                citizenship: $("#citizenship").val(),
                occupation: $("#occupation").val(),
                designation: $("#designation").val(),
                company: $("#company").val(),
                educationEntries: entries,
                ePerson: $("#contactPerson").val(),
                eContact: $("#contactPersonContact").val(),
                eRelationship: $("#relationship").val(),
                eAddress: $("#contactAddress").val(),
                comments: $("#comments").val()
            },
            function(data,status){
                if (data.arr[0] === 0) {
                    $("label[for='uic']").html("Unique Identifier Code: Insufficient characters").css("color", "red");
                } else if (data.arr[1] === 0) {
                    $("label[for='uic']").html("Unique Identifier Code: First 4 characters must be letters").css("color", "red");
                } else if (data.arr[2] === 0) {
                    $("label[for='uic']").html("Unique Identifier Code: Last 4 characters must be numbers").css("color", "red");
                } else {
                    $("label[for='uic']").html("Unique Identifier Code: ").css("color", ""); // Reset color
                }
                
                data.arr[3] === 0 ? $("label[for='lname']").html("Last name: This field is required").css("color", "red") : $("label[for='lname']").html("Last name:");
                data.arr[4] === 0 ? $("label[for='mname']").html("Middle name: This field is required").css("color", "red") : $("label[for='mname']").html("Middle name:");
                data.arr[5] === 0 ? $("label[for='fname']").html("First name: This field is required").css("color", "red") : $("label[for='fname']").html("First name:");
                data.arr[6] === 0 ? $("label[for='sex']").html("Sex: This field is required").css("color", "red") : $("label[for='sex']").html("Sex:");
                data.arr[7] === 0 ? $("label[for='bday']").html("Birthday: This field is required").css("color", "red") : $("label[for='bday']").html("Birthday:");
                data.arr[8] === 0 ? $("label[for='contact-number']").html("Contact Number: This field is required").css("color", "red") : $("label[for='contact-number']").html("Contact Number:");
                data.arr[9] === 0 ? $("label[for='email']").html("Email Address: This field is required").css("color", "red") : $("label[for='email']").html("Email Address:");
                data.arr[10] === 0 ? $("label[for='civil-status']").html("Civil Status: This field is required").css("color", "red") : $("label[for='civil-status']").html("Civil Status:");
                data.arr[11] === 0 ? $("label[for='citizenship']").html("Citizenship: This field is required").css("color", "red") : $("label[for='citizenship']").html("Citizenship:");
                 
            }

        )

    })

})