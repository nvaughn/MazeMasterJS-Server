"use strict";
/**
 * Helper Functions for Maze Master JS
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Returns string array of the selected (bitwise) values within
 * the given enumeration.
 *
 * @param bitwiseEnum - Only works with bitwise enumerations!
 * @param selectedBits - Number representing the selected bits
 */
function listSelectedBitNames(bitwiseEnum, selectedBits) {
    let ret = '';
    for (const dir in bitwiseEnum) {
        if (Number(dir)) {
            let bitVal = parseInt(dir);
            if (!!(bitVal & selectedBits)) {
                let stringVal = bitwiseEnum[bitVal];
                ret += ret.length == 0 ? stringVal : ', ' + stringVal;
            }
        }
    }
    if (ret.length == 0)
        ret = 'NONE';
    return ret;
}
exports.listSelectedBitNames = listSelectedBitNames;
/**
 * Returns string array of the selected (bitwise) values within
 * the given enumeration.
 *
 * @param bitwiseEnum - Only works with bitwise enumerations!
 * @param selectedBits - Number representing the selected bits
 */
function getSelectedBitNames(bitwiseEnum, selectedBits) {
    let ret = new Array();
    for (const dir in bitwiseEnum) {
        if (Number(dir)) {
            let bitVal = parseInt(dir);
            if (!!(bitVal & selectedBits)) {
                let stringVal = bitwiseEnum[bitVal];
                ret.push(stringVal);
            }
        }
    }
    if (ret.length == 0)
        ret.push('NONE');
    return ret;
}
exports.getSelectedBitNames = getSelectedBitNames;
//# sourceMappingURL=Helpers.js.map