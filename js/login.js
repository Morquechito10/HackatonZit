// login.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    // --- NUEVO: Traemos los elementos del Modal ---
    const roleModal = document.getElementById('roleModal');
    const closeModalButton = document.getElementById('closeModal');
    const voluntarioButton = document.getElementById('voluntarioBtn');
    const protectorButton = document.getElementById('protectorBtn');

    // --- Lógica de Login ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evita que la página se recargue

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const body = {
            email: email,
            password: password
        };

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (!response.ok) {
                // Muestra el error de la API (ej. "Contraseña incorrecta")
                throw new Error(data.detail || 'Error al iniciar sesión');
            }

            // ¡Éxito!
            console.log('Login exitoso:', data);

            // Guarda la info del usuario en sessionStorage
            sessionStorage.setItem('user_id', data.user_id);
            sessionStorage.setItem('user_name', data.nombre);

            // --- MODIFICADO: Ya no redirige, AHORA MUESTRA EL MODAL ---
            roleModal.classList.remove('hidden');

        } catch (error) {
            console.error('Error en login:', error);
            alert(error.message);
        }
    });

    // --- NUEVO: Lógica de redirección por ROL ---

    voluntarioButton.addEventListener('click', () => {
        // Cambia esta ruta por la de voluntario
        window.location.href = '/HackatonZit/view/voluntario_lista.html'; 
    });
    
    protectorButton.addEventListener('click', () => {
        // Esta es la ruta que ya tenías
        window.location.href = '/HackatonZit/view/protector_dashboard.html';
    });


    // --- NUEVO: Lógica para cerrar el modal (movida de index.js) ---
    
    // Oculta el modal al hacer clic en la 'X'
    closeModalButton.addEventListener('click', () => {
        roleModal.classList.add('hidden'); 
    });

    // Oculta el modal al hacer clic fuera de él (en el fondo oscuro)
    roleModal.addEventListener('click', (event) => {
        if (event.target === roleModal) {
            roleModal.classList.add('hidden');
        }
    });
});