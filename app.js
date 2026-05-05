/* -------------------- ☁️ CONEXIÓN A LA NUBE (FIREBASE) -------------------- */
const firebaseConfig = {
    apiKey: "AIzaSyCMwnnspPmQnRwOIL_mb12kLne7jcwIUUk",
    authDomain: "gac-cabal-capacitacion.firebaseapp.com",
    databaseURL: "https://gac-cabal-capacitacion-default-rtdb.firebaseio.com", 
    projectId: "gac-cabal-capacitacion",
    storageBucket: "gac-cabal-capacitacion.firebasestorage.app",
    messagingSenderId: "647249180892",
    appId: "1:647249180892:web:54a9f48cc397bf3dd85c19"
};

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const db = firebase.database();

/* -------------------- MAPA DE CODIGOS DEFAULT -------------------- */
const mapaCodigosDefault = {
    "CE00000039": "CREDIWARE", "CE00000089": "SEGURCOOP", "CE00000003": "CREDICOOP", "CR00000003": "CREDICOOP",
    "CE00000004": "TELESOFT", "CR00000004": "TELESOFT", "CE00000071": "DENUNCIA DE CELULAR - TARJETAS Y BLOQUEO DE MODO (COLA 57)",
    "CE00000099": "DENUNCIA DE CELULAR - TARJETAS Y BLOQUEO DE MODO (COLA 57)", "CE00000074": "ENTIDADES PROCESADAS Y NO PROCESADAS POR CABAL",
    "CR00000051": "ENTIDADES PROCESADAS Y NO PROCESADAS POR CABAL", "CE00000076": "ENTIDADES PROCESADAS Y NO PROCESADAS POR CABAL",
    "CR00000050": "ENTIDADES PROCESADAS Y NO PROCESADAS POR CABAL", "CE00000090": "ENTIDADES PROCESADAS Y NO PROCESADAS POR CABAL",
    "CR00000053": "ENTIDADES PROCESADAS Y NO PROCESADAS POR CABAL", "CE00000009": "ENTIDADES PROCESADAS Y NO PROCESADAS POR CABAL",
    "CR00000009": "ENTIDADES PROCESADAS Y NO PROCESADAS POR CABAL", "CE00000091": "TARJETA COTO INTELIGENTE",
    "CR00000049": "TARJETA COTO INTELIGENTE", "CE00000006": "TARJETA COTO INTELIGENTE", "CR00000006": "TARJETA COTO INTELIGENTE",
    "CE00000023": "MANUAL PARA LA ESTANDARIZACIÓN DE LA ATENCIÓN A USUARIOS", "CR00000014": "MANUAL PARA LA ESTANDARIZACIÓN DE LA ATENCIÓN A USUARIOS",
    "CE00000069": "MANUAL PARA LA ESTANDARIZACIÓN DE LA ATENCIÓN A USUARIOS", "CE00000070": "PRECARGADAS SOCIALES Y NO SOCIALES",
    "CR00000040": "PRECARGADAS SOCIALES Y NO SOCIALES", "CE00000067": "PRECARGADAS SOCIALES Y NO SOCIALES",
    "CR00000035": "PRECARGADAS SOCIALES Y NO SOCIALES", "CE00000008": "PRECARGADAS SOCIALES Y NO SOCIALES",
    "CE00000075": "PRECARGADAS SOCIALES Y NO SOCIALES", "CR00000047": "PRECARGADAS SOCIALES Y NO SOCIALES",
    "CR00000020": "VERIFICACIÓN EN LÍNEA (INICIALES)", "CE00000007": "COMERCIOS", "CR00000007": "COMERCIOS",
    "CR00000048": "COMERCIOS", "CE00000077": "COMERCIOS", "CE00000102": "MODIFICACIÓN DOMICILIO DE TARJETAS (COLA 56)",
    "CR00000028": "MODIFICACIÓN DOMICILIO DE TARJETAS (COLA 56)", "CE00000085": "MODIFICACIÓN DOMICILIO DE TARJETAS (COLA 56)",
    "CE00000087": "CHAT MDA", "CE00000068": "BPI", "CR00000032": "BPI", "CE00000092": "SIPAGO", "CR00000033": "SIPAGO",
    "CE00000063": "BIE", "CR00000021": "BIE", "CE00000072": "BIE", "CR00000052": "BIE", "CE00000052": "NUEVA BANCA INTERNET",
    "CR00000055": "NUEVA BANCA INTERNET", "CE00000073": "MI PAGO", "CR00000045": "MI PAGO", "CE00000080": "CHAT TARJETAS",
    "CR00000031": "CHAT TARJETAS", "CE00000055": "CHAT TARJETAS", "CE00000083": "AUTORIZACIONES", "CR00000043": "AUTORIZACIONES",
    "CE00000086": "NORMAS ISO - MONITOREO - CONCIENTIZACION", "CE00000046": "NORMAS ISO - MONITOREO - CONCIENTIZACION",
    "CE00000095": "NORMAS ISO - MONITOREO - CONCIENTIZACION", "CE00000098": "NORMAS ISO - MONITOREO - CONCIENTIZACION",
    "CE00000011": "CALIDAD DE ATENCION", "CR00000011": "CALIDAD DE ATENCION", "CE00000096": "6 SOMBREROS PARA PENSAR",
    "CE00000038": "CABAL BBVA", "CE00000084": "DISTRIBUCIÓN DE PIEZAS", "CR00000029": "DISTRIBUCIÓN DE PIEZAS",
    "CR00000042": "BCCL", "CE00000002": "SISTEMA DE TARJETAS DE CRÉDITO Y DÉBITO",
    "CR00000002": "SISTEMA DE TARJETAS DE CRÉDITO Y DÉBITO", "CE00000051": "COMEX", "CE00000057": "CHEQUES (ECHEQ-FISICO-MOVIL)",
    "CR00000034": "CHEQUES (ECHEQ-FISICO-MOVIL)", "CE00000031": "MÓDULO AUTORIZADOR- INGRESO ONLINE", "CE00000061": "DENUNCIAS",
    "CR00000025": "DENUNCIAS", "CE00000101": "SUITE CRM - USUARIOS", "CE00000103": "BOTMAKER"
};

let mapaLocal = JSON.parse(localStorage.getItem("mapaCodigos"));
let mapaCodigos = (mapaLocal && Object.keys(mapaLocal).length > 0) ? mapaLocal : mapaCodigosDefault;

/* -------------------- VARIABLES GLOBALES Y MEMORIA DE SESIÓN -------------------- */
let usuarioGuardado = localStorage.getItem("entrenadorActivo");
let modoEdicion = usuarioGuardado ? true : false;
let usuarioActual = usuarioGuardado || "Sistema"; 
let mostrarBajas = false; 
const CLAVE_SECRETA = "Capacitacion2026"; 

let cursos = [...new Set(Object.values(mapaCodigos))]; 
let operadores = [];
let sesiones = [];
let actividades = [];
let historialAuditoria = []; 

let tabla = document.querySelector("#tabla tbody");
let encabezado = document.getElementById("encabezado");
let chart;
let chartTopCursos, chartNotas; 

/* -------------------- 🔥 SINCRONIZACIÓN MAESTRA 🔥 -------------------- */
function guardarDatos() {
    if (operadores.length > 0) {
        db.ref('GAC_Sistema').set({ mapaCodigos, operadores, sesiones, actividades, historialAuditoria });
    }
}

function registrarAccion(detalle, usuarioEspecial = null) {
    if (!modoEdicion && !usuarioEspecial) return; 
    let now = new Date();
    let fechaFormat = now.getDate().toString().padStart(2, '0') + '/' + (now.getMonth()+1).toString().padStart(2, '0') + ' ' + now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0') + 'hs';
    let userToLog = usuarioEspecial ? `Invitado (${usuarioEspecial})` : usuarioActual;
    
    historialAuditoria.unshift({ fecha: fechaFormat, usuario: userToLog, detalle: detalle });
    if(historialAuditoria.length > 300) historialAuditoria.pop();
    guardarDatos();
}

db.ref('GAC_Sistema').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        if (data.mapaCodigos) mapaCodigos = data.mapaCodigos;
        cursos = [...new Set(Object.values(mapaCodigos))];
        
        if (data.operadores) { 
            operadores = data.operadores; 
            operadores.forEach(op => { 
                if (!op.estados) op.estados = {}; 
                if(op.activo === undefined) op.activo = true; 
            }); 
        } else { operadores = []; }

        sesiones = data.sesiones || [];
        actividades = data.actividades || [];
        historialAuditoria = data.historialAuditoria || [];
        
        aplicarInterfazLogueada(); 
        crearEncabezado(); 
        actualizarFiltros(); 
        crearTabla(); 
        renderizarSesiones(); 
        renderizarActividades(); 
        actualizarDashboard();
    } else {
        console.warn("⚠️ La base de datos en la nube parece estar vacía.");
    }
});

/* -------------------- 🗂️ NAVEGACIÓN Y FILTROS -------------------- */
function cambiarModulo(idModulo, elementoBoton) {
    document.querySelectorAll('.modulo-contenido').forEach(modulo => modulo.classList.remove('activo'));
    if (idModulo === 'vista-tablero') actualizarTableroJefatura();
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(idModulo).classList.add('activo');
    elementoBoton.classList.add('active');
}

function actualizarFiltros() {
    let selectFiltro = document.getElementById("filtroProducto");
    if(selectFiltro) {
        selectFiltro.innerHTML = '<option value="TODOS">Todos los productos (General)</option>';
        cursos.forEach(c => { selectFiltro.innerHTML += `<option value="${c}">${c}</option>`; });
    }
}

/* -------------------- 📈 DASHBOARD Y MÉTRICAS -------------------- */
function actualizarDashboard(){
    let filtro = document.getElementById("filtroProducto")?.value || "TODOS"; let opsActivos = operadores.filter(op => mostrarBajas ? op.activo === false : op.activo !== false); let domTotalOp = document.getElementById("totalOperadores"); if(domTotalOp) domTotalOp.innerText = opsActivos.length; let domTotalCu = document.getElementById("totalCursos"); if(domTotalCu) domTotalCu.innerText = cursos.length;
    let total = 0, completos = 0, enProceso = 0, pendientes = 0; if (filtro === "TODOS") { total = opsActivos.length * cursos.length; opsActivos.forEach(op => { cursos.forEach(c => { let est = op.estados[c]?.estado || "rojo"; if (est === "verde") completos++; else if (est === "amarillo") enProceso++; else pendientes++; }); }); } else { total = opsActivos.length; opsActivos.forEach(op => { let est = op.estados[filtro]?.estado || "rojo"; if (est === "verde") completos++; else if (est === "amarillo") enProceso++; else pendientes++; }); }
    let domCob = document.getElementById("cobertura"); if(domCob) domCob.innerText = (total > 0 ? Math.round((completos / total) * 100) : 0) + "%"; let ctx = document.getElementById("grafico"); if(ctx) { if(chart) chart.destroy(); chart = new Chart(ctx, { type: "doughnut", data: { labels: ["Capacitados (Verde)", "En proceso (Amarillo)", "Pendientes (Rojo)"], datasets: [{ data: [completos, enProceso, pendientes], backgroundColor: ["#2ecc71", "#f1c40f", "#e74c3c"] }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: filtro === "TODOS" ? "Métricas Generales" : `Métricas de: ${filtro}`, font: { size: 16 } } } } }); }
}

/* -------------------- 📈 TABLERO JEFATURA (CON GRUPOS DE TRATAMIENTO Y EXCEL) -------------------- */
function actualizarTableroJefatura() {
    let totalNotas = 0; let cantidadNotas = 0; let notasAprobadas = 0; let notasDesaprobadas = 0; let notasCriticas = 0; let opsActivos = operadores.filter(op => op.activo !== false);
    
    opsActivos.forEach(op => { cursos.forEach(c => { if(op.estados && op.estados[c] && op.estados[c].historial) { op.estados[c].historial.forEach(h => { if(h.porcentaje !== undefined && h.porcentaje !== "" && h.porcentaje !== "N/A") { let nota = parseInt(h.porcentaje); totalNotas += nota; cantidadNotas++; 
        if(nota >= 85) notasAprobadas++; else if(nota >= 70) notasDesaprobadas++; else notasCriticas++; 
    } }); } }); });
    
    let promedio = cantidadNotas > 0 ? Math.round(totalNotas / cantidadNotas) : 0; 
    let kpiProm = document.getElementById('kpi-promedio'); if (kpiProm) kpiProm.innerText = promedio + '%'; 
    let kpiCerradas = document.getElementById('kpi-sesiones-cerradas'); if (kpiCerradas) kpiCerradas.innerText = sesiones.filter(s => !s.activa).length; 
    let kpiOps = document.getElementById('kpi-total-ops'); if (kpiOps) kpiOps.innerText = opsActivos.length;
    
    let ctxNotas = document.getElementById("graficoDistribucionNotas"); 
    if(ctxNotas) { 
        if(chartNotas) chartNotas.destroy(); 
        chartNotas = new Chart(ctxNotas, { type: "doughnut", data: { labels: ["Aprobado (≥85%)", "Desaprobado (70-84%)", "Crítico (<70%)"], datasets: [{ data: [notasAprobadas, notasDesaprobadas, notasCriticas], backgroundColor: ["#27ae60", "#f39c12", "#c0392b"] }] }, options: { responsive: true, plugins: { title: { display: true, text: "Calidad de Evaluaciones", font: { size: 16 } } } } }); 
    }
    
    let conteoCursos = cursos.map(curso => { let verdes = opsActivos.filter(op => op.estados && op.estados[curso] && op.estados[curso].estado === "verde").length; return { nombre: curso, cantidad: verdes }; }); conteoCursos.sort((a, b) => b.cantidad - a.cantidad); let top5Cursos = conteoCursos.slice(0, 5).map(c => c.nombre);
    let mesesLabels = []; let mesesKeys = []; let hoy = new Date();
    for (let i = 5; i >= 0; i--) { let d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1); let mesStr = d.toISOString().substring(0, 7); mesesKeys.push(mesStr); let nombreMes = d.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }).replace('.', ''); mesesLabels.push(nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)); }
    let colores = ["#3498db", "#e74c3c", "#2ecc71", "#f39c12", "#8e44ad"];
    let datasetsCursos = top5Cursos.map((curso, index) => { return { label: curso.length > 15 ? curso.substring(0, 15) + "..." : curso, data: [0, 0, 0, 0, 0, 0], backgroundColor: colores[index], borderRadius: 4 }; });

    opsActivos.forEach(op => { top5Cursos.forEach((curso, indexCurso) => { if(op.estados && op.estados[curso] && op.estados[curso].historial) { op.estados[curso].historial.forEach(h => { if(h.fecha) { let mesEvento = h.fecha.substring(0, 7); let idxMes = mesesKeys.indexOf(mesEvento); if(idxMes !== -1) { datasetsCursos[indexCurso].data[idxMes]++; } } }); } }); });

    let ctxTop = document.getElementById("graficoTopCursos"); 
    if(ctxTop) { if(chartTopCursos) chartTopCursos.destroy(); chartTopCursos = new Chart(ctxTop, { type: "bar", data: { labels: mesesLabels, datasets: datasetsCursos }, options: { responsive: true, plugins: { title: { display: true, text: "Top 5 Productos (Últimos 6 meses)", font: { size: 16 } }, legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } } }); }

    let vistaTablero = document.getElementById('vista-tablero');
    if (vistaTablero) {
        let contenedorCob = document.getElementById('contenedor-cobertura-areas');
        if (!contenedorCob) {
            contenedorCob = document.createElement('div'); contenedorCob.id = 'contenedor-cobertura-areas'; contenedorCob.style.marginTop = '30px'; contenedorCob.style.padding = '0 20px 20px 20px'; vistaTablero.appendChild(contenedorCob);
        }
        let areas = [...new Set(opsActivos.map(op => op.area || 'Sin Asignar'))].filter(a => a !== 'Sin Asignar' && a !== '---' && a !== '');
        areas.sort();

        let htmlTabla = `
        <div style="background: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="color: #1f497d; margin: 0;"><i class="fa-solid fa-chart-pie"></i> Cobertura por Producto y Grupo de Tratamiento</h3>
                <button onclick="descargarReporteJefaturaExcel()" style="background-color: #27ae60; color: white; padding: 8px 15px; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: background 0.3s;"><i class="fa-solid fa-file-excel"></i> Descargar Reporte</button>
            </div>
            <div style="max-height: 400px; overflow-y: auto; border: 1px solid #ecf0f1; border-radius: 5px;">
                <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 13px; text-align: center;">
                    <thead style="position: sticky; top: 0; background: #2c3e50; color: white; z-index: 10;">
                        <tr>
                            <th style="padding: 12px; text-align: left; border-right: 1px solid #34495e;">Producto / Curso</th>
                            <th style="padding: 12px; border-right: 1px solid #34495e; background: #1a252f;">Global CABAL</th>`;
        
        areas.forEach(area => { htmlTabla += `<th style="padding: 12px;">Grupo: ${area}</th>`; });
        htmlTabla += `</tr></thead><tbody>`;

        cursos.forEach(curso => {
            let capacitadosGlobal = opsActivos.filter(op => op.estados[curso] && op.estados[curso].estado === 'verde').length;
            let percGlobal = opsActivos.length > 0 ? Math.round((capacitadosGlobal / opsActivos.length) * 100) : 0;
            let colorGlobal = percGlobal >= 85 ? '#27ae60' : (percGlobal >= 70 ? '#f39c12' : '#c0392b');

            htmlTabla += `<tr style="border-bottom: 1px solid #ecf0f1; transition: background 0.2s;" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='transparent'"><td style="padding: 10px; text-align: left; font-weight: bold; color: #34495e; border-right: 1px solid #ecf0f1;">${curso}</td><td style="padding: 10px; font-weight: bold; color: ${colorGlobal}; background: #fdfefe; border-right: 1px solid #ecf0f1;">${percGlobal}% <br><span style="font-size:10px; color:#7f8c8d;">(${capacitadosGlobal}/${opsActivos.length} ops)</span></td>`;

            areas.forEach(area => {
                let opsArea = opsActivos.filter(op => (op.area || 'Sin Asignar') === area);
                let totalArea = opsArea.length;
                let capacitadosArea = opsArea.filter(op => op.estados[curso] && op.estados[curso].estado === 'verde').length;
                let percArea = totalArea > 0 ? Math.round((capacitadosArea / totalArea) * 100) : 0;
                let colorArea = percArea >= 85 ? '#27ae60' : (percArea >= 70 ? '#f39c12' : '#c0392b');
                htmlTabla += `<td style="padding: 10px; color: ${colorArea}; font-weight: bold;">${percArea}% <br><span style="font-size:10px; color:#7f8c8d;">(${capacitadosArea}/${totalArea} ops)</span></td>`;
            });
            htmlTabla += `</tr>`;
        });
        htmlTabla += `</tbody></table></div></div>`;
        contenedorCob.innerHTML = htmlTabla;
    }
}

