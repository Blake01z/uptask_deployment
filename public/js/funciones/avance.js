import Swal from "sweetalert2";

export const actualizarAvance = () =>{
    //seleccionar las tareas exitentes
    const tareas = document.querySelectorAll('li.tarea');

    if(tareas.length){
        //seleccionar las tareas completas
        const tareasCompletas = document.querySelectorAll('i.completo');

        //calcular el avence
        const avance = Math.round ((tareasCompletas.length / tareas.length) * 100);

        //mostrar el avance
        const porcentaje = document.querySelector('#porcentaje');
        porcentaje.style.width = avance + '%';


        if(avance === 100){
            Swal.fire(
                'Completaste el Proyecto',
                'Felicidades Has completado tus tareas',
                'success'
            )
        }
    }
}