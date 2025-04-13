const { ipcRenderer } = require('electron');

let colores = ['#E8A8B8', '#F9BEB0', '#FCE7AE', '#C09BBC', '#78C3C9'];
let coloresPredefinidos = {
    "gris-claro": "#f0efef",
    "blanco": "#FFFFFF"
};

// pedir datos al backend
async function cargarAhorros() {
    // cargar los ahorros
    const ahorros = await ipcRenderer.invoke('obtener-ahorros');

    // llamar al contenedor de html
    const contenedor = document.getElementById('ahorros-container');
    contenedor.innerHTML = '';

    // recorrer cada ahorro
    ahorros.forEach((ahorro, index) => {
        let montoMeta = ahorro.metaSoles;
        let montoActual = ahorro.montoActual;
        if (ahorro.metaDolares > 0) montoMeta = ahorro.metaDolares;
        let montoFalta = Math.max(montoMeta - montoActual, 0);

        // crear el card de la tarjeta
        const card = document.createElement('div');
        card.className = 'ahorro-card';

        // crear el titulo
        const titulo = document.createElement('div');
        titulo.className = 'ahorro-card-titulo';
        titulo.style.backgroundColor = colores[index];
        titulo.innerText = `${ahorro.nombre}`;

        // crear el body 
        const body = document.createElement('div');
        body.className = 'ahorro-card-body';

        // crear el anillo
        const canvas = document.createElement('canvas');
        canvas.id = `anillo-${index}`;
        canvas.className = 'ahorro-card-anillo';

        // crear div de datos
        const datos = document.createElement('div');
        datos.className = 'ahorro-card-datos';
         
        // crear los montos
        const montos = document.createElement('div');
        montos.innerHTML = `📈 ${montoActual.toLocaleString('en-US')} <br> 🎯 ${montoMeta.toLocaleString('en-US')}`;

        datos.appendChild(montos);

        body.appendChild(canvas);
        body.appendChild(datos);

        card.appendChild(titulo)
        card.appendChild(body);

        contenedor.appendChild(card);

        // crear el grafico
        const ctx = canvas.getContext('2d');

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [montoFalta, montoActual],
                    backgroundColor: [
                        coloresPredefinidos['gris-claro'],
                        colores[index]
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                cutout: '70%',
                plugins: {
                    tooltip: {enabled: false},
                    legend: {display: false}
                }
            }
        });
    });

}

async function cargarGastos() {
    // cargar los gastos
    const gastos = await ipcRenderer.invoke('obtener-gastos');

    // llamar al contenedor de html
    const contenedor = document.getElementById('gastos-lista');
    contenedor.innerHTML = '';

    gastos.forEach((gasto, index) => {
        const row = document.createElement('div');

        // jalar los datos
        const descripcion = document.createElement('div');
        descripcion.innerText = `${gasto.descripcion}`;

        row.appendChild(descripcion);
        
        contenedor.appendChild(row);
    });
}

async function cargarCategorias() {
    // cargar los gastos
    const cats = await ipcRenderer.invoke('obtener-categorias');

    // llamar al contenedor de html
    const contenedor = document.getElementById('gastos-lista');
    contenedor.innerHTML = '';

    gastos.forEach((gasto, index) => {
        const row = document.createElement('div');

        // jalar los datos
        const descripcion = document.createElement('div');
        descripcion.innerText = `${gasto.descripcion}`;

        row.appendChild(descripcion);
        
        contenedor.appendChild(row);
    });
}

cargarAhorros();
cargarGastos();
//cargarCategorias();

// guardar el ahorro en el backend
async function guardarGastos() {
    // leer valores del input
    const fecha = document.getElementById('fecha-input').value;
    const descripcion = document.getElementById('descripcion-input').value;
    const montoSoles = parseFloat(document.getElementById('monto-soles-input').value) || 0;
    const montoDolares = parseFloat(document.getElementById('monto-dolares-input').value) || 0;
    const categoria = document.getElementById('categoria-input').value;

    // crear el gasto
    const nuevoGasto = {
        fecha,
        descripcion,
        montoSoles,
        montoDolares,
        categoria
    };

    // mandar el gasto al back
    await ipcRenderer.invoke('guardar-gastos', nuevoGasto);

    // recargar la lista
    const contenedor = document.getElementById('gastos-lista');
    const row = document.createElement('div');
    const descripcionDiv = document.createElement('div');
    descripcionDiv.innerText = `${nuevoGasto.descripcion}`;
    row.appendChild(descripcionDiv);
    contenedor.appendChild(row);

    //limpiar los campos después de guardar
    document.getElementById('fecha-input').value = '';
    document.getElementById('descripcion-input').value = '';
    document.getElementById('monto-soles-input').value = '';
    document.getElementById('monto-dolares-input').value = '';
    document.getElementById('categoria-input').value = '';
}