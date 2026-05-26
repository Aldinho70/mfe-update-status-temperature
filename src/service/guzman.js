import { TableUnits } from "../components/TableUnits/TableUnits.js";

// export const mapUnits = async (groups) => {
//     const name_fields_customer = ['4 ESTADO', '05 CAJA1', '05 CAJA2']
//     let units;
//     let array_units = [];

//     groups.forEach(group => {
//         units = group.units;
//     })

//     units.forEach(unit => {
//         if (Object.keys(unit.fields_customers).length) {
//             const field_customer = unit.fields_customers;
//             const array_field = [];

//             for (const key in field_customer) {
//                 if (!Object.hasOwn(field_customer, key)) continue;

//                 const _field = field_customer[key];
//                 if (name_fields_customer.includes(_field.n)) {
//                     array_field.push({
//                         [_field.n]: _field
//                     })
//                 }
//             }
//             array_units.push({
//                 unit: unit.name,
//                 array_field
//             })
//         }
//     })

//     console.log(array_units);

//     TableUnits([]);
// }

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

        if (!Object.keys(unit.fields_customers).length) return;

        const field_customer = unit.fields_customers;

        const unitData = {
            unit: unit.name
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

    TableUnits(array_units);
}