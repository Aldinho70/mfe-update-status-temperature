export const init_chart_temperature = ({ caja, array_temp, array_days }) => {
    const chartId = 'root-chart-temperature';
    window.temperatureCharts = window.temperatureCharts || {};

    if (window.temperatureCharts[chartId]) {
        try {
            window.temperatureCharts[chartId].destroy();
        } catch (error) {
            console.warn('Error destruido gráfica anterior', error);
        }
        delete window.temperatureCharts[chartId];
    }

    window.temperatureCharts[chartId] = Highcharts.chart(chartId, {
        chart: {
            type: 'line'
        },
        title: {
            text: `Control de temperatura caja: ${caja}`
        },
        xAxis: {
            title: {
                text: 'Fechas'
            },
            categories: array_days
        },
        yAxis: {
            title: {
                text: 'Temperatura (°C)'
            },
            plotLines: [
                {
                    value: 5,
                    color: 'red',
                    width: 2,
                    dashStyle: 'Dash',
                    label: {
                        text: 'Límite Superior (5°C)',
                        align: 'right'
                    }
                },
                {
                    value: -2,
                    color: 'blue',
                    width: 2,
                    dashStyle: 'Dash',
                    label: {
                        text: 'Límite Inferior (-2°C)',
                        align: 'right'
                    }
                }
            ]
        },
        series: [{
            name: 'Temperatura',
            data: array_temp
        }]
    });
};