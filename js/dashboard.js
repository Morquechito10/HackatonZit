document.addEventListener("DOMContentLoaded", () => {
    cargarEstadisticas();
});

async function cargarEstadisticas() {
    const statActivos = document.getElementById('stat-activos');
    const statRescatados = document.getElementById('stat-rescatados');
    const statVoluntarios = document.getElementById('stat-voluntarios');

    const userId = sessionStorage.getItem('user_id');
    if (!userId) {
        statActivos.textContent = 'Error';
        statRescatados.textContent = 'Error';
        statVoluntarios.textContent = 'Error';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${userId}/reportes-creados`);
        if (!response.ok) {
            throw new Error('No se pudieron cargar estadísticas.');
        }
        
        const reportes = await response.json();
        
        // Calcular estadísticas
        let activos = 0;
        let cerrados = 0;
        let ayudasOfrecidas = 0;

        reportes.forEach(reporte => {
            if (reporte.estado === 'abierto') {
                activos++;
            } else if (reporte.estado === 'cerrado') {
                cerrados++;
            }
            ayudasOfrecidas += reporte.contador_ayudas_recibidas;
        });

        // Actualizar el DOM
        statActivos.textContent = activos;
        statRescatados.textContent = cerrados;
        statVoluntarios.textContent = ayudasOfrecidas; // Usamos el contador de la API

    } catch (error) {
        console.error(error);
        statActivos.textContent = 'N/A';
        statRescatados.textContent = 'N/A';
        statVoluntarios.textContent = 'N/A';
    }
}