
function concatStyles(...rules) {
    return rules.join(';');
}

/**
 * Generates HTML for zeppelin-rf-map settings panel.
 * @param {object} params
 * @param {string} params.idPrefix
 */
function getSettingsPanelTemplate(params) {
    const idPrefix = params.idPrefix;
    const ids = {
        allAreas: `${idPrefix}_all-areas`,
        rangesNumber: `${idPrefix}_ranges-number`,
        minInRange: `${idPrefix}_min-in-range`,
        maxInRange: `${idPrefix}_max-in-range`,
        map: `${idPrefix}_maps`
    };
    const styles = {
        label: concatStyles(
            'margin-right: 10px'
        ),
        input: concatStyles(
            'text-align: right',
            'width: 100px'
        ),
        formGroup: concatStyles(
            'margin-left: 30px',
            'margin-right: 30px'
        )
    };

    return `
<form class="form-horizontal form-inline" ng-submit="updateMap()">
    <div class="form-group" style="${styles.formGroup}">
        <label for="${ids.map}" style="${styles.label}">
            {{:: l10n('settings.map') }}:
        </label>
        <select class="form-control"
            id="${ids.map}"
            name="map"
            ng-model="map"
            ng-change="updateMap()"
        >
            <option ng-repeat="map in maps track by map.mapID"
                value="{{ map.mapID }}"
            >
                {{ map.mapL10n }}
            </option>
        </select>
    </div>
    <div class="form-group" style="${styles.formGroup}">
        <label for="${ids.rangesNumber}" style="${styles.label}">
            {{:: l10n('settings.rangesNumber') }}:
        </label>
        <input type="number"
            style="${styles.input}"
            min="${params.minRangesNumber}"
            max="${params.maxRangesNumber}"
            class="form-control"
            id="${ids.rangesNumber}"
            name="ranges-number"
            ng-model="rangesNumber"
            ng-blur="updateMap()"
            ng-enter="updateMap()"
        >
    </div>
    <div class="form-group" style="${styles.formGroup}">
        <label for="${ids.minInRange}" style="${styles.label}">
            {{:: l10n('settings.minInRange') }}:
        </label>
        <input type="number"
            style="${styles.input}"
            class="form-control"
            id="${ids.minInRange}"
            name="min-in-range"
            ng-model="minInRange"
            ng-blur="updateMap()"
            ng-enter="updateMap()"
        >
    </div>
    <div class="form-group" style="${styles.formGroup}">
        <label for="${ids.maxInRange}" style="${styles.label}">
            {{:: l10n('settings.maxInRange') }}:
        </label>
        <input type="number"
            style="${styles.input}"
            class="form-control"
            id="${ids.maxInRange}"
            name="max-in-range"
            ng-model="maxInRange"
            ng-blur="updateMap()"
            ng-enter="updateMap()"
        >
    </div>
    <div class="form-group" style="${styles.formGroup}">
        <div class="checkbox">
            <label>
                <input type="checkbox"
                    id="${ids.allAreas}"
                    name="all-areas",
                    ng-model="allAreas"
                    ng-change="updateMap()"
                >
                {{:: l10n('settings.allAreas') }}
            </label>
        </div>
    </div>
</form>
    `;
}


export default getSettingsPanelTemplate;
