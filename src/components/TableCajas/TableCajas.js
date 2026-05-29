import { Modal } from "../components/Modal/Modal.js";
import { Select, initSelect2 } from "../components/Select/Select.js";

const grupos_cajas = ["GUZMAN CAJAS DOBLES", "GUZMAN IRAPUATO CAJAS"]

export const TableCajas = async () => {
    const array_data = [];
    const groups_cajas = await WialonService.loadGroupsWithUnits( grupos_cajas )
    const cajas = [ ...groups_cajas[0].units, ...groups_cajas[1].units ]
    
    cajas.forEach( caja => {
        array_data.push( {unit: caja.name} )
    } )
    
    const html_select = Select( { options: array_data } );
    Modal( { title: 'Asignar una caja a tracto', body: html_select } );
    initSelect2();
}