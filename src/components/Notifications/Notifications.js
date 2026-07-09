import { Modal } from "../components/Modal/Modal.js";
// export const addNotificationToast = (/*unit, data*/) => {
//     console.log('me llego');

//     $("#root-notification").html(
//         `<div class="toast-header">
//             <img src="${unit.info.icon}" class="rounded me-2" width="45" alt="...">
//             <strong class="me-auto fs-4">${unit.info.nameUnit}</strong>
//             <small>Ahora mismo</small>
//             <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
//         </div>
//         <div class="toast-body fs-5">
//             ${data.name}.
//         </div>`
//     )
// }
// window.addNotificationToast = addNotificationToast();

export const showNotifications = () => {
    const array_notifications = WialonService.getArrayNotifications();
    console.log('array_notifications', array_notifications);
    NotifacationsBox(array_notifications);
}

const Notification = ({ unit_name, data }) => {
    return `
        <div class="card border-0 shadow-sm mb-3 border-start border-4 border-primary" style="border-radius: 0.75rem;">
            <div class="card-body d-flex align-items-start gap-3 p-3">
                <div class="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width: 42px; height: 42px;">
                    <i class="bi bi-bell-fill"></i>
                </div>
                <div class="flex-grow-1">
                    <div class="d-flex justify-content-between align-items-center">
                        <h6 class="card-title mb-1 fw-semibold text-dark">${unit_name}</h6>
                        <button type="button" class="btn-close btn-sm" aria-label="Close"></button>
                    </div>
                    <p class="card-text text-secondary mb-0 small">${data.txt}</p>
                </div>
            </div>
        </div>`
}

const NotifacationsBox = (array_notifications) => {
    let notifications_list = '';

    array_notifications.map((notification) => {
        const { unit_name, data } = notification;
        notifications_list +=  Notification({unit_name, data});

    });

    const object_modal = Modal({ 
        title: `Notificaciones recientes (${array_notifications.length})`,
        body: notifications_list,
    });
}

export const updateNotificationsBadge = (count) => {
    $( ".cont_notification " ).text( count );
}

