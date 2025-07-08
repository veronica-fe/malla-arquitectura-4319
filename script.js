let materiasAprobadas = new Set();
let totalCreditos = 167;
let datosPensum = null;

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

    data.niveles.forEach(nivel => {
        const divNivel = document.createElement('div');
        divNivel.className = 'nivel';
        const titulo = document.createElement('h3');
        titulo.textContent = 'Nivel ' + nivel.nivel;
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

            divMateria.innerHTML = `
                <strong>${materia.nombre}</strong><br>
                <span>${materia.codigo} (${materia.creditos} créditos)</span>
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

document.addEventListener('DOMContentLoaded', () => {
    const contador = document.createElement('div');
    contador.id = 'contador-creditos';
    contador.style.margin = '10px 0';
    contador.style.fontWeight = 'bold';
    document.body.insertBefore(contador, document.getElementById('malla'));

    const botonReset = document.createElement('button');
    botonReset.textContent = '🔄 Reiniciar progreso';
    botonReset.style.margin = '10px 0';
    botonReset.onclick = reiniciarProgreso;
    document.body.insertBefore(botonReset, contador);
});
