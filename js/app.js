// Variables 


const task = {
    nombre: '',
    sesiones: 0,
    duracion: 0,
    descanso: 0
}; //Objeto Tarea el cual se usa con los datos del formulario
let tasks = []; //Array de los objetos task que reprensentan las tareas existentes
let tareaActiva; // Tarea aactiva en el pomodoro
let contadorActivo = false; //estado del pomodoro
let intervalo; //variable que almacena el contador del pomodoro
let tiempoSesion = 0
const formTask = document.querySelector('form');
const nombreTarea = document.querySelector('#nombre');    //
const sesiones = document.querySelector('#sesiones');    //   inpus del formulario
const duracion = document.querySelector('#duracion');   //
const descanso = document.querySelector('#descanso');  //

const tareasContenedor = document.querySelector('.tareas');//contenedor de las tareas 
const tareaSecciones = tareasContenedor.querySelectorAll('.tareas__seccion');

const tareaTitulo = document.querySelector('.tarea__actual'); //Titulo que identifica la tarea actual
const pomodoroTime = document.querySelectorAll('.pomodoro__time'); //reloj pomodoro
const sesion = document.querySelector('.pomodoro__sesion'); // sesion pomodoro

const botonIniciar = document.querySelector('#iniciar');  //
const botonDetener = document.querySelector('#detener'); //    Botones


// Eventos


nombreTarea.addEventListener('input', datosFormulario);  //
sesiones.addEventListener('input', datosFormulario);    //  captura la entrada de los campos del formulario en el objeto task
duracion.addEventListener('input', datosFormulario);   //
descanso.addEventListener('input', datosFormulario);  //
formTask.addEventListener('submit', registrarTarea); //Boton de crear tareas

tareasContenedor.addEventListener('click', function (e) {
    const tareaSeccion = e.target.closest('.tareas__seccion');
    if (tareaSeccion) {
        const index = Array.from(tareasContenedor.children).indexOf(tareaSeccion);
        seleccionarTarea(index);
    }
}); //Selecciona la tarea

botonIniciar.addEventListener('click', contador); //inicia el pomodoro
botonDetener.addEventListener('click', detener); //pausa la sesion



//Funciones

function datosFormulario(e) {
    task[e.target.id] = e.target.value;
    console.log(task);
}
function registrarTarea(e) {
    e.preventDefault();

    if (task.nombre === '' || task.sesiones == 0 || task.duracion == 0 || task.descanso == 0) {
        alert("Error: Campos incompletos");
    } else {
        crearTarea(tasks.length);
        console.log('Tarea registrada correctamente');
        task.nombre = '';
        task.sesiones = 0;
        task.duracion = 0;
        task.descanso = 0;
        nombreTarea.value = '';
        sesiones.value = '';
        duracion.value = '';
        descanso.value = '';
    }
}
function crearTarea(index) {
    if (tasks.length <= 4) {
        tasks.push({ ...task });
        const tareasSeccion = document.createElement('div');
        tareasSeccion.classList.add('tareas__seccion');
        const tareaDiv = document.createElement('div');
        tareaDiv.classList.add('tareas__tarea');

        const nombreTarea = document.createElement('h3');
        nombreTarea.classList.add('no-margin', 'tarea__titulo');
        nombreTarea.textContent = `${tasks[index].nombre} ${tasks[index].sesiones * tasks[index].duracion + (tasks[index].sesiones - 1) * tasks[index].descanso} min`;

        const botonEliminar = document.createElement('button');
        botonEliminar.classList.add('tareas__boton');
        botonEliminar.textContent = 'X';

        botonEliminar.addEventListener('click', () => {
            tareasSeccion.remove();
            tasks.splice(index, 1);
            tareaTitulo.textContent = "Selecciona una tarea";
            pomodoroTime[1].textContent = '00'
            pomodoroTime[0].textContent = '00'
            sesion.textContent = '00'
            detener();
        });

        tareaDiv.appendChild(nombreTarea);
        tareasSeccion.appendChild(tareaDiv);
        tareasSeccion.appendChild(botonEliminar);
        tareasContenedor.appendChild(tareasSeccion);
    } else {
        alert(tasks.length, tasks);
    }
}
function seleccionarTarea(index) {
    if (contadorActivo) {
        contadorActivo = false
        tareaActiva = { ...tasks[index], sesionActual: 1, index: index };
        pomodoroTime[0].textContent = tasks[index].duracion < 10 ? `0${tasks[index].duracion}` : tasks[index].duracion;
        pomodoroTime[1].textContent = '00';
        sesion.textContent = '00'
    }
    let tareas = document.querySelectorAll('.tareas__tarea');
    tareas.forEach(tarea => tarea.classList.remove('tareas__tarea--activa'));
    tareas[index].classList.add('tareas__tarea--activa');
    tareaTitulo.textContent = tasks[index].nombre;
    pomodoroTime[0].textContent = tasks[index].duracion < 10 ? `0${tasks[index].duracion}` : tasks[index].duracion;
    pomodoroTime[1].textContent = '00';
    sesion.textContent = '00';  // Muestra la primera sesión
    tareaActiva = { ...tasks[index], sesionActual: 1, index: index };

}

