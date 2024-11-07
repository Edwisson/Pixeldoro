const formTask = document.querySelector('form');

const task = {
    nombre: '',
    sesiones: 0,
    duracion: 0,
    descanso: 0
};

let tasks = [];
let tareaActiva;
let contadorActivo = false;

const nombreTarea = document.querySelector('#nombre');
const sesiones = document.querySelector('#sesiones');
const duracion = document.querySelector('#duracion');
const descanso = document.querySelector('#descanso');
const sesion = document.querySelector('.pomodoro__sesion');

formTask.addEventListener('submit', registrarTarea);
nombreTarea.addEventListener('input', datosFormulario);
sesiones.addEventListener('input', datosFormulario);
duracion.addEventListener('input', datosFormulario);
descanso.addEventListener('input', datosFormulario);

function datosFormulario(e) {
    task[e.target.id] = e.target.value;
    console.log(task);
}

function registrarTarea(e) {
    e.preventDefault();

    if (task.nombre === '' || task.sesiones == 0 || task.duracion == 0 || task.descanso == 0) {
        alert("Error: Campos incompletos");
    } else {
        tasks.push({ ...task });  
        crearTarea(tasks.length - 1); 
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
        const tareasContainer = document.querySelector('.tareas');
        const tareasSeccion = document.createElement('div');
        tareasSeccion.classList.add('tareas__seccion');
        const tareaDiv = document.createElement('div');
        tareaDiv.classList.add('tareas__tarea');
        const tareaTitulo = document.createElement('h3');
        tareaTitulo.classList.add('no-margin', 'tarea__titulo');
        tareaTitulo.textContent = `${tasks[index].nombre} ${tasks[index].sesiones * tasks[index].duracion + (tasks[index].sesiones - 1) * tasks[index].descanso} min`;
        const botonEliminar = document.createElement('button');
        botonEliminar.classList.add('tareas__boton');
        botonEliminar.textContent = 'X';

        botonEliminar.addEventListener('click', () => {
            detener();
            tareasSeccion.remove();
            tasks.splice(index, 1);
            let tareaActual = document.querySelector('.tarea__actual');
            tareaActual.textContent = "Selecciona una tarea";
            let pomodoroTime = document.querySelectorAll('.pomodoro__time');
            pomodoroTime[0].textContent = '00';
            pomodoroTime[1].textContent = '00';
        });

        tareaDiv.appendChild(tareaTitulo);
        tareasSeccion.appendChild(tareaDiv);
        tareasSeccion.appendChild(botonEliminar);
        tareasContainer.appendChild(tareasSeccion);
    } else {
        alert('Termina todas las tareas actuales - No te sobrecargues');
    }
}

const contenedor = document.querySelector('.tareas');

contenedor.addEventListener('click', function (e) {
    const tareaSeccion = e.target.closest('.tareas__seccion');
    if (tareaSeccion) {
        const index = Array.from(contenedor.children).indexOf(tareaSeccion);
        seleccionarTarea(index);
    }
});

let pomodoroTime = document.querySelectorAll('.pomodoro__time');

function seleccionarTarea(index) {
    let tareas = document.querySelectorAll('.tareas__tarea');
    tareas.forEach(tarea => tarea.classList.remove('tareas__tarea--activa'));
    tareas[index].classList.add('tareas__tarea--activa');
    let tareaTitulo = document.querySelector('.tarea__actual');
    tareaTitulo.textContent = tasks[index].nombre;
    pomodoroTime[0].textContent = tasks[index].duracion;
    pomodoroTime[1].textContent = '00';
    sesion.textContent = 1;  // Muestra la primera sesión
    tareaActiva = { ...tasks[index], sesionActual: 1 };
    tareaActiva.index = index;
}

let intervalo;
let pausa;

async function contador() {
    if (contadorActivo === true) {
        return; // Evitar que se ejecute si el contador ya está activo
    }
    contadorActivo = true;

    while (tareaActiva.sesiones > 0 && contadorActivo) {
        let min = tareaActiva.duracion;
        let seg = 0;

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
        const tareaSecciones = contenedor.querySelectorAll('.tareas__seccion');
        tareaSecciones[tareaActiva.index].remove();
        tasks.splice(tareaActiva.index, 1);
        sesion.textContent = "Sesión completa";
    }

    contadorActivo = false;
}

let botonIniciar = document.querySelector('#iniciar');
botonIniciar.addEventListener('click', contador);

let botonDetener = document.querySelector('#detener');
botonDetener.addEventListener('click', detener);

function detener() {
    if (contadorActivo === true) {
        clearInterval(intervalo);
        pomodoroTime[0].textContent = tareaActiva.duracion < 10 ? `0${tareaActiva.duracion}` : tareaActiva.duracion;
        pomodoroTime[1].textContent = '00';
        contadorActivo = false;
    }
}