// const array_notifications = [
//     {
//         "unit_id": 19703961,
//         "unit_name": "076 - I",
//         "data": {
//             "t": 1783627323,
//             "f": 896,
//             "tns": 1783627323000000000,
//             "tp": "unm",
//             "name": "UNIDAD DETENIDA  GRAL",
//             "txt": "076 - I ha salido de la(s) geocerca(s). sensor %SENSOR_NAME% activado con el valor %SENSOR_VALUE%. En 09.07.2026 14:02:03 EN 'Avenida Salamanca Poniente, Ciudad Industrial, Irapuato, Guanajuato 36541, Mexico'.",
//             "color": "#9f28b4",
//             "url": "",
//             "unit": 19703961,
//             "blink": 1,
//             "x": -101.290536,
//             "y": 20.642333,
//             "expression": "idling AND geozone_outside",
//             "executed_branch": "idling AND geozone_outside",
//             "nid": 83,
//             "rt": 0,
//             "p": {}
//         }
//     },
//     {
//         "unit_id": 19703961,
//         "unit_name": "076 - I",
//         "data": {
//             "t": 1783627323,
//             "f": 896,
//             "tns": 1783627323000000000,
//             "tp": "unm",
//             "name": "UNIDAD DETENIDA  GRAL",
//             "txt": "076 - I ha salido de la(s) geocerca(s). sensor %SENSOR_NAME% activado con el valor %SENSOR_VALUE%. En 09.07.2026 14:02:03 EN 'Avenida Salamanca Poniente, Ciudad Industrial, Irapuato, Guanajuato 36541, Mexico'.",
//             "color": "#9f28b4",
//             "url": "",
//             "unit": 19703961,
//             "blink": 1,
//             "x": -101.290536,
//             "y": 20.642333,
//             "expression": "idling AND geozone_outside",
//             "executed_branch": "idling AND geozone_outside",
//             "nid": 83,
//             "rt": 0,
//             "p": {}
//         }
//     },
//     {
//         "unit_id": 25933250,
//         "unit_name": "157 - I FULL",
//         "data": {
//             "t": 1783627323,
//             "f": 896,
//             "tns": 1783627323000000000,
//             "tp": "unm",
//             "name": "UNIDAD DETENIDA  GRAL",
//             "txt": "157 - I FULL ha salido de la(s) geocerca(s). sensor %SENSOR_NAME% activado con el valor %SENSOR_VALUE%. En 09.07.2026 14:02:03 EN 'Avenida Irapuato 101, Ciudad Industrial, Irapuato, Guanajuato 36541, Mexico'.",
//             "color": "#9f28b4",
//             "url": "",
//             "unit": 25933250,
//             "blink": 1,
//             "x": -101.288323,
//             "y": 20.640654,
//             "expression": "idling AND geozone_outside",
//             "executed_branch": "idling AND geozone_outside",
//             "nid": 83,
//             "rt": 0,
//             "p": {}
//         }
//     },
//     {
//         "unit_id": 25933250,
//         "unit_name": "157 - I FULL",
//         "data": {
//             "t": 1783627323,
//             "f": 896,
//             "tns": 1783627323000000000,
//             "tp": "unm",
//             "name": "UNIDAD DETENIDA  GRAL",
//             "txt": "157 - I FULL ha salido de la(s) geocerca(s). sensor %SENSOR_NAME% activado con el valor %SENSOR_VALUE%. En 09.07.2026 14:02:03 EN 'Avenida Irapuato 101, Ciudad Industrial, Irapuato, Guanajuato 36541, Mexico'.",
//             "color": "#9f28b4",
//             "url": "",
//             "unit": 25933250,
//             "blink": 1,
//             "x": -101.288323,
//             "y": 20.640654,
//             "expression": "idling AND geozone_outside",
//             "executed_branch": "idling AND geozone_outside",
//             "nid": 83,
//             "rt": 0,
//             "p": {}
//         }
//     },
//     {
//         "unit_id": 28410547,
//         "unit_name": "C-385 -I",
//         "data": {
//             "t": 1783627633,
//             "f": 896,
//             "tns": 1783627633000000000,
//             "tp": "unm",
//             "name": "DEV-VAR-TEMP",
//             "txt": "C-385 -I: sensor TEMPERATURA activado con el valor -3.70 °C. En 09.07.2026 14:07:13 se movió con una velocidad de 0 km/h cerca de 'Avenida Apaseo Oriente, Ciudad Industrial, Irapuato, Guanajuato 36541'.",
//             "color": "#ffffff",
//             "url": "",
//             "unit": 28410547,
//             "blink": 1,
//             "x": -101.294345,
//             "y": 20.6330466,
//             "expression": "sensor_range",
//             "executed_branch": "sensor_range",
//             "nid": 1,
//             "rt": 0,
//             "p": {}
//         }
//     },
//     {
//         "unit_id": 28410547,
//         "unit_name": "C-385 -I",
//         "data": {
//             "t": 1783627633,
//             "f": 896,
//             "tns": 1783627633000000000,
//             "tp": "unm",
//             "name": "DEV-VAR-TEMP",
//             "txt": "C-385 -I: sensor TEMPERATURA activado con el valor -3.70 °C. En 09.07.2026 14:07:13 se movió con una velocidad de 0 km/h cerca de 'Avenida Apaseo Oriente, Ciudad Industrial, Irapuato, Guanajuato 36541'.",
//             "color": "#ffffff",
//             "url": "",
//             "unit": 28410547,
//             "blink": 1,
//             "x": -101.294345,
//             "y": 20.6330466,
//             "expression": "sensor_range",
//             "executed_branch": "sensor_range",
//             "nid": 1,
//             "rt": 0,
//             "p": {}
//         }
//     },
//     {
//         "unit_id": 28410547,
//         "unit_name": "C-385 -I",
//         "data": {
//             "t": 1783627633,
//             "f": 896,
//             "tns": 1783627633000000000,
//             "tp": "unm",
//             "name": "DEV-VAR-TEMP",
//             "txt": "C-385 -I: sensor TEMPERATURA activado con el valor -3.70 °C. En 09.07.2026 14:07:13 se movió con una velocidad de 0 km/h cerca de 'Avenida Apaseo Oriente, Ciudad Industrial, Irapuato, Guanajuato 36541'.",
//             "color": "#ffffff",
//             "url": "",
//             "unit": 28410547,
//             "blink": 1,
//             "x": -101.294345,
//             "y": 20.6330466,
//             "expression": "sensor_range",
//             "executed_branch": "sensor_range",
//             "nid": 1,
//             "rt": 0,
//             "p": {}
//         }
//     }
// ]