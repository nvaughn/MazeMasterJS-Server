/**
 *
 * Data access object abstracts database implementation from server logic
 * allowing the underlying database to be replaced if needed.
 *
 * All objects passed MUST HAVE an "object.id" property that returns a unique value.
 *
 * LocalDAO wraps access to a local, document-based NO-SQL database called
 * "NeDB" that stores data as json in local text files.  The NeDB API closely
 * matches the MongoDB API, so creating a MongoDAO should be relatively easy
 * if NeDB proves unstable or doesn't perform well enough.
 *
 */
import Logger from './Logger';
import fileExists from 'file-exists';
import {format as fmt} from 'util';
import NeDB from 'nedb';
import lzutf8 from 'lzutf8';
import {DATABASES} from './Enums';
import {DataAccessObject} from './DAO_Interface';

const log = Logger.getInstance();

const mazesDbFile = 'data/mazes.db';
const scoresDbFile = 'data/scores.db';
const teamsDbFile = 'data/teams.db';

const COMPRESSION_ENABLED = true; // enables inline text compression
// Supported Options: Base64 (smallest and as fast as SBS), StorageBinaryString (small, fast, but unreadable), ByteArray (requires buffering)
const COMPRESSION_ENCODING = 'Base64';

export class DataAccessObject_NeDB implements DataAccessObject {
    private static instance: DataAccessObject_NeDB;
    private dbMazes: NeDB;
    private dbScores: NeDB;
    private dbTeams: NeDB;

    // must use getInstance()
    private constructor() {
        log.info(__filename, '', fmt('%s %s', !fileExists.sync(scoresDbFile) ? 'Creating' : 'Loading', mazesDbFile));
        this.dbMazes = new NeDB({filename: mazesDbFile, autoload: true});
        this.dbMazes.ensureIndex({fieldName: 'id', unique: true}, function(err) {
            if (err) log.error(__filename, 'constructor()', 'Unable to ensure unique index on field id in ' + mazesDbFile, err);
        });

        log.info(__filename, '', fmt('%s %s', !fileExists.sync(scoresDbFile) ? 'Creating' : 'Loading', scoresDbFile));
        this.dbScores = new NeDB({filename: scoresDbFile, autoload: true});
        this.dbScores.ensureIndex({fieldName: 'id', unique: true}, function(err) {
            if (err) log.error(__filename, 'constructor()', 'Unable to ensure unique index on field id in ' + scoresDbFile, err);
        });

        log.info(__filename, '', fmt('%s %s', !fileExists.sync(teamsDbFile) ? 'Creating' : 'Loading', teamsDbFile));
        this.dbTeams = new NeDB({filename: teamsDbFile, autoload: true});
        this.dbTeams.ensureIndex({fieldName: 'id', unique: true}, function(err) {
            if (err) log.error(__filename, 'constructor()', 'Unable to ensure unique index on field id in ' + teamsDbFile, err);
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

    public insertDocument(targetDb: DATABASES, object: any, callback: Function): any {
        let fnName = 'insertDocument([DocID: ' + object.id + '])';
        let cbName = callback !== undefined ? callback.name : 'N/A';

        // set a database reference object
        let tDb = targetDb == DATABASES.MAZES ? this.dbMazes : targetDb == DATABASES.SCORES ? this.dbScores : this.dbTeams;

        // compress the document for local DB storage
        if (COMPRESSION_ENABLED) object = this.compressObject(object);

        // store the object
        tDb.insert(object, function(err, newDoc) {
            if (err) throw err;
            if (callback !== undefined) callback(err, newDoc);
            log.debug(__filename, fnName, fmt('[%s].%s completed. Callback to %s.', DATABASES[targetDb], object.id, cbName));
        });
    }

    public updateDocument(targetDb: DATABASES, object: any, callback: Function) {
        let fnName = 'updateDocument([DocID: ' + object.id + '])';
        let cbName = callback !== undefined ? callback.name : 'N/A';

        // set a database reference object
        let tDb = targetDb == DATABASES.MAZES ? this.dbMazes : targetDb == DATABASES.SCORES ? this.dbScores : this.dbTeams;

        // compress the document for local DB storage
        if (COMPRESSION_ENABLED) object = this.compressObject(object);

        // attempt to update the document with the given id
        tDb.update({id: object.id}, object, {}, function(err, numReplaced) {
            if (err) throw err;
            if (callback !== undefined) callback(err, numReplaced);
            log.debug(__filename, fnName, fmt('[%s].%s completed. %s documents updated. Callback to %s.', DATABASES[targetDb], object.id, numReplaced, cbName));
        });
    }

    // compresses the object for storage, retaining the object.Id needed for retrieval
    private compressObject(obj: any): Object {
        return {id: obj.Id, docBody: lzutf8.compress(JSON.stringify(obj), {outputEncoding: COMPRESSION_ENCODING})};
    }

    public getDocument(targetDb: DATABASES, objectId: string, callback: Function) {
        let fnName = 'getDocument([DocID: ' + objectId + '])';
        let cbName = callback !== undefined ? callback.name : 'N/A';

        // set a database reference object
        let tDb = targetDb == DATABASES.MAZES ? this.dbMazes : targetDb == DATABASES.SCORES ? this.dbScores : this.dbTeams;

        // find the first matching document
        tDb.findOne({id: objectId}, function(err, doc: any) {
            if (err) throw err;

            // decompress the document if found
            if (doc && COMPRESSION_ENABLED) doc = DataAccessObject_NeDB.getInstance().decompressDocument(doc);

            log.debug(__filename, fnName, fmt('[%s].%s completed. Callback to %s.', DATABASES[targetDb], objectId, cbName));
            callback(err, doc);
        });
    }

    // decompresses the document and reconstructs the JSON object from docBody
    private decompressDocument(doc: any): Object {
        let dDoc = lzutf8.decompress(doc.docBody, {inputEncoding: COMPRESSION_ENCODING});
        return JSON.parse(dDoc);
    }

    public removeDocument(targetDb: DATABASES, objectId: string, callback: Function) {
        let fnName = 'removeDocument([DocID: ' + objectId + '])';
        let cbName = callback !== undefined ? callback.name : 'N/A';
        log.debug(__filename, fnName, fmt('[%s].%s entered.', DATABASES[targetDb], objectId));

        // set a database reference object
        let tDb = targetDb == DATABASES.MAZES ? this.dbMazes : targetDb == DATABASES.SCORES ? this.dbScores : this.dbTeams;

        // find the first matching document
        tDb.remove({id: objectId}, function(err, numRemoved) {
            if (err) throw err;
            if (callback !== undefined) callback(err, numRemoved);
            log.debug(__filename, fnName, fmt('[%s].%s completed. %s documents removed. Callback to %s.', DATABASES[targetDb], objectId, numRemoved, cbName));
        });
    }

    public getDocumentCount(targetDb: DATABASES, callback: Function) {
        let tDb = targetDb == DATABASES.MAZES ? this.dbMazes : targetDb == DATABASES.SCORES ? this.dbScores : this.dbTeams;
        tDb.count({}, function(err: Error, n: number) {
            if (err) throw err;
            log.debug(__filename, 'getDocumentCount()', fmt('[%s] %s docs found. Callback: %s.', DATABASES[targetDb], n, callback.name));
            callback(err, n);
        });
    }
}

export default DataAccessObject_NeDB;
