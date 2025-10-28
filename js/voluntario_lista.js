// voluntario_lista.js (MODIFICADO PARA PERMITIR AYUDAR)

document.addEventListener("DOMContentLoaded", () => {
    const listaContainer = document.getElementById('view-lista');
    if (listaContainer) {
        cargarReportesLista(listaContainer);
        
        // --- ¡NUEVO! Event Delegation ---
        // Escuchamos clics en el contenedor principal
        listaContainer.addEventListener('click', handleAyudaClick);
    }
});

/**
 * Carga los reportes y los muestra en la lista.
 * @param {HTMLElement} container - El div donde se insertarán los cards.
 */
async function cargarReportesLista(container) {
    try {
        const listResponse = await fetch(`${API_BASE_URL}/reportes`); 
        if (!listResponse.ok) throw new Error(`Error HTTP (lista): ${listResponse.status}`);
        
        const reportesBasicos = await listResponse.json();

        if (reportesBasicos.length === 0) {
            container.innerHTML = '<p>No hay reportes abiertos por el momento.</p>';
            return;
        }

        const detallePromises = reportesBasicos.map(reporte =>
            fetch(`${API_BASE_URL}/reportes/${reporte.reporte_id}`)
                .then(res => res.json())
        );

        const reportesCompletos = await Promise.all(detallePromises);
        
        container.innerHTML = ''; // Limpiar "Cargando..."
        
        reportesCompletos.forEach(reporte => {
            if (reporte && reporte.reporte_id) {
                const cardHtml = crearReportCardHtml(reporte);
                container.innerHTML += cardHtml;
            }
        });

    } catch (error) {
        console.error("Error al cargar los reportes:", error);
        container.innerHTML = '<p style="color: red;">Error al cargar los reportes. Intente más tarde.</p>';
    }
}

/**
 * --- ¡NUEVO! Maneja el clic en un botón de ayuda ---
 * @param {Event} event - El evento de clic
 */
function handleAyudaClick(event) {
    // Verifica si el clic fue en un botón de ayuda
    const target = event.target;
    if (!target.classList.contains('tag-action')) {
        return; // No fue en un botón de ayuda, no hacer nada
    }

    event.preventDefault(); // Prevenir cualquier acción por defecto del botón
    
    // Obtener los datos del botón
    const { reporteId, ayudaId } = target.dataset;
    const ayudaNombre = target.textContent;

    // Llamar a la función que envía a la API
    ofrecerAyuda(reporteId, ayudaId, ayudaNombre, target);
}

/**
 * --- ¡NUEVO! Envía la oferta de ayuda a la API ---
 * @param {string} reporteId - ID del reporte
 * @param {string} ayudaId - ID del tipo de ayuda
 * @param {string} ayudaNombre - Nombre de la ayuda (para el confirm)
 * @param {HTMLButtonElement} buttonElement - El botón que fue presionado
 */
async function ofrecerAyuda(reporteId, ayudaId, ayudaNombre, buttonElement) {
    
    // 1. Obtener ID del voluntario desde sessionStorage
    const userId = sessionStorage.getItem('user_id');
    if (!userId) {
        alert("Error: No has iniciado sesión. Serás redirigido.");
        window.location.href = 'login.html'; // Ajusta esta ruta
        return;
    }

    // 2. Confirmar la acción
    if (!confirm(`¿Estás seguro de que deseas ofrecer ayuda de "${ayudaNombre}" para el reporte REP-${reporteId}?`)) {
        return;
    }

    // 3. Deshabilitar botón y mostrar carga
    buttonElement.disabled = true;
    buttonElement.textContent = "Enviando...";

    // 4. Construir el body para la API
    const body = {
        usuario_id_voluntario: parseInt(userId),
        reporte_id: parseInt(reporteId),
        tipo_ayuda_id: parseInt(ayudaId)
    };

    try {
        // 5. Llamar a la API POST /acciones
        const response = await fetch(`${API_BASE_URL}/acciones`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            // Si la API devuelve un error (ej. "Ya has ofrecido esta ayuda")
            throw new Error(data.detail || 'Error al registrar la ayuda.');
        }

        // 6. Éxito
        alert("¡Gracias! Tu ofrecimiento de ayuda ha sido registrado. El protector será notificado.");
        buttonElement.textContent = "¡Ayuda Ofrecida!";
        buttonElement.classList.add('disabled'); // Estilo visual extra

    } catch (error) {
        // 7. Manejo de errores
        alert(`Error: ${error.message}`);
        // Volver a habilitar el botón si falló
        buttonElement.disabled = false;
        buttonElement.textContent = ayudaNombre;
    }
}


/**
 * Genera el HTML para un solo <div class="report-card">
 * --- MODIFICADO ---
 */
function crearReportCardHtml(reporte) {
    const { priorityClass, priorityText } = getPriorityDetails(reporte.puntaje_prioridad_total);
    const iconClass = getAnimalIcon(reporte.tipo_animal);
    
    // --- CAMBIO: Ahora genera BOTONES en lugar de SPANS ---
    const tagsHtml = reporte.tipos_ayuda
                        .map(ayuda => 
                            `<button class="tag tag-action" data-report-id="${reporte.reporte_id}" data-ayuda-id="${ayuda.tipo_ayuda_id}">
                                ${ayuda.nombre}
                             </button>`
                        )
                        .join(' ');
    
    const locationText = reporte.direccion_texto || 'Ubicación no especificada';

    return `
        <div class="report-card" data-report-id="${reporte.reporte_id}">
            <div class="card-image-placeholder">
                <i class="fa-solid ${iconClass} fa-beat"></i>
            </div>
            <div class="card-content">
                <div class="priority ${priorityClass}">${priorityText}</div>
                <h3>${reporte.titulo}</h3>
                <p class="help-needed">
                    ${tagsHtml || 'No se especificó ayuda.'}
                </p>
                <p class="location">${locationText}</p>
                </div>
        </div>
    `;
}

// --- Funciones Helper (Sin cambios) ---

function getPriorityDetails(puntaje) {
    if (puntaje >= 20) {
        return { priorityClass: 'priority-critica', priorityText: 'CRÍTICA' };
    } else if (puntaje >= 10) {
        return { priorityClass: 'priority-alta', priorityText: 'ALTA' };
    } else {
        return { priorityClass: 'priority-media', priorityText: 'MEDIA' };
    }
}

// ... (Todo el código anterior es correcto)

function getAnimalIcon(tipoAnimal) {
    if (!tipoAnimal) return 'fa-paw';
    const tipo = tipoAnimal.toLowerCase();
    if (tipo.includes('perro')) return 'fa-dog';
    if (tipo.includes('gato')) return 'fa-cat';
    return 'fa-paw'; // La línea que faltaba
}
// Fin del archivo voluntario_lista.js