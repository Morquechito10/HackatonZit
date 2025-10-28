// mapa.js (MODIFICADO)

document.addEventListener("DOMContentLoaded", () => {
    
    const mapElement = document.getElementById('map');
    
    if (mapElement) {
        const defaultCenter = [20.6736, -103.344]; // Guadalajara
        const map = L.map('map').setView(defaultCenter, 13); 

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // --- 5. Pedir Ubicación del Voluntario (Sin cambios) ---
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const myLocation = [position.coords.latitude, position.coords.longitude];
                    map.setView(myLocation, 15);
                    
                    const userIcon = L.divIcon({
                        html: '<i class="fas fa-user-circle" style="font-size: 2.5em; color: var(--primary-color);"></i>',
                        className: 'user-location-icon',
                        iconSize: [30, 30],
                        iconAnchor: [15, 30]
                    });

                    L.marker(myLocation, { icon: userIcon })
                     .addTo(map)
                     .bindPopup("<b>¡Estás aquí!</b><br>Estos son los reportes cercanos.")
                     .openPopup();
                },
                () => {
                    console.warn("El usuario no permitió la geolocalización.");
                }
            );
        } else {
            console.error("Geolocalización no es soportada por este navegador.");
        }

        // --- 6. Cargar Reportes Reales desde la API (Lógica Modificada) ---
        cargarReportesEnMapa(map);
    }
});


/**
 * Carga los reportes desde la API y los añade al mapa y al panel lateral.
 * VERSIÓN MODIFICADA (N+1 queries)
 * @param {L.Map} map - La instancia del mapa de Leaflet.
 */
async function cargarReportesEnMapa(map) {
    const panel = document.querySelector('.report-panel');
    
    try {
        // 1. Obtener la lista BÁSICA de reportes
        const listResponse = await fetch(`${API_BASE_URL}/reportes`);
        if (!listResponse.ok) throw new Error(`Error HTTP (lista): ${listResponse.status}`);
        
        const reportesBasicos = await listResponse.json();

        // Limpiar "Cargando..." (manteniendo el H2)
        panel.innerHTML = '<h2>Reportes Activos</h2>';

        if (reportesBasicos.length === 0) {
            panel.innerHTML += '<p>No hay reportes activos por el momento.</p>';
            return;
        }

        // 2. Crear un array de "promesas" para pedir el DETALLE de CADA reporte
        const detallePromises = reportesBasicos.map(reporte =>
            fetch(`${API_BASE_URL}/reportes/${reporte.reporte_id}`)
                .then(res => {
                    if (!res.ok) console.warn(`No se pudo cargar detalle de ${reporte.reporte_id}`);
                    return res.json();
                })
        );
        
        // 3. Esperar a que TODAS las llamadas de detalle terminen
        const reportesCompletos = await Promise.all(detallePromises);

        // 4. Renderizar cada reporte completo
        reportesCompletos.forEach(reporte => {
            if (reporte && reporte.reporte_id) {
                // 4a. Añadir al Panel Lateral
                const panelHtml = crearPanelItemHtml(reporte);
                panel.innerHTML += panelHtml;

                // 4b. Añadir al Mapa (solo si tiene coordenadas válidas)
                const { latitud, longitud } = reporte;
                
                if (latitud && longitud) {
                    const lat = parseFloat(latitud);
                    const lon = parseFloat(longitud);

                    if (!isNaN(lat) && !isNaN(lon)) {
                        const popupHtml = crearPopupHtml(reporte);
                        L.marker([lat, lon])
                         .addTo(map)
                         .bindPopup(popupHtml);
                    }
                }
            }
        });

    } catch (error) {
        console.error("Error al cargar reportes en el mapa:", error);
        panel.innerHTML = '<h2>Reportes Activos</h2><p style="color: red;">Error al cargar reportes.</p>';
    }
}


// --- Funciones Helper (Sin cambios) ---

function crearPopupHtml(reporte) {
    const { priorityText } = getPriorityDetails(reporte.puntaje_prioridad_total);
    const tagsHtml = reporte.tipos_ayuda
        .map(ayuda => ayuda.nombre)
        .join(', ');
    
    return `
        <b>${reporte.titulo}</b><br>
        Prioridad: <b>${priorityText}</b><br>
        Necesita: ${tagsHtml || 'No especificado'}
    `;
}

function crearPanelItemHtml(reporte) {
    const { priorityClass, priorityText } = getPriorityDetails(reporte.puntaje_prioridad_total);
    const tagsHtml = reporte.tipos_ayuda
        .map(ayuda => ayuda.nombre)
        .join(', ');
    
    return `
        <div class="panel-item ${priorityClass}" data-report-id="${reporte.reporte_id}">
            <h4>${reporte.titulo}</h4>
            <p>Necesita: ${tagsHtml || 'No especificado'}</p>
            <span>${priorityText}</span>
        </div>
    `;
}

function getPriorityDetails(puntaje) {
    if (puntaje >= 20) {
        return { priorityClass: 'priority-critica', priorityText: 'CRÍTICA' };
    } else if (puntaje >= 10) {
        return { priorityClass: 'priority-alta', priorityText: 'ALTA' };
    } else {
        return { priorityClass: 'priority-media', priorityText: 'MEDIA' };
    }
}