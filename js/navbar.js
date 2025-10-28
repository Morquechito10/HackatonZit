// Espera a que el contenido de la página esté cargado
document.addEventListener('DOMContentLoaded', () => {
    
    // Selecciona el botón y el menú
    const userMenuBtn = document.querySelector('.user-menu-btn');
    const userDropdownMenu = document.querySelector('.user-dropdown-menu');

    // Revisa si los elementos existen en la página
    if (userMenuBtn && userDropdownMenu) {
        
        // 1. Muestra/oculta el menú al hacer clic en el botón
        userMenuBtn.addEventListener('click', (e) => {
            // Detiene la propagación para que el 'window.click' no lo cierre
            e.stopPropagation(); 
            userDropdownMenu.classList.toggle('show');
        });

        // 2. Cierra el menú si se hace clic en cualquier otro lugar
        window.addEventListener('click', (e) => {
            // Si el clic NO fue en el botón Y NO fue dentro del menú
            if (!userMenuBtn.contains(e.target) && !userDropdownMenu.contains(e.target)) {
                userDropdownMenu.classList.remove('show');
            }
        });

        // 3. Cierra el menú si se hace clic en una opción (opcional pero bueno)
        userDropdownMenu.addEventListener('click', () => {
             userDropdownMenu.classList.remove('show');
        });
    }
});