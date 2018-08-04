"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Helper Functions for Maze Master JS
 */
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const Enums_1 = require("./Enums");
const Logger_1 = require("./Logger");
const Maze_1 = __importDefault(require("./Maze"));
// static class instances
const log = Logger_1.Logger.getInstance();
const DEFAULT_MAZE_STUB_FILE = path_1.default.resolve('data/maze-list.json');
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
function generateDefaultMazes(dao) {
    let mazeList = JSON.parse(fs_1.default.readFileSync(DEFAULT_MAZE_STUB_FILE, 'utf8'));
    let targetDb = Enums_1.DATABASES.MAZES;
    //    log.setLogLevel(LOG_LEVELS.DEBUG);
    for (let stub of mazeList.stubs) {
        let mazeId = util_1.format('%s:%s:%s:%s', stub.height, stub.width, stub.challenge, stub.seed);
        dao.getDocument(targetDb, mazeId, function cbGetMaze(err, doc) {
            if (!doc) {
                log.info(__filename, 'generateDefaultMazes()', util_1.format('Maze %s not found in %s. Generating and storing...', mazeId, Enums_1.DATABASES[targetDb]));
                let maze = new Maze_1.default();
                maze.generate(stub.height, stub.width, stub.seed, stub.challenge);
                dao.insertDocument(targetDb, maze, function cbInsertMaze(err, newDoc) {
                    console.log('\r\n' + maze.TextRender);
                });
            }
            else {
                log.warn(__filename, 'generateDefaultMazes()', util_1.format('Maze %s already exists in %s.', mazeId, Enums_1.DATABASES[targetDb]));
            }
        });
    }
}
exports.generateDefaultMazes = generateDefaultMazes;
//# sourceMappingURL=Helpers.js.map