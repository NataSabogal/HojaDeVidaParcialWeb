/**
 * Hoja de Vida - Script Principal
 * Implementación de validaciones rígidas, persistencia de listas y lógica dinámica.
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Script Hoja de Vida cargado correctamente.');

    // --- DATOS DE REFERENCIA ---
    const datosColombia = {
        "Antioquia": ["Medellín", "Envigado", "Itagüí", "Bello", "Rionegro", "Sabaneta"],
        "Atlántico": ["Barranquilla", "Soledad", "Malambo", "Puerto Colombia"],
        "Bolívar": ["Cartagena", "Magangué", "Turbaco"],
        "Boyacá": ["Tunja", "Duitama", "Sogamoso"],
        "Caldas": ["Manizales", "Villamaría", "La Dorada"],
        "Cundinamarca": ["Bogotá", "Soacha", "Chía", "Zipaquirá", "Fusagasugá"],
        "Córdoba": ["Montería", "Cereté", "Sahagún"],
        "Huila": ["Neiva", "Pitalito", "Garzón"],
        "Magdalena": ["Santa Marta", "Ciénaga", "Fundación"],
        "Nariño": ["Pasto", "Ipiales", "Tumaco"],
        "Norte de Santander": ["Cúcuta", "Ocaña", "Pamplona"],
        "Quindío": ["Armenia", "Buenavista", "Calarcá", "Circasia", "Córdoba", "Filandia", "Génova", "La Tebaida", "Montenegro", "Pijao", "Quimbaya", "Salento"],
        "Risaralda": ["Pereira", "Dosquebradas", "Santa Rosa de Cabal"],
        "Santander": ["Bucaramanga", "Floridablanca", "Girón", "Piedecuesta"],
        "Tolima": ["Ibagué", "Espinal", "Melgar"],
        "Valle del Cauca": ["Cali", "Palmira", "Buenaventura", "Tuluá", "Buga"]
    };

    const distritosMilitares = [
        "Distrito 1 - Bogotá", "Distrito 2 - Medellín", "Distrito 3 - Cali", 
        "Distrito 4 - Barranquilla", "Distrito 5 - Bucaramanga", "Distrito 6 - Pereira",
        "Distrito 7 - Ibagué", "Distrito 8 - Cartagena", "Distrito 9 - Villavicencio",
        "Distrito 10 - Neiva", "Distrito 11 - Pasto", "Distrito 12 - Cúcuta"
    ];

    // --- CONFIGURACIÓN DE VALIDACIÓN (CAMPOS OBLIGATORIOS) ---
    const VALIDACION_CONFIG = {
        'index.html': [
            { id: 'primer-apellido', label: 'Primer Apellido' },
            { id: 'nombres', label: 'Nombres' },
            { id: 'num-documento', label: 'Número de documento' },
            { name: 'doc', label: 'Tipo de documento', type: 'radio' },
            { name: 'sexo', label: 'Sexo', type: 'radio' },
            { id: 'fecha-nacimiento', label: 'Fecha de nacimiento' },
            { id: 'direccion-correspondencia', label: 'Dirección' },
            { id: 'telefono', label: 'Teléfono' },
            { id: 'email', label: 'Correo electrónico', type: 'email' }
        ],
        'formacion.html': [
            { id: 'titulo-basica', label: 'Título Obtenido (Básica)' },
            { id: 'anio-grado-basica', label: 'Año de Grado' }
        ],
        'experiencia.html': [
            { id: 'empresa-actual', label: 'Empresa o Entidad' },
            { id: 'cargo-actual', label: 'Cargo o Contrato Actual' }
        ],
        'certificacion.html': [
            { id: 'chk-juramento', label: 'Aceptación de juramento', type: 'checkbox' },
            { id: 'nombre-jefe', label: 'Nombre Jefe de Personal' }
        ]
    };


    // --- UTILERÍA ---
    const obtenerPaginaActual = () => {
        const path = window.location.pathname;
        return path.split('/').pop() || 'index.html';
    };

    const navegarA = (url) => { window.location.href = url; };

    // --- POBLAR SELECTS PREDETERMINADOS ---
    const poblarDistritos = () => {
        const sel = document.getElementById('distrito-militar');
        if (!sel) return;
        sel.innerHTML = '<option value="">Seleccione distrito...</option>';
        distritosMilitares.forEach(d => {
            const opt = document.createElement('option');
            opt.value = opt.textContent = d;
            sel.appendChild(opt);
        });
    };

    const setupDynamicDropdowns = () => {
        document.querySelectorAll('.depto-select').forEach(depto => {
            const row = depto.closest('.row');
            if (row) {
                const muni = row.querySelector('.muni-select');
                if (muni) depto.addEventListener('change', () => actualizarMunicipios(muni, depto.value));
            }
        });
    };

    const actualizarMunicipios = (muniSelect, depto) => {
        if (!muniSelect) return;
        muniSelect.innerHTML = '<option value="">Seleccione...</option>';
        if (depto && datosColombia[depto]) {
            datosColombia[depto].forEach(m => {
                const opt = document.createElement('option');
                opt.value = opt.textContent = m;
                muniSelect.appendChild(opt);
            });
        }
    };

    // --- GESTIÓN DE ERRORES VISUALES ---
    const mostrarError = (el, msg) => {
        if (!el) return;
        el.classList.add('is-invalid');
        let errorDiv = el.parentElement.querySelector('.invalid-feedback-custom');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback-custom';
            errorDiv.style.color = '#dc3545';
            errorDiv.style.fontSize = '11px';
            errorDiv.style.marginTop = '2px';
            el.parentElement.appendChild(errorDiv);
        }
        errorDiv.textContent = msg;
        el.style.borderColor = '#dc3545';
    };

    const limpiarErrores = () => {
        document.querySelectorAll('.is-invalid').forEach(el => {
            el.classList.remove('is-invalid');
            el.style.borderColor = '';
        });
        document.querySelectorAll('.invalid-feedback-custom').forEach(el => el.remove());
    };

    // --- VALIDACIÓN RÍGIDA ---
    const validarPaginaActual = () => {
        limpiarErrores();
        const config = VALIDACION_CONFIG[obtenerPaginaActual()];
        if (!config) return true;

        let esValido = true;
        const hoy = new Date();
        const anioActual = hoy.getFullYear();

        config.forEach(campo => {
            if (campo.type === 'radio') {
                const radios = document.querySelectorAll(`input[name="${campo.name}"]`);
                if (!Array.from(radios).some(r => r.checked)) {
                    esValido = false;
                    const grupo = radios[0].closest('.radio-grupo') || radios[0].parentElement;
                    mostrarError(grupo, `Seleccione ${campo.label}`);
                }
            } else if (campo.type === 'checkbox') {
                const el = document.getElementById(campo.id);
                if (el && !el.checked) {
                    esValido = false;
                    mostrarError(el, `Debe aceptar: ${campo.label}`);
                }
            } else if (campo.type === 'email') {
                const el = document.getElementById(campo.id);
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!el || !el.value.trim()) {
                    esValido = false;
                    mostrarError(el, `${campo.label} es requerido`);
                } else if (!emailRegex.test(el.value.trim())) {
                    esValido = false;
                    mostrarError(el, 'Email no válido');
                }
            } else {
                const el = document.getElementById(campo.id);
                if (!el || !el.value.trim()) {
                    esValido = false;
                    mostrarError(el, `${campo.label} es requerido`);
                } else {
                    // Validaciones adicionales específicas
                    if (campo.id === 'fecha-nacimiento') {
                        const cumple = new Date(el.value);
                        let edad = anioActual - cumple.getFullYear();
                        const m = hoy.getMonth() - cumple.getMonth();
                        if (m < 0 || (m === 0 && hoy.getDate() < cumple.getDate())) {
                            edad--;
                        }
                        if (edad < 18) {
                            esValido = false;
                            mostrarError(el, 'Debe ser mayor de 18 años');
                        }
                    }

                    if (el.type === 'number' && (campo.id.includes('anio') || campo.id.includes('year'))) {
                        if (parseInt(el.value) > anioActual) {
                            esValido = false;
                            mostrarError(el, 'El año no puede ser superior al actual');
                        }
                    }
                }
            }
        });

        // Validar años en tablas dinámicas (Formación)
        document.querySelectorAll('input[type="number"][id*="anio"], input[placeholder="MM/AAAA"]').forEach(input => {
            if (input.value.trim()) {
                if (input.type === 'number') {
                    if (parseInt(input.value) > anioActual) {
                        esValido = false;
                        mostrarError(input, 'Año inválido');
                    }
                } else if (input.placeholder === 'MM/AAAA') {
                    const parts = input.value.split('/');
                    if (parts.length === 2) {
                        const year = parseInt(parts[1]);
                        if (year > anioActual) {
                            esValido = false;
                            mostrarError(input, 'Año no puede ser futuro');
                        }
                    }
                }
            }
        });

        if (!esValido) {
            alert('Atención: Algunos campos obligatorios están vacíos o son incorrectos. No puede continuar.');
        }
        return esValido;
    };

    // --- PERSISTENCIA AVANZADA (MANEJO DE ARREGLOS) ---
    const guardarDatos = () => {
        const datos = JSON.parse(localStorage.getItem('hv_draft')) || {};
        
        // Guardar campos estáticos (con ID)
        document.querySelectorAll('input[id], select[id], textarea[id]').forEach(el => {
            if (el.type === 'checkbox') datos[el.id] = el.checked;
            else if (el.type !== 'radio') datos[el.id] = el.value;
        });

        // Guardar radios por nombre
        document.querySelectorAll('input[type="radio"]:checked').forEach(r => {
            datos[r.name] = r.id || r.value;
        });

        // Guardar Entidad Receptora (campo especial sin id a veces)
        const entidad = document.querySelector('.entidad-input');
        if (entidad) datos['entidad-receptora-global'] = entidad.value;

        // Guardar Secciones Dinámicas como Arreglos
        const guardarLista = (containerId, entryClass) => {
            const container = document.getElementById(containerId);
            if (!container) return;
            const items = [];
            container.querySelectorAll('.' + entryClass).forEach(row => {
                const item = {};
                row.querySelectorAll('input, select').forEach(input => {
                    const key = input.id || input.name || input.placeholder || 'campo';
                    if (input.type === 'radio') {
                        if (input.checked) item[input.name] = input.id || input.value;
                    } else {
                        item[key] = input.value;
                    }
                });
                items.push(item);
            });
            datos[containerId] = items;
        };

        guardarLista('contenedor-estudios', 'libreta-box');
        guardarLista('contenedor-idiomas', 'libreta-box');
        guardarLista('contenedor-experiencias', 'libreta-box');

        localStorage.setItem('hv_draft', JSON.stringify(datos));
    };

    const cargarDatos = () => {
        const datos = JSON.parse(localStorage.getItem('hv_draft'));
        if (!datos) return;

        // Cargar Entidad Receptora
        const entidad = document.querySelector('.entidad-input');
        if (entidad && datos['entidad-receptora-global']) entidad.value = datos['entidad-receptora-global'];

        // Cargar campos estáticos
        document.querySelectorAll('input[id], select[id], textarea[id]').forEach(el => {
            if (datos[el.id] !== undefined) {
                if (el.type === 'checkbox') el.checked = datos[el.id];
                else el.value = datos[el.id];
            }
        });

        // Cargar radios
        document.querySelectorAll('input[type="radio"]').forEach(r => {
            if (datos[r.name] && (datos[r.name] === r.id || datos[r.name] === r.value)) {
                r.checked = true;
            }
        });

        // Restaurar Secciones Dinámicas
        const restaurarLista = (containerId, entryClass) => {
            const listData = datos[containerId];
            if (!listData || !listData.length) return;
            const container = document.getElementById(containerId);
            if (!container) return;

            // Limpiar y reconstruir
            const template = container.firstElementChild.cloneNode(true);
            container.innerHTML = '';

            listData.forEach((itemData, index) => {
                const clone = template.cloneNode(true);
                clone.querySelectorAll('input, select').forEach(input => {
                    const key = input.id || input.name || input.placeholder || 'campo';
                    
                    // Ajustar nombres de radios para que no colisionen por fila
                    if (input.type === 'radio') {
                        const originalName = input.name.replace(/\d+$/, '');
                        input.name = originalName + index;
                        if (itemData[originalName] === (input.id || input.value)) input.checked = true;
                    } else {
                        if (itemData[key] !== undefined) input.value = itemData[key];
                    }
                });
                container.appendChild(clone);
            });
        };

        restaurarLista('contenedor-estudios', 'libreta-box');
        restaurarLista('contenedor-idiomas', 'libreta-box');
        restaurarLista('contenedor-experiencias', 'libreta-box');

        // Refrescar municipios y cálculos
        setTimeout(() => {
            document.querySelectorAll('.depto-select').forEach(d => {
                const row = d.closest('.row');
                const muni = row ? row.querySelector('.muni-select') : null;
                if (muni) {
                    actualizarMunicipios(muni, d.value);
                    // Buscar si había un municipio guardado para esta fila
                    // (Más complejo con listas, pero al menos el depto carga)
                }
            });
            if (typeof calcularTotalTiempo === 'function') calcularTotalTiempo();
        }, 100);
    };

    // --- LÓGICA DE TIEMPO ---
    const calcularTotalTiempo = () => {
        const getV = id => parseInt(document.getElementById(id)?.value) || 0;
        const totalMeses = (getV('ap-pub') * 12 + getV('mp-pub')) +
                           (getV('ap-priv') * 12 + getV('mp-priv')) +
                           (getV('ap-ind') * 12 + getV('mp-ind'));
        
        const outA = document.getElementById('total-anios');
        const outM = document.getElementById('total-meses');
        if (outA) outA.value = Math.floor(totalMeses / 12);
        if (outM) outM.value = totalMeses % 12;
    };

    // --- BOTONES DE AGREGAR ---
    const setupAgregarBotones = () => {
        const handleAdd = (btnId, containerId) => {
            const btn = document.getElementById(btnId);
            const container = document.getElementById(containerId);
            if (btn && container) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const clone = container.firstElementChild.cloneNode(true);
                    clone.querySelectorAll('input').forEach(i => i.value = '');
                    clone.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
                    // Ajustar radios para el nuevo indice
                    const newIdx = container.children.length;
                    clone.querySelectorAll('input[type="radio"]').forEach(r => {
                        r.checked = false;
                        r.name = r.name.replace(/\d+$/, '') + newIdx;
                    });
                    container.appendChild(clone);
                    setupDynamicDropdowns();
                });
            }
        };
        handleAdd('btn-agregar-estudio', 'contenedor-estudios');
        handleAdd('btn-agregar-idioma', 'contenedor-idiomas');
        handleAdd('btn-agregar-exp', 'contenedor-experiencias');

        // Delegación de eventos para eliminar (btn-trash)
        document.addEventListener('click', (e) => {
            const trashBtn = e.target.closest('.btn-trash');
            if (trashBtn) {
                e.preventDefault();
                const row = trashBtn.closest('.libreta-box');
                if (row) {
                    const container = row.parentElement;
                    // Evitar borrar el último si es el único
                    if (container.children.length > 1) {
                        row.remove();
                        guardarDatos();
                    } else {
                        // Si es el único, solo limpiamos los campos
                        row.querySelectorAll('input').forEach(i => i.value = '');
                        row.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
                        guardarDatos();
                    }
                }
            }
        });
    };

    // --- NAVEGACIÓN Y PREVISUALIZACIÓN ---
    const setupNavButtons = () => {
        const paginas = ['index.html', 'formacion.html', 'experiencia.html', 'tiempoDeExperiencia.html', 'certificacion.html'];
        const actualIdx = paginas.indexOf(obtenerPaginaActual());

        // Manejar Sigientes
        const btnSig = document.querySelector('.btn-sig') || document.querySelector('.btn-enviar');
        if (btnSig) {
            btnSig.addEventListener('click', (e) => {
                if (validarPaginaActual()) {
                    guardarDatos();
                    if (btnSig.id === 'btn-enviar-final' || btnSig.classList.contains('btn-enviar')) {
                        enviarHojaDeVida();
                    } else if (actualIdx < paginas.length - 1) {
                        navegarA(paginas[actualIdx + 1]);
                    }
                }
            });
        }

        // Manejar Previsualizar (atrás con aviso)
        const btnPrev = document.querySelector('.btn-prev');
        if (btnPrev && !btnPrev.id.startsWith('btn-agregar') && !btnPrev.id.startsWith('btn-limpiar')) {
            btnPrev.addEventListener('click', () => {
                guardarDatos();
                if (actualIdx > 0) navegarA(paginas[actualIdx - 1]);
            });
        }

        // Caso especial paso 1 Previsualizar (mostrar resumen rápido)
        if (obtenerPaginaActual() === 'index.html') {
            const btnPrev1 = document.querySelector('.btn-prev');
            if (btnPrev1) {
                btnPrev1.addEventListener('click', (e) => {
                    e.preventDefault();
                    const d = JSON.parse(localStorage.getItem('hv_draft')) || {};
                    if (d.nombres) {
                        alert(`Resumen actual:\nNombre: ${d.nombres} ${d['primer-apellido'] || ''}\nDoc: ${d['num-documento'] || 'No asignado'}`);
                    } else {
                        alert('No hay datos guardados aún.');
                    }
                });
            }
        }
    };

    // --- ENVÍO FINAL ---
    const enviarHojaDeVida = () => {
        const draft = JSON.parse(localStorage.getItem('hv_draft'));
        if (!draft) return;

        const hvs = JSON.parse(localStorage.getItem('hvs_list')) || [];
        
        const nuevaHV = {
            id: Date.now(),
            nombre: `${draft.nombres || ''} ${draft['primer-apellido'] || ''} ${draft['segundo-apellido'] || ''}`.trim(),
            documento: draft['num-documento'] || 'N/A',
            fechaEnvio: new Date().toLocaleString(),
            estado: 'Diligenciada',
            firmaUsuario: document.getElementById('canvas-firma-usuario')?.toDataURL() || null,
            firmaJefe: document.getElementById('canvas-firma-jefe')?.toDataURL() || null,
            detalle: draft
        };

        hvs.push(nuevaHV);
        localStorage.setItem('hvs_list', JSON.stringify(hvs));
        localStorage.removeItem('hv_draft');

        alert('¡Hoja de Vida enviada exitosamente al administrador!');
        navegarA('index.html');
    };

    // --- PANEL ADMINISTRADOR ---
    const renderAdmin = () => {
        const tabla = document.getElementById('cuerpo-tabla');
        if (!tabla) return;
        const hvs = JSON.parse(localStorage.getItem('hvs_list')) || [];
        const filtro = document.getElementById('select-filtro')?.value || 'todas';
        tabla.innerHTML = '';
        
        hvs.filter(h => filtro === 'todas' || h.estado === filtro).forEach(hv => {
            const tr = document.createElement('tr');
            const esDiligenciada = hv.estado === 'Diligenciada';
            
            tr.innerHTML = `
                <td>${hv.nombre}</td>
                <td>${hv.documento}</td>
                <td>${hv.fechaEnvio}</td>
                <td><span class="badge-estado badge-${hv.estado.toLowerCase()}">${hv.estado}</span></td>
                <td>
                    <div class="d-flex gap-1">
                        <button class="btn-sig btn-sm py-1 px-2" onclick="verDetalle(${hv.id})" title="Ver Detalle">
                            <i class="bi bi-eye"></i> Leer
                        </button>
                        ${esDiligenciada ? `
                            <button class="btn btn-success btn-sm py-1 px-2" onclick="cambiarEstadoAccion(${hv.id}, 'Aceptada')">
                                <i class="bi bi-check-lg"></i>
                            </button>
                            <button class="btn btn-danger btn-sm py-1 px-2" onclick="cambiarEstadoAccion(${hv.id}, 'Rechazada')">
                                <i class="bi bi-x-lg"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            `;
            tabla.appendChild(tr);
        });
    };

    window.cambiarEstadoAccion = (id, nuevoEstado) => {
        const hvs = JSON.parse(localStorage.getItem('hvs_list')) || [];
        const idx = hvs.findIndex(h => h.id === id);
        if (idx !== -1) {
            hvs[idx].estado = nuevoEstado;
            localStorage.setItem('hvs_list', JSON.stringify(hvs));
            renderAdmin();
            if (document.getElementById('panel-detalle').style.display === 'block') {
                verDetalle(id);
            }
        }
    };

    window.verDetalle = (id) => {
        const hvs = JSON.parse(localStorage.getItem('hvs_list')) || [];
        const hv = hvs.find(h => h.id === id);
        if (!hv) return;
        
        document.getElementById('panel-detalle').style.display = 'block';
        document.getElementById('detalle-nombre').textContent = hv.nombre;
        document.getElementById('detalle-doc').textContent = hv.documento;
        document.getElementById('detalle-fecha').textContent = hv.fechaEnvio;
        document.getElementById('detalle-estado-actual').textContent = hv.estado;
        
        const cont = document.getElementById('detalle-datos-completos');
        cont.innerHTML = '';
        cont.classList.remove('detalle-grid'); // Limpiar clases previas

        const labels = {
            'nombres': 'Nombres',
            'primer-apellido': 'Primer Apellido',
            'segundo-apellido': 'Segundo Apellido',
            'num-documento': 'Cédula',
            'email': 'Correo',
            'telefono': 'Teléfono',
            'direccion-correspondencia': 'Dirección',
            'entidad-receptora-global': 'Entidad Destino',
            'fecha-nacimiento': 'Fecha Nac.',
            'total-anios': 'Años Exp.',
            'total-meses': 'Meses Exp.',
            'num-libreta': 'Libreta Militar',
            'distrito-militar': 'Distrito Militar',
            'nac': 'Nacionalidad',
            'doc': 'Tipo Doc.',
            'sexo': 'Sexo'
        };

        // Crear Contenedor Principal
        const mainRow = document.createElement('div');
        mainRow.className = 'row g-4';

        // --- COLUMNA IZQUIERDA (Datos Personales) ---
        const leftCol = document.createElement('div');
        leftCol.className = 'col-md-3 border-end';
        leftCol.style.backgroundColor = '#fcfcfc';

        Object.entries(hv.detalle).forEach(([key, val]) => {
            if (!Array.isArray(val) && val !== '' && val !== false && !key.includes('firma')) {
                const item = document.createElement('div');
                item.className = 'mb-3 border-bottom pb-2';
                const labelText = labels[key] || key.toUpperCase().replace(/-/g, ' ');
                item.innerHTML = `
                    <label class="campo-label" style="font-size: 9px; opacity: 0.7;">${labelText}</label>
                    <p class="mb-0" style="font-size: 11px; font-weight: 600; color: #333;">${val === true ? 'SI' : val}</p>
                `;
                leftCol.appendChild(item);
            }
        });
        mainRow.appendChild(leftCol);

        // --- COLUMNA DERECHA (Secciones y Firmas) ---
        const rightCol = document.createElement('div');
        rightCol.className = 'col-md-9';

        // Fila para las Secciones Dinámicas
        const sectionsRow = document.createElement('div');
        sectionsRow.className = 'row mb-4';

        const seccionesOrder = ['contenedor-estudios', 'contenedor-idiomas', 'contenedor-experiencias'];
        const titulos = {
            'contenedor-estudios': 'ESTUDIOS',
            'contenedor-idiomas': 'IDIOMAS',
            'contenedor-experiencias': 'EXPERIENCIAS'
        };

        seccionesOrder.forEach(key => {
            const val = hv.detalle[key] || [];
            const col = document.createElement('div');
            col.className = 'col-md-4';
            col.innerHTML = `<p class="subtitulo-bloque" style="font-size: 10px; border-bottom: 2px solid #0d1f3c;">${titulos[key]}</p>`;

            if (val.length > 0) {
                val.forEach(item => {
                    const box = document.createElement('div');
                    box.className = 'libreta-box mb-2 p-2 small';
                    box.style.fontSize = '10px';
                    box.style.lineHeight = '1.4';
                    box.innerHTML = Object.entries(item).map(([k, v]) => `<strong>${k}:</strong> ${v}`).join(' | ');
                    col.appendChild(box);
                });
            } else {
                col.innerHTML += '<p class="text-muted small">Sin registros.</p>';
            }
            sectionsRow.appendChild(col);
        });
        rightCol.appendChild(sectionsRow);

        // Fila para Firmas (dentro del área derecha)
        const signaturesRow = document.createElement('div');
        signaturesRow.className = 'row border-top pt-3';
        
        const crearCajaFirma = (titulo, b64) => {
            const col = document.createElement('div');
            col.className = 'col-md-4';
            col.innerHTML = `
                <label class="campo-label" style="font-size: 9px;">${titulo}</label>
                <div style="background: #f8f9fa; border: 1px solid #eee; border-radius: 4px; padding: 5px; text-align: center;">
                    ${b64 ? `<img src="${b64}" style="max-height: 50px; width: auto;">` : '<span class="text-muted" style="font-size: 9px;">No firmada</span>'}
                </div>
            `;
            return col;
        };

        signaturesRow.appendChild(crearCajaFirma('FIRMA DEL SERVIDOR / CONTRATISTA', hv.firmaUsuario));
        signaturesRow.appendChild(crearCajaFirma('FIRMA DEL JEFE DE PERSONAL', hv.firmaJefe));
        
        rightCol.appendChild(signaturesRow);
        mainRow.appendChild(rightCol);

        cont.appendChild(mainRow);

        document.getElementById('btn-guardar-estado').onclick = () => {
            const select = document.getElementById('nuevo-estado');
            if (select.value) {
                cambiarEstadoAccion(id, select.value);
            }
        };

        document.getElementById('btn-cerrar-detalle').onclick = () => {
            document.getElementById('panel-detalle').style.display = 'none';
        };
    };

    // --- INICIALIZACIÓN ---
    // Si se recarga la página manualmente, se reinician los campos (según petición usuario)
    if (performance.getEntriesByType('navigation')[0]?.type === 'reload') {
        localStorage.removeItem('hv_draft');
        console.log('Página recargada. Datos de borrador eliminados.');
    }

    poblarDistritos();
    setupDynamicDropdowns();
    setupAgregarBotones();
    setupNavButtons();
    cargarDatos();
    
    const setupCanvas = (canvasId, clearBtnId) => {
        const canv = document.getElementById(canvasId);
        if (canv) {
            const ctx = canv.getContext('2d');
            
            // Calibración inicial: ajustar resolución interna al tamaño visible
            const ajustarResolucion = () => {
                const rect = canv.getBoundingClientRect();
                if (rect.width > 0) {
                    canv.width = rect.width;
                    canv.height = rect.height || 100;
                }
            };
            ajustarResolucion();
            window.addEventListener('resize', ajustarResolucion);

            let drawing = false;

            const getPos = (e) => {
                const rect = canv.getBoundingClientRect();
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                return {
                    x: clientX - rect.left,
                    y: clientY - rect.top
                };
            };

            const start = (e) => {
                drawing = true;
                const pos = getPos(e);
                ctx.beginPath();
                ctx.moveTo(pos.x, pos.y);
                if (e.cancelable) e.preventDefault();
            };

            const move = (e) => {
                if (!drawing) return;
                const pos = getPos(e);
                ctx.lineWidth = 2.5;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.strokeStyle = '#0d1f3c';
                ctx.lineTo(pos.x, pos.y);
                ctx.stroke();
                if (e.cancelable) e.preventDefault();
            };

            const stop = () => { drawing = false; };

            canv.addEventListener('mousedown', start);
            canv.addEventListener('mousemove', move);
            window.addEventListener('mouseup', stop);

            canv.addEventListener('touchstart', start, { passive: false });
            canv.addEventListener('touchmove', move, { passive: false });
            canv.addEventListener('touchend', stop);

            document.getElementById(clearBtnId)?.addEventListener('click', () => {
                ctx.clearRect(0, 0, canv.width, canv.height);
            });
        }
    };

    setupCanvas('canvas-firma-usuario', 'btn-limpiar-firma-usuario');
    setupCanvas('canvas-firma-jefe', 'btn-limpiar-firma-jefe');

    if (document.getElementById('cuerpo-tabla')) {
        renderAdmin();
        const filtroSelect = document.getElementById('select-filtro');
        if (filtroSelect) {
            filtroSelect.addEventListener('change', renderAdmin);
        }
    }

    // Auto-guardado
    document.addEventListener('input', (e) => {
        if (e.target.matches('input, select, textarea')) {
            guardarDatos();
            if (e.target.id && (e.target.id.startsWith('ap-') || e.target.id.startsWith('mp-'))) calcularTotalTiempo();
        }
    });

    // Guardar al hacer clic en cualquier enlace de navegación (sidebar/header)
    document.querySelectorAll('a, .paso').forEach(link => {
        link.addEventListener('click', () => guardarDatos());
    });
});
