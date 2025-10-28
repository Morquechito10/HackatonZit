// Variables globales para guardar la ubicación seleccionada
let selectedLat = null;
let selectedLng = null;

document.addEventListener("DOMContentLoaded", () => {
    
    // Cargar dinámicamente los tipos de ayuda (checkboxes) desde la API
    cargarTiposDeAyuda();

    // --- Lógica del Mapa (sin cambios) ---
    const mapElement = document.getElementById('report-map');
    if (mapElement) {
        // ... (toda la lógica del mapa sigue igual que antes) ...
        const defaultCenter = [20.6736, -103.344];
        const map = L.map('report-map').setView(defaultCenter, 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const myLocation = [position.coords.latitude, position.coords.longitude];
                    map.setView(myLocation, 16);
                    L.marker(myLocation).addTo(map).bindPopup("<b>¡Estás aquí!</b><br>Haz clic en la ubicación del reporte.").openPopup();
                },
                () => { console.warn("El usuario no permitió la geolocalización."); }
            );
        }
        let marker = null;
        const addressInput = document.getElementById('address');
        const loadingSpinner = document.getElementById('address-loading');
        map.on('click', (e) => {
            const coords = e.latlng;
            selectedLat = coords.lat.toString();
            selectedLng = coords.lng.toString();
            if (marker) {
                marker.setLatLng(coords);
            } else {
                marker = L.marker(coords).addTo(map);
            }
            marker.bindPopup("Ubicación del reporte seleccionada").openPopup();
            document.getElementById('error-address').style.display = 'none';
            addressInput.classList.remove('is-invalid');
            addressInput.value = "Buscando dirección...";
            loadingSpinner.style.display = 'inline-block';
            fetchAddress(coords);
        });
    }

    // --- Lógica de Envío de Formulario ---
    const form = document.getElementById('report-form');
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault(); 
            handleFormSubmit();
        });
    }

    // --- ¡NUEVO! Event Listener para el botón de IA ---
    const btnIA = document.getElementById('btn-mejorar-ia');
    if (btnIA) {
        btnIA.addEventListener('click', (e) => {
            e.preventDefault(); // Previene cualquier acción por defecto
            mejorarDescripcionIA();
        });
    }
});

/**
 * ¡NUEVO! Llama a la API de IA para mejorar la descripción
 */
async function mejorarDescripcionIA() {
    const descripcionTextarea = document.getElementById('descripcion');
    const btnIA = document.getElementById('btn-mejorar-ia');
    const btnText = document.getElementById('ia-btn-text');
    const iaSpinner = document.getElementById('ia-spinner');
    
    const originalText = descripcionTextarea.value;

    if (originalText.trim().length < 10) {
        alert("Por favor, escribe una descripción básica primero (mínimo 10 caracteres).");
        return;
    }

    // Mostrar estado de carga
    btnIA.disabled = true;
    btnText.textContent = 'Mejorando...';
    iaSpinner.style.display = 'inline-block';

    try {
        const response = await fetch(`${API_BASE_URL}/ai/mejorar-descripcion`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: originalText })
        });

        if (!response.ok) {
            throw new Error('La IA no pudo mejorar el texto.');
        }

        const data = await response.json();
        
        // Actualizar el textarea con el texto mejorado
        descripcionTextarea.value = data.enhanced_text; 
        
        // Trigger de validación (por si acaso)
        descripcionTextarea.classList.remove('is-invalid');

    } catch (error) {
        console.error("Error con IA:", error);
        alert("Error al contactar la IA. Intenta de nuevo.");
    } finally {
        // Ocultar estado de carga
        btnIA.disabled = false;
        btnText.textContent = 'Mejorar con IA';
        iaSpinner.style.display = 'none';
    }
}


/**
 * Carga los tipos de ayuda desde la API (sin cambios)
 */
async function cargarTiposDeAyuda() {
    // ... (esta función sigue igual que antes) ...
    const container = document.getElementById('ayuda-checkboxes');
    try {
        const response = await fetch(`${API_BASE_URL}/tipos-ayuda`);
        if (!response.ok) throw new Error('Error al cargar tipos de ayuda');
        const tiposAyuda = await response.json();
        container.innerHTML = '';
        tiposAyuda.forEach(ayuda => {
            const div = document.createElement('div');
            div.className = 'checkbox-item';
            div.innerHTML = `
                <input type="checkbox" id="ayuda-${ayuda.tipo_ayuda_id}" name="ayuda_tipo" value="${ayuda.tipo_ayuda_id}">
                <label for="ayuda-${ayuda.tipo_ayuda_id}">${ayuda.nombre}</label>
            `;
            container.appendChild(div);
        });
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p style="color: red;">No se pudieron cargar las opciones de ayuda.</p>';
    }
}


