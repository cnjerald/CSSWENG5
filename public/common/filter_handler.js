$(document).ready(function() {

    function getSelectedValues() {
      var selectedValues = [];
      var membership = "";
      $(".dropdown").each(function() {
        var selectedValue = $(this).find(".selected").text();
        selectedValues.push(selectedValue);
      });
  
      selectedValues.push($("#search").val());
      console.log(selectedValues[6]);
      console.log(selectedValues[7]);
  
      $.post(
        'filter_ajax', {
          sex: selectedValues[0],
          membership: selectedValues[1],
          membershipDetails: selectedValues[2],
          status: selectedValues[3],
          sort: selectedValues[6],
          searchRes: selectedValues[7]
        },
        function(data, status) {
          if (status === 'success') {
            renderMembers(data.members,data.length);
          } else{
            console.error("Failed to retrieve data");
          }
        }
      );
  
      console.log(selectedValues); // You can replace this with alert(JSON.stringify(selectedValues)) if you want an alert
    }
  
    // Debounce function to limit the rate of function execution
    function debounce(func, wait) {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    }
  
    const debouncedGetSelectedValues = debounce(getSelectedValues, 700);
  
    $("li").on("click", function() {
      getSelectedValues();
    });
  
    $("#search").on('input', function() {
      debouncedGetSelectedValues();
    });

    function renderMembers(members,length) {
      var wrapper = document.querySelector('.database-wrapper');
      wrapper.innerHTML = ''; // Clear previous content
  
      var tableHeader = `
          <table>
              <thead>
                  <tr>
                      <th class="index">${length}</th>
                      <th class="Name">Name</th>
                      <th class="Sex">Sex</th>
                      <th class="Payment">Membership</th>
                      <th class="Status">Status</th>
                      <th class="index"></th>
                  </tr>
              </thead>
              <tbody>
              </tbody>
          </table>`;
      wrapper.insertAdjacentHTML('beforeend', tableHeader);
  
      var tbody = wrapper.querySelector('tbody');
  
      members.forEach((member, index) => {
        // Construct the status content using template literals
        const statusContent = `
            ${member.membershipDetails}
            ${(member.membershipDetails === 'Paid' || member.membershipDetails === "Expired") ? ` - Payment Date: ${member.renewalDate}` : ''}
        `;
    
        // Create the member row with the updated status content
        const memberRow = `
            <tr>
                <td class="index">${index + 1}</td>
                <td class="Name">${member.name}</td>
                <td class="Sex">${member.sex.charAt(0).toUpperCase() + member.sex.slice(1)}</td>
                <td class="Payment">${member.membership}</td>
                <td class="Status">${statusContent}</td>
                <td class="index"><a href="/memberDetail?uic_code=${member.uic_code}">View</a></td>
            </tr>`;
        
        tbody.insertAdjacentHTML('beforeend', memberRow);
    });
    
  }










    
  });