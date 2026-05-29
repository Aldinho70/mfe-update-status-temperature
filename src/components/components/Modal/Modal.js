export const Modal = ( data ) => {
    
    const html_modal = `
        <div class="modal" tabindex="-1" id="root-modal">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${ data?.title || 'Sin titulo asignado' }</h5>
                        <button type="button" class="btn-close" aria-label="Close" onClick="close_modal()" ></button>
                    </div>
                    <div class="modal-body">
                        ${ data?.body || 'Sin datos para mostrar' }
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onClick="close_modal()">Cerrar</button>
                        <button type="button" class="btn btn-primary">Guardar</button>
                    </div>
                </div>
            </div>
        </div>
    `
    $("body").append( html_modal );
    $("#root-modal").show();
}

const close_modal = () => {
    $( "#root-modal" ).hide();
    $( "#root-modal" ).remove();
}
window.close_modal = close_modal;