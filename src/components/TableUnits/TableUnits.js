import { Table } from "../components/Table/Table.js"

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

    data_units.forEach(unit => {

        const status = unit['4 ESTADO']?.v;

        console.log(status);
        
        if (grouped[status] !== undefined) {
            grouped[status].push(unit.unit);
        }
    });

    const body = `
        <tr>

            <td>
                ${grouped.REFRI.length
                    ? grouped.REFRI.map(unit => `<div>${unit}</div>`).join('')
                    : 'Sin unidades'
                }
            </td>

            <td>
                ${grouped.SECO.length
                    ? grouped.SECO.map(unit => `<div>${unit}</div>`).join('')
                    : 'Sin unidades'
                }
            </td>

            <td>
                ${grouped[0].length
                    ? grouped[0].map(unit => `<div>${unit}</div>`).join('')
                    : 'Sin unidades'
                }
            </td>

        </tr>
    `;

    $("body").append(
        Table({
            headers,
            body
        })
    );
}