/**
 * Valida el formulario y lo envía a la API (sin cambios)
 */
async function handleFormSubmit() {
    // ... (esta función sigue igual que antes) ...
    // La validación de 'tipo_animal' funciona igual para <select>
    let isValid = true;
    const tituloInput = document.getElementById('titulo');
    if (tituloInput.value.trim() === "") {
        isValid = false;
        tituloInput.classList.add('is-invalid');
    } else {
        tituloInput.classList.remove('is-invalid');
    }
    const animalInput = document.getElementById('tipo_animal');
    if (animalInput.value.trim() === "") {
        isValid = false;
        animalInput.classList.add('is-invalid');
    } else {
        animalInput.classList.remove('is-invalid');
    }
    const descInput = document.getElementById('descripcion');
    if (descInput.value.trim().length < 10) {
        isValid = false;
        descInput.classList.add('is-invalid');
    } else {
        descInput.classList.remove('is-invalid');
    }
    const addressInput = document.getElementById('address');
    const errorAddress = document.getElementById('error-address');
    if (!selectedLat || !selectedLng) {
        isValid = false;
        errorAddress.style.display = 'block';
        addressInput.classList.add('is-invalid');
    } else {
        errorAddress.style.display = 'none';
        addressInput.classList.remove('is-invalid');
    }
    const checkboxes = document.querySelectorAll('#ayuda-checkboxes input[type="checkbox"]:checked');
    const errorAyuda = document.getElementById('error-ayuda');
    if (checkboxes.length === 0) {
        isValid = false;
        errorAyuda.style.display = 'block';
    } else {
        errorAyuda.style.display = 'none';
    }
    if (!isValid) {
        alert("Por favor, corrige los errores en el formulario.");
        return;
    }
    const userId = sessionStorage.getItem('user_id');
    if (!userId) {
        alert("Error: No has iniciado sesión. Serás redirigido.");
        window.location.href = 'login.html';
        return;
    }
    const tipoAyudaIds = Array.from(checkboxes).map(cb => parseInt(cb.value));
    const reporteBody = {
        usuario_id_protector: parseInt(userId),
        titulo: tituloInput.value.trim(),
        descripcion: descInput.value.trim(),
        tipo_animal: animalInput.value.trim(),
        latitud: selectedLat,
        longitud: selectedLng,
        direccion_texto: addressInput.value.trim(),
        tipo_ayuda_ids: tipoAyudaIds
    };
    const submitButton = document.getElementById('submit-btn');
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando...';
    try {
        const response = await fetch(`${API_BASE_URL}/reportes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reporteBody)
        });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || 'Error al crear el reporte.');
        }
        const data = await response.json();
        console.log("Reporte creado:", data);
        document.getElementById('form-success').style.display = 'block';
        document.getElementById('report-form').reset();
        setTimeout(() => {
            window.location.href = 'protector_reportes.html';
        }, 2000);
    } catch (error) {
        alert(`Error: ${error.message}`);
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-check-circle"></i> Crear Reporte';
    }
}


/**
 * Busca Dirección (Geocodificación Inversa) - Sin cambios
 */
async function fetchAddress(latlng) {
    // ... (esta función sigue igual que antes) ...
    const lat = latlng.lat;
    const lon = latlng.lng;
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
    const addressInput = document.getElementById('address');
    const loadingSpinner = document.getElementById('address-loading');
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('No se pudo conectar a la API de geocodificación');
        const data = await response.json();
        if (data && data.display_name) {
            addressInput.value = data.display_name;
        } else {
            addressInput.value = "No se pudo encontrar una dirección para esta ubicación.";
        }
    } catch (error) {
        console.error("Error al buscar dirección:", error);
        addressInput.value = "Error al buscar. Intenta de nuevo.";
    } finally {
        loadingSpinner.style.display = 'none';
    }
}