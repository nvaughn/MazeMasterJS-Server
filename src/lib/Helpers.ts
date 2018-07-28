/**
 * Helper Functions for Maze Master JS
 */

/**
 * Returns string array of the selected (bitwise) values within
 * the given enumeration.
 *
 * @param bitwiseEnum - Only works with bitwise enumerations!
 * @param selectedBits - Number representing the selected bits
 */
export function listSelectedBitNames(bitwiseEnum: Object, selectedBits: number): string {
    let ret: string = '';

    for (const dir in bitwiseEnum) {
        if (Number(dir)) {
            let bitVal: number = parseInt(dir);
            if (!!(bitVal & selectedBits)) {
                let stringVal: string = (<any>bitwiseEnum)[bitVal];
                ret += ret.length == 0 ? stringVal : ', ' + stringVal;
            }
        }
    }

    if (ret.length == 0) ret = 'NONE';
    return ret;
}

/**
 * Returns string array of the selected (bitwise) values within
 * the given enumeration.
 *
 * @param bitwiseEnum - Only works with bitwise enumerations!
 * @param selectedBits - Number representing the selected bits
 */
export function getSelectedBitNames(bitwiseEnum: Object, selectedBits: number): Array<string> {
    let ret: Array<string> = new Array<string>();

    for (const dir in bitwiseEnum) {
        if (Number(dir)) {
            let bitVal: number = parseInt(dir);
            if (!!(bitVal & selectedBits)) {
                let stringVal: string = (<any>bitwiseEnum)[bitVal];
                ret.push(stringVal);
            }
        }
    }

    if (ret.length == 0) ret.push('NONE');

    return ret;
}
