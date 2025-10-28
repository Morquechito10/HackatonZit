document.addEventListener('DOMContentLoaded', () => {

    const loginForm = document.getElementById('loginForm');
    const roleModal = document.getElementById('roleModal');
    const closeModalButton = document.getElementById('closeModal');

    // Comprobamos si los elementos existen para evitar errores en signup.html
    if (loginForm && roleModal && closeModalButton) {

        // Muestra el modal cuando el formulario de login se envía
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Evita que la página se recargue
            roleModal.classList.remove('hidden'); // Muestra el modal
        });

        // Oculta el modal al hacer clic en la 'X'
        closeModalButton.addEventListener('click', () => {
            roleModal.classList.add('hidden'); // Oculta el modal
        });

        // Oculta el modal al hacer clic fuera de él (en el fondo oscuro)
        roleModal.addEventListener('click', (event) => {
            if (event.target === roleModal) {
                roleModal.classList.add('hidden'); // Oculta el modal
            }
        });

        // Aquí puedes añadir la lógica para los botones "Voluntario" y "Protector"
    }
});