/* -------------------- 📊 DESCARGAR REPORTE DE JEFATURA (EXCEL) -------------------- */
function descargarReporteJefaturaExcel() {
    let fechaHoy = new Date().toLocaleDateString(); let opsActivos = operadores.filter(op => op.activo !== false);
    let areas = [...new Set(opsActivos.map(op => op.area || 'Sin Asignar'))].filter(a => a !== 'Sin Asignar' && a !== '---' && a !== ''); areas.sort();
    if (opsActivos.length === 0) { Swal.fire('Atención', 'No hay operadores activos para generar el reporte.', 'warning'); return; }

    let tablaHTML = `<table border="1" style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11px; text-align: center;"><thead><tr style="background-color: #2c3e50; color: white; font-weight: bold;"><th style="padding: 8px;">Producto / Curso</th><th style="padding: 8px; background-color: #1a252f;">Global CABAL (%)</th><th style="padding: 8px; background-color: #1a252f;">Global CABAL (Cantidades)</th>`;
    areas.forEach(area => { tablaHTML += `<th style="padding: 8px;">Grupo: ${area} (%)</th><th style="padding: 8px;">Grupo: ${area} (Cantidades)</th>`; });
    tablaHTML += `</tr></thead><tbody>`;

    cursos.forEach(curso => {
        let capacitadosGlobal = opsActivos.filter(op => op.estados[curso] && op.estados[curso].estado === 'verde').length;
        let percGlobal = opsActivos.length > 0 ? Math.round((capacitadosGlobal / opsActivos.length) * 100) : 0;
        tablaHTML += `<tr><td style="padding: 5px; text-align: left; font-weight: bold;">${curso}</td><td style="padding: 5px; font-weight: bold;">${percGlobal}%</td><td style="padding: 5px; color: #555;">${capacitadosGlobal} de ${opsActivos.length}</td>`;

        areas.forEach(area => {
            let opsArea = opsActivos.filter(op => (op.area || 'Sin Asignar') === area);
            let capacitadosArea = opsArea.filter(op => op.estados[curso] && op.estados[curso].estado === 'verde').length;
            let percArea = opsArea.length > 0 ? Math.round((capacitadosArea / opsArea.length) * 100) : 0;
            tablaHTML += `<td style="padding: 5px; font-weight: bold;">${percArea}%</td><td style="padding: 5px; color: #555;">${capacitadosArea} de ${opsArea.length}</td>`;
        });
        tablaHTML += `</tr>`;
    });
    tablaHTML += `</tbody></table>`;

    let htmlExcel = `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8" /></head><body><table><tr><td colspan="${3 + (areas.length * 2)}" style="text-align: center; font-size: 16px; font-weight: bold; background-color: #1f497d; color: white; padding: 10px;">REPORTE DE COBERTURA POR GRUPOS DE TRATAMIENTO</td></tr><tr><td colspan="2" style="font-weight: bold; background-color: #f2f2f2;">Fecha de Emisión:</td><td colspan="${1 + (areas.length * 2)}">${fechaHoy}</td></tr><tr><td colspan="${3 + (areas.length * 2)}" style="height: 15px;">&nbsp;</td></tr></table>${tablaHTML}</body></html>`;
    try { let blob = new Blob(['\ufeff' + htmlExcel], { type: 'application/vnd.ms-excel;charset=utf-8;' }); let link = document.createElement("a"); let url = URL.createObjectURL(blob); link.href = url; link.download = `Reporte_Cobertura_Jefatura_${new Date().toISOString().split('T')[0]}.xls`; link.style.display = "none"; document.body.appendChild(link); link.click(); document.body.removeChild(link); window.URL.revokeObjectURL(url); if (typeof registrarAccion === "function") registrarAccion("Descargó Reporte de Cobertura de Jefatura (Excel)"); Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Reporte descargado', showConfirmButton: false, timer: 2000 }); } catch (e) { Swal.fire('Error', 'Tu navegador bloqueó la descarga del Excel.', 'error'); }
}

/* -------------------- 🗄️ ARCHIVO DE BAJAS Y ESPÍA -------------------- */
function alternarBajas() {
    mostrarBajas = !mostrarBajas;
    let btn = document.getElementById("btnVerBajas");
    if (btn) {
        if (mostrarBajas) {
            btn.innerHTML = "🔙 Volver a Activos"; btn.style.backgroundColor = "#e74c3c"; document.getElementById("encabezado").parentElement.parentElement.style.opacity = "0.8";
        } else {
            btn.innerHTML = "👁️ Ver Bajas"; btn.style.backgroundColor = "#7f8c8d"; document.getElementById("encabezado").parentElement.parentElement.style.opacity = "1";
        }
    }
    crearEncabezado(); crearTabla(); actualizarDashboard();
}

async function darDeBaja(nombre) { const { isConfirmed } = await Swal.fire({ title: `¿Archivar a ${nombre}?`, text: "Pasará a la pestaña de Bajas.", icon: 'warning', showCancelButton: true, confirmButtonColor: '#e67e22', confirmButtonText: 'Sí, archivar' }); if (isConfirmed) { let op = operadores.find(o => o.nombre === nombre); if (op) { op.activo = false; registrarAccion(`Archivó/Dio de baja al operador: ${nombre}`); guardarDatos(); } } }
async function darDeAlta(nombre) { const { isConfirmed } = await Swal.fire({ title: `¿Reincorporar a ${nombre}?`, text: "Volverá a aparecer en la matriz principal.", icon: 'info', showCancelButton: true, confirmButtonColor: '#27ae60', confirmButtonText: 'Sí, reincorporar' }); if (isConfirmed) { let op = operadores.find(o => o.nombre === nombre); if (op) { op.activo = true; registrarAccion(`Reincorporó (Alta) al operador: ${nombre}`); guardarDatos(); } } }
async function eliminarDefinitivo(nombre) { const { isConfirmed } = await Swal.fire({ title: `¿Eliminar a ${nombre} PARA SIEMPRE?`, text: "Se borrará todo su historial.", icon: 'error', showCancelButton: true, confirmButtonColor: '#c0392b', confirmButtonText: 'Eliminar definitivamente' }); if (isConfirmed) { operadores = operadores.filter(op => op.nombre !== nombre); registrarAccion(`Eliminó de forma definitiva al operador: ${nombre}`); guardarDatos(); } }

function verHistorialAuditoria() {
    let html = '<div style="max-height: 400px; overflow-y: auto; text-align: left; font-size: 13px; background: #f8f9fa; padding: 10px; border-radius: 5px; border: 1px solid #ccc;">';
    if (historialAuditoria.length === 0) { html += '<p style="text-align:center; color:#7f8c8d; margin-top:20px;">🕵️ No hay movimientos registrados aún.</p>'; } else {
        historialAuditoria.forEach(log => { html += `<div style="border-bottom: 1px dashed #bdc3c7; padding: 10px 0;"><span style="color:#7f8c8d; font-size:11px; float:right;">⏰ ${log.fecha}</span><strong style="color:#2980b9; display:block; margin-bottom:3px;"><i class="fa-solid fa-user-shield"></i> ${log.usuario}</strong><span style="color:#2c3e50;">${log.detalle}</span></div>`; });
    } html += '</div>';
    Swal.fire({ title: '🕵️ Registro de Actividad', html: html, width: '600px', confirmButtonColor: '#34495e', confirmButtonText: 'Cerrar ventana' });
}

/* -------------------- ENCABEZADO Y TABLA (CON N/A Y COLORES) -------------------- */
function crearEncabezado(){
    let tituloAccion = mostrarBajas ? "Acciones" : "Archivar"; let colEliminar = modoEdicion ? `<th>${tituloAccion}</th>` : ``;
    encabezado.innerHTML = `<th>Operador</th><th>Área</th>${colEliminar}`; cursos.forEach(curso => { encabezado.innerHTML += `<th>${curso}</th>`; });
}

function crearTabla(){
    let fragmento = ""; let opsAMostrar = operadores.filter(op => mostrarBajas ? op.activo === false : op.activo !== false);

    opsAMostrar.forEach(op => {
        let claseArea = "area-vacia"; let textoArea = "---";
        if (op.area === "MDA") { claseArea = "area-mda"; textoArea = "MDA"; } else if (op.area === "CR") { claseArea = "area-cr"; textoArea = "CR"; }

        let celdaEliminar = "";
        if (modoEdicion) {
            if (mostrarBajas) { celdaEliminar = `<td style="text-align: center; min-width: 70px;"><button onclick="darDeAlta('${op.nombre}')" style="background:transparent; border:none; color:#27ae60; cursor:pointer; font-size:16px;" title="Reincorporar"><i class="fa-solid fa-rotate-left"></i></button><button onclick="eliminarDefinitivo('${op.nombre}')" style="background:transparent; border:none; color:#c0392b; cursor:pointer; font-size:16px; margin-left:10px;" title="Eliminar Permanente"><i class="fa-solid fa-trash"></i></button></td>`; } 
            else { celdaEliminar = `<td style="text-align: center;"><button onclick="darDeBaja('${op.nombre}')" style="background:transparent; border:none; color:#e67e22; cursor:pointer; font-size:16px;" title="Archivar Operador"><i class="fa-solid fa-box-archive"></i></button></td>`; }
        }

        let clickArea = modoEdicion ? `onclick="asignarArea('${op.nombre}')"` : ``;
        let fila = `<tr><td style="cursor: pointer; color: #2980b9; text-decoration: underline; font-weight: bold;" onclick="verEstadisticas('${op.nombre}')"><i class="fa-solid fa-user-chart"></i> ${op.nombre}</td><td style="text-align: center;"><span class="badge-area ${claseArea}" ${clickArea}>${textoArea}</span></td>${celdaEliminar}`; 

        cursos.forEach(curso => {
            let info = op.estados[curso] || { estado: "rojo", historial: [] }; if (!info.historial) info.historial = []; let lineasInfo = [];

            if (info.historial.length > 0) { 
                info.historial.forEach(evento => { 
                    let fechaVisual = "";
                    if(evento.fecha){ let partes = evento.fecha.split(' '); let soloFecha = partes[0]; let soloHora = partes[1] ? ` ${partes[1]} hs` : ""; fechaVisual = soloFecha.split('-').reverse().join('/') + soloHora; }

                    let txt = `<b>${evento.tipo}</b> ${evento.codigo || ''}`; 
                    if(fechaVisual) txt += ` <br><span style="font-size:0.85em; color:#555;">🗓️ ${fechaVisual}</span>`; 
                    
                    if (evento.porcentaje === "N/A" || evento.porcentaje === undefined || evento.porcentaje === "") { txt += `<br><span style="display: inline-block; margin-top: 5px; font-size: 1.2em; color: #7f8c8d; font-weight: bold;">(N/A)</span>`; } 
                    else {
                        let num = parseInt(evento.porcentaje); let colorBadge = "#16a085"; 
                        if (num >= 85) colorBadge = "#27ae60"; else if (num >= 70) colorBadge = "#f39c12"; else colorBadge = "#c0392b"; 
                        txt += `<br><span style="display: inline-block; margin-top: 5px; font-size: 1.3em; color: ${colorBadge}; font-weight: 900;">💯 ${evento.porcentaje}%</span>`; 
                    }
                    lineasInfo.push(txt); 
                }); 
            } else if (info.estado === "amarillo") { lineasInfo.push("<i>En capacitación</i>"); }
            
            let clickCelda = (modoEdicion && !mostrarBajas) ? `onclick="cargarCapacitacion('${op.nombre}', '${curso}')"` : `style="cursor: default;"`;
            fila += `<td ${clickCelda}><span class="estado ${info.estado}"></span><div class="miniInfo">${lineasInfo.join("<hr style='margin: 4px 0; border: 0; border-top: 1px dashed #ccc;'>")}</div></td>`;
        });
        fila += "</tr>"; fragmento += fila;
    });
    
    if (opsAMostrar.length === 0) { let colSpan = cursos.length + (modoEdicion ? 3 : 2); fragmento = `<tr><td colspan="${colSpan}" style="text-align:center; padding: 20px; color:#7f8c8d;">No hay operadores en esta lista.</td></tr>`; }
    tabla.innerHTML = fragmento;
}

async function asignarArea(nombre) { let op = operadores.find(o => o.nombre === nombre); if (!op) return; const { value: area } = await Swal.fire({ title: 'Asignar Área', input: 'select', inputOptions: { 'MDA': 'MDA', 'CR': 'CR', '': 'Quitar asignación' }, showCancelButton: true }); if (area !== undefined) { op.area = area; registrarAccion(`Asignó el área ${area || 'Vacia'} a ${nombre}`); guardarDatos(); } }

/* -------------------- 🎨 CARGA DE CAPACITACIÓN EN MATRIZ -------------------- */
async function cargarCapacitacion(nombre, cursoNombre){
    let op = operadores.find(o => o.nombre === nombre); if (!op) return; let info = op.estados[cursoNombre] || { estado: "rojo", historial: [] }; if (!info.historial) info.historial = [];
    let validosCE = Object.keys(mapaCodigos).filter(key => mapaCodigos[key] === cursoNombre && key.startsWith("CE")); let validosCR = Object.keys(mapaCodigos).filter(key => mapaCodigos[key] === cursoNombre && key.startsWith("CR"));

    const { value: accion } = await Swal.fire({ 
        title: cursoNombre, text: `Editando a: ${nombre}`, input: 'select', 
        inputOptions: { '1': '🟡 Marcar "En capacitación"', '2': '🟢 Cargar Entrenamiento (CE)', '3': '🟢 Cargar Re-entrenamiento (CR)', '6': '🟢 Cargar Entrenamiento Inicial (EI)', '4': '🔵 Cargar Verificación Anual (VA)', '7': '🔵 Cargar Verif. Requerimiento (VRS)', '8': '✏️ EDITAR Nota/Fecha existente', '9': '🗑️ BORRAR un registro específico', '5': '🔴 BORRAR historial completo' }, showCancelButton: true 
    });

    if (accion === '8') { editarHistorialCapacitacion(nombre, cursoNombre); return; }
    if (accion === '9') { eliminarRegistroCapacitacion(nombre, cursoNombre); return; }
    if (!accion) return; let fechaHoy = new Date().toISOString().split('T')[0]; let guardadoExitoso = false; let textoEspia = "";

    if (accion === '1') { info.estado = "amarillo"; guardadoExitoso = true; textoEspia = `Marcó "En Capacitación" a ${nombre} en ${cursoNombre}`; }
    else if (accion === '2' || accion === '3') {
        let tipo = accion === '2' ? 'CE' : 'CR'; let permitidos = accion === '2' ? validosCE : validosCR;
        const { value: inputCodigo } = await Swal.fire({ 
            title: `Código ${tipo}`, text: `Aceptados: ${permitidos.join(" o ") || "No tiene asignado"}`, input: 'text', showCancelButton: true, 
            inputValidator: (value) => { 
                if (!value) return '¡Debes escribir un código!'; 
                let limpio = value.trim().toUpperCase(); 
                if (!permitidos.includes(limpio)) return `Código erróneo. Usa: ${permitidos.join(" o ")}`; 
            } 
        }); 
        if (!inputCodigo) return; let codigoFinal = inputCodigo.trim().toUpperCase();
        
        const { value: fechaFinal } = await Swal.fire({ title: `Fecha del ${tipo}`, input: 'date', inputValue: fechaHoy, showCancelButton: true }); if (!fechaFinal) return; 
        
        const { value: porcentajeFinal } = await Swal.fire({ 
            title: 'Nota %', 
            html: `<input type="number" id="swal-nota-individual" class="swal2-input" placeholder="Nota %" value="100" min="0" max="100" style="width: 80%; margin: 0 auto;">
                <label style="display:flex; align-items:center; justify-content:center; gap:5px; margin-top:15px; cursor:pointer; font-weight:bold; color:#7f8c8d;">
                    <input type="checkbox" id="swal-na-individual" onchange="document.getElementById('swal-nota-individual').disabled = this.checked; if(this.checked) document.getElementById('swal-nota-individual').value = '';"> N/A (Sin evaluación)
                </label>`,
            showCancelButton: true,
            preConfirm: () => {
                let isNA = document.getElementById('swal-na-individual').checked; let notaVal = document.getElementById('swal-nota-individual').value;
                if (!isNA && notaVal === "") { Swal.showValidationMessage('Ingresá una nota o marcá N/A'); return false; }
                return isNA ? "N/A" : notaVal;
            }
        }); 
        if (porcentajeFinal === undefined) return;
        
        info.historial.push({ tipo: tipo, codigo: codigoFinal, fecha: fechaFinal, porcentaje: porcentajeFinal }); 
        info.estado = "verde"; guardadoExitoso = true; textoEspia = `Cargó ${tipo} (${porcentajeFinal !== "N/A" ? porcentajeFinal+"%" : "N/A"}) a ${nombre} en ${cursoNombre}`;
    }
    else if (accion === '4' || accion === '6' || accion === '7') {
        let tipoNombre = accion === '4' ? 'VA' : (accion === '6' ? 'EI' : 'VRS');
        const { value: fechaVerif } = await Swal.fire({ title: `Fecha`, input: 'date', inputValue: fechaHoy, showCancelButton: true }); if (!fechaVerif) return; 
        
        const { value: porcentajeVerif } = await Swal.fire({ 
            title: 'Nota %', 
            html: `<input type="number" id="swal-nota-individual" class="swal2-input" placeholder="Nota %" value="100" min="0" max="100" style="width: 80%; margin: 0 auto;">
                <label style="display:flex; align-items:center; justify-content:center; gap:5px; margin-top:15px; cursor:pointer; font-weight:bold; color:#7f8c8d;">
                    <input type="checkbox" id="swal-na-individual" onchange="document.getElementById('swal-nota-individual').disabled = this.checked; if(this.checked) document.getElementById('swal-nota-individual').value = '';"> N/A (Sin evaluación)
                </label>`,
            showCancelButton: true,
            preConfirm: () => {
                let isNA = document.getElementById('swal-na-individual').checked; let notaVal = document.getElementById('swal-nota-individual').value;
                if (!isNA && notaVal === "") { Swal.showValidationMessage('Ingresá una nota o marcá N/A'); return false; }
                return isNA ? "N/A" : notaVal;
            }
        }); 
        if (porcentajeVerif === undefined) return;

        info.historial.push({ tipo: tipoNombre, codigo: "", fecha: fechaVerif, porcentaje: porcentajeVerif }); 
        info.estado = "verde"; guardadoExitoso = true; textoEspia = `Cargó ${tipoNombre} (${porcentajeVerif !== "N/A" ? porcentajeVerif+"%" : "N/A"}) a ${nombre} en ${cursoNombre}`;
    }
    else if (accion === '5') {
        const { isConfirmed } = await Swal.fire({ title: '¿Seguro?', text: "Borrará todo el historial de este curso", icon: 'warning', showCancelButton: true });
        if (isConfirmed) { info = { estado: "rojo", historial: [] }; guardadoExitoso = true; textoEspia = `BORRÓ el historial de ${nombre} en ${cursoNombre}`; }
    }
    if (guardadoExitoso) { op.estados[cursoNombre] = info; registrarAccion(textoEspia); guardarDatos(); }
}

async function eliminarRegistroCapacitacion(nombre, cursoNombre) {
    let op = operadores.find(o => o.nombre === nombre); if (!op || !op.estados[cursoNombre]) return;
    let historial = op.estados[cursoNombre].historial; if (!historial || historial.length === 0) { Swal.fire('Aviso', 'No hay registros para borrar en este producto.', 'info'); return; }

    let opcionesHistorial = {};
    historial.forEach((evento, index) => {
        let fVisual = evento.fecha ? evento.fecha.split(' ')[0].split('-').reverse().join('/') : "---";
        let notaTxt = (evento.porcentaje !== undefined && evento.porcentaje !== "N/A" && evento.porcentaje !== "") ? evento.porcentaje + '%' : 'N/A';
        opcionesHistorial[index] = `${evento.tipo} | ${fVisual} | Nota: ${notaTxt}`;
    });

    const { value: indexSelec } = await Swal.fire({ title: 'Borrar un registro', text: `Operador: ${nombre} - Producto: ${cursoNombre}`, input: 'select', inputOptions: opcionesHistorial, showCancelButton: true, confirmButtonColor: '#c0392b', confirmButtonText: '🗑️ Eliminar este registro', cancelButtonText: 'Cancelar' });
    if (indexSelec !== undefined) {
        historial.splice(indexSelec, 1); 
        if (historial.length === 0) { op.estados[cursoNombre].estado = "rojo"; }
        registrarAccion(`Eliminó un registro individual de ${nombre} en ${cursoNombre}`); guardarDatos(); crearTabla(); Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Registro eliminado', showConfirmButton: false, timer: 2000 });
    }
}

async function agregarOperador(){ const { value: nombre } = await Swal.fire({ title: 'Nuevo Operador', input: 'text', showCancelButton: true }); if (nombre) { operadores.push({ nombre: nombre.trim().toUpperCase(), area: "", estados: {}, activo: true }); registrarAccion(`Agregó un nuevo operador: ${nombre.trim().toUpperCase()}`); guardarDatos(); } }

async function editarHistorialCapacitacion(nombre, cursoNombre) {
    let op = operadores.find(o => o.nombre === nombre); if (!op || !op.estados[cursoNombre]) return;
    let historial = op.estados[cursoNombre].historial; if (!historial || historial.length === 0) { Swal.fire('Aviso', 'No hay registros para editar en este producto.', 'info'); return; }

    let opcionesHistorial = {};
    historial.forEach((evento, index) => { let fVisual = evento.fecha ? evento.fecha.split(' ')[0].split('-').reverse().join('/') : "---"; let notaTxt = (evento.porcentaje !== undefined && evento.porcentaje !== "N/A" && evento.porcentaje !== "") ? evento.porcentaje + '%' : 'N/A'; opcionesHistorial[index] = `${evento.tipo} | ${fVisual} | Nota: ${notaTxt}`; });

    const { value: indexSelec } = await Swal.fire({ title: 'Seleccionar registro a editar', text: `Operador: ${nombre} - Producto: ${cursoNombre}`, input: 'select', inputOptions: opcionesHistorial, showCancelButton: true, confirmButtonText: 'Siguiente', cancelButtonText: 'Cancelar' });
    if (indexSelec !== undefined) {
        let registro = historial[indexSelec]; let esNA = (registro.porcentaje === undefined || registro.porcentaje === "N/A" || registro.porcentaje === "");

        const { value: formValues } = await Swal.fire({
            title: 'Editar Registro',
            html: `<div style="text-align: left; font-size: 14px;"><label><b>Fecha:</b></label><input id="edit-h-fecha" class="swal2-input" type="date" value="${registro.fecha ? registro.fecha.split(' ')[0] : ''}"><label><b>Nota %:</b></label><div style="display:flex; align-items:center; gap:10px; margin-top:5px;"><input id="edit-h-nota" class="swal2-input" type="number" value="${esNA ? '' : registro.porcentaje}" min="0" max="100" style="margin:0; width:100%;" ${esNA ? 'disabled' : ''}><label style="font-size:11px; font-weight:bold; color:#7f8c8d; cursor:pointer; display:flex; align-items:center; gap:3px;"><input type="checkbox" id="edit-h-na" onchange="document.getElementById('edit-h-nota').disabled = this.checked; if(this.checked) document.getElementById('edit-h-nota').value = '';" ${esNA ? 'checked' : ''}> N/A</label></div><label style="margin-top:15px; display:block;"><b>Observaciones:</b></label><textarea id="edit-h-obs" class="swal2-textarea" style="height: 100px; margin-top:5px;">${registro.observacion || ""}</textarea></div>`,
            focusConfirm: false, showCancelButton: true, confirmButtonText: 'Guardar Cambios',
            preConfirm: () => {
                let isNA = document.getElementById('edit-h-na').checked; let notaVal = document.getElementById('edit-h-nota').value;
                if (!isNA && notaVal === "") { Swal.showValidationMessage('Ingresá una nota o marcá N/A'); return false; }
                return { fecha: document.getElementById('edit-h-fecha').value, porcentaje: isNA ? "N/A" : notaVal, observacion: document.getElementById('edit-h-obs').value }
            }
        });
        if (formValues) {
            registro.fecha = formValues.fecha; registro.porcentaje = formValues.porcentaje; registro.observacion = formValues.observacion;
            let notaNotificacion = formValues.porcentaje !== "N/A" ? formValues.porcentaje + '%' : 'N/A';
            registrarAccion(`Editó nota de ${nombre} en ${cursoNombre}: ahora es ${notaNotificacion}`); guardarDatos(); crearTabla(); Swal.fire('¡Actualizado!', 'El registro ha sido corregido.', 'success');
        }
    }
}

/* -------------------- GESTIÓN DE PRODUCTOS Y VARIOS -------------------- */
let buscador = document.getElementById("buscador");
if(buscador) { buscador.addEventListener("input", function(){ let texto = this.value.toLowerCase(); document.querySelectorAll("#tabla tbody tr").forEach(fila => { fila.style.display = fila.innerText.toLowerCase().includes(texto) ? "" : "none"; }); }); }

async function agregarProducto() { const { value: formValues } = await Swal.fire({ title: 'Nuevo Producto', html: '<input id="swal-input1" class="swal2-input" placeholder="Nombre">' + '<input id="swal-input2" class="swal2-input" placeholder="Código">', focusConfirm: false, showCancelButton: true, preConfirm: () => { return { producto: document.getElementById('swal-input1').value.trim().toUpperCase(), codigo: document.getElementById('swal-input2').value.trim().toUpperCase() }; } }); if (formValues && formValues.producto) { mapaCodigos[formValues.codigo] = formValues.producto; registrarAccion(`Creó un nuevo producto: ${formValues.producto}`); guardarDatos(); } }

async function gestionarProductos() { const { value: accion } = await Swal.fire({ title: 'Gestión', input: 'select', inputOptions: { 'eliminar': 'Eliminar Código', 'renombrar': 'Renombrar Producto' }, showCancelButton: true }); if (accion === 'eliminar') { const { value: codigo } = await Swal.fire({ title: 'Código', input: 'select', inputOptions: mapaCodigos, showCancelButton: true }); if (codigo) { registrarAccion(`Eliminó el código ${codigo} (${mapaCodigos[codigo]})`); delete mapaCodigos[codigo]; guardarDatos(); } } else if (accion === 'renombrar') { let opciones = {}; cursos.forEach(p => opciones[p] = p); const { value: viejo } = await Swal.fire({ title: 'Renombrar', input: 'select', inputOptions: opciones, showCancelButton: true }); if (viejo) { const { value: nuevo } = await Swal.fire({ title: `Nuevo nombre para ${viejo}`, input: 'text', showCancelButton: true }); if (nuevo) { let n = nuevo.trim().toUpperCase(); for (let code in mapaCodigos) { if (mapaCodigos[code] === viejo) mapaCodigos[code] = n; } operadores.forEach(op => { if (op.estados[viejo]) { op.estados[n] = op.estados[viejo]; delete op.estados[viejo]; } }); registrarAccion(`Renombró el producto ${viejo} a ${n}`); guardarDatos(); } } } }

function verReporteCursos() { let reporte = []; let opsActivos = operadores.filter(op => op.activo !== false); cursos.forEach(curso => { let completados = 0; opsActivos.forEach(op => { if (op.estados[curso] && op.estados[curso].estado === "verde") completados++; }); reporte.push({ nombre: curso, cantidad: completados }); }); reporte.sort((a, b) => b.cantidad - a.cantidad); let htmlTabla = `<table style="width:100%; border-collapse:collapse; font-size:14px; text-align:left;"><tr style="background:#f2f2f2; border-bottom:2px solid #ccc;"><th style="padding:8px;">Producto</th><th style="padding:8px; text-align:center;">Capacitados (Activos)</th></tr>`; reporte.forEach(r => { htmlTabla += `<tr style="border-bottom:1px solid #eee;"><td style="padding:8px;">${r.nombre}</td><td style="padding:8px; text-align:center; font-weight:bold; color:${r.cantidad > 0 ? '#2ecc71' : '#e74c3c'}">${r.cantidad}</td></tr>`; }); htmlTabla += `</table>`; Swal.fire({ title: 'Reporte: Capacitados por Producto', html: `<div style="max-height: 400px; overflow-y: auto;">${htmlTabla}</div>`, width: '700px', confirmButtonColor: '#8e44ad', confirmButtonText: 'Cerrar reporte' }); }

function copiarRutaCarpeta(nombre) { const RUTA_GENERAL = "\\\\central\\GDS\\Proyectos Tecnologicos\\Call_Center\\Registros y Documentos\\08_Archivo de evaluaciones OP\\"; let textArea = document.createElement("textarea"); textArea.value = RUTA_GENERAL; textArea.style.position = "fixed"; textArea.style.opacity = "0"; document.body.appendChild(textArea); textArea.focus(); textArea.select(); try { document.execCommand('copy'); Swal.fire({ title: '¡Ruta General Copiada!', icon: 'success', timer: 2000, showConfirmButton: false }); } catch (err) {} document.body.removeChild(textArea); }

function accederManuales() { const RUTA_MANUALES = "\\\\central\\GDS\\Proyectos Tecnologicos\\Call_Center\\Registros y Documentos\\06_Manuales"; let textArea = document.createElement("textarea"); textArea.value = RUTA_MANUALES; textArea.style.position = "fixed"; textArea.style.opacity = "0"; document.body.appendChild(textArea); textArea.focus(); textArea.select(); try { document.execCommand('copy'); Swal.fire({ title: 'Ruta de Manuales copiada', text: 'Pegala en el Explorador de Archivos para acceder.', icon: 'success', timer: 2500, showConfirmButton: false, toast: true, position: 'top-end' }); } catch (err) { } document.body.removeChild(textArea); if (typeof registrarAccion === "function") registrarAccion("Accedió a la ruta de Biblioteca de Manuales"); }

/* -------------------- 📊 LIBRETA VIRTUAL Y ESTADÍSTICAS INDIVIDUALES -------------------- */
function verEstadisticas(nombre) {
    let op = operadores.find(o => o.nombre === nombre); if(!op) return; let completados = []; let enProceso = []; let faltantes = [];
    cursos.forEach(c => { let est = op.estados && op.estados[c]?.estado || "rojo"; if (est === "verde") completados.push(c); else if (est === "amarillo") enProceso.push(c); else faltantes.push(c); }); let porcentaje = cursos.length > 0 ? Math.round((completados.length / cursos.length) * 100) : 0; let areaBadge = op.area ? `| Área: <b>${op.area}</b>` : ""; let estadoBadge = op.activo === false ? `<br><span style="color:#e74c3c; font-size:14px;">[Operador Inactivo / Archivado]</span>` : '';
    
    let botonInforme = modoEdicion ? `<button onclick="emitirActaRefuerzo('${nombre}')" style="padding: 8px 15px; background-color: #1f497d; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 13px; font-weight: bold; width: 100%; transition: background 0.3s; margin-top: 10px;"><i class="fa-solid fa-file-excel"></i> Descargar Informe Oficial (Excel)</button>` : `<button onclick="emitirActaRefuerzo('${nombre}')" style="padding: 8px 15px; background-color: #8e44ad; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 13px; font-weight: bold; width: 100%; transition: background 0.3s; margin-top: 10px;"><i class="fa-solid fa-file-pdf"></i> Descargar Informe Específico (PDF)</button>`;

    let htmlContent = `<div style="text-align: left; font-size: 14px;"><h2 style="text-align:center; color: #2ecc71;">Completitud: ${porcentaje}% ${areaBadge} ${estadoBadge}</h2><div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 15px; text-align: center; border: 1px dashed #bdc3c7;"><button onclick="copiarRutaCarpeta('${nombre}')" style="padding: 8px 15px; background-color: #34495e; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 13px; font-weight: bold; width: 100%; transition: background 0.3s; margin-bottom: 10px;"><i class="fa-regular fa-copy"></i> Copiar Ruta de Exámenes en Red</button><button onclick="descargarBoletinPDF('${nombre}')" style="padding: 8px 15px; background-color: #c0392b; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 13px; font-weight: bold; width: 100%; transition: background 0.3s;"><i class="fa-solid fa-file-pdf"></i> Descargar Libreta PDF General</button>${botonInforme}</div><hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;"><h4 style="color:#2ecc71; margin-bottom: 5px;">✅ Completados (${completados.length}):</h4><p style="font-size:12px; margin-top: 0;">${completados.join(' | ') || 'Ninguno'}</p><h4 style="color:#f1c40f; margin-bottom: 5px;">⏳ En Proceso (${enProceso.length}):</h4><p style="font-size:12px; margin-top: 0;">${enProceso.join(' | ') || 'Ninguno'}</p><h4 style="color:#e74c3c; margin-bottom: 5px;">❌ Pendientes (${faltantes.length}):</h4><p style="font-size:12px; margin-top: 0;">${faltantes.join(' | ') || 'Ninguno'}</p></div>`; 
    Swal.fire({ title: `Estadísticas: ${nombre}`, html: htmlContent, icon: 'info', width: '700px', showConfirmButton: false, showCloseButton: true });
}

function descargarBoletinPDF(nombre) {
    let op = operadores.find(o => o.nombre === nombre); if(!op) return;
    let fechaHoy = new Date().toLocaleDateString(); let iframe = document.createElement('iframe'); iframe.style.position = 'absolute'; iframe.style.width = '0px'; iframe.style.height = '0px'; iframe.style.border = 'none'; document.body.appendChild(iframe);
    
    let completados = []; let enProceso = []; let faltantes = [];
    cursos.forEach(c => { let est = op.estados && op.estados[c]?.estado || "rojo"; if (est === "verde") completados.push(c); else if (est === "amarillo") enProceso.push(c); else faltantes.push(c); });
    let porcentaje = cursos.length > 0 ? Math.round((completados.length / cursos.length) * 100) : 0;

    let doc = iframe.contentWindow.document;
    doc.write(`<html><head><title>Libreta_${nombre.replace(/\s+/g, '_')}</title><style>@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } @page { size: portrait; margin: 15mm; } } body { font-family: Arial, sans-serif; padding: 20px; }</style></head><body><div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #2c3e50; padding-bottom: 10px;"><h2 style="color: #2c3e50; margin: 0;">LIBRETA VIRTUAL DE CAPACITACIÓN</h2><h3 style="color: #c0392b; margin: 5px 0;">Operador: ${nombre} ${op.area ? '('+op.area+')' : ''}</h3><p style="color: #7f8c8d; margin: 5px 0;">Fecha de Emisión: ${fechaHoy} | Nivel de Completitud: ${porcentaje}%</p></div><h4 style="color:#27ae60;">✅ Cursos Completados (${completados.length})</h4><p style="font-size:12px;">${completados.join(' | ') || 'Ninguno'}</p><hr><h4 style="color:#f39c12;">⏳ Cursos en Proceso (${enProceso.length})</h4><p style="font-size:12px;">${enProceso.join(' | ') || 'Ninguno'}</p><hr><h4 style="color:#c0392b;">❌ Cursos Pendientes (${faltantes.length})</h4><p style="font-size:12px;">${faltantes.join(' | ') || 'Ninguno'}</p></body></html>`); doc.close();
    setTimeout(() => { iframe.contentWindow.focus(); iframe.contentWindow.print(); setTimeout(() => { document.body.removeChild(iframe); }, 5000); }, 500);
}

/* -------------------- 🔒 MAGIA DE LA SESIÓN PERMANENTE -------------------- */
function aplicarInterfazLogueada() {
    if(modoEdicion) {
        let panelAdmin = document.getElementById("panelAdmin"); if (panelAdmin) panelAdmin.style.display = "block";
        document.querySelectorAll('.admin-only').forEach(btn => btn.style.display = 'inline-block');
        let btnLogin = document.getElementById("btnLogin"); if (btnLogin) { btnLogin.innerHTML = `🔓 Cerrar Sesión (${usuarioActual})`; btnLogin.style.backgroundColor = "#c0392b"; }
    }
}

async function solicitarAcceso() {
    if (modoEdicion) {
        modoEdicion = false; registrarAccion(`Cerró sesión`); usuarioActual = "Sistema"; localStorage.removeItem("entrenadorActivo"); 
        let panelAdmin = document.getElementById("panelAdmin"); if (panelAdmin) panelAdmin.style.display = "none";
        document.querySelectorAll('.admin-only').forEach(btn => btn.style.display = 'none');
        let btnMatriz = document.querySelector('.navegacion-modulos button'); if (btnMatriz) cambiarModulo('vista-matriz', btnMatriz);
        let btnLogin = document.getElementById("btnLogin"); if (btnLogin) { btnLogin.innerHTML = "🔒 Activar Edición"; btnLogin.style.backgroundColor = "#34495e"; }
        crearEncabezado(); crearTabla(); renderizarSesiones(); renderizarActividades(); return;
    }
    const { value: password } = await Swal.fire({ title: 'Clave de Entrenadores', input: 'password', showCancelButton: true, confirmButtonColor: '#2ecc71' });
    if (password === CLAVE_SECRETA) {
        const { value: nombreEntrenador } = await Swal.fire({ title: '¿Quién sos?', input: 'select', inputOptions: { 'Solange Mieres': 'Solange Mieres', 'Julia Bandin': 'Julia Bandin', 'Hernán Caraballo': 'Hernán Caraballo', 'Adriana Klehr': 'Adriana Klehr' }, showCancelButton: true, allowOutsideClick: false, confirmButtonColor: '#3498db' });
        if (nombreEntrenador) {
            usuarioActual = nombreEntrenador; modoEdicion = true; localStorage.setItem("entrenadorActivo", usuarioActual); 
            aplicarInterfazLogueada(); registrarAccion(`Inició sesión en el sistema.`); crearEncabezado(); crearTabla(); renderizarSesiones(); renderizarActividades();
            Swal.fire({ title: `¡Hola ${usuarioActual}!`, text: 'Módulos de Capacitadores desbloqueados.', icon: 'success', timer: 1500, showConfirmButton: false });
        }
    } else if (password) { Swal.fire('Error', 'Clave incorrecta', 'error'); }
}

function syncEstadoActividad(idSesion, nuevoEstado) {
    let actVinculada = actividades.find(a => a.idSesionVinculada === idSesion || a.id === 'ACT-' + idSesion);
    if (actVinculada) {
        if (nuevoEstado === 'Pendiente') actVinculada.estado = 'Sin comenzar';
        else if (nuevoEstado === 'En curso') actVinculada.estado = 'En curso';
        else if (nuevoEstado === 'Finalizado') actVinculada.estado = 'Finalizado';
    }
}

function actualizarEstadoOpSesion(idSesion, nombreOp, nuevoEstado) { 
    let sesion = sesiones.find(s => s.id.toString() === idSesion.toString()); 
    if(sesion) { let conv = sesion.convocados.find(c => c.nombre === nombreOp); if(conv) conv.estado = nuevoEstado; guardarDatos(); renderizarSesiones(); } 
}

async function cambiarEstadoRequerimiento(idSesion, nuevoEstado) { 
    let sesion = sesiones.find(s => s.id.toString() === idSesion.toString()); 
    if(sesion) { 
        let estadoAnterior = sesion.estadoReq || "Pendiente"; sesion.estadoReq = nuevoEstado; syncEstadoActividad(sesion.id.toString(), nuevoEstado);
        let cursosAImpactar = (sesion.cursos && sesion.cursos.length > 0) ? sesion.cursos : [sesion.curso];

        if (nuevoEstado === "En curso") {
            sesion.convocados.forEach(conv => { if (conv.estado !== 'capacitado') { let op = operadores.find(o => o.nombre === conv.nombre); if (op) { cursosAImpactar.forEach(curso => { if (!op.estados[curso] || op.estados[curso].estado !== "verde") { op.estados[curso] = { estado: "amarillo", historial: op.estados[curso]?.historial || [] }; } }); } } });
            Swal.fire({ toast: true, position: 'top-end', icon: 'info', title: 'Matriz actualizada: Operadores en capacitación (🟡)', showConfirmButton: false, timer: 3000 });
        } else if (nuevoEstado === "Pendiente") {
            sesion.convocados.forEach(conv => { let op = operadores.find(o => o.nombre === conv.nombre); if (op) { cursosAImpactar.forEach(curso => { if (op.estados[curso] && op.estados[curso].estado === "amarillo") { op.estados[curso].estado = "rojo"; } }); } });
        }
        if (nuevoEstado === "Finalizado") {
            let cambiados = 0;
            sesion.convocados.forEach(conv => {
                let est = conv.estado ? conv.estado.toLowerCase() : "";
                if (est !== "ausente" && est !== "licencia" && est !== "capacitado" && est !== "presente") { conv.estado = "presente"; cambiados++; }
                if (est === "ausente" || est === "licencia" || est === "pendiente") { let op = operadores.find(o => o.nombre === conv.nombre); if (op) { cursosAImpactar.forEach(curso => { if (op.estados[curso] && op.estados[curso].estado === "amarillo") { op.estados[curso].estado = "rojo"; } }); } }
            });
            if (cambiados > 0) Swal.fire({ toast: true, position: 'top-end', icon: 'info', title: `Se marcaron ${cambiados} presentes automáticamente.`, showConfirmButton: false, timer: 3000 }); else Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Sesión Finalizada', showConfirmButton: false, timer: 1000 });
        } else if (estadoAnterior === "Finalizado" && (nuevoEstado === "Pendiente" || nuevoEstado === "En curso")) {
            let revertidos = 0; sesion.convocados.forEach(conv => { let est = conv.estado ? conv.estado.toLowerCase() : ""; if (est === "presente") { conv.estado = "pendiente"; revertidos++; } }); Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: `Deshacer: Se revirtieron ${revertidos} operadores a Pendiente.`, showConfirmButton: false, timer: 3000 });
        }
        let labelCurso = (sesion.cursos && sesion.cursos.length > 0) ? sesion.cursos.join(' + ') : sesion.curso; registrarAccion(`Cambió estado del req. ${labelCurso} a: ${nuevoEstado}`); guardarDatos(); renderizarSesiones(); renderizarActividades(); crearTabla();
    } 
}

