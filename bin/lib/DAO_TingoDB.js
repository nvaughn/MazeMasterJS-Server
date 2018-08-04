"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 * Implements the DataAccessObject Interface to provide a mostly MongoDB compatible
 * abstraction layer for database operations.  This class implements a DAO for the
 * TingoDb (www.tingodb.com) embedded, file-based, JSON data store.
 *
 * All objects passed MUST HAVE an "id" property that returns a unique value.
 *
 */
const fs_1 = __importDefault(require("fs"));
const lzutf8_1 = __importDefault(require("lzutf8"));
const path_1 = __importDefault(require("path"));
const path_exists_1 = __importDefault(require("path-exists"));
const util_1 = require("util");
const Enums_1 = require("./Enums");
const Logger_1 = __importDefault(require("./Logger"));
const TDB = require('tingodb')().Db;
const log = Logger_1.default.getInstance();
const tingoDBDataFolder = 'data/tingo.db';
// Enable to compress / decompress document bodies during db insert/read calls.
// Compression improves read/write performance of local, file-based DB functions
// by reducing the file size on disk and limiting searchable fields in the database.
// Note:  This breaks the DB search functionality!
const COMPRESSION_ENABLED = true;
// Supported Options: Base64 (smallest and as fast as SBS), StorageBinaryString (small, fast, but unreadable), ByteArray (requires buffering)
const COMPRESSION_ENCODING = 'Base64';
class DataAccessObject_TingoDB {
    // must use getInstance()
    constructor() {
        let fp = path_1.default.resolve(tingoDBDataFolder);
        if (!path_exists_1.default.sync(fp)) {
            log.info(__filename, '', fp + ' not found, creating.');
            fs_1.default.mkdirSync(fp);
        }
        log.info(__filename, '', 'Preparing database and collections...');
        this.db = new TDB(tingoDBDataFolder, {});
        // create mazes collection w/ unique index
        this.colMazes = this.db.collection('mazes.col');
        this.colMazes.ensureIndex({ id: 1 }, { unique: true });
        // create scores collection w/ unique index
        this.colScores = this.db.collection('scores.col');
        this.colScores.ensureIndex({ id: 1 }, { unique: true });
        // create teams collection w/ unique index
        this.colTeams = this.db.collection('teams.col');
        this.colTeams.ensureIndex({ id: 1 }, { unique: true });
        // set ready flag
        log.info(__filename, 'constructor()', 'TingoDB and collections ready.');
    }
    openDb(callback) {
        this.db.open((err, db) => {
            this.db = db;
            if (err) {
                log.error(__filename, 'openDb()', 'Error attempting to open ' + tingoDBDataFolder, err);
            }
            else {
                log.debug(__filename, 'openDb()', 'TingoDB Opened.');
            }
            callback();
        });
    }
    closeDb() {
        if (this.db) {
            this.db.close();
            log.debug(__filename, 'closeDb()', 'TingoDB Closed.');
        }
        else {
            log.warn(__filename, 'closeDb()', 'TingoDB Not Defined.');
        }
    }
    /**
     * Returns singleton instance of this class
     */
    static getInstance() {
        if (!this.instance) {
            log.info(__filename, 'getInstance()', 'New DataAccessObject_TingoDB created.');
            this.instance = new DataAccessObject_TingoDB();
        }
        return this.instance;
    }
    /**
     *
     * @param targetName - name of the DB or Collection to return for use
     */
    getTargetRepository(targetName) {
        return targetName == Enums_1.DATABASES.MAZES ? this.colMazes : targetName == Enums_1.DATABASES.SCORES ? this.colScores : this.colTeams;
    }
    /**
     * Compresses the body of the given MazeMasterJS object, but leaves the object.Id
     * @param obj - an uncompressed object
     */
    compressObject(obj) {
        return { id: obj.Id, docBody: lzutf8_1.default.compress(JSON.stringify(obj), { outputEncoding: COMPRESSION_ENCODING }) };
    }
    /**
     * Decompresses the docBody field and returns parsed JSON object version of document
     * @param doc - a compressed document
     */
    decompressDocument(doc) {
        let dDoc = lzutf8_1.default.decompress(doc.docBody, { inputEncoding: COMPRESSION_ENCODING });
        return JSON.parse(dDoc);
    }
    /**
     * Inserts a document into the given database / collection
     * @param targetRepo - target database/collection
     * @param object - the object to store
     * @param callback - error/new document returned via callback
     */
    insertDocument(targetRepo, object, callback) {
        let fnName = 'insertDocument([DocID: ' + object.id + '])';
        let cbName = callback !== undefined ? callback.name : 'N/A';
        // set a database reference object
        let tColl = targetRepo == Enums_1.DATABASES.MAZES ? this.colMazes : targetRepo == Enums_1.DATABASES.SCORES ? this.colScores : this.colTeams;
        // compress the document for local DB storage
        if (COMPRESSION_ENABLED)
            object = this.compressObject(object);
        // store the object
        tColl.insert(object, { fullResult: true }, function (err, newDoc) {
            if (err) {
                log.error(__filename, 'insertDocument', 'Error inserting document.', err);
            }
            else {
                log.debug(__filename, fnName, util_1.format('[%s].%s completed. Callback to %s.', Enums_1.DATABASES[targetRepo], object.id, cbName));
            }
            callback(err, newDoc ? newDoc[0] : undefined);
        });
    }
    /**
     * Updates and stores the given document
     * @param targetRepo - target database/collection
     * @param object - the object to store
     * @param callback - error and/or updated document returned via callback
     */
    updateDocument(targetRepo, object, callback) {
        let fnName = 'updateDocument([DocID: ' + object.id + '])';
        let cbName = callback !== undefined ? callback.name : 'N/A';
        // set a database reference object
        let tColl = this.getTargetRepository(targetRepo);
        // compress the document for local DB storage
        if (COMPRESSION_ENABLED)
            object = this.compressObject(object);
        // attempt to update the document with the given id
        tColl.findAndModify({ id: object.id }, [['id', 1]], { $set: object }, { new: true }, (err, doc) => {
            if (err) {
                log.error(__filename, 'updateDocument', 'Error error updating document.', err);
            }
            else {
                log.debug(__filename, fnName, util_1.format('[%s].%s completed. %s documents updated. Callback to %s.', Enums_1.DATABASES[targetRepo], object.id, doc, cbName));
            }
            if (COMPRESSION_ENABLED)
                doc = this.decompressDocument(doc);
            callback(err, doc);
        });
    }
    /**
     * Returns the first document found with the given id
     * @param targetRepo - target database/collection
     * @param objectId - the id of the object to find
     * @param callback - error and/or located document returned via callback
     */
    getDocument(targetRepo, objectId, callback) {
        let fnName = 'getDocument([DocID: ' + objectId + '])';
        let cbName = callback !== undefined ? callback.name : 'N/A';
        // set a database reference object
        let tColl = this.getTargetRepository(targetRepo);
        // find the first matching document
        tColl.findOne({ id: objectId }, (err, doc) => {
            if (err) {
                log.error(__filename, 'insertDocument', 'Error inserting document.', err);
            }
            else {
                log.debug(__filename, fnName, util_1.format('[%s].%s completed. Callback to %s.', Enums_1.DATABASES[targetRepo], objectId, cbName));
            }
            if (doc && COMPRESSION_ENABLED)
                doc = this.decompressDocument(doc);
            callback(err, doc);
        });
    }
    /**
     * Removes document with matching objectId from the database/collection
     * @param targetRepo - target database/collection
     * @param objectId - the id of the object to find
     * @param callback - error and/or removed document returned via callback
     */
    removeDocument(targetRepo, objectId, callback) {
        let fnName = 'removeDocument([DocID: ' + objectId + '])';
        let cbName = callback !== undefined ? callback.name : 'N/A';
        log.debug(__filename, fnName, util_1.format('[%s].%s entered.', Enums_1.DATABASES[targetRepo], objectId));
        // set a database reference object
        let tColl = this.getTargetRepository(targetRepo);
        // find the first matching document
        tColl.findAndRemove({ id: objectId }, [['id', 'ascending']], function (err, doc) {
            if (err) {
                log.error(__filename, 'insertDocument', 'Error inserting document.', err);
            }
            log.debug(__filename, fnName, util_1.format('[%s].%s completed. %s documents removed. Callback to %s.', Enums_1.DATABASES[targetRepo], objectId, doc, cbName));
            callback(err, doc);
        });
    }
    /**
     * Counts and returns the number documents found in the given repository
     * @param targetRepo - target database/collection
     * @param callback - returns error / document count via callback
     */
    getDocumentCount(targetRepo, callback) {
        let tColl = this.getTargetRepository(targetRepo);
        tColl.find({}).count(function (err, count) {
            if (err) {
                log.error(__filename, 'insertDocument', 'Error inserting document.', err);
            }
            log.debug(__filename, 'getDocumentCount()', util_1.format('[%s] %s docs found. Callback: %s.', Enums_1.DATABASES[targetRepo], count, callback.name));
            callback(err, count);
        });
    }
}
exports.DataAccessObject_TingoDB = DataAccessObject_TingoDB;
exports.default = DataAccessObject_TingoDB;
//# sourceMappingURL=DAO_TingoDB.js.map