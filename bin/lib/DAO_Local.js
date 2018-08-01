"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 * Data access object abstracts database implementation from server logic
 * allowing the underlying database to be replaced if needed.
 *
 * All objects passed MUST supply an "object.id" property that returns
 * a unique value.
 *
 * LocalDAO wraps access to a local, document-based NO-SQL database called
 * "NeDB" that stores data as json in local text files.  The NeDB API closely
 * matches the MongoDB API, so creating a MongoDAO should be relatively easy
 * if NeDB proves unstable or doesn't perform well enough.
 *
 */
const Logger_1 = __importDefault(require("./Logger"));
const file_exists_1 = __importDefault(require("file-exists"));
const util_1 = require("util");
const nedb_1 = __importDefault(require("nedb"));
const lzutf8_1 = __importDefault(require("lzutf8"));
const log = Logger_1.default.getInstance();
const mazesDbFile = 'data/mazes.db';
const scoresDbFile = 'data/scores.db';
const teamsDbFile = 'data/teams.db';
const ENABLE_COMPRESSION = true; // enables inline text compression
var DATABASES;
(function (DATABASES) {
    DATABASES[DATABASES["MAZES"] = 0] = "MAZES";
    DATABASES[DATABASES["SCORES"] = 1] = "SCORES";
    DATABASES[DATABASES["TEAMS"] = 2] = "TEAMS";
})(DATABASES = exports.DATABASES || (exports.DATABASES = {}));
class LocalDAO {
    // must use getInstance()
    constructor() {
        log.info(__filename, '', util_1.format('%s %s', !file_exists_1.default.sync(scoresDbFile) ? 'Creating' : 'Loading', mazesDbFile));
        this.dbMazes = new nedb_1.default({ filename: mazesDbFile, autoload: true });
        this.dbMazes.ensureIndex({ fieldName: 'id', unique: true }, function (err) {
            if (err)
                log.error(__filename, 'constructor()', 'Unable to ensure unique index on field id in ' + mazesDbFile, err);
        });
        log.info(__filename, '', util_1.format('%s %s', !file_exists_1.default.sync(scoresDbFile) ? 'Creating' : 'Loading', scoresDbFile));
        this.dbScores = new nedb_1.default({ filename: scoresDbFile, autoload: true });
        this.dbScores.ensureIndex({ fieldName: 'id', unique: true }, function (err) {
            if (err)
                log.error(__filename, 'constructor()', 'Unable to ensure unique index on field id in ' + scoresDbFile, err);
        });
        log.info(__filename, '', util_1.format('%s %s', !file_exists_1.default.sync(teamsDbFile) ? 'Creating' : 'Loading', teamsDbFile));
        this.dbTeams = new nedb_1.default({ filename: teamsDbFile, autoload: true });
        this.dbTeams.ensureIndex({ fieldName: 'id', unique: true }, function (err) {
            if (err)
                log.error(__filename, 'constructor()', 'Unable to ensure unique index on field id in ' + teamsDbFile, err);
        });
    }
    // singleton instance pattern
    static getInstance() {
        if (!LocalDAO.instance) {
            LocalDAO.instance = new LocalDAO();
        }
        return LocalDAO.instance;
    }
    compressObject(obj) {
        return { id: obj.Id, docBody: lzutf8_1.default.compress(JSON.stringify(obj), { outputEncoding: 'StorageBinaryString' }) };
    }
    decompressDocument(doc) {
        let dDoc = lzutf8_1.default.decompress(doc.docBody, { inputEncoding: 'StorageBinaryString' });
        return JSON.parse(dDoc);
        //return JSON.parse(lzutf8.decompress(doc['docBody']));
    }
    insertDocument(targetDb, object, callback) {
        let fnName = 'insertDocument([DocID: ' + object.id + '])';
        let cbName = callback !== undefined ? callback.name : 'N/A';
        // set a database reference object
        let tDb = targetDb == DATABASES.MAZES ? this.dbMazes : targetDb == DATABASES.SCORES ? this.dbScores : this.dbTeams;
        // compress the document for local DB storage
        if (ENABLE_COMPRESSION)
            object = this.compressObject(object);
        // store the object
        tDb.insert(object, function (err, newDoc) {
            if (err)
                throw err;
            if (callback !== undefined)
                callback(err, newDoc);
            log.debug(__filename, fnName, util_1.format('[%s].%s completed. Callback to %s.', DATABASES[targetDb], object.id, cbName));
        });
    }
    updateDocument(targetDb, object, callback) {
        let fnName = 'updateDocument([DocID: ' + object.id + '])';
        let cbName = callback !== undefined ? callback.name : 'N/A';
        // set a database reference object
        let tDb = targetDb == DATABASES.MAZES ? this.dbMazes : targetDb == DATABASES.SCORES ? this.dbScores : this.dbTeams;
        // compress the document for local DB storage
        if (ENABLE_COMPRESSION)
            object = this.compressObject(object);
        // attempt to update the document with the given id
        tDb.update({ id: object.id }, object, {}, function (err, numReplaced) {
            if (err)
                throw err;
            if (callback !== undefined)
                callback(err, numReplaced);
            log.debug(__filename, fnName, util_1.format('[%s].%s completed. %s documents updated. Callback to %s.', DATABASES[targetDb], object.id, numReplaced, cbName));
        });
    }
    getDocument(targetDb, objectId, callback) {
        let fnName = 'getDocument([DocID: ' + objectId + '])';
        let cbName = callback !== undefined ? callback.name : 'N/A';
        // set a database reference object
        let tDb = targetDb == DATABASES.MAZES ? this.dbMazes : targetDb == DATABASES.SCORES ? this.dbScores : this.dbTeams;
        // find the first matching document
        tDb.findOne({ id: objectId }, function (err, doc) {
            if (err)
                throw err;
            // decompress the document if found
            if (doc && ENABLE_COMPRESSION)
                doc = LocalDAO.getInstance().decompressDocument(doc);
            log.debug(__filename, fnName, util_1.format('[%s].%s completed. Callback to %s.', DATABASES[targetDb], objectId, cbName));
            callback(err, doc);
        });
    }
    removeDocument(targetDb, objectId, callback) {
        let fnName = 'removeDocument([DocID: ' + objectId + '])';
        let cbName = callback !== undefined ? callback.name : 'N/A';
        log.debug(__filename, fnName, util_1.format('[%s].%s entered.', DATABASES[targetDb], objectId));
        // set a database reference object
        let tDb = targetDb == DATABASES.MAZES ? this.dbMazes : targetDb == DATABASES.SCORES ? this.dbScores : this.dbTeams;
        // find the first matching document
        tDb.remove({ id: objectId }, function (err, numRemoved) {
            if (err)
                throw err;
            if (callback !== undefined)
                callback(err, numRemoved);
            log.debug(__filename, fnName, util_1.format('[%s].%s completed. %s documents removed. Callback to %s.', DATABASES[targetDb], objectId, numRemoved, cbName));
        });
    }
    getDocumentCount(targetDb, callback) {
        let tDb = targetDb == DATABASES.MAZES ? this.dbMazes : targetDb == DATABASES.SCORES ? this.dbScores : this.dbTeams;
        tDb.count({}, function (err, n) {
            if (err)
                throw err;
            log.debug(__filename, 'getDocumentCount()', util_1.format('[%s].getDocumentCount() completed. %s documents found. Callback to %s.', DATABASES[targetDb], n, callback.name));
            callback(err, n);
        });
    }
}
exports.LocalDAO = LocalDAO;
exports.default = LocalDAO;
//# sourceMappingURL=DAO_Local.js.map