/* -------------------- 📅 RENDERIZAR SESIONES Y REQUERIMIENTOS -------------------- */
function renderizarSesiones() {
    let contenedorActivas = document.getElementById('contenedor-sesiones'); 
    let contenedorArchivadas = document.getElementById('contenedor-archivadas'); 
    if(!contenedorActivas) return; 
    contenedorActivas.innerHTML = ""; 
    if(contenedorArchivadas) contenedorArchivadas.innerHTML = "";
    
    let htmlActivas = "";
    let htmlArchivadas = "";
    let cantArchivadas = 0;

    sesiones.forEach(sesion => {
        let esArchivada = (sesion.activa === false); 
        let formatFecha = (f) => f ? f.split('-').reverse().join('/') : ''; 
        let estadoReq = sesion.estadoReq || "Pendiente"; 
        let colorFondoReq = esArchivada ? '#f4f6f6' : (estadoReq === 'Finalizado' ? '#e8f8f5' : 'white'); 
        let disableSelect = (!modoEdicion || esArchivada) ? 'disabled' : '';
        
        let htmlConvocados = sesion.convocados.map(conv => `<li><span style="${conv.estado === 'capacitado' ? 'text-decoration: line-through; color:#95a5a6;' : ''}">${conv.nombre}</span><select class="select-asistencia" onchange="actualizarEstadoOpSesion('${sesion.id}', '${conv.nombre}', this.value)" ${disableSelect}><option value="pendiente" ${conv.estado === 'pendiente' ? 'selected' : ''}>⏳ Pend</option><option value="presente" ${conv.estado === 'presente' ? 'selected' : ''}>✅ Pres</option><option value="ausente" ${conv.estado === 'ausente' ? 'selected' : ''}>❌ Aus</option><option value="licencia" ${conv.estado === 'licencia' ? 'selected' : ''}>🏖️ Lic</option><option value="capacitado" ${conv.estado === 'capacitado' ? 'selected' : ''}>🎓 Eval</option></select></li>`).join('');
        
        let btnEditar = (modoEdicion && !esArchivada) ? `<button onclick="editarSesion('${sesion.id}')" style="position:absolute; top:15px; right:45px; background:transparent; border:none; color:#f39c12; cursor:pointer;" title="Editar Requerimiento"><i class="fa-solid fa-pen"></i></button>` : ''; 
        let btnEliminar = modoEdicion ? `<button onclick="eliminarSesion('${sesion.id}')" style="position:absolute; top:15px; right:15px; background:transparent; border:none; color:#e74c3c; cursor:pointer;" title="Eliminar"><i class="fa-solid fa-trash"></i></button>` : ''; 
        
        let cantNotas = sesion.notas ? sesion.notas.length : 0; 
        let btnNotas = `<button onclick="abrirBitacora('${sesion.id}')" style="width:100%; margin-top:10px; background-color:#f39c12; color:white; border:none; padding:8px; border-radius:5px; font-weight:bold; cursor:${modoEdicion ? 'pointer' : 'not-allowed'}; opacity:${modoEdicion ? '1' : '0.6'}; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" ${!modoEdicion ? 'disabled' : ''}><i class="fa-solid fa-comments"></i> Bitácora de Entrenadores ${cantNotas > 0 ? '<span style="background:white; color:#f39c12; padding:2px 6px; border-radius:10px; font-size:11px; margin-left:5px;">'+cantNotas+'</span>' : ''}</button>`;
        
        let btnVincularCR = (modoEdicion && sesion.tipo === 'CE' && !esArchivada) ? `<button onclick="abrirModalNuevaSesion('${sesion.id}')" style="width:100%; margin-top:5px; background-color:#8e44ad; color:white; border:none; padding:8px; border-radius:5px; font-weight:bold; cursor:pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"><i class="fa-solid fa-link"></i> Programar Re-entrenamiento (CR)</button>` : '';
        let badgeVinculo = sesion.idVinculada ? `<span style="font-size: 10px; background: #8e44ad; color: white; padding: 3px 6px; border-radius: 10px; margin-left: 5px; vertical-align: top;"><i class="fa-solid fa-link"></i> CR Vinculado</span>` : '';

        let enlacesHTML = "";
        if (sesion.linkVerificacion || sesion.linkKahoot || sesion.linkEncuesta) {
            enlacesHTML += `<div style="display: flex; gap: 5px; justify-content: center; margin-top: 10px; padding: 5px; background: #f8f9fa; border-radius: 5px; border: 1px dashed #bdc3c7;">`;
            if (sesion.linkVerificacion) enlacesHTML += `<a href="${sesion.linkVerificacion}" target="_blank" style="flex:1; text-align:center; padding: 5px; background: #3498db; color: white; border-radius: 4px; text-decoration: none; font-size: 11px; font-weight: bold; transition: 0.3s;" title="Ir a Verificación"><i class="fa-solid fa-clipboard-check"></i> Verif.</a>`;
            if (sesion.linkKahoot) enlacesHTML += `<a href="${sesion.linkKahoot}" target="_blank" style="flex:1; text-align:center; padding: 5px; background: #8e44ad; color: white; border-radius: 4px; text-decoration: none; font-size: 11px; font-weight: bold; transition: 0.3s;" title="Jugar Kahoot"><i class="fa-solid fa-gamepad"></i> Kahoot</a>`;
            if (sesion.linkEncuesta) enlacesHTML += `<a href="${sesion.linkEncuesta}" target="_blank" style="flex:1; text-align:center; padding: 5px; background: #f1c40f; color: #2c3e50; border-radius: 4px; text-decoration: none; font-size: 11px; font-weight: bold; transition: 0.3s;" title="Ir a Encuesta"><i class="fa-solid fa-star"></i> Encuesta</a>`;
            enlacesHTML += `</div>`;
        }

        let footerHTML = !esArchivada 
            ? `<div class="card-sesion-footer" style="display:flex; gap:10px; padding:15px; background:white; border-top:1px solid #eee;"><button style="flex:2; background:#2980b9; color:white; border:none; padding:10px; border-radius:5px; cursor:pointer;" ${!modoEdicion ? 'disabled' : ''} onclick="volcarNotasParciales('${sesion.id}')">📝 Evaluar</button><button style="flex:1; background:#7f8c8d; color:white; border:none; padding:10px; border-radius:5px; cursor:pointer;" ${!modoEdicion ? 'disabled' : ''} onclick="archivarSesion('${sesion.id}')">📦 Archivar</button></div>` 
            : `<div class="card-sesion-footer" style="display:flex; gap:10px; padding:15px; background:#ecf0f1; border-top:1px solid #ddd; align-items:center;"><div style="flex:1; text-align:center; color:#7f8c8d; font-weight:bold; font-size:12px;"><i class="fa-solid fa-box-archive"></i> ARCHIVADO</div><button style="flex:2; background:#2980b9; color:white; border:none; padding:10px; border-radius:5px; cursor:pointer; font-weight:bold;" ${!modoEdicion ? 'disabled' : ''} onclick="desarchivarSesion('${sesion.id}')"><i class="fa-solid fa-rotate-left"></i> Desarchivar</button></div>`;
        
        let tituloTarjeta = (sesion.cursos && sesion.cursos.length > 0) ? sesion.cursos.join(' + ').toUpperCase() : (sesion.curso ? sesion.curso.toUpperCase() : 'SIN PRODUCTO');

        let tarjetaHTML = `
            <div class="card-sesion" id="sesion-${sesion.id}" style="background: ${colorFondoReq}; ${esArchivada ? 'filter: grayscale(0.5); opacity: 0.9;' : ''}">
                <div class="card-sesion-header">
                    <span class="badge-tipo">${sesion.tipo}</span> ${badgeVinculo} ${btnEditar}${btnEliminar}
                    <h3>${tituloTarjeta}</h3>
                    <p class="entrenador">${sesion.entrenador}</p>
                </div>
                <div class="card-sesion-body">
                    <div class="info-fechas">
                        <p><b>Inicio:</b> ${formatFecha(sesion.fechaInicio)} ${sesion.horaInicio ? `| ⏰ ${sesion.horaInicio}` : ''}</p>
                        <p><b>Fin:</b> ${formatFecha(sesion.fechaFin)} ${sesion.horaFin ? `| ⏰ ${sesion.horaFin}` : ''}</p>
                    </div>
                    <div style="margin-top:15px; padding:10px; background:#ecf0f1; border-radius:5px; display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:12px; font-weight:bold;">Estado:</span>
                        <select onchange="cambiarEstadoRequerimiento('${sesion.id}', this.value)" ${disableSelect} style="padding:4px; border-radius:4px;">
                            <option value="Pendiente" ${estadoReq === 'Pendiente' ? 'selected' : ''}>⏳ Pendiente</option>
                            <option value="En curso" ${estadoReq === 'En curso' ? 'selected' : ''}>🏃‍♂️ En curso</option>
                            <option value="Finalizado" ${estadoReq === 'Finalizado' ? 'selected' : ''}>✅ Finalizado</option>
                        </select>
                    </div>
                    ${btnNotas}
                    ${btnVincularCR}
                    ${enlacesHTML}
                    <hr class="divisor">
                    <h4 class="titulo-asistencia">Convocados</h4>
                    <ul class="lista-asistencia">${htmlConvocados}</ul>
                </div>
                ${footerHTML}
            </div>`;
            
        if (esArchivada) {
            htmlArchivadas += tarjetaHTML;
            cantArchivadas++;
        } else {
            htmlActivas += tarjetaHTML;
        }
    });

    contenedorActivas.innerHTML = htmlActivas;

    if (contenedorArchivadas) {
        if (cantArchivadas > 0) {
            contenedorArchivadas.innerHTML = `
            <div style="grid-column: 1 / -1; width: 100%;">
                <details style="background: #ecf0f1; border: 1px solid #bdc3c7; border-radius: 8px; padding: 15px; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <summary style="font-size: 15px; font-weight: bold; color: #34495e; outline: none; display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-folder-closed"></i> Ver Requerimientos Archivados (${cantArchivadas})
                    </summary>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin-top: 15px; cursor: default;">
                        ${htmlArchivadas}
                    </div>
                </details>
            </div>`;
        } else {
            contenedorArchivadas.innerHTML = "";
        }
    }
}


