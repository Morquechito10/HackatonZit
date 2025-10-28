// Espera a que el contenido de la página esté cargado
document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Verifica si estamos en la página del mapa
    //    Buscamos el 'div' con id 'map'
    if (document.getElementById('map')) {

        // 2. Coordenadas de ejemplo (Centrado en Guadalajara, MX)
        const mapCenter = [20.6736, -103.344];

        // 3. Inicializa el mapa
        const map = L.map('map').setView(mapCenter, 13); // 13 es el nivel de zoom

        // 4. Agrega la capa de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // --- 5. Agrega los Pines de Ejemplo ---

        // Reporte 1: Perro en Avenida Principal (CRÍTICA)
        const marker1 = L.marker([20.675, -103.345]).addTo(map);
        marker1.bindPopup("<b>Perro en Avenida Principal</b><br>Prioridad: CRÍTICA<br>Necesita: Vet, Transporte");

        // Reporte 2: Cachorros en caja (ALTA)
        const marker2 = L.marker([20.671, -103.349]).addTo(map);
        marker2.bindPopup("<b>Cachorros en caja</b><br>Prioridad: ALTA<br>Necesita: Hogar Temporal, Alimento");
        
        // Reporte 3: Gato en un árbol (MEDIA)
        const marker3 = L.marker([20.678, -103.340]).addTo(map);
        marker3.bindPopup("<b>Gato en un árbol</b><br>Prioridad: MEDIA<br>Necesita: Rescate");
    }

});