export const addNotificationToast = (/*unit, data*/) => {
    console.log( 'me llego' );
    
    $("#root-notification").html(
        `<div class="toast-header">
            <img src="${unit.info.icon}" class="rounded me-2" width="45" alt="...">
            <strong class="me-auto fs-4">${unit.info.nameUnit}</strong>
            <small>Ahora mismo</small>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body fs-5">
            ${data.name}.
        </div>`
    )
}
window.addNotificationToast = addNotificationToast();