/* -------------------- 📔 BITÁCORA DE ENTRENADORES (NOMBRES Y EDICIÓN) -------------------- */
async function abrirBitacora(idSesion) {
    if (!modoEdicion) return; let sesion = sesiones.find(s => s.id.toString() === idSesion.toString()); if (!sesion) return; if (!sesion.notas) sesion.notas = [];
    
    let htmlNotas = sesion.notas.map((n, index) => `<div style="background: white; border-left: 4px solid #f39c12; padding: 10px; margin-bottom: 10px; text-align: left; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); position:relative;"><strong style="color: #2c3e50; font-size: 13px;">🧑‍🏫 ${n.autor}</strong> <div style="position:absolute; top:10px; right:10px; display:flex; align-items:center; gap:8px;"><span style="color: #7f8c8d; font-size: 11px;">${n.fecha}</span><button onclick="Swal.close(); setTimeout(()=> editarNotaBitacora('${idSesion}', ${index}), 300)" style="background:none; border:none; color:#3498db; cursor:pointer; padding:0; font-size:13px;" title="Editar"><i class="fa-solid fa-pen"></i></button><button onclick="Swal.close(); setTimeout(()=> eliminarNotaBitacora('${idSesion}', ${index}), 300)" style="background:none; border:none; color:#e74c3c; cursor:pointer; padding:0; font-size:13px;" title="Eliminar"><i class="fa-solid fa-trash"></i></button></div><p style="margin: 8px 0 0 0; color: #444; font-size: 13px; padding-right:45px;">${n.texto}</p></div>`).join('');
    if (sesion.notas.length === 0) { htmlNotas = '<p style="font-size: 13px; color: #7f8c8d; text-align: center; margin-top: 20px;">No hay notas previas.<br>¡Agregá la primera novedad para el equipo!</p>'; }

    let opcionesAutores = ['Solange Mieres', 'Julia Bandin', 'Hernán Caraballo', 'Adriana Klehr'].map(nombre => `<option value="${nombre}" ${usuarioActual === nombre ? 'selected' : ''}>${nombre}</option>`).join('');
    
    const { value: formValues } = await Swal.fire({ title: '📝 Bitácora de Entrenadores', html: `<div style="background: #ecf0f1; padding: 10px; border-radius: 5px; margin-bottom: 15px; height: 200px; overflow-y: auto; border: 1px solid #bdc3c7;">${htmlNotas}</div><div style="text-align: left; background: #f8f9fa; padding: 10px; border-radius: 5px; border: 1px dashed #ccc;"><label style="font-size: 12px; font-weight: bold; color: #34495e;">¿Quién deja la nota?</label><select id="swal-nota-autor" class="swal2-select" style="width: 100%; margin: 5px 0 15px 0; padding: 5px; font-size: 14px;">${opcionesAutores}</select><label style="font-size: 12px; font-weight: bold; color: #34495e;">Novedades o seguimiento:</label><textarea id="swal-nota-texto" class="swal2-textarea" style="width: 100%; margin: 5px 0 0 0; padding: 10px; font-size: 14px; height: 80px;" placeholder="Ej: Hoy dimos la primera parte..."></textarea></div>`, width: '550px', showCancelButton: true, confirmButtonColor: '#f39c12', cancelButtonColor: '#7f8c8d', confirmButtonText: '💾 Guardar Mensaje', cancelButtonText: 'Cerrar', preConfirm: () => { let autor = document.getElementById('swal-nota-autor').value; let texto = document.getElementById('swal-nota-texto').value.trim(); if (!texto) return false; return { autor, texto }; } });
    
    if (formValues && formValues.texto) { let now = new Date(); let fechaFormat = now.getDate().toString().padStart(2, '0') + '/' + (now.getMonth()+1).toString().padStart(2, '0') + ' ' + now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0') + 'hs'; sesion.notas.push({ autor: formValues.autor, texto: formValues.texto, fecha: fechaFormat }); registrarAccion(`Dejó un mensaje en una bitácora.`); guardarDatos(); renderizarSesiones(); setTimeout(() => abrirBitacora(idSesion), 300); }
}

async function editarNotaBitacora(idSesion, indexNota) {
    let sesion = sesiones.find(s => s.id.toString() === idSesion.toString()); if (!sesion || !sesion.notas || !sesion.notas[indexNota]) return; let nota = sesion.notas[indexNota];
    const { value: nuevoTexto } = await Swal.fire({ title: '✏️ Editar Mensaje', html: `<div style="text-align: left;"><label style="font-size: 12px; font-weight: bold; color: #34495e;">Modificá el texto:</label><textarea id="swal-edit-nota-texto" class="swal2-textarea" style="width: 100%; margin: 5px 0 0 0; padding: 10px; font-size: 14px; height: 120px;">${nota.texto}</textarea></div>`, showCancelButton: true, confirmButtonColor: '#3498db', cancelButtonColor: '#7f8c8d', confirmButtonText: '💾 Guardar Cambios', cancelButtonText: 'Cancelar', preConfirm: () => { let texto = document.getElementById('swal-edit-nota-texto').value.trim(); if (!texto) { Swal.showValidationMessage('El mensaje no puede estar vacío'); return false; } return texto; } });
    if (nuevoTexto) { nota.texto = nuevoTexto; nota.fecha = nota.fecha.includes("(Editado)") ? nota.fecha : nota.fecha + " (Editado)"; registrarAccion(`Editó un mensaje en una bitácora.`); guardarDatos(); } setTimeout(() => abrirBitacora(idSesion), 300);
}

async function eliminarNotaBitacora(idSesion, indexNota) {
    const { isConfirmed } = await Swal.fire({ title: '¿Borrar mensaje?', text: "Se eliminará permanentemente de la bitácora.", icon: 'warning', showCancelButton: true, confirmButtonColor: '#e74c3c', cancelButtonColor: '#7f8c8d', confirmButtonText: 'Sí, borrar', cancelButtonText: 'Cancelar' });
    if (isConfirmed) { let sesion = sesiones.find(s => s.id.toString() === idSesion.toString()); if (sesion && sesion.notas) { sesion.notas.splice(indexNota, 1); registrarAccion(`Eliminó un mensaje en una bitácora.`); guardarDatos(); renderizarSesiones(); } } setTimeout(() => abrirBitacora(idSesion), 300);
}

function desarchivarSesion(idSesion) { let sesion = sesiones.find(s => s.id.toString() === idSesion.toString()); if(sesion) { sesion.activa = true; registrarAccion(`Desarchivó una sesión`); guardarDatos(); renderizarSesiones(); } }

/* -------------------- 📝 EVALUAR Y VOLCAR NOTAS (CON LÓGICA DE FECHAS) -------------------- */
async function volcarNotasParciales(idSesion) {
    let sesion = sesiones.find(s => s.id.toString() === idSesion.toString()); if (!sesion) return; 
    let tarjeta = document.getElementById(`sesion-${idSesion}`); let selects = tarjeta.querySelectorAll('.select-asistencia'); let presentes = [];
    sesion.convocados.forEach((conv, index) => { conv.estado = selects[index].value; if (conv.estado === 'presente') presentes.push(conv.nombre); }); 
    if (presentes.length === 0) { Swal.fire('Aviso', 'Marcá al menos a un operador como Presente', 'warning'); return; }
    
    let fechaHoy = new Date().toISOString().split('T')[0]; let horaAhora = new Date().toTimeString().substring(0,5); 
    let fechaFinSesion = sesion.fechaFin || sesion.fechaInicio || fechaHoy;
    
    let htmlNotas = presentes.map(nombre => { 
        let idLimpio = nombre.replace(/\s+/g, ''); 
        return `<div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin-bottom: 10px; text-align: left; border: 1px solid #dee2e6;"><label style="font-weight:bold; font-size:14px; color:#2980b9;">${nombre}</label><div style="display: flex; gap: 10px; align-items: center; margin-top:5px;"><div style="flex: 1.5;" title="Fecha de Carga"><input type="date" id="fecha-${idLimpio}" class="swal2-input" style="width:100%; margin:0; height:32px;" value="${fechaHoy}"></div><div style="flex: 1;"><input type="time" id="hora-${idLimpio}" class="swal2-input" style="width:100%; margin:0; height:32px;" value="${horaAhora}"></div><div style="flex: 1.2; display: flex; align-items: center; gap: 8px;"><input type="number" id="nota-${idLimpio}" class="swal2-input" style="width:100%; margin:0; height:32px;" min="0" max="100" placeholder="Nota %"><label style="font-size: 11px; font-weight:bold; color:#7f8c8d; cursor:pointer; display:flex; align-items:center; gap:3px;" title="Sin evaluación usa la Fecha de Fin del curso"><input type="checkbox" id="na-${idLimpio}" onchange="let n = document.getElementById('nota-${idLimpio}'); let f = document.getElementById('fecha-${idLimpio}'); n.disabled = this.checked; if(this.checked){ n.value = ''; f.disabled = true; f.value = '${fechaFinSesion}'; } else { f.disabled = false; f.value = '${fechaHoy}'; }"> N/A</label></div></div><textarea id="obs-${idLimpio}" class="swal2-textarea" style="width:100%; margin: 5px 0 0 0; padding:8px; font-size: 13px; border: 1px dashed #bdc3c7; resize:vertical; box-sizing:border-box;" rows="3" placeholder="Observaciones / Temas a reforzar (Usá ENTER para bajar de línea)"></textarea></div>` 
    }).join('');
        
    const { value: datosGuardados } = await Swal.fire({ 
        title: 'Evaluar y Cargar a Matriz', html: `<div style="max-height:350px; overflow-y:auto; overflow-x:hidden; padding-right: 5px;">${htmlNotas}</div>`, width: '600px', showCancelButton: true, confirmButtonText: 'Guardar Notas', 
        preConfirm: () => { 
            let resultados = {}; 
            for (let nombre of presentes) { 
                let idLimpio = nombre.replace(/\s+/g, ''); let isNA = document.getElementById(`na-${idLimpio}`).checked; let fecha = document.getElementById(`fecha-${idLimpio}`).value; let hora = document.getElementById(`hora-${idLimpio}`).value; let notaVal = document.getElementById(`nota-${idLimpio}`).value; let obs = document.getElementById(`obs-${idLimpio}`).value; 
                if (!fecha) { Swal.showValidationMessage(`Falta fecha para ${nombre}`); return false; } 
                if (!isNA && notaVal === "") { Swal.showValidationMessage(`Ingresá una nota o marcá N/A para ${nombre}`); return false; }
                resultados[nombre] = { fecha, hora, nota: isNA ? "N/A" : notaVal, obs }; 
            } return resultados; 
        } 
    });
    
    if (datosGuardados) {
        let cursosAImpactar = (sesion.cursos && sesion.cursos.length > 0) ? sesion.cursos : [sesion.curso];
        presentes.forEach(nombre => {
            let datos = datosGuardados[nombre]; let op = operadores.find(o => o.nombre === nombre);
            if (op) { cursosAImpactar.forEach(cursoActual => { let info = op.estados[cursoActual] || { estado: "rojo", historial: [] }; let codigoReal = Object.keys(mapaCodigos).find(key => mapaCodigos[key] === cursoActual && key.startsWith(sesion.tipo)) || ""; let fh = datos.fecha; if (datos.hora) fh += ` ${datos.hora} hs`; info.historial.push({ tipo: sesion.tipo, codigo: codigoReal, fecha: fh, porcentaje: datos.nota, observacion: datos.obs, linkVerificacion: sesion.linkVerificacion || "" }); info.estado = "verde"; op.estados[cursoActual] = info; }); }
            let conv = sesion.convocados.find(c => c.nombre === nombre); if(conv) conv.estado = "capacitado";
        });
        if(sesion.estadoReq === "Pendiente") { sesion.estadoReq = "En curso"; syncEstadoActividad(sesion.id.toString(), "En curso"); }
        registrarAccion(`Evaluó y mandó notas a la matriz de: ${cursosAImpactar.join(' + ')}`); guardarDatos(); Swal.fire('¡Éxito!', 'Notas cargadas en la matriz para todos los productos.', 'success'); crearTabla(); renderizarActividades();
    }
}

/* -------------------- 📦 ARCHIVAR SESIÓN (CON LÓGICA DE FECHAS) -------------------- */
async function archivarSesion(idSesion) {
    let sesion = sesiones.find(s => s.id.toString() === idSesion.toString()); if(!sesion) return; 
    let presentesSinEvaluar = sesion.convocados.filter(c => c.estado === 'presente'); let cursosAImpactar = (sesion.cursos && sesion.cursos.length > 0) ? sesion.cursos : [sesion.curso];

    sesion.convocados.forEach(conv => {
        let est = conv.estado ? conv.estado.toLowerCase() : "";
        if (est === "ausente" || est === "licencia" || est === "pendiente") { let op = operadores.find(o => o.nombre === conv.nombre); if (op) { cursosAImpactar.forEach(cursoActual => { if (op.estados[cursoActual] && op.estados[cursoActual].estado === "amarillo") { op.estados[cursoActual].estado = "rojo"; } }); } }
    });

    if (presentesSinEvaluar.length > 0) {
        const { isConfirmed } = await Swal.fire({ title: '¡Falta Evaluación!', html: `Tenés a <b>${presentesSinEvaluar.length}</b> operador/es como "Presente" que no enviaste a la Matriz.<br><br>¿Querés mandarlos automáticamente (sin nota) y archivar la sesión?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#2980b9', confirmButtonText: 'Sí, enviar a Matriz y archivar', cancelButtonText: 'Cancelar' });
        if (isConfirmed) {
            let fechaParaGuardar = sesion.fechaFin || sesion.fechaInicio || new Date().toISOString().split('T')[0];
            presentesSinEvaluar.forEach(conv => { let op = operadores.find(o => o.nombre === conv.nombre); if (op) { cursosAImpactar.forEach(cursoActual => { let info = op.estados[cursoActual] || { estado: "rojo", historial: [] }; let codigoReal = Object.keys(mapaCodigos).find(key => mapaCodigos[key] === cursoActual && key.startsWith(sesion.tipo)) || ""; info.historial.push({ tipo: sesion.tipo, codigo: codigoReal, fecha: fechaParaGuardar, porcentaje: "N/A" }); info.estado = "verde"; op.estados[cursoActual] = info; }); } conv.estado = "capacitado"; });
            sesion.activa = false; sesion.estadoReq = "Finalizado"; syncEstadoActividad(sesion.id.toString(), "Finalizado"); registrarAccion(`Autoevaluó y archivó sesión de: ${cursosAImpactar.join(' + ')}`); guardarDatos(); crearTabla(); renderizarSesiones(); renderizarActividades(); Swal.fire('¡Solucionado!', 'Sesión archivada y Matriz actualizada.', 'success');
        }
    } else { 
        const { isConfirmed } = await Swal.fire({ title: '¿Archivar Sesión?', text: "La tarjeta pasará al historial de archivadas en la parte inferior.", icon: 'warning', showCancelButton: true, confirmButtonColor: '#7f8c8d', cancelButtonColor: '#d33', confirmButtonText: 'Sí, archivar', cancelButtonText: 'Cancelar' }); 
        if (isConfirmed) { sesion.activa = false; registrarAccion(`Archivó una sesión`); guardarDatos(); crearTabla(); renderizarSesiones(); Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Archivado correctamente', showConfirmButton: false, timer: 1500 }); } 
    }
}

/* -------------------- 📅 CREAR NUEVA SESIÓN Y AUTO-SINCRO -------------------- */
async function abrirModalNuevaActividad() {
    if (!modoEdicion) return;
    const { value: formValues } = await Swal.fire({ 
        title: 'Planificar Actividad', 
        html: `
            <div style="text-align: left; font-size: 14px; display: grid; gap: 10px;">
                <div><label><b>Título:</b></label><input id="swal-act-titulo" class="swal2-input" style="width:90%; margin:0; height:35px;"></div>
                <div><label><b>Tipo:</b></label><select id="swal-act-tipo" class="swal2-select" style="width:100%; margin:0; padding:5px;">
                    <option value="Administrativa">Administrativa</option>
                    <option value="Reunión de Equipo">Reunión de Equipo</option>
                    <option value="Armado de Curso">Armado de Curso / Material</option>
                    <option value="Capacitación">Capacitación a Operadores</option>
                    <option value="Otro">Otro</option>
                </select></div>
                <div><label><b>Responsable:</b></label><select id="swal-act-entrenador" class="swal2-select" style="width:100%; margin:0; padding:5px;">
                    <option value="Todos">Equipo Completo</option>
                    <option value="Solange Mieres">Solange Mieres</option>
                    <option value="Julia Bandin">Julia Bandin</option>
                    <option value="Hernán Caraballo">Hernán Caraballo</option>
                    <option value="Julia Bandin / Solange Mieres">Julia Bandin / Solange Mieres</option>
                    <option value="Solange Mieres / Hernán Caraballo">Solange Mieres / Hernán Caraballo</option>
                    <option value="Hernán Caraballo / Julia Bandin">Hernán Caraballo/ Julia Bandin</option>
                    <option value="Julia Bandin / Hernán Caraballo / Solange Mieres">Julia Bandin / Hernán Caraballo / Solange Mieres</option>
                </select></div>
                <div><label><b>Estado:</b></label><select id="swal-act-estado" class="swal2-select" style="width:100%; margin:0; padding:5px;">
                    <option value="Sin comenzar" selected>⏳ Sin comenzar</option>
                    <option value="En curso">🏃‍♂️ En curso</option>
                    <option value="Finalizado">✅ Finalizado</option>
                    <option value="Cancelado">❌ Cancelado</option>
                    <option value="Otro">🔘 Otro</option>
                </select></div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                    <div><label><b>Fecha Desde:</b></label><input type="date" id="swal-act-fecha" class="swal2-input" style="width:100%; margin:0; height:35px; padding: 0 5px;"></div>
                    <div><label><b>Fecha Hasta:</b></label><input type="date" id="swal-act-fecha-hasta" class="swal2-input" style="width:100%; margin:0; height:35px; padding: 0 5px;"></div>
                    <div><label><b>Hora:</b></label><input type="time" id="swal-act-hora" class="swal2-input" style="width:100%; margin:0; height:35px; padding: 0 5px;"></div>
                </div>
            </div>`, 
        width: '550px', showCancelButton: true, confirmButtonColor: '#27ae60', confirmButtonText: '💾 Guardar', 
        preConfirm: () => { 
            let titulo = document.getElementById('swal-act-titulo').value; let fecha = document.getElementById('swal-act-fecha').value; let fechaHasta = document.getElementById('swal-act-fecha-hasta').value; 
            if (!titulo || !fecha) { Swal.showValidationMessage('Título y Fecha Desde son obligatorios'); return false; } 
            if (!fechaHasta) fechaHasta = fecha; 
            if (fechaHasta < fecha) { Swal.showValidationMessage('La Fecha Hasta no puede ser anterior a la Fecha Desde'); return false; }
            return { id: Date.now().toString(), titulo: titulo, tipo: document.getElementById('swal-act-tipo').value, entrenador: document.getElementById('swal-act-entrenador').value, estado: document.getElementById('swal-act-estado').value, fecha: fecha, fechaHasta: fechaHasta, hora: document.getElementById('swal-act-hora').value }; 
        } 
    });
    if (formValues) { actividades.push(formValues); actividades.sort((a, b) => new Date(a.fecha) - new Date(b.fecha)); registrarAccion(`Agendó actividad para entrenadores: ${formValues.titulo}`); guardarDatos(); renderizarActividades(); }
}

/* -------------------- 📆 AGENDA DE ENTRENADORES (AGRUPADA POR AÑO) -------------------- */
function renderizarActividades() {
    let contenedor = document.getElementById('contenedor-actividades'); 
    if(!contenedor) return; 
    contenedor.innerHTML = "";

    if (actividades.length === 0) { 
        contenedor.innerHTML = "<p style='text-align:center; color:#7f8c8d; grid-column: 1 / -1;'>No hay actividades planificadas.</p>"; 
    } else { 
        // 1. Agrupamos las actividades por año
        let gruposPorAnio = {};
        actividades.forEach(act => {
            let anio = act.fecha.split('-')[0] || "S/F";
            if (!gruposPorAnio[anio]) gruposPorAnio[anio] = [];
            gruposPorAnio[anio].push(act);
        });

        // 2. Ordenamos los años de más reciente a más viejo
        let aniosOrdenados = Object.keys(gruposPorAnio).sort((a, b) => b - a);
        let anioActual = new Date().getFullYear().toString();

        let htmlFinal = "";

        aniosOrdenados.forEach(anio => {
            let htmlActivasAnio = "";
            let htmlCerradasAnio = "";
            let cantActivas = 0;
            let cantCerradas = 0;

            gruposPorAnio[anio].forEach(act => {
                let formatFecha = act.fecha.split('-').reverse().join('/');
                let formatFechaHasta = act.fechaHasta ? act.fechaHasta.split('-').reverse().join('/') : formatFecha;
                let textoFechas = formatFecha === formatFechaHasta ? formatFecha : `${formatFecha} al ${formatFechaHasta}`;

                let btnEditar = modoEdicion ? `<button onclick="editarActividad('${act.id}')" style="position:absolute; top:12px; right:40px; background:transparent; border:none; color:#f39c12; cursor:pointer; font-size:16px;"><i class="fa-solid fa-pen"></i></button>` : ''; 
                let btnEliminar = modoEdicion ? `<button onclick="eliminarActividad('${act.id}')" style="position:absolute; top:12px; right:12px; background:transparent; border:none; color:#e74c3c; cursor:pointer; font-size:16px;"><i class="fa-solid fa-trash"></i></button>` : ''; 
                
                let colorBorde = act.tipo === 'Administrativa' ? '#3498db' : (act.tipo === 'Reunión de Equipo' ? '#9b59b6' : (act.tipo === 'Capacitación' ? '#27ae60' : '#e67e22')); 
                let estadoActual = act.estado || "Sin comenzar"; 
                let opacidad = (estadoActual === 'Cancelado' || estadoActual === 'Finalizado') ? '0.7' : '1'; 
                let tachado = estadoActual === 'Cancelado' ? 'text-decoration: line-through; color: #95a5a6;' : 'color: #2c3e50;'; 
                
                let tarjeta = `<div style="background: white; border-radius: 8px; padding: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-left: 5px solid ${colorBorde}; position:relative; opacity: ${opacidad};">${btnEditar}${btnEliminar}<h3 style="margin: 0 0 10px 0; font-size: 15px; padding-right: 50px; ${tachado}">${act.titulo}</h3><p style="margin: 5px 0; font-size: 12px; color: #7f8c8d;"><i class="fa-solid fa-tag"></i> ${act.tipo}</p><p style="margin: 5px 0; font-size: 12px; color: #7f8c8d;"><i class="fa-solid fa-user-tie"></i> ${act.entrenador}</p><p style="margin: 5px 0; font-size: 13px; color: #2c3e50;"><i class="fa-regular fa-calendar"></i> <b>${textoFechas}</b> ${act.hora ? `| ⏰ ${act.hora} hs` : ''}</p><div style="margin-top:10px; background:#f8f9fa; padding:5px; border-radius:4px; border:1px solid #eee; display:flex; justify-content:space-between; align-items:center;"><span style="font-size:11px; font-weight:bold; color:#7f8c8d;">Estado:</span><select onchange="cambiarEstadoActividad('${act.id}', this.value)" ${!modoEdicion ? 'disabled' : ''} style="font-size:11px; border:none; background:transparent; font-weight:bold; cursor:pointer;"><option value="Sin comenzar" ${estadoActual === 'Sin comenzar' ? 'selected' : ''}>⏳ Pendiente</option><option value="En curso" ${estadoActual === 'En curso' ? 'selected' : ''}>🏃‍♂️ En curso</option><option value="Finalizado" ${estadoActual === 'Finalizado' ? 'selected' : ''}>✅ Finalizado</option><option value="Cancelado" ${estadoActual === 'Cancelado' ? 'selected' : ''}>❌ Cancelado</option></select></div></div>`;

                if (estadoActual === 'Finalizado' || estadoActual === 'Cancelado') { htmlCerradasAnio += tarjeta; cantCerradas++; }
                else { htmlActivasAnio += tarjeta; cantActivas++; }
            });

            // Creamos la carpeta del año
            let estaAbierto = (anio === anioActual) ? "open" : "";
            htmlFinal += `
            <div style="grid-column: 1 / -1; margin-bottom: 20px;">
                <details ${estaAbierto} style="background: #fdfefe; border: 1px solid #dcdde1; border-radius: 10px; padding: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    <summary style="font-size: 18px; font-weight: 900; color: #1f497d; cursor: pointer; outline: none; display: flex; align-items: center; gap: 10px; padding: 10px;">
                        <i class="fa-solid fa-calendar-check"></i> PLANIFICACIÓN ${anio} 
                        <span style="font-size: 12px; font-weight: normal; background: #eee; color: #666; padding: 2px 8px; border-radius: 10px;">${gruposPorAnio[anio].length} actividades</span>
                    </summary>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; padding: 15px; cursor: default;">
                        ${htmlActivasAnio}
                        ${cantCerradas > 0 ? `
                            <div style="grid-column: 1 / -1; margin-top: 10px;">
                                <details style="background: #f4f6f6; border-radius: 8px; padding: 10px;">
                                    <summary style="font-size: 13px; font-weight: bold; color: #7f8c8d; cursor: pointer;">
                                        <i class="fa-solid fa-clock-rotate-left"></i> Ver historial de cerradas (${cantCerradas})
                                    </summary>
                                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; margin-top: 15px;">
                                        ${htmlCerradasAnio}
                                    </div>
                                </details>
                            </div>` : ''}
                    </div>
                </details>
            </div>`;
        });

        contenedor.innerHTML = htmlFinal;
    } 
    renderizarCalendarioAnual();
}

function cambiarEstadoActividad(id, nuevoEstado) { let act = actividades.find(a => a.id.toString() === id.toString()); if (act) { act.estado = nuevoEstado; registrarAccion(`Cambió el estado de actividad entrenadores a: ${nuevoEstado}`); guardarDatos(); renderizarActividades(); } }

async function editarActividad(id) { 
    let act = actividades.find(a => a.id.toString() === id.toString()); if (!act) return; 
    const { value: formValues } = await Swal.fire({ 
        title: 'Editar Actividad', 
        html: `
            <div style="text-align: left; font-size: 14px; display: grid; gap: 10px;">
                <div><label><b>Título:</b></label><input id="swal-edit-titulo" class="swal2-input" style="width:90%; margin:0; height:35px;" value="${act.titulo}"></div>
                <div><label><b>Tipo:</b></label><select id="swal-edit-tipo" class="swal2-select" style="width:100%; margin:0; padding:5px;">
                    <option value="Administrativa" ${act.tipo === 'Administrativa' ? 'selected' : ''}>Administrativa</option>
                    <option value="Reunión de Equipo" ${act.tipo === 'Reunión de Equipo' ? 'selected' : ''}>Reunión de Equipo</option>
                    <option value="Armado de Curso" ${act.tipo === 'Armado de Curso' ? 'selected' : ''}>Armado de Curso / Material</option>
                    <option value="Capacitación" ${act.tipo === 'Capacitación' ? 'selected' : ''}>Capacitación a Operadores</option>
                    <option value="Otro" ${act.tipo === 'Otro' ? 'selected' : ''}>Otro</option>
                </select></div>
                <div><label><b>Responsable:</b></label><select id="swal-edit-entrenador" class="swal2-select" style="width:100%; margin:0; padding:5px;">
                    <option value="Todos" ${act.entrenador === 'Todos' ? 'selected' : ''}>Equipo Completo</option>
                    <option value="Solange Mieres" ${act.entrenador === 'Solange Mieres' ? 'selected' : ''}>Solange Mieres</option>
                    <option value="Julia Bandin" ${act.entrenador === 'Julia Bandin' ? 'selected' : ''}>Julia Bandin</option>
                    <option value="Hernán Caraballo" ${act.entrenador === 'Hernán Caraballo' ? 'selected' : ''}>Hernán Caraballo</option>
                    <option value="Julia Bandin / Solange Mieres" ${act.entrenador === 'Julia Bandin / Solange Mieres' ? 'selected' : ''}>Julia Bandin/ Solange Mieres</option>
                    <option value="Solange Mieres/ Hernán Caraballo" ${act.entrenador === 'Solange Mieres / Hernán Caraballo' ? 'selected' : ''}>Solange Mieres / Hernán Caraballo</option>
                    <option value="Hernán Caraballo / Julia Bandin" ${act.entrenador === 'Hernán Caraballo / Julia Bandin' ? 'selected' : ''}>Hernán Caraballo/ Julia Bandin</option>
                    <option value="Julia Bandin / Hernán Caraballo / Solange Mieres" ${act.entrenador === 'Julia Bandin / Hernán Caraballo / Solange Mieres' ? 'selected' : ''}>Julia Bandin / Hernán Caraballo / Solange Mieres</option>
                </select></div>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                    <div><label><b>Fecha Desde:</b></label><input type="date" id="swal-edit-fecha" class="swal2-input" style="width:100%; margin:0; height:35px; padding: 0 5px;" value="${act.fecha}"></div>
                    <div><label><b>Fecha Hasta:</b></label><input type="date" id="swal-edit-fecha-hasta" class="swal2-input" style="width:100%; margin:0; height:35px; padding: 0 5px;" value="${act.fechaHasta || act.fecha}"></div>
                    <div><label><b>Hora:</b></label><input type="time" id="swal-edit-hora" class="swal2-input" style="width:100%; margin:0; height:35px; padding: 0 5px;" value="${act.hora || ''}"></div>
                </div>
            </div>`, 
        width: '550px', showCancelButton: true, confirmButtonColor: '#f39c12', confirmButtonText: '💾 Guardar Cambios',
        preConfirm: () => { 
            let titulo = document.getElementById('swal-edit-titulo').value; let fecha = document.getElementById('swal-edit-fecha').value; let fechaHasta = document.getElementById('swal-edit-fecha-hasta').value; 
            if (!titulo || !fecha) { Swal.showValidationMessage('Título y Fecha Desde son obligatorios'); return false; } 
            if (!fechaHasta) fechaHasta = fecha; 
            if (fechaHasta < fecha) { Swal.showValidationMessage('La Fecha Hasta no puede ser anterior a la Fecha Desde'); return false; }
            return { titulo: titulo, tipo: document.getElementById('swal-edit-tipo').value, entrenador: document.getElementById('swal-edit-entrenador').value, fecha: fecha, fechaHasta: fechaHasta, hora: document.getElementById('swal-edit-hora').value }; 
        } 
    }); 
    if (formValues) { act.titulo = formValues.titulo; act.tipo = formValues.tipo; act.entrenador = formValues.entrenador; act.fecha = formValues.fecha; act.fechaHasta = formValues.fechaHasta; act.hora = formValues.hora; actividades.sort((a, b) => new Date(a.fecha) - new Date(b.fecha)); registrarAccion(`Editó la actividad: ${act.titulo}`); guardarDatos(); renderizarActividades(); } 
}

async function eliminarActividad(id) { const { isConfirmed } = await Swal.fire({ title: '¿Eliminar Actividad?', icon: 'warning', showCancelButton: true }); if (isConfirmed) { actividades = actividades.filter(a => a.id.toString() !== id.toString()); registrarAccion(`Eliminó una actividad de entrenadores`); guardarDatos(); renderizarActividades(); } }

function renderizarCalendarioAnual() { 
    let contenedor = document.getElementById('contenedor-calendario'); if (!contenedor) return; 
    let anio = new Date().getFullYear(); let nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]; 
    let html = `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin-bottom: 30px;">`; 
    
    let diasOcupados = {}; 
    actividades.forEach(act => { 
        let fechaInicio = new Date(act.fecha + "T12:00:00"); let fechaFin = act.fechaHasta ? new Date(act.fechaHasta + "T12:00:00") : fechaInicio;
        for(let d = new Date(fechaInicio); d <= fechaFin; d.setDate(d.getDate() + 1)) { let mesStr = (d.getMonth() + 1).toString().padStart(2, '0'); let diaStr = d.getDate().toString().padStart(2, '0'); diasOcupados[`${d.getFullYear()}-${mesStr}-${diaStr}`] = true; }
    }); 
    
    for (let mes = 0; mes < 12; mes++) { 
        html += `<div style="background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); text-align: center; border-top: 3px solid #34495e;"><h4 style="margin: 5px 0 10px 0; color: #2980b9;">${nombresMeses[mes]}</h4><div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; font-size: 11px; font-weight: bold; color: #7f8c8d; margin-bottom: 5px;"><div>D</div><div>L</div><div>M</div><div>M</div><div>J</div><div>V</div><div>S</div></div><div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; font-size: 13px;">`; 
        let primerDia = new Date(anio, mes, 1).getDay(); let diasEnMes = new Date(anio, mes + 1, 0).getDate(); 
        for (let i = 0; i < primerDia; i++) { html += `<div></div>`; } 
        for (let dia = 1; dia <= diasEnMes; dia++) { 
            let mesStr = (mes + 1).toString().padStart(2, '0'); let diaStr = dia.toString().padStart(2, '0'); let fechaActual = `${anio}-${mesStr}-${diaStr}`; let tieneActividad = diasOcupados[fechaActual]; 
            let estiloDia = tieneActividad ? `background-color: #e74c3c; color: white; border-radius: 50%; font-weight: bold; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.2);` : `color: #2c3e50; padding: 2px;`; 
            let accionClic = tieneActividad ? `onclick="verDetalleDia('${fechaActual}')"` : ``; html += `<div style="${estiloDia} padding: 4px 0;" ${accionClic}>${dia}</div>`; 
        } 
        html += `</div></div>`; 
    } 
    html += `</div>`; contenedor.innerHTML = html; 
}

function verDetalleDia(fecha) { 
    let actsDelDia = actividades.filter(a => { let fInicio = a.fecha; let fFin = a.fechaHasta || a.fecha; return fecha >= fInicio && fecha <= fFin; }); 
    if(actsDelDia.length === 0) return; let formatFechaClick = fecha.split('-').reverse().join('/'); 
    
    let listaHTML = actsDelDia.map(a => { 
        let est = a.estado || "Sin comenzar"; let iconEst = est === 'Finalizado' ? '✅' : (est === 'Cancelado' ? '❌' : (est === 'En curso' ? '🏃‍♂️' : '⏳')); 
        let fIni = a.fecha.split('-').reverse().join('/'); let fFin = a.fechaHasta ? a.fechaHasta.split('-').reverse().join('/') : fIni; let textoFechas = fIni === fFin ? '' : `<br>🗓️ ${fIni} al ${fFin}`;
        return `<div style="background: #f8f9fa; border-left: 4px solid #3498db; padding: 10px; margin-bottom: 10px; text-align: left; border-radius: 4px;"><p style="margin: 0; font-weight: bold; color: #2c3e50; ${est === 'Cancelado' ? 'text-decoration:line-through;' : ''}">${a.titulo}</p><p style="margin: 5px 0 0 0; font-size: 12px; color: #7f8c8d;"><i class="fa-solid fa-tag"></i> ${a.tipo} | <i class="fa-solid fa-user"></i> ${a.entrenador} ${a.hora ? `| ⏰ ${a.hora} hs` : ''} ${textoFechas}</p><p style="margin: 5px 0 0 0; font-size: 12px; font-weight:bold; color: #e67e22;">${iconEst} ${est}</p></div>`; 
    }).join(''); 
    
    Swal.fire({ title: `Agenda del ${formatFechaClick}`, html: listaHTML, icon: 'calendar', confirmButtonColor: '#27ae60', confirmButtonText: 'Cerrar' }); 
}

async function abrirModalNuevaSesion() {
    let checkboxesProductos = cursos.map(c => `<label style="display: flex; align-items: center; padding: 8px 10px; margin-bottom: 5px; background-color: #f8f9fa; border: 1px solid #dcdde1; border-radius: 6px; cursor: pointer; transition: background 0.2s;"><input type="checkbox" class="chk-producto-multi" value="${c}" style="margin: 0 10px 0 0; transform: scale(1.2); cursor: pointer;"><span style="font-size: 11px; font-weight: bold; color: #2c3e50; line-height: 1.4; text-align: left;">${c}</span></label>`).join('');
    let opsHtml = operadores.filter(o => o.activo !== false).map(o => `<label style="display:block; text-align:left; margin:5px 0;"><input type="checkbox" class="chk-convocado" value="${o.nombre}"> ${o.nombre}</label>`).join('');

    const { value: formValues } = await Swal.fire({
        title: 'Nueva Sesión',
        html: `<div style="display:flex; gap:15px; margin-bottom: 15px;"><div style="flex:1; display:flex; flex-direction:column; text-align:left;"><label style="font-size:12px; font-weight:bold; margin-bottom: 3px;">Tipo:</label><select id="swal-tipo" class="swal2-select" style="margin:0; width:100%; box-sizing:border-box; padding:0 10px; height: 3em;"><option value="CE" selected>CE</option><option value="CR">CR</option><option value="EI">EI</option><option value="VA">VA</option><option value="VRS">VRS</option></select></div><div style="flex:2; display:flex; flex-direction:column; text-align:left;"><label style="font-size:12px; font-weight:bold; margin-bottom: 3px;">Entrenador/a:</label><select id="swal-entrenador" class="swal2-select" style="margin:0; width:100%; box-sizing:border-box; padding:0 10px; height: 3em;"><option value="Solange Mieres">Solange Mieres</option><option value="Hernán Caraballo">Hernán Caraballo</option><option value="Julia Bandin">Julia Bandin</option><option value="Julia Bandin / Hernán Caraballo">Julia Bandin / Hernán Caraballo</option><option value="Julia Bandin / Solange Mieres">Julia Bandin / Solange Mieres</option><option value="Hernán Caraballo / Solange Mieres">Hernán Caraballo / Solange Mieres</option><option value="Julia Bandin / Hernán Caraballo / Solange Mieres">Julia Bandin / Hernán Caraballo / Solange Mieres</option></select></div></div><label style="font-size:12px; font-weight:bold; display:block; text-align:left; margin-bottom:3px;">Producto/s (Podés tildar varios):</label><div style="max-height: 160px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; border-radius: 5px; background: #fff; margin-bottom: 15px; display: block;">${checkboxesProductos}</div><div style="display:flex; gap:10px; margin-bottom: 10px;"><div style="flex:1; display:flex; flex-direction:column; text-align:left;"><label style="font-size:12px; font-weight:bold; margin-bottom: 3px;">Inicio:</label><input type="date" id="swal-fecha-inicio" class="swal2-input" style="margin:0; width:100%; box-sizing:border-box;"></div><div style="flex:1; display:flex; flex-direction:column; text-align:left;"><label style="font-size:12px; font-weight:bold; margin-bottom: 3px;">Fin:</label><input type="date" id="swal-fecha-fin" class="swal2-input" style="margin:0; width:100%; box-sizing:border-box;"></div></div><div style="display:flex; gap:10px;"><div style="flex:1; display:flex; flex-direction:column; text-align:left;"><label style="font-size:12px; font-weight:bold; margin-bottom: 3px;">Hora Inicio:</label><input type="time" id="swal-hora-inicio" class="swal2-input" style="margin:0; width:100%; box-sizing:border-box;"></div><div style="flex:1; display:flex; flex-direction:column; text-align:left;"><label style="font-size:12px; font-weight:bold; margin-bottom: 3px;">Hora Fin:</label><input type="time" id="swal-hora-fin" class="swal2-input" style="margin:0; width:100%; box-sizing:border-box;"></div></div><hr style="margin: 15px 0;"><label style="font-size:12px; font-weight:bold; display:block; text-align:left;"><i class="fa-solid fa-link"></i> Enlaces Útiles (Opcionales):</label><input id="swal-link-verif" class="swal2-input" style="margin-top:5px; height: 35px; font-size:13px; width:100%; box-sizing:border-box;" placeholder="🔗 Link de Verificación"><input id="swal-link-kahoot" class="swal2-input" style="margin-top:5px; height: 35px; font-size:13px; width:100%; box-sizing:border-box;" placeholder="🎮 Link de Kahoot"><input id="swal-link-encuesta" class="swal2-input" style="margin-top:5px; height: 35px; font-size:13px; width:100%; box-sizing:border-box;" placeholder="⭐ Link de Encuesta Satisfacción"><hr style="margin: 15px 0;"><div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;"><label style="font-size:12px; font-weight:bold;">Convocados:</label><div><button type="button" onclick="document.querySelectorAll('.chk-convocado').forEach(c => { if(c.parentElement.style.display !== 'none') c.checked = true; })" style="font-size:10px; padding:2px 5px; background:#2ecc71; color:white; border:none; border-radius:3px; cursor:pointer;">✔ Marcar Visibles</button><button type="button" onclick="document.querySelectorAll('.chk-convocado').forEach(c => c.checked = false)" style="font-size:10px; padding:2px 5px; background:#e74c3c; color:white; border:none; border-radius:3px; cursor:pointer;">✖ Desmarcar Todos</button></div></div><input type="text" id="swal-buscar-op" placeholder="🔍 Escribí para buscar..." style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; margin-bottom:5px; box-sizing:border-box;" onkeyup="let val=this.value.toLowerCase(); document.querySelectorAll('.chk-convocado').forEach(c => { c.parentElement.style.display = c.value.toLowerCase().includes(val) ? 'block' : 'none'; })"><div id="lista-convocados-swal" style="max-height: 150px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; border-radius: 5px; background: #fff;">${opsHtml}</div>`,
        width: '650px', showCancelButton: true, confirmButtonText: 'Guardar Requerimiento', cancelButtonText: 'Cancel', confirmButtonColor: '#3498db',
        preConfirm: () => {
            let tipo = document.getElementById('swal-tipo').value; let entrenador = document.getElementById('swal-entrenador').value; let cursosSeleccionados = Array.from(document.querySelectorAll('.chk-producto-multi:checked')).map(cb => cb.value); let fechaInicio = document.getElementById('swal-fecha-inicio').value; let fechaFin = document.getElementById('swal-fecha-fin').value; let convocadosSeleccionados = Array.from(document.querySelectorAll('.chk-convocado:checked')).map(cb => ({ nombre: cb.value, estado: "pendiente" }));
            if (!tipo || !entrenador || cursosSeleccionados.length === 0 || !fechaInicio || convocadosSeleccionados.length === 0) { Swal.showValidationMessage('Faltan campos obligatorios: Entrenador, Producto, Fecha de Inicio y Convocados.'); return false; }
            return { id: Date.now().toString(), tipo, entrenador, cursos: cursosSeleccionados, fechaInicio, fechaFin, horaInicio: document.getElementById('swal-hora-inicio').value, horaFin: document.getElementById('swal-hora-fin').value, linkVerificacion: document.getElementById('swal-link-verif').value, linkKahoot: document.getElementById('swal-link-kahoot').value, linkEncuesta: document.getElementById('swal-link-encuesta').value, convocados: convocadosSeleccionados, activa: true, estadoReq: "Pendiente" };
        }
    });

    if (formValues) {
        sesiones.push(formValues);
        let nuevaActividad = { id: 'ACT-' + formValues.id, idSesionVinculada: formValues.id, titulo: `🎓 ${formValues.tipo} - ${formValues.cursos.join(' + ')}`, tipo: 'Capacitación', entrenador: formValues.entrenador, estado: 'Sin comenzar', fecha: formValues.fechaInicio, fechaHasta: formValues.fechaFin || formValues.fechaInicio, hora: formValues.horaInicio || '' };
        actividades.push(nuevaActividad); registrarAccion(`Agendó sesión de: ${formValues.cursos.join(' + ')}`); guardarDatos(); renderizarSesiones(); renderizarActividades(); Swal.fire('Sesión Creada', 'El requerimiento y la actividad fueron agendados con éxito.', 'success');
    }
}

async function editarSesion(id) {
    let sesion = sesiones.find(s => s.id.toString() === id.toString()); if (!sesion) return;
    let cursosActuales = sesion.cursos ? sesion.cursos : (sesion.curso ? [sesion.curso] : []);
    let checkboxesProductos = cursos.map(c => `<label style="display: flex; align-items: center; padding: 8px 10px; margin-bottom: 5px; background-color: #f8f9fa; border: 1px solid #dcdde1; border-radius: 6px; cursor: pointer; transition: background 0.2s;"><input type="checkbox" class="chk-producto-multi-edit" value="${c}" style="margin: 0 10px 0 0; transform: scale(1.2); cursor: pointer;" ${cursosActuales.includes(c) ? 'checked' : ''}><span style="font-size: 11px; font-weight: bold; color: #2c3e50; line-height: 1.4; text-align: left;">${c}</span></label>`).join('');
    let opsHtml = operadores.filter(o => o.activo !== false).map(o => { let conv = sesion.convocados.find(c => c.nombre === o.nombre); return `<label style="display:block; text-align:left; margin:5px 0;"><input type="checkbox" class="chk-convocado-edit" value="${o.nombre}" ${conv ? "checked" : ""}> ${o.nombre}</label>`; }).join('');

    const { value: formValues } = await Swal.fire({
        title: 'Editar Requerimiento',
        html: `<div style="display:flex; gap:15px; margin-bottom: 15px;"><div style="flex:1; display:flex; flex-direction:column; text-align:left;"><label style="font-size:12px; font-weight:bold; margin-bottom: 3px;">Tipo:</label><select id="swal-tipo-edit" class="swal2-select" style="margin:0; width:100%; box-sizing:border-box; padding:0 10px; height: 3em;"><option value="CE" ${sesion.tipo === 'CE' ? 'selected' : ''}>CE</option><option value="CR" ${sesion.tipo === 'CR' ? 'selected' : ''}>CR</option><option value="EI" ${sesion.tipo === 'EI' ? 'selected' : ''}>EI</option><option value="VA" ${sesion.tipo === 'VA' ? 'selected' : ''}>VA</option><option value="VRS" ${sesion.tipo === 'VRS' ? 'selected' : ''}>VRS</option></select></div><div style="flex:2; display:flex; flex-direction:column; text-align:left;"><label style="font-size:12px; font-weight:bold; margin-bottom: 3px;">Entrenador/a:</label><select id="swal-entrenador-edit" class="swal2-select" style="margin:0; width:100%; box-sizing:border-box; padding:0 10px; height: 3em;"><option value="Solange Mieres" ${sesion.entrenador === 'Solange Mieres' ? 'selected' : ''}>Solange Mieres</option><option value="Hernán Caraballo" ${sesion.entrenador === 'Hernán Caraballo' ? 'selected' : ''}>Hernán Caraballo</option><option value="Julia Bandin" ${sesion.entrenador === 'Julia Bandin' ? 'selected' : ''}>Julia Bandin</option><option value="Julia Bandin / Hernán Caraballo" ${sesion.entrenador === 'Julia Bandin / Hernán Caraballo' ? 'selected' : ''}>Julia Bandin / Hernán Caraballo</option><option value="Julia Bandin / Solange Mieres" ${sesion.entrenador === 'Julia Bandin / Solange Mieres' ? 'selected' : ''}>Julia Bandin / Solange Mieres</option><option value="Hernán Caraballo / Solange Mieres" ${sesion.entrenador === 'Hernán Caraballo / Solange Mieres' ? 'selected' : ''}>Hernán Caraballo / Solange Mieres</option><option value="Julia Bandin / Hernán Caraballo / Solange Mieres" ${sesion.entrenador === 'Julia Bandin / Hernán Caraballo / Solange Mieres' ? 'selected' : ''}>Julia Bandin / Hernán Caraballo / Solange Mieres</option></select></div></div><label style="font-size:12px; font-weight:bold; display:block; text-align:left; margin-bottom:3px;">Producto/s:</label><div style="max-height: 150px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; border-radius: 5px; background: #fff; margin-bottom: 15px; display: block;">${checkboxesProductos}</div><div style="display:flex; gap:10px; margin-bottom: 10px;"><div style="flex:1; display:flex; flex-direction:column; text-align:left;"><label style="font-size:12px; font-weight:bold; margin-bottom: 3px;">Inicio:</label><input type="date" id="swal-fecha-inicio-edit" class="swal2-input" style="margin:0; width:100%; box-sizing:border-box;" value="${sesion.fechaInicio || ''}"></div><div style="flex:1; display:flex; flex-direction:column; text-align:left;"><label style="font-size:12px; font-weight:bold; margin-bottom: 3px;">Fin:</label><input type="date" id="swal-fecha-fin-edit" class="swal2-input" style="margin:0; width:100%; box-sizing:border-box;" value="${sesion.fechaFin || ''}"></div></div><div style="display:flex; gap:10px;"><div style="flex:1; display:flex; flex-direction:column; text-align:left;"><label style="font-size:12px; font-weight:bold; margin-bottom: 3px;">Hora Inicio:</label><input type="time" id="swal-hora-inicio-edit" class="swal2-input" style="margin:0; width:100%; box-sizing:border-box;" value="${sesion.horaInicio || ''}"></div><div style="flex:1; display:flex; flex-direction:column; text-align:left;"><label style="font-size:12px; font-weight:bold; margin-bottom: 3px;">Hora Fin:</label><input type="time" id="swal-hora-fin-edit" class="swal2-input" style="margin:0; width:100%; box-sizing:border-box;" value="${sesion.horaFin || ''}"></div></div><label style="font-size:12px; font-weight:bold; margin-top:10px; display:block; text-align:left;">Convocados:</label><div style="max-height: 120px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; border-radius: 5px; background: #fff;">${opsHtml}</div>`,
        width: '650px', showCancelButton: true, confirmButtonText: 'Guardar Cambios',
        preConfirm: () => {
            let cursosSeleccionados = Array.from(document.querySelectorAll('.chk-producto-multi-edit:checked')).map(cb => cb.value);
            let convocadosNuevos = Array.from(document.querySelectorAll('.chk-convocado-edit:checked')).map(cb => { let yaEstaba = sesion.convocados.find(c => c.nombre === cb.value); return yaEstaba ? yaEstaba : { nombre: cb.value, estado: "pendiente" }; });
            if (cursosSeleccionados.length === 0 || convocadosNuevos.length === 0) { Swal.showValidationMessage('Elegí al menos un producto y un convocado.'); return false; }
            sesion.tipo = document.getElementById('swal-tipo-edit').value; sesion.entrenador = document.getElementById('swal-entrenador-edit').value; sesion.cursos = cursosSeleccionados; delete sesion.curso; sesion.fechaInicio = document.getElementById('swal-fecha-inicio-edit').value; sesion.fechaFin = document.getElementById('swal-fecha-fin-edit').value; sesion.horaInicio = document.getElementById('swal-hora-inicio-edit').value; sesion.horaFin = document.getElementById('swal-hora-fin-edit').value; sesion.convocados = convocadosNuevos; return true;
        }
    });

    if (formValues) {
        let actVinculada = actividades.find(a => a.idSesionVinculada === sesion.id.toString() || a.id === 'ACT-' + sesion.id.toString());
        if (actVinculada) { actVinculada.titulo = `🎓 ${sesion.tipo} - ${sesion.cursos.join(' + ')}`; actVinculada.entrenador = sesion.entrenador; actVinculada.fecha = sesion.fechaInicio; actVinculada.fechaHasta = sesion.fechaFin || sesion.fechaInicio; actVinculada.hora = sesion.horaInicio || ''; }
        registrarAccion(`Editó la sesión de: ${sesion.cursos.join(' + ')}`); guardarDatos(); renderizarSesiones(); renderizarActividades(); Swal.fire('Actualizado', 'Sesión modificada con éxito', 'success');
    }
}

async function eliminarSesion(id) { const { isConfirmed } = await Swal.fire({ title: '¿Eliminar Sesión?', text: "Esta acción borrará la sesión de la agenda para siempre.", icon: 'warning', showCancelButton: true, confirmButtonColor: '#e74c3c' }); if (isConfirmed) { actividades = actividades.filter(a => a.idSesionVinculada !== id.toString() && a.id !== 'ACT-' + id.toString()); sesiones = sesiones.filter(s => s.id.toString() !== id.toString()); registrarAccion(`Eliminó un requerimiento de capacitación de la agenda`); guardarDatos(); renderizarSesiones(); renderizarActividades(); } }

function descargarMatrizExcel() {
    let fechaHoy = new Date().toLocaleDateString(); let horaHoy = new Date().toLocaleTimeString().substring(0, 5); let opsActivos = operadores.filter(op => mostrarBajas ? op.activo === false : op.activo !== false);
    if (opsActivos.length === 0) { Swal.fire('Atención', 'No hay datos para exportar.', 'warning'); return; }
    let tablaHTML = `<table border="1" style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 10px; text-align: center;"><thead><tr style="background-color: #2c3e50; color: white; font-weight: bold;"><th style="padding: 5px;">Operador</th><th style="padding: 5px;">Área</th>${cursos.map(c => `<th style="padding: 5px; font-size: 8px; width: 60px;">${c}</th>`).join('')}</tr></thead><tbody>`;
    opsActivos.forEach(op => {
        tablaHTML += `<tr><td style="font-weight: bold; padding: 5px; text-align: left;">${op.nombre}</td><td style="padding: 5px;">${op.area || '---'}</td>`;
        cursos.forEach(curso => {
            let info = op.estados && op.estados[curso] ? op.estados[curso] : { historial: [] }; let celdaTexto = "---"; let colorFondo = "#ffffff";
            if (info.historial && info.historial.length > 0) {
                let ultimo = info.historial[info.historial.length - 1]; let fechaVisual = ultimo.fecha ? ultimo.fecha.split(' ')[0].split('-').reverse().join('/') : ""; let nota = (ultimo.porcentaje !== undefined && ultimo.porcentaje !== "" && ultimo.porcentaje !== "N/A") ? `${ultimo.porcentaje}%` : "N/A"; celdaTexto = `${fechaVisual}<br>${nota}`;
                if (ultimo.porcentaje !== undefined && ultimo.porcentaje !== "" && ultimo.porcentaje !== "N/A") { let num = parseInt(ultimo.porcentaje); if (num >= 85) colorFondo = "#e8f8f5"; else if (num >= 70) colorFondo = "#fef5e7"; else colorFondo = "#fdedec"; } else { colorFondo = "#ecf0f1"; }
            } tablaHTML += `<td style="background-color: ${colorFondo}; padding: 3px;">${celdaTexto}</td>`;
        }); tablaHTML += `</tr>`;
    }); tablaHTML += `</tbody></table>`;
    if (modoEdicion) {
        let htmlExcel = `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8" /></head><body><table><tr><td colspan="${cursos.length + 2}" style="text-align: center; font-size: 14px; font-weight: bold; background-color: #c0392b; color: white; padding: 5px;">DOCUMENTO DE EXPORTACIÓN - LOS DATOS OFICIALES Y AUDITABLES RESIDEN EXCLUSIVAMENTE EN EL SISTEMA GIC</td></tr><tr><td colspan="${cursos.length + 2}" style="height: 10px;">&nbsp;</td></tr><tr><td colspan="${cursos.length + 2}" style="text-align: center; font-size: 18px; font-weight: bold; background-color: #1f497d; color: white; padding: 12px;">MATRIZ GENERAL DE CAPACITACIÓN</td></tr><tr><td colspan="2" style="font-weight: bold; background-color: #f2f2f2;">Fecha de Emisión:</td><td colspan="${cursos.length}">${fechaHoy} - ${horaHoy} hs</td></tr><tr><td colspan="${cursos.length + 2}" style="height: 20px;">&nbsp;</td></tr></table>${tablaHTML}</body></html>`;
        try { let blob = new Blob(['\ufeff' + htmlExcel], { type: 'application/vnd.ms-excel;charset=utf-8;' }); let link = document.createElement("a"); let url = URL.createObjectURL(blob); link.href = url; link.download = `GIC_Matriz_OFICIAL_${new Date().toISOString().split('T')[0]}.xls`; link.style.display = "none"; document.body.appendChild(link); link.click(); document.body.removeChild(link); window.URL.revokeObjectURL(url); if (typeof registrarAccion === "function") registrarAccion("Exportó Matriz General OFICIAL (Excel)"); Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Excel descargado', showConfirmButton: false, timer: 2000 }); } catch (e) { Swal.fire('Error', 'Tu navegador bloqueó la descarga del Excel.', 'error'); }
    } else {
        Swal.fire({ title: 'Preparando PDF...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } }); let iframe = document.createElement('iframe'); iframe.style.position = 'absolute'; iframe.style.width = '0px'; iframe.style.height = '0px'; iframe.style.border = 'none'; document.body.appendChild(iframe); let doc = iframe.contentWindow.document; doc.write(`<html><head><title>Matriz_Consulta_${new Date().toISOString().split('T')[0]}</title><style>@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } @page { size: landscape; margin: 10mm; } } body { font-family: Arial, sans-serif; padding: 20px; }</style></head><body><div style="text-align: center; margin-bottom: 20px;"><h2 style="color: #1f497d; margin: 0;">Reporte de Matriz General</h2><p style="color: #7f8c8d; margin: 5px 0;">Fecha: ${fechaHoy} | Sólo Lectura</p></div>${tablaHTML}</body></html>`); doc.close(); setTimeout(() => { Swal.close(); iframe.contentWindow.focus(); iframe.contentWindow.print(); setTimeout(() => { document.body.removeChild(iframe); }, 5000); }, 500);
    }
}

async function emitirActaRefuerzo(nombre) {
    let op = operadores.find(o => o.nombre === nombre); if(!op) return; let cursosDisponibles = {}; cursos.forEach(c => { if(op.estados && op.estados[c] && op.estados[c].historial && op.estados[c].historial.length > 0) { cursosDisponibles[c] = c; } });
    if(Object.keys(cursosDisponibles).length === 0) { Swal.fire('Sin datos', 'Este operador no tiene capacitaciones finalizadas.', 'info'); return; }
    const { value: cursoSelec } = await Swal.fire({ title: 'Emitir Informe', text: '¿De qué producto querés generar el Informe?', input: 'select', inputOptions: cursosDisponibles, showCancelButton: true }); if(!cursoSelec) return; let hist = op.estados[cursoSelec].historial; let ultimoEvento = hist[hist.length - 1]; let tituloInput = modoEdicion ? 'Capacitador/a' : 'Tu Nombre (Solicitante)'; let valorInput = modoEdicion && usuarioActual !== 'Sistema' ? usuarioActual : ''; const { value: nombreIngresado } = await Swal.fire({ title: tituloInput, input: 'text', inputValue: valorInput, showCancelButton: true, inputValidator: (value) => { if (!value) return 'Por favor, completá este campo para continuar.'; } }); if(!nombreIngresado) return;
    let obs = ultimoEvento.observacion || "No se registraron respuestas incorrectas."; let obsExcel = obs.replace(/\n/g, "<br style='mso-data-placement:same-cell;' />"); let linkVerifHTML = ultimoEvento.linkVerificacion ? `<br><br><b>Link de Verificación / Examen:</b> <a href="${ultimoEvento.linkVerificacion}" style="color: #2980b9; text-decoration: underline;">${ultimoEvento.linkVerificacion}</a>` : ""; let fechaVisual = ultimoEvento.fecha ? ultimoEvento.fecha.split(' ')[0].split('-').reverse().join('/') : ''; let etiquetaRol = modoEdicion ? 'Capacitador/a:' : 'Solicitante:'; let notaObtenida = (ultimoEvento.porcentaje !== undefined && ultimoEvento.porcentaje !== "" && ultimoEvento.porcentaje !== "N/A") ? ultimoEvento.porcentaje + '%' : 'N/A (Asistencia)';
    let tablaActaHTML = `<table border="0" style="width: 100%; border-collapse: collapse;"><tr><td colspan="4" style="text-align: center; font-size: 14px; font-weight: bold; background-color: #c0392b; color: white; padding: 5px; border: 1px solid #000;">DOCUMENTO DE EXPORTACIÓN - LOS DATOS OFICIALES RESIDEN EXCLUSIVAMENTE EN EL SISTEMA GIC</td></tr><tr><td colspan="4" style="height: 15px;">&nbsp;</td></tr><tr><td colspan="4" style="text-align: center; font-size: 16px; font-weight: bold; background-color: #1f497d; color: white; padding: 10px; border: 1px solid #000;">INFORME DE CAPACITACIÓN</td></tr><tr><td colspan="4" style="height: 25px;">&nbsp;</td></tr><tr><td style="font-weight: bold; border: 1px solid #000; padding: 5px; background-color: #f2f2f2; width: 25%;">Fecha:</td><td style="border: 1px solid #000; padding: 5px; text-align: center; width: 25%;">${fechaVisual}</td><td style="font-weight: bold; border: 1px solid #000; padding: 5px; background-color: #f2f2f2; width: 25%;">${etiquetaRol}</td><td style="border: 1px solid #000; padding: 5px; text-align: center; width: 25%;">${nombreIngresado}</td></tr><tr><td style="font-weight: bold; border: 1px solid #000; padding: 5px; background-color: #f2f2f2;">Operador:</td><td style="border: 1px solid #000; padding: 5px; text-align: center;">${op.nombre}</td><td style="font-weight: bold; border: 1px solid #000; padding: 5px; background-color: #f2f2f2;">Lider:</td><td style="border: 1px solid #000; padding: 5px; text-align: center;"></td></tr><tr><td style="font-weight: bold; border: 1px solid #000; padding: 5px; background-color: #f2f2f2;">Tipo de Capacitación:</td><td colspan="3" style="border: 1px solid #000; padding: 5px; text-align: center;">${ultimoEvento.tipo || ''}</td></tr><tr><td colspan="4" style="height: 20px;">&nbsp;</td></tr><tr><td colspan="4" style="font-weight: bold; background-color: #1f497d; color: white; padding: 5px; border: 1px solid #000;">Respuestas correctas (Producto: ${cursoSelec})</td></tr><tr><td colspan="4" style="height: 120px; vertical-align: top; border: 1px solid #000; padding: 10px;">${obsExcel}</td></tr><tr><td colspan="4" style="height: 20px;">&nbsp;</td></tr><tr><td colspan="4" style="font-weight: bold; background-color: #1f497d; color: white; padding: 5px; border: 1px solid #000;">Observaciones generales de la capacitación</td></tr><tr><td colspan="4" style="height: 60px; vertical-align: top; border: 1px solid #000; padding: 10px;">Nota obtenida: ${notaObtenida}. ${linkVerifHTML}</td></tr><tr><td colspan="4" style="height: 20px;">&nbsp;</td></tr><tr><td style="font-weight: bold; background-color: #2c3e50; color: white; padding: 5px; border: 1px solid #000; text-align: center;">Sigla</td><td colspan="3" style="font-weight: bold; background-color: #2c3e50; color: white; padding: 5px; border: 1px solid #000;">Referencia de Capacitación</td></tr><tr><td style="border: 1px solid #000; padding: 5px; font-weight: bold; text-align: center;">CE</td><td colspan="3" style="border: 1px solid #000; padding: 5px;">Entrenamiento / Capacitación</td></tr><tr><td style="border: 1px solid #000; padding: 5px; font-weight: bold; text-align: center;">CR</td><td colspan="3" style="border: 1px solid #000; padding: 5px;">Re-entrenamiento</td></tr><tr><td style="border: 1px solid #000; padding: 5px; font-weight: bold; text-align: center;">EI</td><td colspan="3" style="border: 1px solid #000; padding: 5px;">Entrenamiento Inicial</td></tr><tr><td style="border: 1px solid #000; padding: 5px; font-weight: bold; text-align: center;">VA</td><td colspan="3" style="border: 1px solid #000; padding: 5px;">Verificación Anual</td></tr><tr><td style="border: 1px solid #000; padding: 5px; font-weight: bold; text-align: center;">VRS</td><td colspan="3" style="border: 1px solid #000; padding: 5px;">Verificación de Requerimiento de Sector</td></tr></table>`;
    if (modoEdicion) {
        let htmlCompletado = `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8" /></head><body style="font-family: Arial, sans-serif;">${tablaActaHTML}</body></html>`;
        try { let blob = new Blob(['\ufeff' + htmlCompletado], { type: 'application/vnd.ms-excel;charset=utf-8;' }); let link = document.createElement("a"); let url = URL.createObjectURL(blob); link.href = url; link.download = `Informe_${op.nombre.replace(/\s+/g, '_')}_${cursoSelec}.xls`; link.style.display = "none"; document.body.appendChild(link); link.click(); document.body.removeChild(link); window.URL.revokeObjectURL(url); if (typeof registrarAccion === "function") registrarAccion(`Emitió Informe OFICIAL para ${op.nombre}`); } catch (e) { Swal.fire('Error', 'Tu navegador bloqueó la descarga del Excel.', 'error'); }
    } else {
        Swal.fire({ title: 'Preparando PDF...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } }); let iframe = document.createElement('iframe'); iframe.style.position = 'absolute'; iframe.style.width = '0px'; iframe.style.height = '0px'; iframe.style.border = 'none'; document.body.appendChild(iframe); let doc = iframe.contentWindow.document; doc.write(`<html><head><title>Informe_${op.nombre.replace(/\s+/g, '_')}_${cursoSelec}</title><style>@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } @page { size: portrait; margin: 15mm; } } body { font-family: Arial, sans-serif; padding: 20px; }</style></head><body>${tablaActaHTML}</body></html>`); doc.close(); setTimeout(() => { Swal.close(); iframe.contentWindow.focus(); iframe.contentWindow.print(); setTimeout(() => { document.body.removeChild(iframe); }, 5000); }, 500); if (typeof registrarAccion === "function") registrarAccion(`Descargó Informe (PDF) de ${op.nombre} en ${cursoSelec}`, nombreIngresado);
    }
}

function descargarInformeEvaluaciones() {
    let fechaHoy = new Date().toLocaleDateString(); let tablaHTML = `<table border="1" style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11px; text-align: center;"><thead><tr style="background-color: #8e44ad; color: white; font-weight: bold;"><th style="padding: 8px;">Operador</th><th style="padding: 8px;">Área</th><th style="padding: 8px;">Producto / Curso</th><th style="padding: 8px;">Tipo (CE/CR/EI)</th><th style="padding: 8px;">Código CABAL</th><th style="padding: 8px;">Fecha de Carga</th><th style="padding: 8px;">Nota (%)</th><th style="padding: 8px;">Estado</th></tr></thead><tbody>`; let filasGeneradas = 0;
    operadores.forEach(op => { cursos.forEach(c => { if (op.estados && op.estados[c] && op.estados[c].historial) { op.estados[c].historial.forEach(evento => { filasGeneradas++; let nota = (evento.porcentaje !== undefined && evento.porcentaje !== "" && evento.porcentaje !== "N/A") ? evento.porcentaje : '-'; let estado = 'Sin nota'; let colorNota = '#333'; if (nota !== '-') { let num = parseInt(nota); if (num >= 85) { estado = 'Aprobado'; colorNota = '#27ae60'; } else if (num >= 70) { estado = 'Desaprobado'; colorNota = '#f39c12'; } else { estado = 'Crítico'; colorNota = '#c0392b'; } } else { estado = 'Asistió (N/A)'; } tablaHTML += `<tr><td style="padding: 5px; text-align: left;"><b>${op.nombre}</b></td><td style="padding: 5px;">${op.area || '---'}</td><td style="padding: 5px; text-align: left;">${c}</td><td style="padding: 5px;">${evento.tipo || '---'}</td><td style="padding: 5px;">${evento.codigo || '---'}</td><td style="padding: 5px;">${evento.fecha ? evento.fecha.split(' ')[0].split('-').reverse().join('/') : '---'}</td><td style="font-weight:bold; padding: 5px; color: ${colorNota}">${nota}</td><td style="padding: 5px;">${estado}</td></tr>`; }); } }); });
    tablaHTML += `</tbody></table>`; let referenciasHTML = `<br><table border="1" style="width: 50%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 10px; text-align: left; margin-top: 15px;"><tr><td style="font-weight: bold; background-color: #2c3e50; color: white; padding: 5px; text-align: center; width: 50px;">Sigla</td><td style="font-weight: bold; background-color: #2c3e50; color: white; padding: 5px;">Referencia de Capacitación</td></tr><tr><td style="padding: 5px; font-weight: bold; text-align: center;">CE</td><td style="padding: 5px;">Entrenamiento / Capacitación</td></tr><tr><td style="padding: 5px; font-weight: bold; text-align: center;">CR</td><td style="padding: 5px;">Re-entrenamiento</td></tr><tr><td style="padding: 5px; font-weight: bold; text-align: center;">EI</td><td style="padding: 5px;">Entrenamiento Inicial</td></tr><tr><td style="padding: 5px; font-weight: bold; text-align: center;">VA</td><td style="padding: 5px;">Verificación Anual</td></tr><tr><td style="padding: 5px; font-weight: bold; text-align: center;">VRS</td><td style="padding: 5px;">Verificación de Requerimiento de Sector</td></tr></table>`;

    if (filasGeneradas === 0) { Swal.fire('Sin datos', 'Todavía no hay evaluaciones cargadas para exportar.', 'info'); return; }
    if (modoEdicion) {
        let htmlExcel = `<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8" /></head><body><table><tr><td colspan="8" style="text-align: center; font-size: 14px; font-weight: bold; background-color: #c0392b; color: white; padding: 5px;">DOCUMENTO DE EXPORTACIÓN - LOS DATOS OFICIALES RESIDEN EXCLUSIVAMENTE EN EL SISTEMA GIC</td></tr><tr><td colspan="8" style="height: 10px;">&nbsp;</td></tr><tr><td colspan="8" style="text-align: center; font-size: 16px; font-weight: bold; background-color: #8e44ad; color: white; padding: 10px;">INFORME DETALLADO DE EVALUACIONES</td></tr><tr><td colspan="8" style="height: 15px;">&nbsp;</td></tr></table>${tablaHTML}${referenciasHTML.replace(/<br>/g, '')}</body></html>`;
        try { let blob = new Blob(['\ufeff' + htmlExcel], { type: 'application/vnd.ms-excel;charset=utf-8;' }); let link = document.createElement("a"); let url = URL.createObjectURL(blob); link.href = url; link.download = `Informe_Evaluaciones_Detallado_${new Date().toISOString().split('T')[0]}.xls`; link.style.display = "none"; document.body.appendChild(link); link.click(); document.body.removeChild(link); window.URL.revokeObjectURL(url); if (typeof registrarAccion === "function") registrarAccion(`Descargó el Informe Detallado de Evaluaciones OFICIAL`); Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Excel descargado', showConfirmButton: false, timer: 2000 }); } catch (e) { Swal.fire('Error', 'Tu navegador bloqueó la descarga del Excel.', 'error'); }
    } else {
        Swal.fire({ title: 'Preparando PDF...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } }); let iframe = document.createElement('iframe'); iframe.style.position = 'absolute'; iframe.style.width = '0px'; iframe.style.height = '0px'; iframe.style.border = 'none'; document.body.appendChild(iframe); let doc = iframe.contentWindow.document; doc.write(`<html><head><title>Evaluaciones_Consulta_${new Date().toISOString().split('T')[0]}</title><style>@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } @page { size: portrait; margin: 10mm; } } body { font-family: Arial, sans-serif; padding: 20px; }</style></head><body><div style="text-align: center; margin-bottom: 20px;"><h2 style="color: #8e44ad; margin: 0;">Informe Detallado de Evaluaciones</h2><p style="color: #7f8c8d; margin: 5px 0;">Fecha: ${fechaHoy} | Sólo Lectura</p></div>${tablaHTML}${referenciasHTML}</body></html>`); doc.close(); setTimeout(() => { Swal.close(); iframe.contentWindow.focus(); iframe.contentWindow.print(); setTimeout(() => { document.body.removeChild(iframe); }, 5000); }, 500); if (typeof registrarAccion === "function") registrarAccion(`Descargó Informe Detallado (PDF)`, "Invitado");
    }
}

/* -------------------- 📤 RESTAURAR BACKUP -------------------- */
function restaurarBackup(event) {
    let file = event.target.files[0];
    if (!file) return;
    let reader = new FileReader();
    reader.onload = async function(e) {
        try {
            let data = JSON.parse(e.target.result);
            const { isConfirmed } = await Swal.fire({
                title: '¿Restaurar Backup?',
                text: "Esto sobreescribirá la base de datos actual. ¿Estás seguro?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#e74c3c'
            });
            if (isConfirmed) {
                if (data.mapaCodigos) mapaCodigos = data.mapaCodigos;
                if (data.operadores) operadores = data.operadores;
                if (data.sesiones) sesiones = data.sesiones;
                if (data.actividades) actividades = data.actividades;
                if (data.historialAuditoria) historialAuditoria = data.historialAuditoria;
                
                cursos = [...new Set(Object.values(mapaCodigos))];
                registrarAccion("Restauró la base de datos desde un Backup");
                guardarDatos();
                Swal.fire('¡Restaurado!', 'La base de datos ha sido restaurada con éxito.', 'success').then(() => {
                    location.reload();
                });
            }
        } catch (err) {
            Swal.fire('Error', 'El archivo no es un JSON válido.', 'error');
        }
    };
    reader.readAsText(file);
}

/* -------------------- 📖 INSTRUCTIVO TÉCNICO (IT) INTEGRADO -------------------- */
function abrirManualGIC() {
    if (modoEdicion) {
        const contenidoCapacitador = `
        <div style="text-align: left; font-size: 13px; max-height: 600px; overflow-y: auto; padding-right: 15px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.5;">
            <div style="background: #2980b9; color: white; padding: 12px; border-radius: 5px; margin-bottom: 15px; text-align: center;">
                <h3 style="margin: 0;">🛠️ Manual Avanzado del GIC (Editores)</h3>
                <p style="margin: 5px 0 0 0; font-size: 11px;">Exclusivo para Capacitación y Jefatura</p>
            </div>
            
            <h4 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 3px;"><i class="fa-solid fa-table-cells"></i> 1. GESTIÓN DE LA MATRIZ GENERAL</h4>
            <ul>
                <li><b>Cargar Evaluaciones:</b> Hacé clic en la celda de un operador. Podés cargar Entrenamientos (CE, CR, EI) o Verificaciones (VA, VRS).</li>
                <li><b>Notas y N/A:</b> Si el operador solo asistió pero no rindió examen, tildá <b>N/A</b> (la nota no promediará y se usará la fecha de fin de curso).</li>
                <li><b>Corregir Errores:</b> Al hacer clic en una celda, tenés opciones para <i>"✏️ Editar Nota/Fecha"</i> o <i>"🗑️ Borrar un registro específico"</i> sin perder el resto del historial.</li>
                <li><b>Altas y Bajas:</b> Podés archivar operadores (pasan a la vista "Ver Bajas") o eliminarlos definitivamente. También podés asignarles su Área (CR, MDA).</li>
                <li><b>Descarga Oficial:</b> El botón "Exportar Matriz" genera el Excel general blindado para auditorías.</li>
            </ul>

            <h4 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 3px; margin-top: 15px;"><i class="fa-solid fa-calendar-check"></i> 2. AGENDA DE CAPACITACIONES (Requerimientos)</h4>
            <ul>
                <li><b>Crear Sesión:</b> Asigná tipo (CE, CR, etc.), Entrenador, Fechas, Producto y marcá a los convocados.</li>
                <li><b>Bitácora:</b> Cada tarjeta tiene un chat interno para dejar novedades del grupo al resto de los entrenadores.</li>
                <li><b>📝 Evaluar:</b> Marcá las asistencias (Presente, Ausente, Licencia). Al tocar "Evaluar", el sistema te pedirá las notas de los presentes y las enviará automáticamente a la Matriz.</li>
                <li><b>📦 Archivar:</b> Cierra la sesión. Si quedaron "Presentes" sin evaluar, los carga automáticamente como N/A. Los Ausentes vuelven a estado Rojo en la matriz.</li>
            </ul>

            <h4 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 3px; margin-top: 15px;"><i class="fa-solid fa-chart-line"></i> 3. TABLERO JEFATURA Y REPORTES</h4>
            <ul>
                <li><b>Tablero Ejecutivo:</b> Muestra KPIs globales, distribución de notas (Aprobado ≥85%, Desaprobado 70-84%, Crítico <70%) y el Top 5 de cursos.</li>
                <li><b>Cobertura por Grupo:</b> Tabla dinámica que cruza Productos vs. Áreas (CR, MDA) calculando porcentajes y cantidades. Incluye botón de descarga a Excel.</li>
                <li><b>Exportación a Medida:</b> En la barra superior, permite generar un Excel filtrando por fechas exactas, productos específicos y selección manual de operadores.</li>
                <li><b>Informe de Evaluaciones:</b> Descarga un Excel crudo con el detalle de cada nota sacada por cada operador.</li>
            </ul>

            <h4 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 3px; margin-top: 15px;"><i class="fa-solid fa-user-chart"></i> 4. LIBRETAS E INFORMES INDIVIDUALES</h4>
            <ul>
                <li>Haciendo clic en el nombre de un operador (en azul), accedés a sus estadísticas.</li>
                <li>Podés descargar su <b>Libreta Virtual (PDF)</b> o emitir el <b>Informe Oficial (Excel)</b> para enviarlo firmado a Calidad/Jefatura.</li>
            </ul>
        </div>`;
        Swal.fire({ title: 'Manual GIC', html: contenidoCapacitador, width: '800px', confirmButtonText: 'Entendido, ¡a trabajar!', confirmButtonColor: '#2980b9' });
    } else {
        const contenidoUsuario = `
        <div style="text-align: left; font-size: 14px; font-family: 'Segoe UI', sans-serif; line-height: 1.6; max-height: 500px; overflow-y: auto; padding-right: 15px;">
            <div style="background: #27ae60; color: white; padding: 12px; border-radius: 5px; margin-bottom: 15px; text-align: center;">
                <h3 style="margin: 0;">📊 Guía de Consulta Rápida</h3>
                <p style="margin: 5px 0 0 0; font-size: 12px;">Vista Perfil Visualización</p>
            </div>
            
            <p>Bienvenido/a al <b>GIC (Gestión Integral de Capacitación)</b>. En esta vista de solo lectura podrás hacer seguimiento de tu estado de formación.</p>

            <h4 style="color: #27ae60; border-bottom: 1px solid #eee;"><i class="fa-solid fa-traffic-light"></i> 1. El Semáforo de Capacitación</h4>
            <p>En la Matriz General verás círculos de colores que indican tu estado en cada producto:</p>
            <ul>
                <li>🟢 <b>Verde:</b> Capacitación completada y aprobada (o N/A de asistencia).</li>
                <li>🟡 <b>Amarillo:</b> Actualmente en período de capacitación.</li>
                <li>🔴 <b>Rojo:</b> Capacitación pendiente o no realizada.</li>
            </ul>
            <p><i>Nota: Al posar el mouse sobre un círculo verde, podrás ver el detalle de la fecha y la nota obtenida (💯). Las notas ≥85% se muestran en verde, las notas entre 70-84% en naranja y las menores a 70% en rojo.</i></p>

            <h4 style="color: #27ae60; border-bottom: 1px solid #eee; margin-top: 15px;"><i class="fa-solid fa-id-card"></i> 2. Tu Libreta Virtual</h4>
            <p>Si hacés <b>clic sobre tu nombre</b> (marcado en azul subrayado en la tabla), se abrirá tu perfil personal. Desde allí podrás:</p>
            <ul>
                <li>Ver tu porcentaje de completitud global.</li>
                <li>Revisar qué cursos tenés aprobados, en proceso y pendientes.</li>
                <li>Descargar tu <b>Libreta Virtual en PDF</b> para guardarla en tus registros.</li>
            </ul>

            <h4 style="color: #27ae60; border-bottom: 1px solid #eee; margin-top: 15px;"><i class="fa-solid fa-magnifying-glass"></i> 3. Búsqueda y Filtros</h4>
            <ul>
                <li>Usá el buscador principal para encontrar tu nombre rápidamente en la lista.</li>
                <li>En la sección del gráfico superior, podés usar el filtro desplegable para ver las métricas generales de todo el Call Center respecto a un producto en particular.</li>
            </ul>
        </div>`;
        Swal.fire({ title: 'Instructivo GIC', html: contenidoUsuario, width: '700px', confirmButtonText: 'Cerrar', confirmButtonColor: '#27ae60' });
    }
}

/* -------------------- 📊 EXPORTACIÓN A MEDIDA -------------------- */
async function modalExportacionAvanzada() {
    console.log("¡El botón fue clickeado!"); // Esto es para ver si funciona internamente
    
    let opsActivos = operadores.filter(op => op.activo !== false);
    if (opsActivos.length === 0) {
        Swal.fire('Atención', 'No hay operadores activos para generar el reporte.', 'warning');
        return;
    }

    // Armamos los checkboxes de Productos y Operadores
    let checkboxesProductos = cursos.map(c => `<label style="display:flex; align-items:center; margin-bottom:5px; font-size:12px; cursor:pointer;"><input type="checkbox" class="chk-exp-prod" value="${c}" checked style="margin-right:8px;"> ${c}</label>`).join('');
    let checkboxesOperadores = opsActivos.map(o => `<label style="display:flex; align-items:center; margin-bottom:5px; font-size:12px; cursor:pointer;"><input type="checkbox" class="chk-exp-op" value="${o.nombre}" checked style="margin-right:8px;"> ${o.nombre}</label>`).join('');

    let fechaHoyStr = new Date().toISOString().split('T')[0];
    let haceUnMes = new Date();
    haceUnMes.setMonth(haceUnMes.getMonth() - 1);
    let fechaHaceUnMesStr = haceUnMes.toISOString().split('T')[0];

    const { value: formValues } = await Swal.fire({
        title: 'Exportación a Medida',
        html: `
        <div style="text-align: left;">
            <p style="font-size:13px; color:#7f8c8d; margin-bottom:15px;">Seleccioná los filtros para generar un Excel detallado con las evaluaciones correspondientes a ese período.</p>
            
            <div style="display:flex; gap:15px; margin-bottom:15px;">
                <div style="flex:1;">
                    <label style="font-size:12px; font-weight:bold;">Fecha Desde:</label>
                    <input type="date" id="swal-exp-desde" class="swal2-input" value="${fechaHaceUnMesStr}" style="width:100%; height:35px; margin:5px 0 0 0; box-sizing:border-box;">
                </div>
                <div style="flex:1;">
                    <label style="font-size:12px; font-weight:bold;">Fecha Hasta:</label>
                    <input type="date" id="swal-exp-hasta" class="swal2-input" value="${fechaHoyStr}" style="width:100%; height:35px; margin:5px 0 0 0; box-sizing:border-box;">
                </div>
            </div>

            <div style="display:flex; gap:15px; margin-bottom:10px;">
                <div style="flex:1; border:1px solid #ccc; border-radius:5px; padding:10px; background:#fff;">
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding-bottom:5px; margin-bottom:5px;">
                        <label style="font-size:12px; font-weight:bold; color:#2c3e50;">Productos:</label>
                        <div>
                            <button onclick="document.querySelectorAll('.chk-exp-prod').forEach(c=>c.checked=true)" style="font-size:9px; padding:2px 4px; background:#2ecc71; color:white; border:none; border-radius:3px; cursor:pointer;">Todos</button>
                            <button onclick="document.querySelectorAll('.chk-exp-prod').forEach(c=>c.checked=false)" style="font-size:9px; padding:2px 4px; background:#e74c3c; color:white; border:none; border-radius:3px; cursor:pointer;">Ninguno</button>
                        </div>
                    </div>
                    <div style="max-height:120px; overflow-y:auto;">${checkboxesProductos}</div>
                </div>

                <div style="flex:1; border:1px solid #ccc; border-radius:5px; padding:10px; background:#fff;">
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding-bottom:5px; margin-bottom:5px;">
                        <label style="font-size:12px; font-weight:bold; color:#2c3e50;">Operadores:</label>
                        <div>
                            <button onclick="document.querySelectorAll('.chk-exp-op').forEach(c=>c.checked=true)" style="font-size:9px; padding:2px 4px; background:#2ecc71; color:white; border:none; border-radius:3px; cursor:pointer;">Todos</button>
                            <button onclick="document.querySelectorAll('.chk-exp-op').forEach(c=>c.checked=false)" style="font-size:9px; padding:2px 4px; background:#e74c3c; color:white; border:none; border-radius:3px; cursor:pointer;">Ninguno</button>
                        </div>
                    </div>
                    <div style="max-height:120px; overflow-y:auto;">${checkboxesOperadores}</div>
                </div>
            </div>
        </div>`,
        width: '700px',
        showCancelButton: true,
        confirmButtonText: '<i class="fa-solid fa-file-excel"></i> Generar Excel',
        confirmButtonColor: '#27ae60',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            let desde = document.getElementById('swal-exp-desde').value;
            let hasta = document.getElementById('swal-exp-hasta').value;
            let prodsSeleccionados = Array.from(document.querySelectorAll('.chk-exp-prod:checked')).map(cb => cb.value);
            let opsSeleccionados = Array.from(document.querySelectorAll('.chk-exp-op:checked')).map(cb => cb.value);
            
            if (!desde || !hasta) { Swal.showValidationMessage('Ambas fechas son obligatorias.'); return false; }
            if (hasta < desde) { Swal.showValidationMessage('La Fecha Hasta no puede ser anterior a la Fecha Desde.'); return false; }
            if (prodsSeleccionados.length === 0) { Swal.showValidationMessage('Elegí al menos un producto.'); return false; }
            if (opsSeleccionados.length === 0) { Swal.showValidationMessage('Elegí al menos un operador.'); return false; }
            
            return { desde, hasta, productos: prodsSeleccionados, operadores: opsSeleccionados };
        }
    });

    if (formValues) {
        let tablaHTML = `<table border="1" style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11px; text-align: center;">
            <thead>
                <tr style="background-color: #16a085; color: white; font-weight: bold;">
                    <th style="padding: 8px;">Operador</th>
                    <th style="padding: 8px;">Área</th>
                    <th style="padding: 8px;">Producto / Curso</th>
                    <th style="padding: 8px;">Tipo</th>
                    <th style="padding: 8px;">Código CABAL</th>
                    <th style="padding: 8px;">Fecha de Evaluación</th>
                    <th style="padding: 8px;">Nota (%)</th>
                    <th style="padding: 8px;">Estado</th>
                </tr>
            </thead>
            <tbody>`;
        
        let filasGeneradas = 0;
        let opsFiltrados = opsActivos.filter(op => formValues.operadores.includes(op.nombre));

        opsFiltrados.forEach(op => {
            formValues.productos.forEach(curso => {
                if (op.estados && op.estados[curso] && op.estados[curso].historial) {
                    op.estados[curso].historial.forEach(evento => {
                        let fechaEventoVal = evento.fecha ? evento.fecha.split(' ')[0] : "";
                        if (fechaEventoVal >= formValues.desde && fechaEventoVal <= formValues.hasta) {
                            filasGeneradas++;
                            let nota = (evento.porcentaje !== undefined && evento.porcentaje !== "" && evento.porcentaje !== "N/A") ? evento.porcentaje : '-';
                            let estado = 'Sin nota'; let colorNota = '#333';
                            if (nota !== '-') {
                                let num = parseInt(nota);
                                if (num >= 85) { estado = 'Aprobado'; colorNota = '#27ae60'; } 
                                else if (num >= 70) { estado = 'Desaprobado'; colorNota = '#f39c12'; } 
                                else { estado = 'Crítico'; colorNota = '#c0392b'; }
                            } else {
                                estado = 'Asistió (N/A)';
                            }
                            
                            let fechaVisual = fechaEventoVal.split('-').reverse().join('/');
                            tablaHTML += `<tr>
                                <td style="padding: 5px; text-align: left;"><b>${op.nombre}</b></td>
                                <td style="padding: 5px;">${op.area || '---'}</td>
                                <td style="padding: 5px; text-align: left;">${curso}</td>
                                <td style="padding: 5px;">${evento.tipo || '---'}</td>
                                <td style="padding: 5px;">${evento.codigo || '---'}</td>
                                <td style="padding: 5px;">${fechaVisual}</td>
                                <td style="font-weight:bold; padding: 5px; color: ${colorNota}">${nota}</td>
                                <td style="padding: 5px;">${estado}</td>
                            </tr>`;
                        }
                    });
                }
            });
        });
        
        tablaHTML += `</tbody></table>`;

        if (filasGeneradas === 0) {
            Swal.fire('Sin resultados', 'No se encontraron evaluaciones que coincidan con esos filtros y fechas.', 'info');
            return;
        }

        let formatDesde = formValues.desde.split('-').reverse().join('/');
        let formatHasta = formValues.hasta.split('-').reverse().join('/');
        let htmlExcel = `
        <html xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head><meta charset="utf-8" /></head>
        <body>
            <table>
                <tr><td colspan="8" style="text-align: center; font-size: 14px; font-weight: bold; background-color: #c0392b; color: white; padding: 5px;">DOCUMENTO DE EXPORTACIÓN - GIC</td></tr>
                <tr><td colspan="8" style="text-align: center; font-size: 16px; font-weight: bold; background-color: #16a085; color: white; padding: 10px;">INFORME A MEDIDA DE EVALUACIONES</td></tr>
                <tr>
                    <td colspan="2" style="font-weight: bold; background-color: #f2f2f2;">Período consultado:</td>
                    <td colspan="6">${formatDesde} al ${formatHasta}</td>
                </tr>
                <tr><td colspan="8" style="height: 15px;">&nbsp;</td></tr>
            </table>
            ${tablaHTML}
        </body>
        </html>`;

        try { 
            let blob = new Blob(['\ufeff' + htmlExcel], { type: 'application/vnd.ms-excel;charset=utf-8;' }); 
            let link = document.createElement("a"); 
            let url = URL.createObjectURL(blob); 
            link.href = url; 
            link.download = `Reporte_Medida_GIC_${new Date().toISOString().split('T')[0]}.xls`; 
            link.style.display = "none"; 
            document.body.appendChild(link); 
            link.click(); 
            document.body.removeChild(link); 
            window.URL.revokeObjectURL(url); 
            if (typeof registrarAccion === "function") registrarAccion(`Descargó un Reporte a Medida (Excel)`); 
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Excel generado con éxito', showConfirmButton: false, timer: 2000 }); 
        } catch (e) { 
            Swal.fire('Error', 'Tu navegador bloqueó la descarga del Excel.', 'error'); 
        }
    }
}

/* -------------------- 📥 DESCARGAR BACKUP (JSON) -------------------- */
function descargarBackup() {
    // 1. Juntamos toda la información actual del sistema
    let backupData = {
        mapaCodigos: mapaCodigos,
        operadores: operadores,
        sesiones: sesiones,
        actividades: actividades,
        historialAuditoria: historialAuditoria
    };

    // 2. Lo transformamos a formato texto JSON (para que sea liviano)
    let dataStr = JSON.stringify(backupData, null, 2);
    let blob = new Blob([dataStr], { type: "application/json" });
    let url = URL.createObjectURL(blob);
    
    // 3. Forzamos la descarga del archivo
    let link = document.createElement('a');
    link.href = url;
    let fechaHoy = new Date().toISOString().split('T')[0];
    link.download = `Backup_GIC_Completo_${fechaHoy}.json`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // 4. Registramos en la auditoría y avisamos que salió bien
    if (typeof registrarAccion === "function") {
        registrarAccion("Descargó un Backup completo del sistema (JSON)");
    }
    
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Backup descargado con éxito',
        showConfirmButton: false,
        timer: 2500
    });
}