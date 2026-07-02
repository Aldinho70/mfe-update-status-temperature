// export const Modal = ( data ) => {

//     const html_modal = `
//         <div class="modal bg-dark" tabindex="-1" id="root-modal">
//             <div class="modal-dialog ${ data?.modal_size || 'modal-lg'} ">
//                 <div class="modal-content">
//                     <div class="modal-header">
//                         <h5 class="modal-title">${ data?.title || 'Sin titulo asignado' }</h5>
//                         <button type="button" class="btn-close" aria-label="Close" onClick="close_modal()" ></button>
//                     </div>
//                     <div class="modal-body">
//                         ${ data?.body || 'Sin datos para mostrar' }
//                     </div>
//                     <div class="modal-footer">
//                         <button type="button" class="btn btn-secondary" onClick="close_modal()">Cerrar</button>
//                         ${ (data?.function_button)
//                             ? `<button type="button" class="btn btn-primary" onClick="${data?.function_button || alert('Sin funcion')}" >Guardar</button>`
//                             : ``
//                         }
//                     </div>
//                 </div>
//             </div>
//         </div>
//     `
//     $("body").append( html_modal );
//     $("#root-modal").show();
// }

// const close_modal = () => {
//     $( "#root-modal" ).hide();
//     $( "#root-modal" ).remove();
// }
// window.close_modal = close_modal;
let modal_counter = 0;

export const Modal = (data) => {

    modal_counter++;
    const modal_id = `root-modal-${modal_counter}`;
    const z_base = 1050 + (modal_counter * 20);

    const html_modal = `
        <div class="modal" tabindex="-1" id="${modal_id}" style="z-index:${z_base + 10}; display:block; background: transparent;">
            <div class="modal-dialog ${data?.modal_size || 'modal-lg'}">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${data?.title || 'Sin titulo asignado'}</h5>
                        <button type="button" class="btn-close" aria-label="Close" onClick="close_modal('${modal_id}')"></button>
                    </div>
                    <div class="modal-body">
                        ${data?.body || 'Sin datos para mostrar'}
                    </div>
                    <div class="modal-footer">
                        ${(data?.footer)
                            ? `<button type="button" class="btn btn-secondary" onClick="close_modal('${modal_id}')">Cerrar</button>`
                            : ``
                        }
                        
                        ${(data?.function_button)
                            ? `<button type="button" class="btn btn-primary" onClick="${data?.function_button}">Guardar</button>`
                            : ``
                        }
                    </div>
                </div>
            </div>
        </div>
    `;

    // Backdrop independiente, con su propio z-index (debajo del modal que acabamos de crear)
    const backdrop_html = `<div class="modal-backdrop fade show" id="backdrop-${modal_id}" style="z-index:${z_base + 5}"></div>`;

    $("body").append(backdrop_html);
    $("body").append(html_modal);
    $("body").addClass("modal-open"); // necesario para el scroll lock de Bootstrap

    return modal_id;
}

export const close_modal = (modal_id) => {
    if (!modal_id) {
        const ultimo = $(".modal").last();
        modal_id = ultimo.attr("id");
    }

    if (!modal_id) return;

    if (window.modalRefreshIntervals?.[modal_id]) {
        const modalState = window.modalRefreshIntervals[modal_id];

        if (modalState.refreshId) {
            clearInterval(modalState.refreshId);
        }

        if (modalState.countdownId) {
            clearInterval(modalState.countdownId);
        }

        delete window.modalRefreshIntervals[modal_id];
    }

    $(`#${modal_id}`).remove();
    $(`#backdrop-${modal_id}`).remove();

    // Si ya no queda ningún modal abierto, quitamos el scroll lock
    if ($(".modal").length === 0) {
        $("body").removeClass("modal-open");
    }
}

window.close_modal = close_modal; // exponer global para los onClick inline