import Visualization from 'zeppelin-vis'
import PassthroughTransformation from 'zeppelin-tabledata/passthrough'
import ColumnselectorTransformation from 'zeppelin-tabledata/columnselector'
import Highcharts from 'highcharts/highmaps';
import getSettingsPanelTemplate from './settings-panel-template';
import { l10n } from './l10n';
import { maxmindToHighmaps, highmapsMapdata } from './data';
import { isSameNumber, parseHTML } from './utils';
import {
    createHighchartMap,
    updateHighchartMapData,
    updateHighchartByRanges,
    destroyHighchartMap
} from './highmaps-helper';


let instancesNumber = 0;


const constants = Object.freeze({
    idPrefix: 'zeppelin-highmaps',
    defaultMap: 'RU'
});


export default class ZeppelinHighmaps extends Visualization {

    constructor(targetEl, config) {
        super(targetEl, config);

        instancesNumber++;
        this.instanceId = `${constants.idPrefix}-${instancesNumber}`;

        this.errorElement = null;

        this.columnselectorProps = [
            { name: 'region' },
            { name: 'value' }
        ];
        this.columnselector = new ColumnselectorTransformation(config, this.columnselectorProps);

        this.params = {
            allAreas: true,
            map: constants.defaultMap,
            rangesNumber: 5,
            minInRange: NaN,
            maxInRange: NaN
        };

        this.tableData = null;

        this.chart = null;
        this.chartContainer = this.createChartContainer();

        targetEl.css({
            display: 'flex',
            flexDirection: 'column'
        });
    }


    /**
     * @override
     */
    getTransformation() {
        return this.columnselector;
    }


    /**
     * @override
     * @param {object[]} tableData Raw data.
     */
    render(tableData) {
        const areSettingsCorrect = this.config.region && this.config.value;
        if (!areSettingsCorrect) {
            this.renderError(l10n('settings.invalid'));
            return;
        } else {
            this.hideError();
        }

        this.tableData = tableData;

        if (this.chart) {
            this.updateChart();
        } else {
            this.redrawChart();
        }
    }


    /**
     * Destroys current chart and renders new one instead.
     */
    redrawChart() {
        destroyHighchartMap(this.chart);

        const data = this.getData(this.tableData);

        const mapPath = this.registerMapData(this.params.map);
        this.chart = createHighchartMap({
            containerElement: this.chartContainer,
            mapPath,
            data,
            allAreas: this.params.allAreas,
            rangesNumber: this.params.rangesNumber,
            minInRange: this.params.minInRange,
            maxInRange: this.params.maxInRange
        });
    }


    /**
     * Updates chart's series.
     */
    updateChart() {
        const data = this.getData(this.tableData);
        updateHighchartMapData(this.chart, data);
    }


    /**
     * Updates chart with given values settings without redrawing.
     * @param {number} rangesNumber
     * @param {number|string} minInRange
     * @param {number|string} maxInRange
     * @returns {boolean} Returns true if chart was updated.
     */
    updateChartByValues(rangesNumber, rawMinInRange, rawMaxInRange) {
        let hasChanges = false;

        if (this.params.rangesNumber !== rangesNumber) {
            this.params.rangesNumber = rangesNumber;
            hasChanges = true;
        }

        const minInRange = parseFloat(rawMinInRange);
        if (!isSameNumber(minInRange, this.params.minInRange)) {
            this.params.minInRange = minInRange;
            hasChanges = true;
        }

        const maxInRange = parseFloat(rawMaxInRange);
        if (!isSameNumber(maxInRange, this.params.maxInRange)) {
            this.params.maxInRange = maxInRange;
            hasChanges = true;
        }

        if (hasChanges) {
            updateHighchartByRanges(this.chart, {
                rangesNumber: this.params.rangesNumber,
                data: this.getData(this.tableData),
                minInRange: this.params.minInRange,
                maxInRange: this.params.maxInRange
            });
            return hasChanges;
        }

        return hasChanges;
    }


