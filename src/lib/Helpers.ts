/**
 * Helper Functions for Maze Master JS
 */
import fs from 'fs';
import path from 'path';
import { format as fmt } from 'util';

import { DATABASES } from './Enums';
import { Logger } from './Logger';
import Maze from './Maze';

// static class instances
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

/**
 * Generates a series of default mazes and stores them using the given data access object
 *
 * @param dao - The Data Access Object to use for storing the new maze data
 */
export function generateDefaultMazes(dao: any) {
    let mazeList = JSON.parse(fs.readFileSync(DEFAULT_MAZE_STUB_FILE, 'utf8'));
    let targetDb = DATABASES.MAZES;

    for (let stub of mazeList.stubs) {
        let mazeId = fmt('%s:%s:%s:%s', stub.height, stub.width, stub.challenge, stub.seed);
        dao.getDocument(targetDb, mazeId, function cbGetMaze(err: Error, doc: any) {
            if (!doc) {
                log.info(__filename, 'generateDefaultMazes()', fmt('Maze %s not found in %s. Generating and storing...', mazeId, DATABASES[targetDb]));
                let maze = new Maze();
                maze.generate(stub.height, stub.width, stub.seed, stub.challenge);
                dao.insertDocument(targetDb, maze, function cbInsertMaze(err: any, newDoc: Maze) {
                    console.log('\r\n' + maze.TextRender);
                });
            } else {
                log.warn(__filename, 'generateDefaultMazes()', fmt('Maze %s already exists in %s.', mazeId, DATABASES[targetDb]));
            }
        });
    }
}
