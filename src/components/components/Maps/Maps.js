import { obtenerPuntosDeCambioTemperatura } from "../../../utils/temp.utils.js";
import { Modal } from "../Modal/Modal.js";
export let map3D = null;

const mexico_google_maps = {
    center: { lat: 24.25459353020009, lng: -101.6559865211694, altitude: 3287 },
    range: 3459229,
    tilt: 3,
    heading: 3.5,
};


export function initMap(tramos, data_unit) {
    console.log(tramos);
    const { puntos, salida, entrada } = tramos

    const puntosCambioTemp = obtenerPuntosDeCambioTemperatura(puntos);

    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: { lat: puntos[0].lat, lng: puntos[0].lng },
    });

    initPolyline(map, puntos);
    addMarkers(map, puntosCambioTemp);

    if (salida != null && entrada != null) {
        addMarkerStartEnd(map, puntos, data_unit, true);
    } else {
        addMarkerStartEnd(map, puntos, data_unit, false);
    }
}


function addMarkers(map, puntos) {
    const markers = puntos.map((punto, index) => {
        const etiqueta = `${punto.titulo}`

        const marcador = new google.maps.Marker({
            position: { lat: punto.lat, lng: punto.lng },
            map: map,
            title: punto.titulo,
            label: {
                text: etiqueta,
                color: "white",
                fontWeight: "bold",
            },
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: "#f44242",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
                scale: 20,
                labelOrigin: new google.maps.Point(0, 0),
            },
        });

        marcador.addListener("click", () => onMarcadorClick(punto, etiqueta));

        marcador.addListener("mouseover", () => onMarkerMouseOver(punto, marcador));

        marcador.addListener("mouseout", () => onMarkerMouseOut(punto, marcador));

        return marcador;
    });

    // El clusterer maneja el mapa y el agrupamiento
    new markerClusterer.MarkerClusterer({
        map,
        markers,
        algorithm: new markerClusterer.SuperClusterAlgorithm({
            radius: 80, // ← distancia en px para agrupar (ajústalo a tu gusto)
        }),
    });
}

function onMarcadorClick(punto) {
    Modal({
        title: 'Datos de temperatura',
        body: `<div class="alert alert-info text-center my-3">
                    <h6 class="mb-2">
                        <i class="bi bi-thermometer-half me-2"></i>
                        ${punto.titulo}
                    </h6>

                    <small>
                        <strong>Temperatura:</strong> ${punto.temp}°C<br>
                        <strong>Lat:</strong> ${punto.lat}<br>
                        <strong>Lng:</strong> ${punto.lng}
                    </small>
                </div>

                <iframe
                    width="100%"
                    height="400"
                    style="border:0"
                    loading="lazy"
                    allowfullscreen
                    referrerpolicy="no-referrer-when-downgrade"
                    src="https://maps.google.com/maps?q=${punto.lat},${punto.lng}&t=k&z=18&output=embed">
                </iframe>`,
    });
}

// Creamos UN solo InfoWindow reutilizable (no uno por marcador)
const infoWindow = new google.maps.InfoWindow();

function onMarkerMouseOver(punto, marcador) {
    infoWindow.setContent(`
        <div class="card bg-secondary text-white" style="min-width: 180px;">
            <div class="card-body p-2">
                <h6 class="card-title mb-1">
                    <i class="bi bi-geo-alt-fill me-1"></i>
                    ${punto.name_ubication}
                </h6>
                <p class="card-text mb-0" style="font-size: 13px;">
                    🌡️ Temp: <strong>${punto.temp}°C</strong>
                </p>
                <small class="text-white-50">${punto.datetime || ''}</small>
            </div>
        </div>
    `);

    infoWindow.open({
        anchor: marcador,
        shouldFocus: false,
    });
}

function onMarkerMouseOut() {
    infoWindow.close();
}

function initPolyline(map, puntos) {
    const coordenadas = puntos.map(p => ({ lat: p.lat, lng: p.lng }));

    return new google.maps.Polyline({
        path: coordenadas,
        map: map,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 4,
    });
}

