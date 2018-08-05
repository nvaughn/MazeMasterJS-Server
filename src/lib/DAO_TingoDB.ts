/**
 *
 * Implements the DataAccessObject Interface to provide a mostly MongoDB compatible
 * abstraction layer for database operations.  This class implements a DAO for the
 * TingoDb (www.tingodb.com) embedded, file-based, JSON data store.
 *
 * All objects passed MUST HAVE an "id" property that returns a unique value.
 *
 */
import fs from 'fs';
import lzutf8 from 'lzutf8';
import path from 'path';
import pathExists from 'path-exists';
import { format as fmt } from 'util';

import { DataAccessObject } from './DAO_Interface';
import { DATABASES } from './Enums';
import Logger from './Logger';

const TDB = require('tingodb')().Db;
const log = Logger.getInstance();
const tingoDBDataFolder = 'data/tingo.db';

// Enable to compress / decompress document bodies during db insert/read calls.
// Compression improves read/write performance of local, file-based DB functions
// by reducing the file size on disk and limiting searchable fields in the database.
// Note:  This breaks the DB search functionality!
const COMPRESSION_ENABLED = true;

// Supported Options: Base64 (smallest and as fast as SBS), StorageBinaryString (small, fast, but unreadable), ByteArray (requires buffering)
const COMPRESSION_ENCODING = 'Base64';

export class DataAccessObject_TingoDB implements DataAccessObject {
    private static instance: DataAccessObject_TingoDB;
    private db: any;
    private colMazes: any;
    private colScores: any;
    private colTeams: any;

