// Espera a que el contenido de la página esté cargado
document.addEventListener("DOMContentLoaded", () => {
    
    const mapElement = document.getElementById('report-map');
    
    if (mapElement) {
        // 1. Define un centro de mapa por defecto (si la geolocalización falla)
        const defaultCenter = [20.6736, -103.344]; // Guadalajara
        
        // 2. Inicializa el mapa
        const map = L.map('report-map').setView(defaultCenter, 13);

        // 3. Agrega la capa de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        
        // ===== ¡NUEVO! 4. Pedir Ubicación Automática (Geolocalización) =====
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Si el usuario acepta, centra el mapa en su ubicación
                    const myLocation = [position.coords.latitude, position.coords.longitude];
                    map.setView(myLocation, 16); // Zoom más cercano
                    
                    // Opcional: poner un marcador de "Estás aquí"
                    L.marker(myLocation)
                     .addTo(map)
                     .bindPopup("<b>¡Estás aquí!</b><br>Mueve el mapa si es necesario.")
                     .openPopup();
                },
                () => {
                    // Si el usuario rechaza, el mapa se queda en el centro por defecto
                    console.warn("El usuario no permitió la geolocalización.");
                }
            );
        }

        // --- Lógica de Clic en el Mapa ---
        
        let marker = null; // Variable para guardar el marcador
        const addressInput = document.getElementById('address');
        const loadingSpinner = document.getElementById('address-loading');

        map.on('click', (e) => {
            const coords = e.latlng;

            // Mueve o crea el marcador
            if (marker) {
                marker.setLatLng(coords);
            } else {
                marker = L.marker(coords).addTo(map);
            }
            marker.bindPopup("Ubicación del reporte seleccionada").openPopup();

            // Muestra el spinner y busca la dirección
            addressInput.value = "Buscando dirección...";
            loadingSpinner.style.display = 'inline-block';
            
            // Llama a la función que busca la dirección
            fetchAddress(coords);
        });

        
        // ===== ¡NUEVO! 5. Buscar Dirección (Geocodificación Inversa) =====
        async function fetchAddress(latlng) {
            const lat = latlng.lat;
            const lon = latlng.lng;
            // Usamos la API Nominatim de OpenStreetMap
            const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('No se pudo conectar a la API de geocodificación');
                }
                
                const data = await response.json();
                
                // Si la API devuelve una dirección, la mostramos
                if (data && data.display_name) {
                    addressInput.value = data.display_name; // Ej: "Calle Ficticia 123, Colonia..."
                } else {
                    addressInput.value = "No se pudo encontrar una dirección para esta ubicación.";
                }
                
            } catch (error) {
                console.error("Error al buscar dirección:", error);
                addressInput.value = "Error al buscar. Intenta de nuevo.";
            } finally {
                // Oculta el spinner al terminar
                loadingSpinner.style.display = 'none';
            }
        }
    }
});