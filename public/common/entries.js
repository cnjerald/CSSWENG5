let educationIndex = 1;
let medicationIndex = 1;
let conditionIndex = 1;

$(document).ready(function() {
    $('#addEducation').click(function() {
        addEntry('#entries', 'school', 'course', 'education-year', educationIndex++);
    });

    $('#addMedication').click(function() {
        addMedicationEntry();
    });

    $('#addCondition').click(function() {
        addEntry('#conditions', 'condition', null, null, conditionIndex++);
    });

    // Automatically move focus to the next input field when maxlength is reached
    $('.uic-box').on('input', function() {
        var maxLength = parseInt($(this).attr('maxlength'));
        var currentLength = $(this).val().length;
        if (currentLength === maxLength) {
            $(this).next('.uic-box').focus();
        }
    });

    function addMedicationEntry() {
        let entry = $('<div class="divider"></div>');

        let comboBox1 = $('<div class="comboBox"></div>');
        comboBox1.append(`<label class="left" for="medication${medicationIndex}">Medication:</label><br>`);
        comboBox1.append(`<input class="inputBox" type="text" id="medication${medicationIndex}" name="medication[]" required placeholder="Enter medication"><br>`);
        entry.append(comboBox1);

        let comboBox2 = $('<div class="comboBox"></div>');
        comboBox2.append(`<label class="left" for="startDate${medicationIndex}">Start Date:</label><br>`);
        comboBox2.append(`<input class="inputBox" type="date" id="startDate${medicationIndex}" name="startDate[]" required><br>`);
        entry.append(comboBox2);

        let xButtonDiv = $('<div class="xButton"></div>');
        xButtonDiv.append(`<button type="button" class="remove-button" onclick="removeEntry(this)"> </button>`);
        entry.append(xButtonDiv);

        $('#medications').append(entry);

        updateRemoveButtons('#medications');
        medicationIndex++;
    }


    function addEntry(container, name1, name2, name3, index) {
        let entry = $('<div class="divider"></div>');

        let comboBox1 = $('<div class="comboBox"></div>');
        comboBox1.append(`<label class="left" for="${name1}${index}">${capitalizeFirstLetter(name1.replace('-', ' '))}:</label><br>`);
        comboBox1.append(`<input class="inputBox" type="text" id="${name1}${index}" name="${name1}[]" required placeholder="Enter ${name1.replace('-', ' ')}"><br>`);
        entry.append(comboBox1);

        if (name2) {
            let comboBox2 = $('<div class="comboBox"></div>');
            comboBox2.append(`<label class="left" for="${name2}${index}">${capitalizeFirstLetter(name2.replace('-', ' '))}:</label><br>`);
            comboBox2.append(`<input class="inputBox" type="text" id="${name2}${index}" name="${name2}[]" required placeholder="Enter ${name2.replace('-', ' ')}"><br>`);
            entry.append(comboBox2);
        }

        if (name3) {
            let comboBox3 = $('<div class="comboBox"></div>');
            comboBox3.append(`<label class="left" for="${name3}${index}">${capitalizeFirstLetter(name3.replace('-', ' '))}:</label><br>`);
            let select3 = $(`<select class="inputBox" id="${name3}${index}" name="${name3}[]" required>
                                <option value="" disabled selected>Select your ${name3.replace('-', ' ')}</option>
                                <option value="1st">1st Year</option>
                                <option value="2nd">2nd Year</option>
                                <option value="3rd">3rd Year</option>
                                <option value="4th">4th Year</option>
                                <option value="5th">5th Year</option>
                                <option value="graduate">Graduate</option>
                                <option value="postgraduate">Postgraduate</option>
                            </select><br>`);
            comboBox3.append(select3);
            entry.append(comboBox3);
        }

        let xButtonDiv = $('<div class="xButton"></div>');
        xButtonDiv.append(`<button type="button" class="remove-button" onclick="removeEntry(this)"> </button>`);
        entry.append(xButtonDiv);

        $(container).append(entry);

        updateRemoveButtons(container);
    }

    window.removeEntry = function(button) {
        $(button).closest('.divider').remove();
        updateRemoveButtons('#entries');
        updateRemoveButtons('#medications');
        updateRemoveButtons('#conditions');
    };

    function updateRemoveButtons(container) {
        $(container).find('.remove-button').hide();
        $(container).find('.divider:last .remove-button').show();
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Initialize remove buttons visibility
    updateRemoveButtons('#entries');
    updateRemoveButtons('#medications');
    updateRemoveButtons('#conditions');
});
