/**
 * Helper Functions for Maze Master JS
 */
import fs from 'fs';
import path from 'path';
import { format as fmt } from 'util';
import { Logger, LOG_LEVELS } from './Logger';
import Maze from './Maze';
import { DATABASES } from './Enumerations';
import { DAO_NeDb } from './DAO_NeDB';

const log = Logger.getInstance();
const DEFAULT_MAZE_STUB_FILE = path.resolve('data/maze-list.json');

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

export function generateDefaultMazes() {
    let mazeList = JSON.parse(fs.readFileSync(DEFAULT_MAZE_STUB_FILE, 'utf8'));
    let targetDb = DATABASES.MAZES;
    let dao = DAO_NeDb.getInstance();

    log.setLogLevel(LOG_LEVELS.DEBUG);

    for (let stub of mazeList.stubs) {
        let mazeId = fmt('%s:%s:%s:%s', stub.height, stub.width, stub.challenge, stub.seed);
        let doc = dao.getDocument(targetDb, mazeId, function cbGetMaze(err: Error, doc: any) {
            if (!doc) {
                log.info(__filename, 'generateDefaultMazes()', fmt('Maze %s not found in %s. Generating and storing...', mazeId, DATABASES[targetDb]));
                let maze = new Maze();
                maze.generate(stub.height, stub.width, stub.seed, stub.challenge);
                dao.insertDocument(targetDb, maze);
                console.log('\r\n' + maze.TextRender);
            } else {
                log.warn(__filename, 'generateDefaultMazes()', fmt('Maze %s already exists in %s.', mazeId, DATABASES[targetDb]));
            }
        });
    }
}
