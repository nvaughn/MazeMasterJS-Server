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
const NeDB = require("nedb");
const log = Logger_1.default.getInstance();
const mazesDbFile = 'data/mazes.db';
const scoresDbFile = 'data/scores.db';
const teamsDbFile = 'data/teams.db';
var DATABASES;
(function (DATABASES) {
    DATABASES[DATABASES["MAZES"] = 0] = "MAZES";
    DATABASES[DATABASES["SCORES"] = 1] = "SCORES";
    DATABASES[DATABASES["TEAMS"] = 2] = "TEAMS";
})(DATABASES = exports.DATABASES || (exports.DATABASES = {}));
class LocalDAO {
    // must use getInstance()
    constructor() {
        log.info(__filename, '', util_1.format('%s %s', !file_exists_1.default.sync(mazesDbFile) ? 'Creating' : 'Loading', mazesDbFile));
        this.dbMazes = new NeDB({ filename: mazesDbFile, autoload: true });
        // NOTE: NeDB automatically invokes unique index on _id ... leaving commented code for future reference
        //
        // this.dbMazes.ensureIndex({ fieldName: '_id', unique: true }, function(err) {
        //     log.error(__filename, 'constructor()', 'Unable to ensure unique index on field _id in ' + mazesDbFile, err);
        // });
        log.info(__filename, '', util_1.format('%s %s', !file_exists_1.default.sync(scoresDbFile) ? 'Creating' : 'Loading', scoresDbFile));
        this.dbScores = new NeDB({ filename: scoresDbFile, autoload: true });
        log.info(__filename, '', util_1.format('%s %s', !file_exists_1.default.sync(teamsDbFile) ? 'Creating' : 'Loading', teamsDbFile));
        this.dbTeams = new NeDB({ filename: teamsDbFile, autoload: true });
    }
    // singleton instance pattern
    static getInstance() {
        if (!LocalDAO.instance) {
            LocalDAO.instance = new LocalDAO();
        }
        return LocalDAO.instance;
    }
    insertDocument(targetDb, object, callback) {
        let fnName = 'insertDocument([DocID: ' + object.id + '])';
        let cbName = callback !== undefined ? callback.name : 'N/A';
        // set a database reference object
        let tDb = targetDb == DATABASES.MAZES ? this.dbMazes : targetDb == DATABASES.SCORES ? this.dbScores : this.dbTeams;
        tDb.insert(object, function (err, newDoc) {
            if (err && err !== undefined)
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
        // attempt to update the document with the given id
        tDb.update({ _id: object.id }, object, {}, function (err, numReplaced) {
            if (err && err !== undefined)
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
        tDb.findOne({ _id: objectId }, function (err, doc) {
            if (err && err !== undefined)
                throw err;
            if (callback !== undefined)
                callback(err, doc);
            log.debug(__filename, fnName, util_1.format('[%s].%s completed. Callback to %s.', DATABASES[targetDb], objectId, cbName));
        });
    }
    removeDocument(targetDb, objectId, callback) {
        let fnName = 'removeDocument([DocID: ' + objectId + '])';
        let cbName = callback !== undefined ? callback.name : 'N/A';
        log.debug(__filename, fnName, util_1.format('[%s].%s entered.', DATABASES[targetDb], objectId));
        // set a database reference object
        let tDb = targetDb == DATABASES.MAZES ? this.dbMazes : targetDb == DATABASES.SCORES ? this.dbScores : this.dbTeams;
        // find the first matching document
        tDb.remove({ _id: objectId }, function (err, numRemoved) {
            if (err && err !== undefined)
                throw err;
            if (callback !== undefined)
                callback(err, numRemoved);
            log.debug(__filename, fnName, util_1.format('[%s].%s completed. %s documents removed. Callback to %s.', DATABASES[targetDb], objectId, numRemoved, cbName));
        });
    }
}
exports.LocalDAO = LocalDAO;
exports.default = LocalDAO;
//# sourceMappingURL=DAO_Local.js.map