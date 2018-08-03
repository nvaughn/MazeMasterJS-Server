"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Enums_1 = require("./Enums");
const lowdb_1 = __importDefault(require("lowdb"));
const FileSync_1 = __importDefault(require("lowdb/adapters/FileSync"));
const Logger_1 = require("./Logger");
const util_1 = require("util");
const file_exists_1 = __importDefault(require("file-exists"));
const LOW_DB_FILE = 'data/lowdb.json';
const log = Logger_1.Logger.getInstance();
const adapter = new FileSync_1.default(LOW_DB_FILE);
const db = lowdb_1.default(adapter);
class DataAccessObject_lowdb {
    // must use getInstance()
    constructor() {
        log.info(__filename, '', util_1.format('%s %s', !file_exists_1.default.sync(LOW_DB_FILE) ? 'Creating' : 'Loading', LOW_DB_FILE));
        db.defaults({ MAZES: [], SCORES: [], TEAMS: [] }).write();
    }
    // singleton instance pattern
    static getInstance() {
        if (!DataAccessObject_lowdb.instance) {
            log.info(__filename, 'getInstance()', 'New DataAccessObject_NeDB created.');
            DataAccessObject_lowdb.instance = new DataAccessObject_lowdb();
        }
        return DataAccessObject_lowdb.instance;
    }
    insertDocument(targetDb, object, callback) {
        let err;
        try {
            db.get(Enums_1.DATABASES[targetDb])
                .push(object)
                .write();
        }
        catch (error) {
            err = error;
        }
        callback(err, object);
    }
    updateDocument(targetDb, object, callback) {
        let err;
        try {
            db.get(Enums_1.DATABASES[targetDb])
                .find({ id: object.Id })
                .assign({ object })
                .write();
        }
        catch (error) {
            err = error;
        }
        callback(err, 1);
    }
    getDocument(targetDb, objectId, callback) {
        let err;
        let doc;
        log.debug(__filename, 'getDocument(' + objectId + ')', 'Searching...');
        try {
            doc = db
                .get(Enums_1.DATABASES[targetDb])
                .filter({ id: objectId })
                .value();
            console.log('found: %s', doc.Mazes);
        }
        catch (error) {
            err = error;
        }
        callback(err, doc.Maze);
    }
    removeDocument(targetDb, objectId, callback) {
        let err;
        let numRemoved = 0;
        try {
            numRemoved = db
                .get(Enums_1.DATABASES[targetDb])
                .size()
                .value();
            db.get(Enums_1.DATABASES[targetDb])
                .remove({ id: objectId })
                .write();
            numRemoved =
                numRemoved -
                    db
                        .get(Enums_1.DATABASES[targetDb])
                        .size()
                        .value();
        }
        catch (error) {
            err = error;
        }
        callback(err, numRemoved);
    }
    getDocumentCount(targetDb, callback) {
        let err;
        let count = 0;
        try {
            count = db
                .get(Enums_1.DATABASES[targetDb])
                .size()
                .value();
        }
        catch (error) {
            err = error;
        }
        callback(err, count);
    }
}
exports.DataAccessObject_lowdb = DataAccessObject_lowdb;
exports.default = DataAccessObject_lowdb;
//# sourceMappingURL=DAO_lowdb.js.map