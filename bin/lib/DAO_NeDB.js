"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 * Implements the DataAccessObject Interface to provide a mostly MongoDB compatible
 * abstraction layer for database operations.
 *
 * This class implements a DAO for the NeDB (https://www.npmjs.com/package/nedb) embedded, file-based,
 * JSON data store.
 *
 * All objects passed MUST HAVE an "id" property that returns a unique value.
 *
 * WARNING: NeDB does NOT work correctly in virtualized host environments due to a problem
 * with flushToDisk.  NeDB is no longer supported by the author(s), so I've switched over
 * to TingoDb.
 *
 */
const lzutf8_1 = __importDefault(require("lzutf8"));
const nedb_1 = __importDefault(require("nedb"));
const util_1 = require("util");
const Enums_1 = require("./Enums");
const Logger_1 = __importDefault(require("./Logger"));
const log = Logger_1.default.getInstance();
const mazesDbFile = 'data/mazes.db';
const scoresDbFile = 'data/scores.db';
const teamsDbFile = 'data/teams.db';
// Enable to compress / decompress document bodies during db insert/read calls.
// Compression improves read/write performance of local, file-based DB functions
// by reducing the file size on disk and limiting searchable fields in the database.
// WARNING:  This breaks the DB search functionality!
const COMPRESSION_ENABLED = true;
// Supported Options: Base64 (smallest and as fast as SBS), StorageBinaryString (small, fast, but unreadable), ByteArray (requires buffering)
const COMPRESSION_ENCODING = 'Base64';
class DataAccessObject_NeDB {
    // must use getInstance()
    constructor() {
        log.info(__filename, '', util_1.format('Preparing database %s', mazesDbFile));
        this.dbMazes = new nedb_1.default({ filename: mazesDbFile, autoload: true });
        this.dbMazes.ensureIndex({ fieldName: 'id', unique: true }, function (err) {
            if (err)
                log.error(__filename, 'constructor()', 'Unable to ensure unique index on field id in ' + mazesDbFile, err);
        });
        log.info(__filename, '', util_1.format('Preparing database %s', mazesDbFile));
        this.dbScores = new nedb_1.default({ filename: scoresDbFile, autoload: true });
        this.dbScores.ensureIndex({ fieldName: 'id', unique: true }, function (err) {
            if (err)
                log.error(__filename, 'constructor()', 'Unable to ensure unique index on field id in ' + scoresDbFile, err);
        });
        log.info(__filename, '', util_1.format('Preparing database %s', mazesDbFile));
        this.dbTeams = new nedb_1.default({ filename: teamsDbFile, autoload: true });
        this.dbTeams.ensureIndex({ fieldName: 'id', unique: true }, function (err) {
            if (err)
                log.error(__filename, 'constructor()', 'Unable to ensure unique index on field id in ' + teamsDbFile, err);
        });
    }
    // singleton instance pattern
    static getInstance() {
        if (!DataAccessObject_NeDB.instance) {
            log.info(__filename, 'getInstance()', 'New DataAccessObject_NeDB created.');
            DataAccessObject_NeDB.instance = new DataAccessObject_NeDB();
        }
        return DataAccessObject_NeDB.instance;
    }
    insertDocument(targetDb, object, callback) {
        let fnName = 'insertDocument([DocID: ' + object.id + '])';
        let cbName = callback !== undefined ? callback.name : 'N/A';
        // set a database reference object
        let tDb = targetDb == Enums_1.DATABASES.MAZES ? this.dbMazes : targetDb == Enums_1.DATABASES.SCORES ? this.dbScores : this.dbTeams;
        // compress the document for local DB storage
        if (COMPRESSION_ENABLED)
            object = this.compressObject(object);
        // store the object
        tDb.insert(object, function (err, newDoc) {
            log.debug(__filename, fnName, util_1.format('[%s].%s completed. Callback to %s.', Enums_1.DATABASES[targetDb], object.id, cbName));
            callback(err, newDoc);
        });
    }
    updateDocument(targetDb, object, callback) {
        let fnName = 'updateDocument([DocID: ' + object.id + '])';
        let cbName = callback !== undefined ? callback.name : 'N/A';
        // set a database reference object
        let tDb = targetDb == Enums_1.DATABASES.MAZES ? this.dbMazes : targetDb == Enums_1.DATABASES.SCORES ? this.dbScores : this.dbTeams;
        // compress the document for local DB storage
        if (COMPRESSION_ENABLED)
            object = this.compressObject(object);
        // attempt to update the document with the given id
        tDb.update({ id: object.id }, object, {}, (err, numReplaced) => {
            log.debug(__filename, fnName, util_1.format('[%s].%s completed. %s documents updated. Callback to %s.', Enums_1.DATABASES[targetDb], object.id, numReplaced, cbName));
            this.getDocument(targetDb, object.id, (err, doc) => {
                callback(err, doc);
            });
        });
    }
    // compresses the object for storage, retaining the object.Id needed for retrieval
    compressObject(obj) {
        return { id: obj.Id, docBody: lzutf8_1.default.compress(JSON.stringify(obj), { outputEncoding: COMPRESSION_ENCODING }) };
    }
    getDocument(targetDb, objectId, callback) {
        let fnName = 'getDocument([DocID: ' + objectId + '])';
        let cbName = callback !== undefined ? callback.name : 'N/A';
        // set a database reference object
        let tDb = targetDb == Enums_1.DATABASES.MAZES ? this.dbMazes : targetDb == Enums_1.DATABASES.SCORES ? this.dbScores : this.dbTeams;
        // find the first matching document
        tDb.findOne({ id: objectId }, function (err, doc) {
            if (err)
                throw err;
            // decompress the document if found
            if (doc && COMPRESSION_ENABLED)
                doc = DataAccessObject_NeDB.getInstance().decompressDocument(doc);
            log.debug(__filename, fnName, util_1.format('[%s].%s completed. Callback to %s.', Enums_1.DATABASES[targetDb], objectId, cbName));
            callback(err, doc);
        });
    }
    // decompresses the document and reconstructs the JSON object from docBody
    decompressDocument(doc) {
        let dDoc = lzutf8_1.default.decompress(doc.docBody, { inputEncoding: COMPRESSION_ENCODING });
        return JSON.parse(dDoc);
    }
    removeDocument(targetDb, objectId, callback) {
        let fnName = 'removeDocument([DocID: ' + objectId + '])';
        let cbName = callback !== undefined ? callback.name : 'N/A';
        log.debug(__filename, fnName, util_1.format('[%s].%s entered.', Enums_1.DATABASES[targetDb], objectId));
        // set a database reference object
        let tDb = targetDb == Enums_1.DATABASES.MAZES ? this.dbMazes : targetDb == Enums_1.DATABASES.SCORES ? this.dbScores : this.dbTeams;
        // find the first matching document
        tDb.remove({ id: objectId }, function (err, numRemoved) {
            log.debug(__filename, fnName, util_1.format('[%s].%s completed. %s documents removed. Callback to %s.', Enums_1.DATABASES[targetDb], objectId, numRemoved, cbName));
            callback(err, { id: objectId });
        });
    }
    getDocumentCount(targetDb, callback) {
        let tDb = targetDb == Enums_1.DATABASES.MAZES ? this.dbMazes : targetDb == Enums_1.DATABASES.SCORES ? this.dbScores : this.dbTeams;
        tDb.count({}, function (err, count) {
            if (err)
                throw err;
            log.debug(__filename, 'getDocumentCount()', util_1.format('[%s] %s docs found. Callback: %s.', Enums_1.DATABASES[targetDb], count, callback.name));
            callback(err, count);
        });
    }
    closeDb() {
        // not implemented
    }
}
exports.DataAccessObject_NeDB = DataAccessObject_NeDB;
exports.default = DataAccessObject_NeDB;
//# sourceMappingURL=DAO_NeDB.js.map