export const Select = (data) => {
    return `
        <select class="form-select" id="root-select">
            <option selected>Selecciona una caja</option>
            <option selected value="">Sin caja</option>
            ${ data?.options
                ? data.options.map( caja => `<option value="${caja.unit}">${caja.unit}</option>`)
                : ``
            }
        </select>`
}

export const initSelect2 = ( modalId = 'root-modal-1' ) => {
    $('#root-select').select2({
        dropdownParent: $(`#${modalId}`)
    });
}