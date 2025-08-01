let materiasAprobadas = new Set();
let totalCreditos = 167;
let datosPensum = null;
let mapaNumeros = {};

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

  const años = Math.ceil(data.niveles.length / 2);
  const tituloAños = document.createElement('div');
  tituloAños.className = 'grid-anual';
  for (let i = 1; i <= años; i++) {
    const div = document.createElement('div');
    div.className = 'anio';
    div.textContent = `Año ${i}`;
    tituloAños.appendChild(div);
  }
  contenedor.appendChild(tituloAños);

  const filaSemestres = document.createElement('div');
  filaSemestres.className = 'grid-semestres';

  data.niveles.forEach(nivel => {
    const divSemestre = document.createElement('div');
    divSemestre.className = 'semestre';

    const h4 = document.createElement('h4');
    h4.textContent = toRoman(nivel.nivel);
    divSemestre.appendChild(h4);

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

      divSemestre.appendChild(divMateria);
    });

    filaSemestres.appendChild(divSemestre);
  });

  contenedor.appendChild(filaSemestres);

  let aprobados = calcularCreditos(data);
  let totalMaterias = 0;
  data.niveles.forEach(n => totalMaterias += n.materias.length);
  let materiasOk = materiasAprobadas.size;
  let porcentajeCreditos = Math.round((aprobados / totalCreditos) * 100);
  let porcentajeMaterias = Math.round((materiasOk / totalMaterias) * 100);
  contador.innerHTML = `
    Créditos aprobados: <strong>${aprobados}</strong> de <strong>${totalCreditos}</strong> (${porcentajeCreditos}%)<br>
    Materias aprobadas: <strong>${materiasOk}</strong> de <strong>${totalMaterias}</strong> (${porcentajeMaterias}%)
  `;
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
