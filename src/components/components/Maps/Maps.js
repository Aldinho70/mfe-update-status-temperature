// import { unitSectionDetails } from "../../componets/Units/UnitsSection.js";

import { obtenerPuntosDeCambioTemperatura } from "../../../utils/temp.utils.js";
import { Modal } from "../Modal/Modal.js";
export let map3D = null;

const mexico_google_maps = {
    center: { lat: 24.25459353020009, lng: -101.6559865211694, altitude: 3287 },
    range: 3459229,
    tilt: 3,
    heading: 3.5,
};


export function initMap(puntos) {
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: { lat: puntos[0].lat, lng: puntos[0].lng },
    });


    agregarPolyline(map, puntos);

    const puntosCambioTemp = obtenerPuntosDeCambioTemperatura(puntos);
    agregarMarcadores(map, puntosCambioTemp);
}

// ─── Marcadores con etiqueta tipo A, B, C... ───────────────────────────────
function agregarMarcadores(map, puntos) {
    puntos.forEach(function (punto, index) {

        const etiqueta = `${punto.temp}`

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
                scale: 14,                    // Tamaño del círculo
                labelOrigin: new google.maps.Point(0, 0),
            },
        });

        marcador.addListener("click", function () {
            onMarcadorClick(punto);
        });
    });
}

// ─── Acción al hacer click ──────────────────────────────────────────────────
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

// ─── Ruta por calles sin marcadores propios de Google ──────────────────────
function trazarRutaPorCalles(map, puntos) {
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
            strokeColor: "#FF0000",  // ← cambia el color aquí
            strokeOpacity: 1.0,
            strokeWeight: 5,
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

function agregarPolyline(map, puntos) {
    const coordenadas = puntos.map(p => ({ lat: p.lat, lng: p.lng }));

    return new google.maps.Polyline({
        path: coordenadas,
        map: map,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 4,
    });
}

/* Operacion */
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