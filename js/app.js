const formTask = document.querySelector('form');

const task = {
    nombre: '',
    sesiones: 0,
    duracion: 0,
    descanso: 0
};

let tasks = [];

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

function crearTarea(index) {  // Línea cambiada: agregar `index` como parámetro
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
            console.log(`Tarea eliminada: ${tasks[index].nombre}`);
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
