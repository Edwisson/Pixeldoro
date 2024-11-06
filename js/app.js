const formTask = document.querySelector('form');

const task = {
    nombre: '',
    sesiones: 0,
    duracion: 0,
    descanso: 0
};

let tasks = [];

let tareaActiva;

const nombreTarea = document.querySelector('#nombre');
const sesiones = document.querySelector('#sesiones');
const duracion = document.querySelector('#duracion');
const descanso = document.querySelector('#descanso');

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
        tasks.push({ ...task });  // Línea cambiada: agregar una copia de `task` a `tasks`
        crearTarea(tasks.length - 1);  // Línea cambiada: pasar el índice de la tarea a crear
        console.log('Tarea registrada correctamente');

        // Restablecer los valores de `task` y el formulario
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

        // Crear el contenedor de la sección de la tarea
        const tareasSeccion = document.createElement('div');
        tareasSeccion.classList.add('tareas__seccion');

        // Crear el contenedor de la tarea
        const tareaDiv = document.createElement('div');
        tareaDiv.classList.add('tareas__tarea');

        // Crear el título de la tarea
        const tareaTitulo = document.createElement('h3');
        tareaTitulo.classList.add('no-margin', 'tarea__titulo');
        tareaTitulo.textContent = `${tasks[index].nombre} ${tasks[index].sesiones * tasks[index].duracion + (tasks[index].sesiones - 1) * tasks[index].descanso} min`;

        // Crear el botón de eliminación
        const botonEliminar = document.createElement('button');
        botonEliminar.classList.add('tareas__boton');
        botonEliminar.textContent = 'X';

        // Agregar un evento de clic al botón para eliminar la tarea
        botonEliminar.addEventListener('click', () => {
            tareasSeccion.remove();
            tasks.splice(index, 1);  // Línea cambiada: eliminar la tarea del array `tasks`
            console.log(`Tarea eliminada: ${tasks[index] ? tasks[index].nombre : 'desconocida'}`);
            let tareaActual = document.querySelector('.tarea__actual')
            tareaActual.textContent = "Selecciona una tarea"
            let pomodoroTime = document.querySelectorAll('.pomodoro__time')
            pomodoroTime[0].textContent = '00'
            pomodoroTime[1].textContent = '00'
        });

        // Agregar el título de la tarea al contenedor de la tarea
        tareaDiv.appendChild(tareaTitulo);

        // Agregar la tarea y el botón de eliminar al contenedor principal
        tareasSeccion.appendChild(tareaDiv);
        tareasSeccion.appendChild(botonEliminar);

        // Finalmente, agregar la tarea al contenedor principal
        tareasContainer.appendChild(tareasSeccion);
    } else {
        alert('Termina todas las tareas actuales - No te sobrecargues');
    }
}

// Seleccionar el contenedor de las tareas
const contenedor = document.querySelector('.tareas');


contenedor.addEventListener('click', function (e) {

    const tareaSeccion = e.target.closest('.tareas__seccion');

    if (tareaSeccion) {

        const index = Array.from(contenedor.children).indexOf(tareaSeccion);
        seleccionarTarea(index)
    }
});

let pomodoroTime = document.querySelectorAll('.pomodoro__time')

function seleccionarTarea(index) {
    let tareas = document.querySelectorAll('.tareas__tarea')
    tareas.forEach(tarea => tarea.classList.remove('tareas__tarea--activa'));
    tareas[index].classList.add('tareas__tarea--activa')
    let tareaTitulo = document.querySelector('.tarea__actual')
    tareaTitulo.textContent = tasks[index].nombre

    pomodoroTime[0].textContent = tasks[index].duracion
    pomodoroTime[1].textContent = '00'
    tareaActiva = tasks[index]
    tareaActiva.index = index
}

async function contador() {
    while (tareaActiva.sesiones != 0) {
        let min = tareaActiva.duracion; // Declarar `min` fuera del intervalo para persistir su valor
        let seg = 0; // Iniciar segundos en 0
        const intervalo = setInterval(() => {
            console.log("Ejecutando acción en el intervalo");

            if (seg === 0) {
                min -= 1; // Reducir los minutos
                seg = 59; // Reiniciar los segundos a 59
            } else {
                seg -= 1; // Reducir los segundos
            }

            // Actualizar el DOM con los valores actuales de `min` y `seg`
            pomodoroTime[0].textContent = min < 10 ? `0${min}` : min
            pomodoroTime[1].textContent = seg < 10 ? `0${seg}` : seg

        }, 1000);

        await new Promise(resolve => setTimeout(resolve, tareaActiva.duracion * 60 * 1000));
        clearInterval(intervalo);
        tareaActiva.sesiones -= 1// Detener el intervalo si llega a 0 minutos y 0 segundos
    }
    if (tareaActiva.sesiones == 0) {
        const tareaSecciones = contenedor.querySelectorAll('.tareas__seccion')
        tareaSecciones[tareaActiva.index].remove()
        tasks.splice(tareaActiva.index, 1);
    }
}

// Corrección en el selector del botón
let botonIniciar = document.querySelector('#iniciar');
botonIniciar.addEventListener('click', contador);
