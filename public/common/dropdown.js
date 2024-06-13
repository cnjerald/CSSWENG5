    
document.addEventListener('DOMContentLoaded', function() {
    const dropdowns = document.querySelectorAll('.dropdown');

    function toggleMenu(dropdown) {
        const menu = dropdown.querySelector('.menu');
        menu.classList.toggle('menu-open');
    }

    function closeOtherMenus(clickedDropdown) {
        dropdowns.forEach(dropdown => {
            if (dropdown !== clickedDropdown) {
                const menu = dropdown.querySelector('.menu');
                menu.classList.remove('menu-open');
            }
        });
    }

    dropdowns.forEach(dropdown => {
        const selectButton = dropdown.querySelector('.select');
        const options = dropdown.querySelectorAll('.menu li');

        selectButton.addEventListener('click', function() {
            toggleMenu(dropdown);
            closeOtherMenus(dropdown);
        });

        options.forEach(option => {
            option.addEventListener('click', function() {
                const selectedText = option.textContent;
                const selectedSpan = dropdown.querySelector('.selected');
                selectedSpan.textContent = selectedText;
                toggleMenu(dropdown); // closes the dropdown after selection (optional)
            });
        });

        document.addEventListener('click', function(event) {
            const target = event.target;
            if (!dropdown.contains(target)) {
                const menu = dropdown.querySelector('.menu');
                menu.classList.remove('menu-open');
            }
        });
    });
});
