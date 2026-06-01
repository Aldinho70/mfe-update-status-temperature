import { TableUnits } from "../components/TableUnits/TableUnits.js";
import { hideLoader } from "../components/components/Loader/Loader.js";

export const mapUnits = async (groups) => {

    const name_fields_customer = [
        '4 ESTADO',
        '05 CAJA1',
        '05 CAJA2'
    ];

    let array_units = [];
    let units = [];

    groups.forEach(group => {
        units.push(...group.units);
    });

    units.forEach(unit => {
        // console.log(unit)
        if (!Object.keys(unit.fields_customers).length) return;

        const field_customer = unit.fields_customers;

        const unitData = {
            id: unit.id,
            unit: unit.name,
            icon: unit.icon,
        };

        for (const key in field_customer) {

            if (!Object.hasOwn(field_customer, key)) continue;

            const _field = field_customer[key];

            if (name_fields_customer.includes(_field.n)) {
                unitData[_field.n] = _field;
            }
        }

        array_units.push(unitData);
    });

    // console.log(array_units);

    hideLoader();
    TableUnits(array_units);
    
}