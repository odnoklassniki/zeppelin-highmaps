import Polyglot from 'node-polyglot';
import get from 'lodash/get';
import l10nPhrases from './../l10n';


const locale = navigator.language;
const defaultLocale = 'en';
const defaultPhrases = l10nPhrases[defaultLocale];
const phrases = l10nPhrases[locale] || defaultPhrases;


/**
 * Logs arguments with fixed app-related prefix.
 * @private
 * @param {...any} args
 */
function log(...args) {
    console.log('[zeppelin-highmaps l10n]', ...args);
}


/**
 * Missing localization key handler.
 * @private
 * @param {string} missedKey Missed localization key.
 * @param {object} [opts] Default key template options.
 */
function onMissingKey(missedKey, opts) {
    const defaultValue = get(defaultPhrases, missedKey, '');
    if (defaultValue) {
        log(`localization from default (${defaultLocale}) locale is used for '${missedKey}' key`);
        return Polyglot.transformPhrase(defaultValue, opts, defaultLocale);
    }
    log(`localization for key '${missedKey}' not found!`);
    return missedKey;
}


const polyglot = new Polyglot({
    phrases,
    locale,
    allowMissing: true,
    onMissingKey
});


/**
 * Returns localized phrase by it's key. Interpolation and plural forms are supported.
 * @param {string} key Phrase key.
 * @param {object} params Interpolation parameters.
 * @returns {string} Localized phrase.
 * @example
 * const phrases = {
 *   test: {
 *     simple: 'Hello, world!',
 *     interpolateMe: 'Hello, %{name}!',
 *     // use 'smart_count' for plural forms.
 *     plural: 'Hello, %{smart_count} world! |||| Hello, %{smart_count} worlds!'
 *   }
 * };
 * ...
 * l10n('test.simple'); // Hello, world!
 * l10n('test.interpolateMe', { name: 'WORLD' }); // Hello, WORLD!
 * l10n('test.plural', { smart_count: 1 }); // Hello, 1 world!
 * l10n('test.plural', { smart_count: 5 }); // Hello, 5 worlds!
 */
export const l10n = polyglot.t.bind(polyglot);
