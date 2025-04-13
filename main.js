// en el main tenemos el back basicamente

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 1080,
        height: 750,
        autoHideMenuBar: true,
        resizable: false,
        frame: false,
        movable: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');
});


/************************* JSON logic **************************/

// ruta al archivo json
const ahorrosPath = path.join(__dirname, 'data', 'ahorros.json');
const catPath = path.join(__dirname, 'data', 'categorias.json');
const gastosPath = path.join(__dirname, 'data', 'gastos.json');
const ingresosPath = path.join(__dirname, 'data', 'ingresos.json');

// leer el archivo
function leerAhorros() {
    const datos = fs.readFileSync(ahorrosPath, 'utf-8');
    return JSON.parse(datos);
}

function leerCategorias() {
    const datos = fs.readFileSync(catPath, 'utf-8');
    return JSON.parse(datos);
}

function leerGastos() {
    const datos = fs.readFileSync(gastosPath, 'utf-8');
    return JSON.parse(datos);
}

function leerIngresos() {
    const datos = fs.readFileSync(ingresosPath, 'utf-8');
    return JSON.parse(datos);
}


// guardar datos
function guardarAhorros(nuevosDatos) {
    fs.writeFileSync(ahorrosPath, JSON.stringify(nuevosDatos, null, 2), 'utf-8');
}

function guardarCategorias(nuevosDatos) {
    fs.writeFileSync(catPath, JSON.stringify(nuevosDatos, null, 2), 'utf-8');
}

function guardarGastos(nuevosDatos) {
    fs.writeFileSync(gastosPath, JSON.stringify(nuevosDatos, null, 2), 'utf-8');
}

function guardarIngresos(nuevosDatos) {
    fs.writeFileSync(ingresosPath, JSON.stringify(nuevosDatos, null, 2), 'utf-8');
}



/********************************* IPC MAIN **********************/

// escuchar cuando el front pide los datos
ipcMain.handle('obtener-ahorros', ()=> {
    return leerAhorros();
});

ipcMain.handle('obtener-gastos', ()=> {
    return leerGastos();
});


// escuchar cuando el front manda datos nuevos
ipcMain.handle('guardar-ahorros', (event, nuevosDatos) => {
    guardarAhorros(nuevosDatos);
});

ipcMain.handle('guardar-gastos', (event, nuevosDatos) => {
    const gastosExistentes = leerGastos();
    gastosExistentes.push(nuevosDatos);
    guardarGastos(gastosExistentes);
});