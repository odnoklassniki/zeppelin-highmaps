import Highcharts from 'highcharts/highmaps';


/**
 * @typedef {object} ChartDataItem
 * @property {string} hc-key Highcharts contry code or region ID.
 * @property {number} value Key value.
 */


/**
 * @typedef {object} CommonParams
 * @property {HTMLElement} containerElement HTML element that will contain created Highcharts map.
 * Container should have ID!
 * @property {string} mapPath Path to Highmaps mapdata.
 * http://code.highcharts.com/mapdata/
 * @property {ChartDataItem} data Chart data.
 * @property {number} rangesNumber Number of ranges to generate.
 * @property {number} [minInRange] Number to use as minimum value.
 * @property {number} [maxInRange] Number to use as maximum value.
 */


/**
 * Creates new Highchart map instance by given parameters.
 * @param {CommonParams} params
 * @returns {Highcharts.Chart} Chart instance.
 */
export function createHighchartMap(params) {
    const ranges = getRanges(params);
    const colorAxisDataClasses = getColorAxisDataClasses(ranges);
    return createHighchartsMapInstance(params, colorAxisDataClasses);
}


/**
 * Destroyes given chart and it's container.
 * @see https://api.highcharts.com/class-reference/Highcharts.Chart
 * @param {Highcharts.Chart} chart Chart instance.
 */
export function destroyHighchartMap(chart) {
    if (chart) {
        const chartContainer = chart.container.parentNode;
        chart.destroy();
        if (chartContainer) {
            chartContainer.parentNode.removeChild(chartContainer);
        }
    }
}


/**
 * Updates series within given chart.
 * @param {*} args
 * @example
 * const dataForFirstSerie = ...;
 * const dataForSecondSerie = ...;
 * updateHighchartMapData(chartInstance, dataForFirstSerie, dataForSecondSerie);
 */
export function updateHighchartMapData(chart, ...datas) {
    datas.forEach((data, index) => {
        chart.series[index].setData(data);
    });
}


/**
 * Creates new instance of the Highcharts.mapChart and inserts it to a given container.
 * @private
 * @param {CommonParams} params
 * @param {object[]} colorAxisDataClasses List of dataClasses options for colorAxis parameter.
 * https://api.highcharts.com/highcharts/colorAxis.dataClasses
 * @return {Highcharts.Chart} Chart instance.
 */
function createHighchartsMapInstance(params, colorAxisDataClasses) {
    const chartElement = createHighchartChartElement(params.containerElement);

    return Highcharts.mapChart(chartElement, {
        chart: {
            map: params.mapPath
        },
        title: {
            text: ''
        },
        mapNavigation: {
            enabled: true,
            buttonOptions: {
                verticalAlign: 'bottom'
            }
        },
        legend: {
            title: {
                text: null,
                style: {
                    color: (Highcharts.theme && Highcharts.theme.textColor) || 'black'
                }
            },
            align: 'right',
            verticalAlign: 'bottom',
            valueDecimals: 0,
            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || 'rgba(255, 255, 255, 0.85)',
            symbolRadius: 0,
            symbolHeight: 14
        },
        colorAxis: {
            dataClasses: colorAxisDataClasses
        },
        series: [{
            data: params.data.slice(),
            name: 'Data set',
            joinBy: 'hc-key',
            states: {
                hover: {
                    color: '#724cf9'
                }
            }
        }]
    });
}


/**
 * Generates colorAxis.dataClasses values for given data ranges.
 * @private
 * @param {number} ranges
 * @returns {object[]}
 * https://api.highcharts.com/highcharts/colorAxis.dataClasses
 */
function getColorAxisDataClasses(ranges) {
    const colorAxisDataClasses = ranges.slice(1).map((toRange, index) => {
        const indexColorNumber = Math.floor(((index + 1) / ranges.length) * 255);
        const redColor = indexColorNumber;
        const greenColor = 255 - indexColorNumber;
        const dataClass = {
            color: `rgb(${redColor}, ${greenColor}, 0)`
        };
        const fromValue = ranges[index];
        const fromInfinity = fromValue === Number.MIN_VALUE;
        const toInfinity = toRange === Number.MAX_VALUE;
        if (!fromInfinity) {
            dataClass.from = fromValue;
        }
        if (!toInfinity) {
            dataClass.to = toRange;
        }
        return dataClass;
    });
    return colorAxisDataClasses;
}


/**
 * Generates data ranges to generate colorAxis.dataClasses.
 * @private
 * @param {CommonParams} params
 * @returns {number[]}
 */
function getRanges(params) {
    const values = params.data.map(dataItem => dataItem.value);
    const hasValues = values.length > 0;
    const ranges = [];
    let rangesNumber = params.rangesNumber;

    const minInRange = params.minInRange;
    const hasMinInRange = !isNaN(minInRange);
    const minValue = hasValues ? values.reduce((minValue, value) => Math.min(minValue, value)) : 0;
    const addNegativeInfinity = hasMinInRange && minValue < minInRange;
    // values in (-Infinity, minInRange]
    if (addNegativeInfinity) {
        ranges.push(Number.MIN_VALUE);
        rangesNumber--;
    }
    const min = hasMinInRange ? minInRange : minValue;
    ranges.push(min);

    const maxInRange = params.maxInRange;
    const hasMaxInRange = !isNaN(maxInRange);
    const maxValue = hasValues ? values.reduce((max, value) => Math.max(max, value)) : 0;
    const addPositiveInfinity = hasMaxInRange && maxValue > maxInRange;
    // values in [maxInRange, +Infinity)
    if (addPositiveInfinity) {
        rangesNumber--;
    }
    const max = hasMaxInRange ? maxInRange : maxValue;

    if (rangesNumber) {
        const rangeStep = (max - min) / rangesNumber;
        for(let i = 1; i <= rangesNumber; i++) {
            ranges.push(min + Math.round(rangeStep * i));
        }
        ranges[ranges.length - 1] = max;
    }
    if (addPositiveInfinity) {
        ranges.push(Number.MAX_VALUE);
    }

    return ranges;
}


/**
 * Creates DIV element to render chart to.
 * Container should have ID!
 * @private
 * @param {HTMLElement} container
 * @returns {HTMLElement}
 */
function createHighchartChartElement(container) {
    const random = Math.floor(Math.random() * 1000000);
    const chartElement = document.createElement('div');
    chartElement.id = `${container.id}__chart_${random}`;
    chartElement.style.height = '100%';
    chartElement.style.flex = '1';
    container.appendChild(chartElement);
    return chartElement;
}
