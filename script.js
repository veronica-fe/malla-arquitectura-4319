// Paso 1: Numerar materias y construir mapa de números
let materiasAprobadas = new Set();
let totalCreditos = 167;
let datosPensum = null;
let mapaNumeros = {}; // clave: código, valor: número asignado

function puedeTomar(materia, aprobadas) {
    if (!materia.requisitos) return true;
    return materia.requisitos.every(req => aprobadas.has(req));
}

function calcularCreditos(data) {
    let suma = 0;
    data.niveles.forEach(nivel => {
        nivel.materias.forEach(materia => {
            if (materiasAprobadas.has(materia.codigo)) {
                suma += materia.creditos;
            }
        });
    });
    return suma;
}

function actualizarVista(data) {
    const contenedor = document.getElementById('malla');
    const contador = document.getElementById('contador-creditos');
    contenedor.innerHTML = '';

    let numeroGlobal = 1;
    mapaNumeros = {};

    data.niveles.forEach(nivel => {
        nivel.materias.forEach(m => {
            mapaNumeros[m.codigo] = numeroGlobal++;
        });
    });

    data.niveles.forEach(nivel => {
        const divNivel = document.createElement('div');
        divNivel.className = 'nivel';
        const titulo = document.createElement('h3');
        titulo.textContent = `Año ${Math.ceil(nivel.nivel/2)} - Semestre ${toRoman(nivel.nivel)}`;
        divNivel.appendChild(titulo);

        nivel.materias.forEach(materia => {
            const divMateria = document.createElement('div');
            divMateria.className = 'materia';
            divMateria.id = materia.codigo;

            let tipo = "GEN";
            let nombre = materia.nombre.toLowerCase();
            if (nombre.includes("diseño")) tipo = "DIS";
            else if (nombre.includes("construcción") || nombre.includes("estructura")) tipo = "CON";
            else if (nombre.includes("teoría") || nombre.includes("historia")) tipo = "TEO";
            else if (nombre.includes("representación") || nombre.includes("modelación") || nombre.includes("bim")) tipo = "DIG";
            else if (nombre.includes("ética") || nombre.includes("inglés") || nombre.includes("formación")) tipo = "FOR";
            else if (nombre.includes("urbanismo") || nombre.includes("territorial") || nombre.includes("hábitat") || nombre.includes("ciudad")) tipo = "URB";
            else if (nombre.includes("optativa") || nombre.includes("electiva")) tipo = "OPT";
            else if (nombre.includes("grado") || nombre.includes("metodología") || nombre.includes("investigación")) tipo = "GES";

            divMateria.classList.add(`tipo-${tipo}`);

            if (materiasAprobadas.has(materia.codigo)) {
                divMateria.classList.add("aprobada");
            } else if (puedeTomar(materia, materiasAprobadas)) {
                divMateria.classList.add("disponible");
            } else {
                divMateria.classList.add("bloqueada");
            }

            const numero = mapaNumeros[materia.codigo];
            const requisitosNumerados = (materia.requisitos || []).map(cod => mapaNumeros[cod]).filter(Boolean);

            divMateria.innerHTML = `
                <div class="cuadro-materia">
                  <div class="top">
                    <span class="sigla">${materia.codigo}</span>
                    <span class="numero">#${numero}</span>
                  </div>
                  <div class="nombre">${materia.nombre}</div>
                  <div class="bottom">
                    <span class="creditos">${materia.creditos} créditos</span>
                    <span class="reqs">Req: ${requisitosNumerados.join(", ") || "-"}</span>
                  </div>
                </div>
            `;

            divMateria.onclick = () => {
                if (materiasAprobadas.has(materia.codigo)) {
                    materiasAprobadas.delete(materia.codigo);
                } else {
                    materiasAprobadas.add(materia.codigo);
                }
                guardarProgreso();
                actualizarVista(data);
            };

            divNivel.appendChild(divMateria);
        });

        contenedor.appendChild(divNivel);
    });

    let aprobados = calcularCreditos(data);
    contador.textContent = `Créditos aprobados: ${aprobados} de ${totalCreditos}`;
}

function toRoman(n) {
    const map = [
        [10, 'X'], [9, 'IX'], [8, 'VIII'], [7, 'VII'], [6, 'VI'],
        [5, 'V'], [4, 'IV'], [3, 'III'], [2, 'II'], [1, 'I']
    ];
    let result = '';
    for (let [value, numeral] of map) {
        while (n >= value) {
            result += numeral;
            n -= value;
        }
    }
    return result;
}

function guardarProgreso() {
    localStorage.setItem("materiasAprobadas", JSON.stringify(Array.from(materiasAprobadas)));
}

function cargarProgreso() {
    const data = localStorage.getItem("materiasAprobadas");
    if (data) {
        materiasAprobadas = new Set(JSON.parse(data));
    }
}

function reiniciarProgreso() {
    if (confirm("¿Seguro que deseas borrar tu progreso?")) {
        materiasAprobadas.clear();
        guardarProgreso();
        actualizarVista(datosPensum);
    }
}

fetch('pensum_arquitectura_4319.json')
    .then(res => res.json())
    .then(data => {
        datosPensum = data;
        cargarProgreso();
        actualizarVista(data);
    });
