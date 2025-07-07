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

            if (materiasAprobadas.has(materia.codigo)) {
                divMateria.style.background = '#c8e6c9'; // verde
                divMateria.style.textDecoration = 'line-through';
            } else if (puedeTomar(materia, materiasAprobadas)) {
                divMateria.style.background = '#bbdefb'; // azul
            } else {
                divMateria.style.background = '#eeeeee'; // gris
                divMateria.style.color = '#999';
            }

            divMateria.innerHTML = `
                <strong>${materia.nombre}</strong><br>
                <span>${materia.codigo} (${materia.creditos} créditos)</span>
            `;

            divMateria.onclick = () => {
                if (mate
