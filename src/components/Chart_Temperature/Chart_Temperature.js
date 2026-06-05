export const init_chart_temperature = ( {caja, array_temp, array_days} ) => {
    
    Highcharts.chart('root-chart-temperature', {
        chart: {
            type: 'line'
        },
        title: {
            text: `Control de temperatura caja: ${ caja }`
        },
        // subtitle: {
        //     text: 'Datos ficticios de temperaturas en °C'
        // },
        xAxis: {
            title: {
                text: 'Fechas'
            },
            categories: array_days
        },
        yAxis: {
            title: {
                text: 'Temperatura (°C)'
            }
        },
        series: [{
            name: 'Temperatura',
            data: array_temp
        }]
    });
}