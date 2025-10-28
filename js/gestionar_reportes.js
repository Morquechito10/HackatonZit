document.addEventListener("DOMContentLoaded", () => {
    cargarReportesDelProtector();
});

async function cargarReportesDelProtector() {
    const tbody = document.getElementById('reportes-tbody');
    
    const userId = sessionStorage.getItem('user_id');
    if (!userId) {
        tbody.innerHTML = '<tr><td colspan="6" style="color: red; text-align: center;">Error: No has iniciado sesión.</td></tr>';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${userId}/reportes-creados`);
        if (!response.ok) {
            throw new Error('No se pudieron cargar tus reportes.');
        }
        
        const reportes = await response.json();
        
        if (reportes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Aún no has creado ningún reporte.</td></tr>';
            return;
        }

        tbody.innerHTML = ''; // Limpiar "Cargando..."
        
        reportes.forEach(reporte => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-report-id', reporte.reporte_id);
            
            const { priorityClass, priorityText } = getPriorityDetails(reporte.puntaje_prioridad_total);
            const { statusClass, statusText } = getStatusDetails(reporte.estado);
            
            tr.innerHTML = `
                <td><strong>REP-${reporte.reporte_id}</strong></td>
                <td>${reporte.titulo}</td>
                <td><span class="tag-priority ${priorityClass}">${priorityText}</span></td>
                <td><span class="tag-status ${statusClass}">${statusText}</span></td>
                <td>${reporte.contador_ayudas_recibidas}</td>
                <td>
                    <div class="action-btn-group">
                        <button class="action-btn btn-view" title="Visualizar" onclick="verDetalle(${reporte.reporte_id})"><i class="fas fa-eye"></i></button>
                        <button class="action-btn btn-edit" title="Editar" onclick="editarReporte(${reporte.reporte_id})" ${reporte.estado === 'cerrado' ? 'disabled' : ''}><i class="fas fa-pencil-alt"></i></button>
                        <button class="action-btn btn-delete" title="Eliminar" onclick="eliminarReporte(${reporte.reporte_id})" ${reporte.estado === 'cerrado' ? 'disabled' : ''}><i class="fas fa-trash-alt"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error(error);
        tbody.innerHTML = `<tr><td colspan="6" style="color: red; text-align: center;">${error.message}</td></tr>`;
    }
}

async function eliminarReporte(reporteId) {
    if (!confirm(`¿Estás seguro de que deseas eliminar el reporte REP-${reporteId}? Esta acción no se puede deshacer.`)) {
        return;
    }
    
    const userId = sessionStorage.getItem('user_id');
    if (!userId) {
        alert("Error de sesión. Vuelve a iniciar sesión.");
        return;
    }

    try {
        // La API (main.py) espera el ID del editor como parámetro de consulta
        const response = await fetch(`${API_BASE_URL}/reportes/${reporteId}?usuario_id_editor=${userId}`, {
            method: 'DELETE'
        });

        if (response.status === 204) { // 204 No Content (Éxito)
            alert("Reporte eliminado con éxito.");
            // Eliminar la fila de la tabla
            document.querySelector(`tr[data-report-id="${reporteId}"]`).remove();
        } else if (response.status === 403) {
            throw new Error("No tienes permiso para eliminar este reporte.");
        } else if (response.status === 404) {
            throw new Error("Reporte no encontrado.");
        } else {
            throw new Error("Error al eliminar el reporte.");
        }

    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

// --- Funciones de ayuda ---

function getPriorityDetails(puntaje) {
    if (puntaje >= 20) return { priorityClass: 'priority-critica', priorityText: 'CRÍTICA' };
    if (puntaje >= 10) return { priorityClass: 'priority-alta', priorityText: 'ALTA' };
    return { priorityClass: 'priority-media', priorityText: 'MEDIA' };
}

function getStatusDetails(estado) {
    if (estado === 'abierto') return { statusClass: 'status-activo', statusText: 'ABIERTO' };
    if (estado === 'en_progreso') return { statusClass: 'status-proceso', statusText: 'EN PROCESO' };
    if (estado === 'cerrado') return { statusClass: 'status-resuelto', statusText: 'CERRADO' };
    return { statusClass: '', statusText: estado.toUpperCase() };
}

// Funciones placeholder para los otros botones
function verDetalle(reporteId) {
    alert(`(Implementación futura) Ver detalle del reporte ${reporteId}`);
    // Aquí podrías redirigir a una página de detalle:
    // window.location.href = `reporte_detalle.html?id=${reporteId}`;
}

function editarReporte(reporteId) {
    alert(`(Implementación futura) Editar reporte ${reporteId}`);
    // Aquí podrías redirigir a un formulario de edición:
    // window.location.href = `protector_editar.html?id=${reporteId}`;
}