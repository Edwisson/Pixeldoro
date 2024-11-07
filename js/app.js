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
    let tareas = document.querySelectorAll('.tareas__tarea');
    tareas.forEach(tarea => tarea.classList.remove('tareas__tarea--activa'));
    tareas[index].classList.add('tareas__tarea--activa');
    tareaTitulo.textContent = tasks[index].nombre;
    pomodoroTime[0].textContent = tasks[index].duracion;
    pomodoroTime[1].textContent = '00';
    sesion.textContent = 1;  // Muestra la primera sesión
    tareaActiva = { ...tasks[index], sesionActual: 1, index: index };
}
async function contador() {
    if (contadorActivo === true) {
        return; // Evitar que se ejecute si el contador ya está activo
    }
    contadorActivo = true;

    while (tareaActiva.sesiones > 0 && contadorActivo) {
        let min = tareaActiva.duracion;
        let seg = 0;
        let tiempoSesion = 0

        tiempoTranscurrido = setInterval(()=> tiempoSesion += 1, 1000)
        // Actualiza la sesión en pantalla
        sesion.textContent = `${tareaActiva.sesionActual}`;

        // Temporizador de trabajo
        intervalo = setInterval(() => {
            if (!contadorActivo) { // Si se pausa
                clearInterval(intervalo);
                return;
            }

            if (seg === 0) {
                if (min === 0) {
                    clearInterval(intervalo);
                    return;
                }
                min -= 1;
                seg = 59;
            } else {
                seg -= 1;
            }

            pomodoroTime[0].textContent = min < 10 ? `0${min}` : min;
            pomodoroTime[1].textContent = seg < 10 ? `0${seg}` : seg;
            console.log(tiempoSesion)
        }, 1000);

        // Espera hasta que se complete el tiempo de trabajo o se pause
        await new Promise(resolve => setTimeout(resolve, tareaActiva.duracion * 60 * 1000));
        clearInterval(intervalo);

        // Verifica si quedan más sesiones para aplicar descanso
        tareaActiva.sesiones -= 1;
        tareaActiva.sesionActual += 1;

        if (tareaActiva.sesiones > 1 && contadorActivo) { // Descanso si hay sesiones restantes
            min = tareaActiva.descanso;
            seg = 0;
            sesion.textContent = `Descanso (${tareaActiva.descanso} min)`;

            intervalo = setInterval(() => {
                if (!contadorActivo) { // Pausa el descanso
                    clearInterval(intervalo);
                    return;
                }

                if (seg === 0) {
                    if (min === 0) {
                        clearInterval(intervalo);
                        return;
                    }
                    min -= 1;
                    seg = 59;
                } else {
                    seg -= 1;
                }

                pomodoroTime[0].textContent = min < 10 ? `0${min}` : min;
                pomodoroTime[1].textContent = seg < 10 ? `0${seg}` : seg;

            }, 1000);

            await new Promise(resolve => setTimeout(resolve, tareaActiva.descanso * 60 * 1000));
            clearInterval(intervalo);
        }
    }

    // Al terminar todas las sesiones, se elimina la tarea
    if (tareaActiva.sesiones === 0) {

        tareaSecciones[tareaActiva.index].remove();
        tasks.splice(tareaActiva.index, 1);
        sesion.textContent = "Sesión completa";
    }

    contadorActivo = false;
}
function detener() {
    if (contadorActivo === true) {
        clearInterval(intervalo);
        pomodoroTime[0].textContent = tareaActiva.duracion < 10 ? `0${tareaActiva.duracion}` : tareaActiva.duracion;
        pomodoroTime[1].textContent = '00';
        contadorActivo = false;
    }
}