    /**
     * Updates chart with given values by creating new chart instead of old one.
     * @param {string} newMap
     * @param {boolean} allAreas
     */
    redrawsChartByValues(newMap, allAreas) {
        let hasChanges = false;

        // Unfortunatelly, if "update" method was called on chart instance,
        // previous map is still visible.
        if (this.params.map !== newMap) {
            this.params.map = newMap;
            hasChanges = true;
        }

        // Unfortunatelly, only first change of allAreas makes map to hide or show null-value regions,
        // rest changes do not affect the chart map.
        if (this.params.allAreas !== allAreas) {
            this.params.allAreas = allAreas;
            hasChanges = true;
        }

        if (hasChanges) {
            this.redrawChart();
        }

        return hasChanges;
    }


    /**
     * Creates DIV that will contain chart.
     * @returns {HTMLElement}
     */
    createChartContainer() {
        // TBD: several maps for one data set.
        const chartContainerHtml = `<div id="${this.instanceId}-chart-container" `
            + 'style="height: 100%; flex: 1; display: flex; flex-direction: row;" '
            + '></div>';
        this.chartContainer = parseHTML(chartContainerHtml)[0];
        this.targetEl.append(this.chartContainer);
        return this.chartContainer;
    }


    /**
     * Returns Angular definition for settings panel.
     * @override
     * @return {object}
     */
    getSetting() {
        const self = this;
        const maps = Object.keys(maxmindToHighmaps.mapsPaths).map((map) => ({
            mapID: map,
            mapL10n: l10n(`maps.${map}`)
        }));
        return {
            template: getSettingsPanelTemplate({
                idPrefix: self.instanceId,
                minRangesNumber: 2,
                maxRangesNumber: 10
            }),
            scope: {
                l10n,
                allAreas: self.params.allAreas,
                rangesNumber: self.params.rangesNumber,
                minInRange: self.params.minInRange || '',
                maxInRange: self.params.maxInRange || '',
                maps,
                map: constants.defaultMap,
                updateMap: function () {
                    const scope = this;

                    const chartUpdatedByValues = self.updateChartByValues(
                        scope.rangesNumber, scope.minInRange, scope.maxInRange);
                    if (chartUpdatedByValues) {
                        return;
                    }

                    const newMap = scope.map || constants.defaultMap;
                    const chartRedrawnByValues = self.redrawsChartByValues(newMap, scope.allAreas);
                    if (chartRedrawnByValues) {
                        return;
                    }
                }
            }
        };
    }


    /**
     * Registers map data by given map path and renders error if no map data found.
     * @param {string} mapShortcut Shortcut to get map path.
     * @returns {string} Map path.
     */
    registerMapData(mapShortcut) {
        const mapPath = maxmindToHighmaps.mapsPaths[mapShortcut];
        const mapData = mapPath ? highmapsMapdata[mapPath] : null;
        if (!mapData) {
            this.renderError(l10n('highcharts.mapNotFound', { mapShortcut, mapPath }));
            return '';
        }
        Highcharts.maps[mapPath] = mapData;
        return mapPath;
    }


    /**
     * Converts input data set to data set for Highcharts.
     * @param {object} tableData Zeppelin/Helium data set.
     * @returns {ChartDataItem[]}
     */
    getData(tableData) {
        const regionsMap = maxmindToHighmaps.regions[this.params.map];
        const data = tableData.rows
            .map(row => {
                const regionId = row[this.config.region.index];
                const value = parseFloat(row[this.config.value.index]);
                return {
                    // Uses regionId as country code if no regions map found for this map.
                    'hc-key': regionsMap ? regionsMap[regionId] : regionId.toLowerCase(),
                    value
                };
            })
            .filter(dataItem => dataItem['hc-key'] && !isNaN(dataItem.value));
        if (data.length === 0) {
            this.renderError(l10n('data.emptySet'));
        } else {
            this.hideError();
        }
        return data;
    }


    /**
     * Renders given error message.
     * @param {string} errorMsg
     */
    renderError(errorMsg) {
        if (!this.errorElement) {
            const errorElementHtml = '<span style="color: red;"></span>';
            this.errorElement = parseHTML(errorElementHtml)[0];
            this.targetEl.prepend(this.errorElement);
        }
        this.errorElement.innerHTML = errorMsg;
        this.errorElement.hidden = false;
        this.chartContainer.style.display = 'none';
    }


    /**
     * Hides error message.
     */
    hideError() {
        if (this.errorElement) {
            this.errorElement.hidden = true;
        }
        this.chartContainer.style.display = 'flex';
    }

}
