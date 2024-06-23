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
          sort: selectedValues[6],
          searchRes: selectedValues[7]
        },
        function(data, status) {
          if (status === 'success') {
            renderMembers(data.members);
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

    function renderMembers(members) {
        var wrapper = document.querySelector('.database-wrapper');
        wrapper.innerHTML = ''; // Clear previous content
    
        var header = `
            <div class="database-item database-header">
                <div class="db-item UIC">UIC</div>
                <div class="db-item Name">Name</div>
                <div class="db-item Sex">Sex</div>
                <div class="db-item Payment">Membership</div>
                <div class="db-item Status">Status</div>
                <div class="db-item Engagement">Engagement</div>
                <div class="db-item Contribution">Contribution</div>
                <div class="db-item Show-More last-child">Show More</div>
            </div>`;
        wrapper.insertAdjacentHTML('beforeend', header);
    
        members.forEach(member => {
            var memberHTML = `
                <div class="database-item database-header">
                  <div class="db-item UIC">${member.uic_code}</div>
                  <div class="db-item Name">${member.name}</div>
                  <div class="db-item Sex">${member.sex}</div>
                  <div class="db-item Payment">${member.membership}</div>
                  <div class="db-item Status">${member.membershipDetails}</div>
                  <div class="db-item Engagement">Engagement</div>
                  <div class="db-item Contribution">Contribution</div>
                  <div class="db-item Show-More last-child">
                      <div class="last-child-item">
                          <a href="/memberDetail?uic_code=${member.uic_code}">
                              <span class="last-child-icon material-symbols-outlined">more_horiz</span>
                          </a>
                      </div>
                  </div>
              </div>`;
            wrapper.insertAdjacentHTML('beforeend', memberHTML);
        });
    }
  });