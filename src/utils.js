/**
 * Converts given source to number.
 * @param {any} source
 * @returns {number}
 */
export function toNumber(source) {
    if (typeof source === 'number') {
        return source;
    }
    if (source && typeof source === 'string') {
        return parseInt(source, 10);
    }
    return NaN;
}
