const { ipcRenderer } = require('electron');

// pedir datos al backend
async function cargarAhorros() {
    // cargar los ahorros
    const ahorros = await ipcRenderer.invoke('obtener-ahorros');

    // llamar al contenedor de html
    const contenedor = document.getElementById('ahorros-container');
    contenedor.innerHTML = '';

    // renderizar el card para cada ahorro
    ahorros.forEach(ahorro => {
        const div = document.createElement('div');
        div.className = 'ahorro-card';
        div.innerText = `${ahorro.nombre}: S/. ${ahorro.metaSoles.toFixed(2)}`;
        contenedor.appendChild(div);
    });

}

//cargarAhorros();