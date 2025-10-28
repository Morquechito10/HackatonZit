// Espera a que el contenido de la página esté cargado
document.addEventListener("DOMContentLoaded", () => {
    
    // Selecciona el formulario
    const form = document.getElementById('report-form');

    if (form) {
        // Escucha el evento 'submit' (cuando el usuario da clic al botón)
        form.addEventListener('submit', (event) => {
            
            let isValid = true; // Asumimos que el formulario es válido

            // --- Validación 1: Dirección/Mapa ---
            const addressInput = document.getElementById('address');
            const errorAddress = document.getElementById('error-address');
            // Revisa si el campo está vacío o sigue con el placeholder de "buscando"
            if (addressInput.value.trim() === "" || addressInput.value.includes("Buscando")) {
                isValid = false;
                errorAddress.style.display = 'block'; // Muestra el error
                addressInput.classList.add('is-invalid'); // Añade borde rojo
            } else {
                errorAddress.style.display = 'none'; // Oculta el error
                addressInput.classList.remove('is-invalid');
            }

            // --- Validación 2: Checkboxes de Ayuda ---
            const checkboxes = document.querySelectorAll('#ayuda-checkboxes input[type="checkbox"]:checked');
            const errorAyuda = document.getElementById('error-ayuda');
            
            if (checkboxes.length === 0) { // Si no hay NINGÚN checkbox marcado
                isValid = false;
                errorAyuda.style.display = 'block'; // Muestra el error
            } else {
                errorAyuda.style.display = 'none'; // Oculta el error
            }

            // --- Decisión Final ---
            if (!isValid) {
                // Si algo falló, previene que el formulario se envíe
                event.preventDefault(); 
                alert("Por favor, corrige los errores en el formulario.");
            } else {
                // (Simulación) Si todo está bien, muestra un éxito y previene el envío real
                event.preventDefault(); // Quita esto cuando tengas un backend
                alert("¡Formulario válido! (Simulación de envío)");
            }
        });
    }
});