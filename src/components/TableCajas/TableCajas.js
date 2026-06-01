import { Modal } from "../components/Modal/Modal.js";
import { Select, initSelect2 } from "../components/Select/Select.js";

let object_unit_selected;
const grupos_cajas = ["GUZMAN CAJAS DOBLES", "GUZMAN IRAPUATO CAJAS"]

export const TableCajas = async (_unit_selected) => {
    object_unit_selected = _unit_selected;
    const array_data = [];
    const groups_cajas = await WialonService.loadGroupsWithUnits(grupos_cajas)
    const cajas = [...groups_cajas[0].units, ...groups_cajas[1].units]

    cajas.forEach(caja => {
        array_data.push({ unit: caja.name })
    })

    const html_select = Select({ options: array_data });
    Modal({ title: 'Asignar una caja a tracto', body: html_select, function_button: "update_caja_custom_field()" });
    initSelect2();
}

const update_caja_custom_field = async () => {

    console.log( object_unit_selected );
    
    try {

        const new_value_caja = $("#root-select").val();

        const payload = {
            // unit_name: object_unit_selected.unit,
            id_unit: object_unit_selected.unit_id,
            field_id: object_unit_selected.field_id_caja,
            field_name: object_unit_selected.field_name_caja,
            field_new_value: new_value_caja,
        };

        console.log(payload);
        
        const responses = await Promise.allSettled([
            WialonService.updateCustomField(payload)
        ]);

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
            $(`#root-button-caja-asignada-${object_unit_selected.unit_id}` ).html(new_value_caja)
            close_modal();
        }

        if (failed.length) {
            message += `❌ Unidades con error:\n\n`;
            message += failed.join('\n');
        }

        alert(message);

    } catch (error) {

        console.log(error);

    }

};

window.update_caja_custom_field = update_caja_custom_field;