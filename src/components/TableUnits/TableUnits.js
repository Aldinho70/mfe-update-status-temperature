import { Table } from "../components/Table/Table.js"
import { Modal } from "../components/Modal/Modal.js";
import { TableCajas } from "../TableCajas/TableCajas.js";
import { initMap } from "../components/Maps/Maps.js";
import { getNameUbication } from "../components/Maps/Maps.js";
import { findBoxTruck } from "../../helpers/wialon.helpers.js";
import { WialonReportService } from "../../service/remoteWialonApi.js";
import { parseWialonTimestamp } from "../../utils/parsed_date_time.js";
import { init_chart_temperature } from "../Chart_Temperature/Chart_Temperature.js";

const movedUnits = [];
let wialon_report_service;
let data_reports_temperatura;

export const TableUnits = async (data_units = []) => {

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

    // data_reports_temperatura = await WialonService.getReportAccount('DEV-GUZMAN', 'TEMPERATURAS DEV');
    // wialon_report_service = new WialonReportService(await WialonService.getSid());
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

            <div class="d-flex justify-content-between align-items-end">
                <div>
                    <button class="btn btn-sm btn-info caja-btn" data-unit="${unit.unit}" onClick="showChartTemperature('${caja?.v}')">
                        <span id="root-button-show-temperature-${unit.id}">
                            <i class="bi bi-thermometer-snow"></i>
                            Grafica temperaturas
                        </span>
                    </button>
                </div>
                <div class="d-flex flex-column align-items-end">
                    <small class="text-muted mb-1">
                        Caja asignada
                    </small>

                    <button class="btn btn-sm btn-warning caja-btn" data-unit="${unit.unit}" onClick="updateCaja('${safeId}')">
                        <i class="bi bi-truck me-1"></i>
                        <span id="root-button-caja-asignada-${unit.id}">
                            ${caja?.v || 'Asignar caja'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    `;
};

const getTemperatureStatsHtml = (stats) => {

    if (!stats) {
        return `
            <div class="alert alert-info border-0 rounded-4 px-4 py-3 mb-0 shadow-sm">
                <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-info-circle-fill"></i>
                    <span>No hay datos de temperatura disponibles.</span>
                </div>
            </div>
        `;
    }

    return `
        <div class="row g-3">
            <div class="col-12 col-sm-6">
                <div class="card border-0 rounded-4 shadow-sm h-100 bg-primary-subtle">
                    <div class="card-body text-center py-4">
                        <p class="text-uppercase text-muted small mb-2">Temperatura actual</p>
                        <h3 class="mb-0 fw-bold">${stats.lastTemperature} °C</h3>
                    </div>
                </div>
            </div>
            <div class="col-12 col-sm-6">
                <div class="card border-0 rounded-4 shadow-sm h-100 bg-danger-subtle">
                    <div class="card-body text-center py-4">
                        <p class="text-uppercase text-muted small mb-2">Temperatura máxima</p>
                        <h3 class="mb-0 fw-bold">${stats.maxTemperature} °C</h3>
                    </div>
                </div>
            </div>
            <div class="col-12 col-sm-6">
                <div class="card border-0 rounded-4 shadow-sm h-100 bg-info-subtle">
                    <div class="card-body text-center py-4">
                        <p class="text-uppercase text-muted small mb-2">Temperatura mínima</p>
                        <h3 class="mb-0 fw-bold">${stats.minTemperature} °C</h3>
                    </div>
                </div>
            </div>
            <div class="col-12 col-sm-6">
                <div class="card border-0 rounded-4 shadow-sm h-100 bg-success-subtle">
                    <div class="card-body text-center py-4">
                        <p class="text-uppercase text-muted small mb-2">Promedio</p>
                        <h3 class="mb-0 fw-bold">${stats.averageTemperature} °C</h3>
                    </div>
                </div>
            </div>

            <div class="col-12">
                <div class="card border-0 rounded-4 bg-light h-100 shadow-sm">
                    <div class="card-body py-3">
                        <div class="row gx-2 gy-3 text-center">
                            <div class="col-6 col-md-4">
                                <p class="text-uppercase text-muted small mb-1">Lecturas</p>
                                <strong class="fs-6">${stats.count}</strong>
                            </div>
                            <div class="col-6 col-md-4">
                                <p class="text-uppercase text-muted small mb-1">Positivas</p>
                                <strong class="fs-6">${stats.positiveReadings}</strong>
                            </div>
                            <div class="col-6 col-md-4">
                                <p class="text-uppercase text-muted small mb-1">Negativas</p>
                                <strong class="fs-6">${stats.negativeReadings}</strong>
                            </div>
                            <div class="col-6 col-md-4">
                                <p class="text-uppercase text-muted small mb-1">Rango</p>
                                <strong class="fs-6">${stats.temperatureRange} °C</strong>
                            </div>
                            <div class="col-6 col-md-4">
                                <p class="text-uppercase text-muted small mb-1">Mediana</p>
                                <strong class="fs-6">${stats.medianTemperature} °C</strong>
                            </div>
                            <div class="col-6 col-md-4">
                                <p class="text-uppercase text-muted small mb-1">Última lectura</p>
                                <strong class="fs-6">${stats.lastTemperature} °C</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

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

    TableCajas(payload);
}
window.updateCaja = updateCaja;

const buildTemperatureModalBody = ({ stats_temp, travel }) => {
    return `<div class="container-fluid px-0 px-lg-2 py-2">

            <div class="row g-3">
                <div class="col-12">
                    <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
                        <div class="card-body p-4">
                            <div class="row align-items-center gy-3">
                                <div class="col-12 col-lg-8">
                                    <div class="d-flex align-items-center gap-2 mb-2">
                                        <span class="badge rounded-pill bg-primary-subtle text-primary-emphasis">Recorrido</span>
                                        <span class="text-muted small">Monitoreo en tiempo real</span>
                                    </div>
                                    <h5 class="mb-2 fw-semibold">Resumen del recorrido</h5>
                                    <p class="text-muted mb-0 lh-lg" id="root-travel">${travel}</p>
                                </div>
                                <div class="col-6 col-md-4 col-lg-2">
                                    <div class="border rounded-3 p-3 text-center bg-body-tertiary h-100">
                                        <small class="text-uppercase text-muted d-block mb-1">Última actualización</small>
                                        <strong id="last-update-text" class="d-block">--</strong>
                                    </div>
                                </div>
                                <div class="col-6 col-md-4 col-lg-2">
                                    <div class="border rounded-3 p-3 text-center bg-body-tertiary h-100">
                                        <small class="text-uppercase text-muted d-block mb-1">Próxima actualización</small>
                                        <strong id="next-update-text" class="d-block">60s</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-12">
                    <div class="card shadow-sm border-0 rounded-4 overflow-hidden">
                        <div class="card-body p-0">
                            <div id="root-chart-temperature" class="w-100" style="min-height: 320px;"></div>
                        </div>
                    </div>
                </div>

                <div class="col-12 col-xl-4">
                    <div class="card shadow-sm h-100 border-0 rounded-4">
                        <div class="card-body p-4">
                            <div class="d-flex align-items-center justify-content-between mb-3">
                                <h6 class="card-title mb-0 fw-semibold">Indicadores de temperatura</h6>
                                <span class="badge rounded-pill bg-secondary-subtle text-secondary-emphasis">Resumen</span>
                            </div>
                            ${getTemperatureStatsHtml(stats_temp)}
                        </div>
                    </div>
                </div>

                <div class="col-12 col-xl-8">
                    <div class="card shadow-sm h-100 border-0 rounded-4 overflow-hidden">
                        <div class="card-body p-0">
                            <div id="map" class="w-100 rounded-bottom" style="min-height: 70vh;"></div>
                        </div>
                    </div>
                </div>
            </div>

        </div>`;
};

const fetchTemperatureModalData = async (caja) => {
    const find_caja = await findBoxTruck(caja);
    if (!find_caja) {
        throw new Error('No fue posible encontrar la caja seleccionada');
    }

    const unit_selected = find_caja.id;
    const session = await WialonService.getSession();
    const unit = await session.getItem(unit_selected);
    const sen = await WialonService.getSensor(unit_selected, ['TEMPERATURA', 'Temperatura']);
    const last_messages = await WialonService.getLastMessages(unit_selected);
    const array_last_messages = last_messages.messages || [];
    const unit_name = unit.getName();

    let array_temp = [];
    let array_days = [];
    let tramos = [];
    let travel = ``;
    let tramo_actual = null;
    let dentro_de_tramo = false;
    let hubo_notificacion = false;

    for (const _last_message of array_last_messages) {
        if (_last_message.p?.name === 'SALIDA GUZMAN DEV') {
            travel = 'La unidad sale de planta';
            hubo_notificacion = true;
            dentro_de_tramo = true;
            tramo_actual = {
                salida: {
                    timestamp: _last_message.t,
                    datetime: parseWialonTimestamp(_last_message.t),
                    x: _last_message.p.x,
                    y: _last_message.p.y,
                },
                entrada: null,
                puntos: [],
            };

        } else if (_last_message.p?.name === 'ENTRADA GUZMAN DEV') {
            hubo_notificacion = true;

            if (dentro_de_tramo && tramo_actual) {
                tramo_actual.entrada = {
                    timestamp: _last_message.t,
                    datetime: parseWialonTimestamp(_last_message.t),
                    x: _last_message.p.x,
                    y: _last_message.p.y,
                };
                tramos.push(tramo_actual);
                tramo_actual = null;
                dentro_de_tramo = false;
            }
        }

        if (_last_message.pos && dentro_de_tramo) {
            const date_time = parseWialonTimestamp(_last_message.t);
            let result = unit.calculateSensorValue(sen, _last_message);

            if (result !== -348201.3876) {
                result = Math.round(result);
                array_days.push(date_time);
                array_temp.push(result);
            }

            if (tramo_actual) {
                tramo_actual.puntos.push({
                    lat: _last_message.pos.y,
                    lng: _last_message.pos.x,
                    titulo: `${result} ℃`,
                    t: _last_message.t,
                    temp: result,
                    speed: _last_message.pos.s,
                    odometer: _last_message.p?.odometer,
                    viaje_completo: true,
                });
            }
        }
    }

    if (tramo_actual) {
        tramos.push(tramo_actual);
    }

    if (!hubo_notificacion) {
        const tramo_completo = {
            salida: null,
            entrada: null,
            puntos: [],
        };

        for (const _last_message of array_last_messages) {
            if (_last_message.pos) {
                const date_time = parseWialonTimestamp(_last_message.t);
                let result = unit.calculateSensorValue(sen, _last_message);

                if (result !== -348201.3876) {
                    result = Math.round(result);
                    array_days.push(date_time);
                    array_temp.push(result);
                }

                tramo_completo.puntos.push({
                    lat: _last_message.pos.y,
                    lng: _last_message.pos.x,
                    t: _last_message.t,
                    titulo: `${result} ℃`,
                    temp: result,
                    speed: _last_message.pos.s,
                    odometer: _last_message.p?.odometer,
                    viaje_completo: false,
                });
            }
        }

        tramos.push(tramo_completo);
    }

    return {
        tramos,
        unit,
        unit_name,
        array_temp,
        array_days,
        stats_temp: getTemperatureStats(array_temp),
        travel,
    };
};

const updateTimerDisplays = (modal_id, secondsRemaining) => {
    const lastUpdateText = document.querySelector(`#${modal_id} #last-update-text`);
    const nextUpdateText = document.querySelector(`#${modal_id} #next-update-text`);

    if (lastUpdateText && !lastUpdateText.dataset.updatedAt) {
        lastUpdateText.dataset.updatedAt = new Date().toLocaleTimeString();
        lastUpdateText.innerText = `Última actualización: ${lastUpdateText.dataset.updatedAt}`;
    }

    if (nextUpdateText) {
        nextUpdateText.innerText = `Próxima actualización en: ${secondsRemaining}s`;
    }
};

const updateTemperatureModalContent = async (modal_id, caja) => {
    const data = await fetchTemperatureModalData(caja);
    const modalBody = document.querySelector(`#${modal_id} .modal-body`);
    if (!modalBody) {
        return;
    }

    modalBody.innerHTML = buildTemperatureModalBody(data);

    if (data.tramos[0]?.puntos?.length) {
        initMap(data.tramos[0], data.unit);
    }

    init_chart_temperature({
        caja: data.unit_name,
        array_temp: data.array_temp,
        array_days: data.array_days,
    });

    const lastUpdateText = document.querySelector(`#${modal_id} #last-update-text`);
    if (lastUpdateText) {
        lastUpdateText.dataset.updatedAt = new Date().toLocaleTimeString();
        lastUpdateText.innerText = `Última actualización: ${lastUpdateText.dataset.updatedAt}`;
    }
};

const showChartTemperature = async (caja) => {
    try {
        const instanceHtml = buildTemperatureModalBody({ stats_temp: null, travel: 'Cargando datos...' });
        const modal_id = Modal({
            title: 'Grafica de temperaturas',
            body: instanceHtml,
            modal_size: 'modal-fullscreen',
            footer: false,
        });

        await updateTemperatureModalContent(modal_id, caja);

        window.modalRefreshIntervals = window.modalRefreshIntervals || {};
        window.modalRefreshIntervals[modal_id] = window.modalRefreshIntervals[modal_id] || {};

        if (window.modalRefreshIntervals[modal_id].refreshId) {
            clearInterval(window.modalRefreshIntervals[modal_id].refreshId);
        }

        if (window.modalRefreshIntervals[modal_id].countdownId) {
            clearInterval(window.modalRefreshIntervals[modal_id].countdownId);
        }

        window.modalRefreshIntervals[modal_id].secondsRemaining = 60;
        updateTimerDisplays(modal_id, window.modalRefreshIntervals[modal_id].secondsRemaining);

        window.modalRefreshIntervals[modal_id].refreshId = setInterval(async () => {
            if (!document.getElementById(modal_id)) {
                clearInterval(window.modalRefreshIntervals[modal_id].refreshId);
                clearInterval(window.modalRefreshIntervals[modal_id].countdownId);
                delete window.modalRefreshIntervals[modal_id];
                return;
            }

            await updateTemperatureModalContent(modal_id, caja);
            window.modalRefreshIntervals[modal_id].secondsRemaining = 60;
        }, 60 * 1000);

        window.modalRefreshIntervals[modal_id].countdownId = setInterval(() => {
            if (!document.getElementById(modal_id)) {
                clearInterval(window.modalRefreshIntervals[modal_id].countdownId);
                return;
            }

            const state = window.modalRefreshIntervals[modal_id];
            if (!state) return;

            state.secondsRemaining = Math.max(0, state.secondsRemaining - 1);
            updateTimerDisplays(modal_id, state.secondsRemaining);
        }, 1000);

    } catch (error) {
        console.log(error);
        Modal({
            title: 'Error al generar la grafica',
            body: `<div class="alert alert-warning text-center my-3">
                        <h6 class="mb-2">
                            <i class="bi bi-exclamation-triangle-fill me-2"></i>
                            No fue posible generar la gráfica de temperatura
                        </h6>

                        <small>
                            Si el problema persiste, por favor repórtelo al área de soporte técnico.
                        </small>
                    </div>`,
            footer: true,
        });
    }
};
window.showChartTemperature = showChartTemperature;

const getTemperatureStats = (temperatures) => {

    const validTemps = temperatures
        .filter(temp =>
            typeof temp === 'number' &&
            !isNaN(temp)
        );

    if (!validTemps.length) {
        return null;
    }

    const min = Math.min(...validTemps);
    const max = Math.max(...validTemps);

    const avg =
        validTemps.reduce((acc, temp) => acc + temp, 0) /
        validTemps.length;

    const range = max - min;

    const overZero = validTemps.filter(t => t > 0).length;
    const belowZero = validTemps.filter(t => t < 0).length;

    const sorted = [...validTemps].sort((a, b) => a - b);

    const median =
        sorted.length % 2 === 0
            ? (
                sorted[sorted.length / 2 - 1] +
                sorted[sorted.length / 2]
            ) / 2
            : sorted[Math.floor(sorted.length / 2)];

    return {
        count: validTemps.length,

        minTemperature: min,
        maxTemperature: max,

        averageTemperature: Number(avg.toFixed(2)),
        medianTemperature: Number(median.toFixed(2)),

        temperatureRange: Number(range.toFixed(2)),

        positiveReadings: overZero,
        negativeReadings: belowZero,

        firstTemperature: validTemps[0],
        lastTemperature:
            validTemps[validTemps.length - 1]
    };

}

