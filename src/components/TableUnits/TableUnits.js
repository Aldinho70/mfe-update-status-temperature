import { Table } from "../components/Table/Table.js"
import { Modal } from "../components/Modal/Modal.js";
import { TableCajas } from "../TableCajas/TableCajas.js";

const movedUnits = [];

export const TableUnits = (data_units = []) => {

    const headers = [
        'Frio',
        'Seco',
        'Sin operacion'
    ];

    const grouped = {
        REFRI: [],
        SECO: [],
        0: []
    };

    // Agrupar unidades
    data_units.forEach(unit => {

        const status = unit['4 ESTADO']?.v;

        if (grouped[status] !== undefined) {
            grouped[status].push(unit);
        }

    });

    // Crear body
    const body = `
        <tr>

            ${createColumn(grouped.REFRI, 'REFRI')}

            ${createColumn(grouped.SECO, 'SECO')}

            ${createColumn(grouped[0], '0')}

        </tr>
    `;

    // Render tabla
    $("body").append(
        Table({
            headers,
            body
        })
    );

    // Inicializar drag and drop
    initDragAndDrop();

};

const createColumn = (units = [], status = '') => {

    return `
        <td class="drop-zone border-4 border-dark" data-status="${status}">

            ${units.length
            ? units.map(unit => createUnitCard(unit, status)).join('')
            : '<div>Sin unidades</div>'
        }

        </td>
    `;
};

const createUnitCard = (unit, status) => {

    const caja = unit["05 CAJA1"];
    const field_id = unit["4 ESTADO"].id;

    const safeId = unit.unit
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9_-]/g, '');

    return `
        <div 
            class="unit-card d-flex justify-content-between align-items-center p-2 mb-2 border rounded bg-white shadow-sm"
            draggable="true"
            id="card-root-${safeId}"
            data-unit="${unit.unit}"
            data-unit_id="${unit.id}"
            data-field_id="${field_id}"
            data-field-id-caja=${caja.id}
            data-status="${status}"
        >

            <!-- LEFT -->
            <div class="d-flex align-items-center gap-2">

                <img 
                    class="icon rounded"
                    src="${unit.icon}"
                    alt="icon"
                    width="32"
                />

                <div class="d-flex flex-column">

                    <span class="fw-semibold">
                        ${unit.unit}
                    </span>

                    <small class="text-muted">
                        Tractor asignado
                    </small>

                </div>

            </div>

            <!-- RIGHT -->
            <div class="d-flex flex-column align-items-end">

                <small class="text-muted mb-1">
                    Caja asignada
                </small>

                <button class="btn btn-sm btn-warning caja-btn" data-unit="${unit.unit}" onClick="updateCaja('${safeId}')">

                    <i class="bi bi-truck me-1"></i>

                    <span id="root-button-caja-asignada-${unit.id}" >${caja?.v || 'Asignar caja'}</span>

                </button>

            </div>

        </div>
    `;
};

const initDragAndDrop = () => {

    let dragged = null;

    // Drag start
    document.querySelectorAll('.unit-card').forEach(card => {

        card.addEventListener('dragstart', () => {
            dragged = card;
        });

    });

    // Drop zones
    document.querySelectorAll('.drop-zone').forEach(zone => {

        zone.addEventListener('dragover', e => {
            e.preventDefault();
        });

        zone.addEventListener('drop', () => {

            if (!dragged) return;

            zone.appendChild(dragged);

            const unit = dragged.dataset.unit;
            const unit_id = dragged.dataset.unit_id;
            const field_id = dragged.dataset.field_id;

            const oldStatus = dragged.dataset.status;

            const newStatus = zone.dataset.status;

            // Evitar duplicados
            const exists = movedUnits.find(
                item => item.unit === unit
            );

            if (exists) {

                exists.newStatus = newStatus;

            } else {

                movedUnits.push({
                    unit,
                    unit_id,
                    field_id,
                    oldStatus,
                    newStatus
                });

            }

            // Actualizar status actual
            dragged.dataset.status = newStatus;

        });

    });

    // Guardar cambios
    $('#saveChanges').on('click', async () => {

        try {

            const responses = await Promise.allSettled(

                movedUnits.map(_data => {

                    const payload = {
                        id_unit: _data.unit_id,
                        field_id: _data.field_id,
                        field_name: '4 ESTADO',
                        field_new_value: _data.newStatus,
                        unit_name: _data.unit
                    };

                    return WialonService.updateCustomField(payload);

                })

            );

            const success = [];
            const failed = [];

            responses.forEach(r => {

                if (r.status === 'fulfilled') {

                    success.push(r.value.unit_name);

                } else {

                    failed.push(r.reason);

                }

            });

            let message = '';

            if (success.length) {

                message += `✅ Unidades actualizadas:\n\n`;
                message += success.join('\n');
                message += '\n\n';

            }

            if (failed.length) {

                message += `❌ Unidades con error:\n\n`;
                message += failed.join('\n');

            }

            alert(message);
            window.location.reload();

        } catch (error) {

            console.log(error);

        }

    });

};

const updateCaja = (unit_selected) => {
    const card = $(`#card-root-${unit_selected}`);
    const payload = {
        unit: card.data('unit'),
        unit_id: card.data('unit_id'),
        field_id_caja: card.data('field-id-caja'),
        field_name_caja: '05 CAJA1',
    }

    TableCajas( payload );
}
window.updateCaja = updateCaja;