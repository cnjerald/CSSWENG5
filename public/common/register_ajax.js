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


        $.post(
            'register-checker',
            {
                uic1: $("#uic1").val(), uic2: $("#uic2").val(), uic3: $("#uic3").val(), uic4: $("#uic4").val(),
                lname: $("#lname").val(),
                fname: $("#fname").val(),
                mname: $("#mname").val(),
                gender: $("#gender").val(),
                sex: $("#sex").val(),
                bday: $("#bday").val(),
                contact_number: $("#contact-number").val(),
                email_address: $("#email-address").val(),
                facebook_address: $("#facebook-address").val(),
                civil_status: $("#civil-status").val(),
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


            }

        )

    })

})