async function contador() {
    console.log(tareaActiva.sesiones)
    if (contadorActivo) return; // Si el contador ya está activo, no hacer nada
    contadorActivo = true; // Marca el contador como activo

    // Mientras haya sesiones disponibles y el contador esté activo
    while (tareaActiva.sesiones > 0 && contadorActivo) {
        // Verifica si es una sesión de trabajo o descanso, según el número de sesión actual
        if (tareaActiva.sesionActual % 2 !== 0) { // Sesión de trabajo
            // Ejecuta la sesión de trabajo
            await ejecutarSesion(tareaActiva.duracion, 'trabajo');

            if (contadorActivo) tareaActiva.sesiones -= 1;
            // Disminuye las sesiones restantes
        } else { // Sesión de descanso
            // Ejecuta la sesión de descanso
            await ejecutarSesion(tareaActiva.descanso, 'descanso');
        }

        // Solo incrementar el número de la sesión si no se ha detenido
        if (contadorActivo) {

            tareaActiva.sesionActual += 1; // Incrementa el número de sesión
            sesion.textContent = `0${tareaActiva.sesionActual}`; // Muestra el número de sesión
        }
    }

    // Cuando se acaben todas las sesiones
    if (contadorActivo) {
        pomodoroTime[1].textContent = '00'
        pomodoroTime[0].textContent = '00'
        sesion.textContent = '00'
    }
    contadorActivo = false;
    tareaActiva.sesionActual = 1; // Reinicia el contador de sesiones al finalizar
}

// Función para ejecutar una sesión de trabajo o descanso
async function ejecutarSesion(duracion, tipoSesion) {
    let min = duracion;
    let seg = 0;

    // Reinicia los minutos y segundos si se está reanudando
    if (tipoSesion === 'trabajo') {
        // Asegúrate de usar el valor correcto para la sesión actual
        pomodoroTime[0].textContent = min < 10 ? `0${min}` : min;
        pomodoroTime[1].textContent = seg < 10 ? `0${seg}` : seg;
    }

    // Lógica para contar los minutos y segundos
    while ((min > 0 || seg > 0) && contadorActivo) {
        // Actualiza la UI con el tiempo restante
        pomodoroTime[0].textContent = min < 10 ? `0${min}` : min;
        pomodoroTime[1].textContent = seg < 10 ? `0${seg}` : seg;

        await sleep(1000); // Espera 1 segundo

        if (seg === 0) {
            if (min > 0) {
                min -= 1;
                seg = 59;
            } else {
                break;
            }
        } else {
            seg -= 1;
        }
    }

    // Si el contador se detuvo, mantén el tiempo visible
    if (!contadorActivo) {
        pomodoroTime[0].textContent = tareaActiva.duracion < 10 ? `0${tareaActiva.duracion}` : tareaActiva.duracion;
        pomodoroTime[1].textContent = '00';
        sesion.textContent = '00'
    }
}

// Función para pausar el temporizador
function detener() {
    if (contadorActivo) {
        pomodoroTime[0].textContent = tareaActiva.duracion < 10 ? `0${tareaActiva.duracion}` : tareaActiva.duracion;
        pomodoroTime[1].textContent = '00';
        contadorActivo = false; // Detener el temporizador
    }
}

// Función para hacer una pausa entre cada sesión
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}