export async function getNameUbication(lat, lng) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=TU_API_KEY&language=es`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
        return data.results[0].formatted_address; // dirección completa
    }

    return "Ubicación desconocida";
}

// ─── Ruta por calles sin marcadores propios de Google ──────────────────────
function traceRuteByStreets(map, puntos) {
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
            strokeColor: "#FF0000",  // ← cambia el color aquí
            strokeOpacity: 1.0,
            strokeWeight: 10,
        },
    });
    directionsRenderer.setMap(map);

    const origen = puntos[0];
    const destino = puntos[puntos.length - 1];
    const paradas = puntos.slice(1, -1).map(p => ({
        location: { lat: p.lat, lng: p.lng },
        stopover: true,
    }));

    directionsService.route(
        {
            origin: { lat: origen.lat, lng: origen.lng },
            destination: { lat: destino.lat, lng: destino.lng },
            waypoints: paradas,
            travelMode: google.maps.TravelMode.DRIVING,
        },
        function (result, status) {
            if (status === "OK") {
                directionsRenderer.setDirections(result);
            } else {
                console.error("Error al trazar ruta:", status);
            }
        }
    );
}

function addMarkerStartEnd(map, puntos, unit, is_all_travel) {
    if (!puntos || puntos.length === 0) return;

    const primerPunto = puntos[0];
    const ultimoPunto = puntos[puntos.length - 1];
    let marcadorInicio = {}

    // ── Marcador de INICIO ──────────────────────────────────────

    if (is_all_travel) {
        marcadorInicio = new google.maps.Marker({
            position: { lat: primerPunto.lat, lng: primerPunto.lng },
            map: map,
            title: "Inicio de viaje",
            icon: {
                url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
                scaledSize: new google.maps.Size(44, 44),
            },
            label: {
                text: "Inicio de viaje", // o usa "A", "INICIO", etc.
                fontSize: "32px",
            },
            zIndex: 999, // siempre arriba de los demás marcadores
        })

        marcadorInicio.addListener("click", () => {
            onMarcadorClick({
                ...primerPunto,
                titulo: "Salida de planta",
            });
        });
    }

    // ── Marcador de FIN ──────────────────────────────────────────
    const marcadorFin = new google.maps.Marker({
        position: { lat: ultimoPunto.lat, lng: ultimoPunto.lng },
        map: map,
        title: "Fin de viaje",
        icon: {
            url: unit.getIconUrl(32),
            scaledSize: new google.maps.Size(44, 44),
        },
        // label: {
        //     text: "Fin de recorrido",
        //     fontSize: "16px",
        // },
        zIndex: 999,
    });

    marcadorFin.addListener("click", () => {
        onMarcadorClick({
            ...ultimoPunto,
            titulo: "Llegada / Fin de recorrido",
        });
    });

    return { marcadorInicio, marcadorFin };
}

/* Maps 3D */
export async function init3DMap(locations) {
    const { Map3DElement, MapMode, Marker3DInteractiveElement } = await google.maps.importLibrary("maps3d");
    const { PinElement } = await google.maps.importLibrary("marker");

    // Crear mapa
    map3D = new Map3DElement({
        ...mexico_google_maps,
        mode: MapMode.SATELLITE,
    });

    // Añadir markers
    locations.forEach((office) => {
        const marker = new Marker3DInteractiveElement({
            position: office.point,
            label: `${office.name}-${office.id} `,
            altitudeMode: "ABSOLUTE",
            extruded: true,
        });

        marker.addEventListener("gmp-click", (event) => {

            const partes = event.target.label.split("-");
            unitSectionDetails(partes[1]);
            event.stopPropagation();
            map3D.flyCameraTo({
                endCamera: office.camera,
                durationMillis: 5000,
            });
        });

        /* No borrar */
        // map3D.addEventListener('gmp-click', (event) => {
        //     console.log("camera: { center: { lat: " + map3D.center.lat + ", lng : " + map3D.center.lng + ", altitude: " + map3D.center.altitude + " }, range: " + map3D.range + ", tilt: " + map3D.tilt + " ,heading: " + map3D.heading + ", }");
        //     console.log("{ lat: " + event.position.lat + ", lng : " + event.position.lng + ", altitude: " + event.position.altitude + " }");
        //     map3D.stopCameraAnimation();
        // });

        const markerPin = new PinElement(office.pin);
        marker.append(markerPin);

        map3D.append(marker);
    });

    return map3D
}

export const flyCameraToByUnit = async (lat, lng, altitude) => {
    map3D.flyCameraTo({
        endCamera: {
            center: { lat: lat, lng: lng, altitude: altitude },
            // center: { lat: 25.512436044681202, lng : -103.40546869247386, altitude: 1121.2403623597386 },
            range: 200,  // zoom aproximado
            tilt: 45,    // inclinación
            heading: 0,  // orientación
        },
        durationMillis: 5000, // animación de 2 segundos
    });
}

export const resetMap = () => {
    map3D.flyCameraTo({
        endCamera: mexico_google_maps,
        durationMillis: 3000, // 3 segundos de animación
    });
}

export const getLocationsOfUnits = (units) => {
    return units.map(unit => {
        const pos = unit.getPosition();
        const { x, y, z } = pos;

        return {
            name: unit.getName(),
            id: unit.getId(),
            camera: {
                center: { lat: y, lng: x, altitude: z },
                range: 200,
                tilt: 45,
                heading: 0,
            },
            point: { lat: y, lng: x, altitude: z },
            pin: {
                background: "white",
                glyph: new URL('https://images.vexels.com/media/users/3/239035/isolated/preview/30f14f21c3cc0a12edd11f2876c6fa90-camion-3.png'),
                scale: 2.0,
            }
        };
    });
}