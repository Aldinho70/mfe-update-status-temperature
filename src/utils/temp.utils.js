/**
 * Filtra los puntos dejando solo aquellos donde la temperatura cambió respecto al anterior.
 * @param {Array} puntos - Array completo de puntos { lat, lng, t, temp, ... }
 * @returns {Array} Array solo con los puntos de cambio
 */
export function obtenerPuntosDeCambioTemperatura(puntos) {
    if (!puntos || puntos.length === 0) return [];

    const cambios = [puntos[0]]; // el primer punto siempre se incluye (es el punto de partida)

    for (let i = 1; i < puntos.length; i++) {
        const actual = puntos[i];
        const anterior = puntos[i - 1];

        if (actual.temp !== anterior.temp) {
            cambios.push(actual);
        }
    }

    return cambios;
}