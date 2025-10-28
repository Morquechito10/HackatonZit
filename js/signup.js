// signup.js
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const habilidadesContainer = document.getElementById('habilidades-container');

    // --- 1. Cargar Habilidades al iniciar la página ---
    async function loadHabilidades() {
        try {
            const response = await fetch(`${API_BASE_URL}/habilidades`);
            if (!response.ok) {
                throw new Error('No se pudieron cargar las habilidades.');
            }
            const habilidades = await response.json();
            
            // Limpia el mensaje "Cargando..."
            habilidadesContainer.innerHTML = ''; 

            // Crea un checkbox por cada habilidad
            habilidades.forEach(skill => {
                const div = document.createElement('div');
                div.classList.add('flex', 'items-center');
                div.innerHTML = `
                    <input id="skill-${skill.habilidad_id}" name="habilidad" value="${skill.habilidad_id}" type="checkbox" class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                    <label for="skill-${skill.habilidad_id}" class="ml-2 block text-sm text-gray-900">${skill.nombre}</label>
                `;
                habilidadesContainer.appendChild(div);
            });

        } catch (error) {
            console.error('Error cargando habilidades:', error);
            habilidadesContainer.innerHTML = '<p class="text-red-500 text-sm">Error al cargar habilidades.</p>';
        }
    }

    // Llama a la función al cargar la página
    loadHabilidades();

    // --- 2. Manejar el envío del formulario de Registro ---
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Recolecta todos los valores del formulario
        const nombre = document.getElementById('nombre').value;
        const apellido_paterno = document.getElementById('apellido_paterno').value;
        const apellido_materno = document.getElementById('apellido_materno').value || null;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const telefono = document.getElementById('telefono').value || null;

        // Recolecta las habilidades seleccionadas
        const habilidadCheckboxes = document.querySelectorAll('input[name="habilidad"]:checked');
        const habilidad_ids = Array.from(habilidadCheckboxes).map(checkbox => parseInt(checkbox.value));

        // Validación (la API la requiere)
        if (habilidad_ids.length === 0) {
            alert('Por favor, selecciona al menos una habilidad.');
            return;
        }

        // Construye el objeto body que espera la API (Schema UserCreate)
        const body = {
            nombre,
            apellido_paterno,
            apellido_materno,
            email,
            password,
            telefono,
            habilidad_ids // Array de números [1, 3, 5]
        };

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (!response.ok) {
                // Muestra el error de la API (ej. "El email ya está registrado")
                throw new Error(data.detail || 'Error al registrarse.');
            }

            // ¡Éxito!
            console.log('Registro exitoso:', data);
            alert('¡Cuenta creada exitosamente! Ahora serás redirigido para iniciar sesión.');
            
            // Redirige al login
            // La barra al inicio es la clave.
            window.location.href = '/HackatonZit/index.html';

        } catch (error) {
            console.error('Error en registro:', error);
            alert(error.message);
        }
    });
});