/**
 * Hoja de Vida - Script Principal
 * Implementación de validaciones y lógica dinámica
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Script Hoja de Vida cargado correctamente.');

    // --- DATOS DE DEPARTAMENTOS Y MUNICIPIOS ---
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

    // --- LÓGICA DE SELECTS DINÁMICOS ---
    const deptoSelects = document.querySelectorAll('select.depto-select');
    const muniSelects = document.querySelectorAll('select.muni-select');

    // Mapeo de select de depto a su respectivo select de municipio
    // En este caso, asumimos que están en la misma fila o estructura cercana.
    // Una forma robusta es usar IDs o clases específicas.
    // Vamos a asignar event listeners a todos los selects de departamento.

    const setupDynamicDropdowns = () => {
        const rows = document.querySelectorAll('.row');
        rows.forEach(row => {
            const depto = row.querySelector('.depto-select');
            const muni = row.querySelector('.muni-select');

            if (depto && muni) {
                depto.addEventListener('change', () => {
                    const deptoSeleccionado = depto.value;
                    actualizarMunicipios(muni, deptoSeleccionado);
                });
            }
        });
    };

    const actualizarMunicipios = (muniSelect, depto) => {
        // Limpiar municipio select
        muniSelect.innerHTML = '<option value="">Seleccione...</option>';

        if (depto && datosColombia[depto]) {
            datosColombia[depto].forEach(municipio => {
                const option = document.createElement('option');
                option.value = municipio;
                option.textContent = municipio;
                muniSelect.appendChild(option);
            });
        }
    };

    setupDynamicDropdowns();

    // --- VALIDACIONES DE CAMPOS ---
    const forms = document.querySelectorAll('article.contenido');
    
    // Función para mostrar error
    const mostrarError = (input, mensaje) => {
        input.classList.add('is-invalid');
        input.style.borderColor = '#dc3545';
        
        let errorDiv = input.nextElementSibling;
        if (!errorDiv || !errorDiv.classList.contains('error-mensaje')) {
            errorDiv = document.createElement('div');
            errorDiv.classList.add('error-mensaje');
            errorDiv.style.color = '#dc3545';
            errorDiv.style.fontSize = '12px';
            errorDiv.style.marginTop = '4px';
            input.parentNode.appendChild(errorDiv);
        }
        errorDiv.textContent = mensaje;
    };

    const limpiarError = (input) => {
        input.classList.remove('is-invalid');
        input.style.borderColor = '';
        const errorDiv = input.parentNode.querySelector('.error-mensaje');
        if (errorDiv) {
            errorDiv.remove();
        }
    };

    // Validar emails
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', () => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (input.value && !emailRegex.test(input.value)) {
                mostrarError(input, 'Correo electrónico no válido');
            } else {
                limpiarError(input);
            }
        });
    });

    // Validar campos obligatorios al intentar avanzar
    const btnSiguiente = document.querySelector('.btn-sig');
    if (btnSiguiente && !btnSiguiente.id.includes('guardar')) { // Evitar el de admin
        btnSiguiente.addEventListener('click', (e) => {
            let formValido = true;
            const camposRequeridos = document.querySelectorAll('.campo-input[required], input[type="text"].campo-input:not([placeholder*="Ej"]):not([value])');
            
            // Nota: En el HTML actual no hay muchos 'required', vamos a validar algunos críticos
            const nombres = document.querySelector('input[placeholder="Ej: JUAN CARLOS"]');
            if (nombres && !nombres.value.trim()) {
                mostrarError(nombres, 'El nombre es obligatorio');
                formValido = false;
            }

            const apellidos = document.querySelector('input[placeholder="Ej: GONZÁLEZ"]');
            if (apellidos && !apellidos.value.trim()) {
                mostrarError(apellidos, 'El apellido es obligatorio');
                formValido = false;
            }

            // Si es la página de certificación, validar el checkbox
            const chkJuramento = document.getElementById('chk-juramento');
            if (chkJuramento && !chkJuramento.checked) {
                alert('Debe aceptar el juramento para continuar.');
                formValido = false;
            }

            if (!formValido) {
                e.preventDefault();
                console.warn('Formulario inválido, corrija los errores.');
            }
        });
    }

    // --- LÓGICA DE TIEMPO DE EXPERIENCIA (Calculo automático) ---
    const inputsTiempo = [
        'ap-pub', 'mp-pub', 'ap-priv', 'mp-priv', 'ap-ind', 'mp-ind'
    ];
    
    const calcularTotalTiempo = () => {
        let totalMeses = 0;
        
        const apPub = parseInt(document.getElementById('ap-pub')?.value) || 0;
        const mpPub = parseInt(document.getElementById('mp-pub')?.value) || 0;
        const apPriv = parseInt(document.getElementById('ap-priv')?.value) || 0;
        const mpPriv = parseInt(document.getElementById('mp-priv')?.value) || 0;
        const apInd = parseInt(document.getElementById('ap-ind')?.value) || 0;
        const mpInd = parseInt(document.getElementById('mp-ind')?.value) || 0;

        totalMeses = (apPub * 12 + mpPub) + (apPriv * 12 + mpPriv) + (apInd * 12 + mpInd);
        
        const aniosFinal = Math.floor(totalMeses / 12);
        const mesesFinal = totalMeses % 12;
        
        const outAnios = document.getElementById('total-anios');
        const outMeses = document.getElementById('total-meses');
        
        if (outAnios && outMeses) {
            outAnios.value = aniosFinal;
            outMeses.value = mesesFinal;
        }
    };

    inputsTiempo.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', calcularTotalTiempo);
        }
    });

    // --- BOTONES DE AGREGAR FILAS (Mínima implementación) ---
    const btnAgregarEstudio = document.getElementById('btn-agregar-estudio');
    if (btnAgregarEstudio) {
        btnAgregarEstudio.addEventListener('click', (e) => {
            e.preventDefault();
            const contenedor = document.getElementById('contenedor-estudios');
            const nuevo = contenedor.firstElementChild.cloneNode(true);
            // Limpiar inputs del clon
            nuevo.querySelectorAll('input').forEach(i => i.value = '');
            nuevo.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
            contenedor.appendChild(nuevo);
        });
    }

    const btnAgregarExp = document.getElementById('btn-agregar-exp');
    if (btnAgregarExp) {
        btnAgregarExp.addEventListener('click', (e) => {
            e.preventDefault();
            const contenedor = document.getElementById('contenedor-experiencias');
            const nuevo = contenedor.firstElementChild.cloneNode(true);
            nuevo.querySelector('.subtitulo-bloque').textContent = 'Experiencia Anterior';
            nuevo.querySelectorAll('input').forEach(i => i.value = '');
            nuevo.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
            contenedor.appendChild(nuevo);
            // Re-vincular selects dinámicos si los hay en el clon
            setupDynamicDropdowns();
        });
    }

    // --- LÓGICA DE PERSISTENCIA (Draft) ---
    const obtenerNombrePagina = () => {
        const partes = window.location.pathname.split('/');
        return partes[partes.length - 1] || 'pagina';
    };

    const normalizarTexto = (texto) => texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const obtenerLabelCampo = (campo) => {
        const bloque = campo.closest('.mb-3, .col-md-1, .col-md-2, .col-md-3, .col-md-4, .col-md-6, .col-md-8, .col-md-12, .libreta-box');
        const label = bloque ? bloque.querySelector('.campo-label') : null;
        if (label && label.textContent.trim()) {
            return label.textContent.trim();
        }
        if (campo.placeholder && campo.placeholder.trim()) {
            return campo.placeholder.trim();
        }
        return campo.id || campo.name || campo.tagName;
    };

    const obtenerClavePersistencia = (campo, indice) => {
        if (campo.id) return campo.id;
        if (campo.dataset.persistKey) return campo.dataset.persistKey;
        const pagina = obtenerNombrePagina();
        const label = normalizarTexto(obtenerLabelCampo(campo));
        const tipo = normalizarTexto(campo.type || campo.tagName || 'campo');
        const clave = `auto__${pagina}__${label || tipo}__${indice}`;
        campo.dataset.persistKey = clave;
        return clave;
    };

    const guardarProgreso = () => {
        const draft = JSON.parse(localStorage.getItem('hv_draft')) || {};
        const labelsGuardados = draft.__labels || {};

        // Guardar inputs, selects y textareas (incluye campos sin id)
        const campos = document.querySelectorAll('input.campo-input, select.campo-input, textarea.campo-input, input.entidad-input');
        campos.forEach((campo, indice) => {
            const clave = obtenerClavePersistencia(campo, indice);
            labelsGuardados[clave] = obtenerLabelCampo(campo);

            if (campo.type === 'checkbox') {
                draft[clave] = campo.checked;
                return;
            }
            if (campo.type === 'radio') return;
            draft[clave] = campo.value;
        });

        // Guardar radio buttons por grupo
        const radios = document.querySelectorAll('input[type="radio"]');
        const grupos = new Set();
        radios.forEach(radio => {
            if (!radio.name || grupos.has(radio.name)) return;
            grupos.add(radio.name);
            const seleccionado = document.querySelector(`input[type="radio"][name="${radio.name}"]:checked`);
            const claveGrupo = `radio__${obtenerNombrePagina()}__${radio.name}`;
            if (seleccionado) {
                const valorRadio = seleccionado.id || seleccionado.value || 'seleccionado';
                draft[claveGrupo] = valorRadio;
                if (seleccionado.id) {
                    // Compatibilidad con la lógica anterior
                    draft[radio.name] = seleccionado.id;
                }
            } else {
                delete draft[claveGrupo];
            }
        });

        draft.__labels = labelsGuardados;
        localStorage.setItem('hv_draft', JSON.stringify(draft));
    };

    const cargarProgreso = () => {
        const draft = JSON.parse(localStorage.getItem('hv_draft'));
        if (!draft) return;
        
        // Restaurar textos, selects, textareas y checkboxes (con y sin id)
        const campos = document.querySelectorAll('input.campo-input, select.campo-input, textarea.campo-input, input.entidad-input');
        campos.forEach((campo, indice) => {
            const clave = obtenerClavePersistencia(campo, indice);
            if (typeof draft[clave] === 'undefined') return;

            if (campo.type === 'checkbox') {
                campo.checked = !!draft[clave];
            } else if (campo.type !== 'radio') {
                campo.value = draft[clave];

                // Si es un depto, actualizar municipios relacionados
                if (campo.classList.contains('depto-select')) {
                    const row = campo.closest('.row');
                    const muniSelect = row ? row.querySelector('.muni-select') : null;
                    if (muniSelect) {
                        actualizarMunicipios(muniSelect, campo.value);
                    }
                }
            }
        });

        // Restaurar Radio Buttons por nombre y id
        const radios = document.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => {
            const claveGrupo = `radio__${obtenerNombrePagina()}__${radio.name}`;
            const valorGuardado = draft[claveGrupo] || draft[radio.name];
            if (valorGuardado && (valorGuardado === radio.id || valorGuardado === radio.value)) {
                radio.checked = true;
            }
        });
        
        // Pequeño refuerzo para calculos de tiempo si los hay
        setTimeout(() => {
            if (typeof calcularTotalTiempo === 'function') calcularTotalTiempo();
        }, 100);
    };

    // Escuchar cambios en todo el documento para guardar inmediatamente
    document.addEventListener('change', guardarProgreso);
    document.addEventListener('input', guardarProgreso);

    // Guardar antes de salir de la página por si acaso
    window.addEventListener('beforeunload', guardarProgreso);

    // Asegurar guardado al hacer clic en botones de navegación o enlaces
    document.querySelectorAll('a, button, .paso').forEach(el => {
        el.addEventListener('click', () => {
            guardarProgreso();
        });
    });

    cargarProgreso();

    // --- LÓGICA DE ENVÍO (Finalización) ---
    const btnEnviar = document.querySelector('.btn-enviar');
    if (btnEnviar) {
        btnEnviar.addEventListener('click', () => {
            const draft = JSON.parse(localStorage.getItem('hv_draft')) || {};
            
            // Validar que al menos tenga nombre y cedula
            if (!draft['nombres'] || !draft['num-documento']) {
                alert('Por favor complete los datos personales antes de enviar.');
                return;
            }

            const hvs = JSON.parse(localStorage.getItem('hvs_list')) || [];
            
            // Crear nueva HV
            const nuevaHV = {
                id: Date.now(),
                nombre: `${draft['nombres']} ${draft['primer-apellido']}`,
                documento: draft['num-documento'],
                fechaEnvio: new Date().toLocaleDateString(),
                estado: 'Diligenciada',
                detalle: draft
            };
            
            hvs.push(nuevaHV);
            localStorage.setItem('hvs_list', JSON.stringify(hvs));
            
            // Limpiar draft
            localStorage.removeItem('hv_draft');
            
            alert('¡Hoja de Vida enviada con éxito!');
            location.href = 'index.html';
        });
    }

    // --- LÓGICA PANEL ADMINISTRADOR ---
    const cuerpoTabla = document.getElementById('cuerpo-tabla');
    if (cuerpoTabla) {
        const etiquetasCampos = {
            nombres: 'Nombres',
            'primer-apellido': 'Primer Apellido',
            'segundo-apellido': 'Segundo Apellido',
            sexo: 'Sexo',
            nacionalidad: 'Nacionalidad',
            'tipo-documento': 'Tipo de Documento',
            'num-documento': 'Número de Documento',
            'libreta-militar': 'Libreta Militar',
            'primera-clase': 'Libreta Primera Clase',
            'segunda-clase': 'Libreta Segunda Clase',
            'num-libreta': 'Número de Libreta',
            distrito: 'Distrito Militar',
            'fecha-nacimiento': 'Fecha de Nacimiento',
            pais: 'País',
            departamento: 'Departamento',
            municipio: 'Municipio',
            direccion: 'Dirección',
            telefono: 'Teléfono',
            celular: 'Celular',
            email: 'Correo Electrónico',
            'ap-pub': 'Años Sector Público',
            'mp-pub': 'Meses Sector Público',
            'ap-priv': 'Años Sector Privado',
            'mp-priv': 'Meses Sector Privado',
            'ap-ind': 'Años Independiente',
            'mp-ind': 'Meses Independiente',
            'total-anios': 'Total Años Experiencia',
            'total-meses': 'Total Meses Experiencia',
            'chk-juramento': 'Juramento Aceptado'
        };

        const formatearEtiqueta = (clave, labelsDetalle = {}) => {
            if (labelsDetalle[clave]) return labelsDetalle[clave];
            if (etiquetasCampos[clave]) return etiquetasCampos[clave];
            return clave
                .replace(/[-_]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
                .replace(/\b\w/g, (char) => char.toUpperCase());
        };

        const formatearValor = (valor) => {
            if (valor === null || valor === undefined) return 'No registra';
            if (typeof valor === 'boolean') return valor ? 'Sí' : 'No';
            const texto = String(valor).trim();
            return texto ? texto : 'No registra';
        };

        /** Evita mostrar claves técnicas del localStorage y duplicados de radios en el panel admin. */
        const CLAVES_RADIO_LEGADO = new Set([
            'libreta', 'doc', 'nac', 'sexo', 'grado', 'habla1', 'lee1', 'escribe1', 'tipo1'
        ]);

        const debeOmitirEntradaDetalle = (clave, valor, labelsDetalle) => {
            const c = String(clave);
            const ln = c.toLowerCase();
            if (ln.startsWith('radio__') || ln.startsWith('auto__')) return true;
            if (ln.includes('.html')) return true;
            if (CLAVES_RADIO_LEGADO.has(ln)) return true;

            const etiquetaGuardada = (labelsDetalle[clave] || '').toLowerCase();
            const etiquetaMostrada = formatearEtiqueta(clave, labelsDetalle).toLowerCase();
            const textoEtiqueta = `${etiquetaGuardada} ${etiquetaMostrada}`;
            if (textoEtiqueta.includes('.html')) return true;

            const valNorm = String(valor == null ? '' : valor).trim().toLowerCase();
            if (textoEtiqueta.includes('escriba el nombre de la entidad')) {
                if (!valNorm || valNorm === 'no registrarse' || valNorm === 'no registra') return true;
            }

            if (
                (ln === 'total-anios' || ln === 'total-meses') &&
                (valor === 0 || valor === '0' || valNorm === '')
            ) {
                return true;
            }

            return false;
        };

        const renderDetalleCompleto = (detalle = {}) => {
            const contenedor = document.getElementById('detalle-datos-completos');
            if (!contenedor) return;

            const labelsDetalle = detalle.__labels || {};
            const entradas = Object.entries(detalle).filter(([clave, valor]) => {
                if (/^canvas-firma/.test(clave) || clave.startsWith('__')) return false;
                return !debeOmitirEntradaDetalle(clave, valor, labelsDetalle);
            });

            if (!entradas.length) {
                contenedor.innerHTML = '<p class="detalle-valor">Esta hoja de vida no tiene información adicional guardada.</p>';
                return;
            }

            contenedor.innerHTML = entradas.map(([clave, valor]) => `
                <div class="detalle-item">
                    <label class="campo-label">${formatearEtiqueta(clave, labelsDetalle)}</label>
                    <p class="detalle-valor">${formatearValor(valor)}</p>
                </div>
            `).join('');
        };

        const renderAdmin = () => {
            const hvs = JSON.parse(localStorage.getItem('hvs_list')) || [];
            const filtro = document.getElementById('select-filtro').value;
            
            cuerpoTabla.innerHTML = '';
            
            const filtradas = filtro === 'todas' ? hvs : hvs.filter(h => h.estado === filtro);
            
            filtradas.forEach(hv => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${hv.nombre}</td>
                    <td>${hv.documento}</td>
                    <td>${hv.fechaEnvio}</td>
                    <td><span class="badge-estado badge-${hv.estado.toLowerCase()}">${hv.estado}</span></td>
                    <td>
                        <button class="btn-sig btn-sm" onclick="verDetalle(${hv.id})" style="padding: 4px 10px; font-size: 10px;">Ver</button>
                    </td>
                `;
                cuerpoTabla.appendChild(tr);
            });
        };

        document.getElementById('select-filtro').addEventListener('change', renderAdmin);
        renderAdmin();

        // Función global para ver detalle
        window.verDetalle = (id) => {
            const hvs = JSON.parse(localStorage.getItem('hvs_list')) || [];
            const hv = hvs.find(h => h.id === id);
            if (!hv) return;

            document.getElementById('panel-detalle').style.display = 'block';
            document.getElementById('detalle-nombre').textContent = hv.nombre;
            document.getElementById('detalle-doc').textContent = hv.documento;
            document.getElementById('detalle-fecha').textContent = hv.fechaEnvio;
            document.getElementById('detalle-estado-actual').textContent = hv.estado;
            renderDetalleCompleto(hv.detalle);
            
            // Boton guardar cambio estado
            const btnGuardarEstado = document.getElementById('btn-guardar-estado');
            btnGuardarEstado.onclick = () => {
                const nuevoEstado = document.getElementById('nuevo-estado').value;
                if (nuevoEstado) {
                    hv.estado = nuevoEstado;
                    localStorage.setItem('hvs_list', JSON.stringify(hvs));
                    renderAdmin();
                    document.getElementById('panel-detalle').style.display = 'none';
                }
            };
        };

        const btnCerrar = document.getElementById('btn-cerrar-detalle');
        if (btnCerrar) {
            btnCerrar.addEventListener('click', () => {
                document.getElementById('panel-detalle').style.display = 'none';
            });
        }
    }

    // --- LÓGICA DE FIRMA DIGITAL ---
    const initFirma = (canvasId, clearBtnId) => {
        const canvas = document.getElementById(canvasId);
        const clearBtn = document.getElementById(clearBtnId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let drawing = false;

        const resizeCanvas = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            ctx.strokeStyle = '#0d1f3c';
            ctx.lineWidth = 2;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
        };

        window.addEventListener('resize', resizeCanvas);
        setTimeout(resizeCanvas, 100);

        const getPos = (e) => {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        };

        const startDrawing = (e) => {
            drawing = true;
            const pos = getPos(e);
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            if (e.cancelable) e.preventDefault();
        };

        const draw = (e) => {
            if (!drawing) return;
            const pos = getPos(e);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
            if (e.cancelable) e.preventDefault();
        };

        const stopDrawing = () => {
            drawing = false;
        };

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);

        canvas.addEventListener('touchstart', startDrawing);
        canvas.addEventListener('touchmove', draw);
        canvas.addEventListener('touchend', stopDrawing);

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            });
        }
    };

    initFirma('canvas-firma-usuario', 'btn-limpiar-firma-usuario');
    initFirma('canvas-firma-jefe', 'btn-limpiar-firma-jefe');

});
