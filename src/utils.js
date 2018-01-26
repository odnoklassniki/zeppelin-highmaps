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


/**
 * Checks is given numbers are same.
 * NaN is equal NaN in this case.
 * @param {number} a
 * @param {number} b
 * @returns {boolean}
 */
export function isSameNumber(a, b) {
    return isNaN(a) && isNaN(b) || a === b;
}