    // must use getInstance()
    private constructor() {
        let fp = path.resolve(tingoDBDataFolder);
        if (!pathExists.sync(fp)) {
            log.info(__filename, '', fp + ' not found, creating.');
            fs.mkdirSync(fp);
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

    private openDb(callback: Function) {
        this.db.open((err: any, db: any) => {
            this.db = db;
            if (err) {
                log.error(__filename, 'openDb()', 'Error attempting to open ' + tingoDBDataFolder, err);
            } else {
                log.debug(__filename, 'openDb()', 'TingoDB Opened.');
            }

            callback();
        });
    }

    public closeDb() {
        if (this.db) {
            this.db.close();
            log.debug(__filename, 'closeDb()', 'TingoDB Closed.');
        } else {
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
    private getTargetRepository(targetName: DATABASES): any {
        return targetName == DATABASES.MAZES ? this.colMazes : targetName == DATABASES.SCORES ? this.colScores : this.colTeams;
    }

    /**
     * Compresses the body of the given MazeMasterJS object, but leaves the object.Id
     * @param obj - an uncompressed object
     */
    private compressObject(obj: any): Object {
        return { id: obj.Id, docBody: lzutf8.compress(JSON.stringify(obj), { outputEncoding: COMPRESSION_ENCODING }) };
    }

    /**
     * Decompresses the docBody field and returns parsed JSON object version of document
     * @param doc - a compressed document
     */
    private decompressDocument(doc: any): Object {
        let dDoc = lzutf8.decompress(doc.docBody, { inputEncoding: COMPRESSION_ENCODING });
        return JSON.parse(dDoc);
    }

    /**
     * Inserts a document into the given database / collection
     * @param targetRepo - target database/collection
     * @param object - the object to store
     * @param callback - error/new document returned via callback
     */
    public insertDocument(targetRepo: DATABASES, object: any, callback: Function) {
        let fnName = 'insertDocument([DocID: ' + object.id + '])';
        let cbName = callback !== undefined ? callback.name : 'N/A';

        // set a database reference object
        let tColl = targetRepo == DATABASES.MAZES ? this.colMazes : targetRepo == DATABASES.SCORES ? this.colScores : this.colTeams;

        // compress the document for local DB storage
        if (COMPRESSION_ENABLED) object = this.compressObject(object);

        // store the object
        tColl.insert(object, { fullResult: true }, function(err: any, newDoc: any) {
            if (err) {
                log.error(__filename, fnName, 'Error inserting document.', err);
            } else {
                log.debug(__filename, fnName, fmt('[%s].%s completed. Callback to %s.', DATABASES[targetRepo], object.id, cbName));
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
    public updateDocument(targetRepo: DATABASES, object: any, callback: Function) {
        let fnName = 'updateDocument([DocID: ' + object.id + '])';
        let cbName = callback !== undefined ? callback.name : 'N/A';

        // set a database reference object
        let tColl = this.getTargetRepository(targetRepo);

        // compress the document for local DB storage
        if (COMPRESSION_ENABLED) object = this.compressObject(object);

        // attempt to update the document with the given id
        tColl.findAndModify({ id: object.id }, [['id', 1]], { $set: object }, { new: true }, (err: any, doc: any) => {
            if (err) {
                log.error(__filename, fnName, 'Error error updating document.', err);
            } else {
                log.debug(__filename, fnName, fmt('[%s].%s completed. %s documents updated. Callback to %s.', DATABASES[targetRepo], object.id, doc, cbName));
            }
            if (COMPRESSION_ENABLED) doc = this.decompressDocument(doc);
            callback(err, doc);
        });
    }

    /**
     * Returns the first document found with the given id
     * @param targetRepo - target database/collection
     * @param objectId - the id of the object to find
     * @param callback - error and/or located document returned via callback
     */
    public getDocument(targetRepo: DATABASES, objectId: string, callback: Function) {
        let fnName = 'getDocument([DocID: ' + objectId + '])';
        let cbName = callback !== undefined ? callback.name : 'N/A';

        // set a database reference object
        let tColl = this.getTargetRepository(targetRepo);

        // find the first matching document
        tColl.findOne({ id: objectId }, (err: any, doc: any) => {
            if (err) {
                log.error(__filename, fnName, 'Error finding document.', err);
            } else {
                log.debug(__filename, fnName, fmt('[%s].%s completed. Callback to %s.', DATABASES[targetRepo], objectId, cbName));
            }
            if (doc && COMPRESSION_ENABLED) doc = this.decompressDocument(doc);
            callback(err, doc);
        });
    }

    /**
     * Returns the first document found with the given id
     * @param targetRepo - target database/collection
     * @param objectId - the id of the object to find
     * @param callback - error and/or located document returned via callback
     */
    public getDocuments(targetRepo: DATABASES, filter: string, callback: Function) {
        let fnName = 'getDocuments([Filter: ' + filter + '])';

        // set a database reference object
        let tColl = this.getTargetRepository(targetRepo);

        // find the first matching document
        // TODO: Parse and decompress docs
        tColl.find(filter, (err: any, doc: any) => {
            if (err) {
                log.error(__filename, fnName, 'Error inserting document.', err);
            } else {
                log.debug(__filename, fnName, fmt('[%s].%s completed. Callback to %s.', DATABASES[targetRepo], filter, callback.name));
            }
            if (doc && COMPRESSION_ENABLED) doc = this.decompressDocument(doc);
            callback(err, doc);
        });
    }

    /**
     * Removes document with matching objectId from the database/collection
     * @param targetRepo - target database/collection
     * @param objectId - the id of the object to find
     * @param callback - error and/or removed document returned via callback
     */
    public removeDocument(targetRepo: DATABASES, objectId: string, callback: Function) {
        let fnName = 'removeDocument([DocID: ' + objectId + '])';
        let cbName = callback !== undefined ? callback.name : 'N/A';
        log.debug(__filename, fnName, fmt('[%s].%s entered.', DATABASES[targetRepo], objectId));

        // set a database reference object
        let tColl = this.getTargetRepository(targetRepo);

        // find the first matching document
        tColl.findAndRemove({ id: objectId }, [['id', 'ascending']], function(err: any, doc: any) {
            if (err) {
                log.error(__filename, 'insertDocument', 'Error inserting document.', err);
            }
            log.debug(__filename, fnName, fmt('[%s].%s completed. %s documents removed. Callback to %s.', DATABASES[targetRepo], objectId, doc, cbName));
            callback(err, doc);
        });
    }

    /**
     * Counts and returns the number documents found in the given repository
     * @param targetRepo - target database/collection
     * @param callback - returns error / document count via callback
     */
    public getDocumentCount(targetRepo: DATABASES, callback: Function) {
        let tColl = this.getTargetRepository(targetRepo);
        tColl.find({}).count(function(err: Error, count: number) {
            if (err) {
                log.error(__filename, 'insertDocument', 'Error inserting document.', err);
            }
            log.debug(__filename, 'getDocumentCount()', fmt('[%s] %s docs found. Callback: %s.', DATABASES[targetRepo], count, callback.name));
            callback(err, count);
        });
    }
}

export default DataAccessObject_TingoDB;
