fetch('pensum_arquitectura_4319.json')
  .then(res => res.json())
  .then(data => {
    const contenedor = document.getElementById('malla');
    data.niveles.forEach(nivel => {
        const divNivel = document.createElement('div');
        divNivel.className = 'nivel';
        const titulo = document.createElement('h3');
        titulo.textContent = 'Nivel ' + nivel.nivel;
        divNivel.appendChild(titulo);

        nivel.materias.forEach(materia => {
            const divMateria = document.createElement('div');
            divMateria.className = 'materia';
            divMateria.innerHTML = `<strong>${materia.nombre}</strong><br><span>${materia.codigo} (${materia.creditos} créditos)</span>`;
            divNivel.appendChild(divMateria);
        });

        contenedor.appendChild(divNivel);
    });
  });
