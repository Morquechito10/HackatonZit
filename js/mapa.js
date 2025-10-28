// Espera a que el contenido de la página esté cargado
document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Verifica si estamos en la página del mapa
    const mapElement = document.getElementById('map');
    
    if (mapElement) {
        // 2. Coordenadas por defecto (si el usuario rechaza la ubicación)
        const defaultCenter = [20.6736, -103.344]; // Guadalajara

        // 3. Inicializa el mapa
        const map = L.map('map').setView(defaultCenter, 13); 

        // 4. Agrega la capa de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        
        // --- 5. ¡NUEVO! Pedir Ubicación del Voluntario ---
        if (navigator.geolocation) {
            // Muestra un aviso amigable (opcional, pero bueno)
            console.log("Solicitando ubicación del voluntario...");

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // ¡Éxito! Centra el mapa en la ubicación del usuario
                    const myLocation = [position.coords.latitude, position.coords.longitude];
                    map.setView(myLocation, 15); // Zoom más cercano
                    
                    // --- Marcador Especial para el Usuario ---
                    // (Usando un icono de Font Awesome)
                    const userIcon = L.divIcon({
                        html: '<i class="fas fa-user-circle" style="font-size: 2.5em; color: var(--primary-color);"></i>',
                        className: 'user-location-icon', // Clase para quitar fondo blanco
                        iconSize: [30, 30],
                        iconAnchor: [15, 30] // Centra el icono
                    });

                    L.marker(myLocation, { icon: userIcon })
                     .addTo(map)
                     .bindPopup("<b>¡Estás aquí!</b><br>Estos son los reportes cercanos.")
                     .openPopup();
                },
                () => {
                    // El usuario rechazó o hubo un error
                    console.warn("El usuario no permitió la geolocalización. Mostrando ubicación por defecto.");
                    // (El mapa se queda en 'defaultCenter')
                }
            );
        } else {
            console.error("Geolocalización no es soportada por este navegador.");
        }


        // --- 6. Pines de Reportes (Simulando "Cercanos") ---
        // (Estos se cargarían dinámicamente según la ubicación del usuario)

        const marker1 = L.marker([20.675, -103.345]).addTo(map);
        marker1.bindPopup("<b>Perro en Avenida Principal</b><br>Prioridad: CRÍTICA<br>Necesita: Vet, Transporte");

        const marker2 = L.marker([20.671, -103.349]).addTo(map);
        marker2.bindPopup("<b>Cachorros en caja</b><br>Prioridad: ALTA<br>Necesita: Hogar Temporal, Alimento");
        
        const marker3 = L.marker([20.678, -103.340]).addTo(map);
        marker3.bindPopup("<b>Gato en un árbol</b><br>Prioridad: MEDIA<br>Necesita: Rescate");
    }

});