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
import Logger from './Logger';
import fileExists from 'file-exists';
import { format as fmt } from 'util';
import NeDB = require('nedb');
import * as helpers from './Helpers';

const log = Logger.getInstance();
const mazesDbFile = 'data/mazes.db';
const scoresDbFile = 'data/scores.db';
const teamsDbFile = 'data/teams.db';

export enum DATABASES {
    MAZES = 0,
    SCORES,
    TEAMS
}

export class LocalDAO {
    private static instance: LocalDAO;
    private dbMazes: NeDB;
    private dbScores: NeDB;
    private dbTeams: NeDB;

    // must use getInstance()
    private constructor() {
        log.info(__filename, '', fmt('%s %s', !fileExists.sync(scoresDbFile) ? 'Creating' : 'Loading', mazesDbFile));
        this.dbMazes = new NeDB({ filename: mazesDbFile, autoload: true });
        this.dbMazes.ensureIndex({ fieldName: 'id', unique: true }, function(err) {
            if (err) log.error(__filename, 'constructor()', 'Unable to ensure unique index on field id in ' + mazesDbFile, err);
        });

        log.info(__filename, '', fmt('%s %s', !fileExists.sync(scoresDbFile) ? 'Creating' : 'Loading', scoresDbFile));
        this.dbScores = new NeDB({ filename: scoresDbFile, autoload: true });
        this.dbScores.ensureIndex({ fieldName: 'id', unique: true }, function(err) {
            if (err) log.error(__filename, 'constructor()', 'Unable to ensure unique index on field id in ' + scoresDbFile, err);
        });

        log.info(__filename, '', fmt('%s %s', !fileExists.sync(teamsDbFile) ? 'Creating' : 'Loading', teamsDbFile));
        this.dbTeams = new NeDB({ filename: teamsDbFile, autoload: true });
        this.dbTeams.ensureIndex({ fieldName: 'id', unique: true }, function(err) {
            if (err) log.error(__filename, 'constructor()', 'Unable to ensure unique index on field id in ' + teamsDbFile, err);
        });
    }

    // singleton instance pattern
    static getInstance() {
        if (!LocalDAO.instance) {
            LocalDAO.instance = new LocalDAO();
        }
        return LocalDAO.instance;
    }

    public insertDocument(targetDb: DATABASES, object: any, callback?: Function) {
        let fnName = 'insertDocument([DocID: ' + object.id + '])';
        let cbName = callback !== undefined ? callback.name : 'N/A';

        // set a database reference object
        let tDb = targetDb == DATABASES.MAZES ? this.dbMazes : targetDb == DATABASES.SCORES ? this.dbScores : this.dbTeams;

        tDb.insert(object, function(err, newDoc) {
            if (err) throw err;
            if (callback !== undefined) callback(err, newDoc);
            log.debug(__filename, fnName, fmt('[%s].%s completed. Callback to %s.', DATABASES[targetDb], object.id, cbName));
        });
    }

    public updateDocument(targetDb: DATABASES, object: any, callback?: Function) {
        let fnName = 'updateDocument([DocID: ' + object.id + '])';
        let cbName = callback !== undefined ? callback.name : 'N/A';

        // set a database reference object
        let tDb = targetDb == DATABASES.MAZES ? this.dbMazes : targetDb == DATABASES.SCORES ? this.dbScores : this.dbTeams;

        // attempt to update the document with the given id
        tDb.update({ id: object.id }, object, {}, function(err, numReplaced) {
            if (err) throw err;
            if (callback !== undefined) callback(err, numReplaced);
            log.debug(__filename, fnName, fmt('[%s].%s completed. %s documents updated. Callback to %s.', DATABASES[targetDb], object.id, numReplaced, cbName));
        });
    }

    public getDocument(targetDb: DATABASES, objectId: string, callback: Function) {
        let fnName = 'getDocument([DocID: ' + objectId + '])';
        let cbName = callback !== undefined ? callback.name : 'N/A';

        // set a database reference object
        let tDb = targetDb == DATABASES.MAZES ? this.dbMazes : targetDb == DATABASES.SCORES ? this.dbScores : this.dbTeams;

        // find the first matching document
        tDb.findOne({ id: objectId }, function(err, doc) {
            if (err) throw err;
            if (callback !== undefined) callback(err, doc);
            log.debug(__filename, fnName, fmt('[%s].%s completed. Callback to %s.', DATABASES[targetDb], objectId, cbName));
        });
    }

    public removeDocument(targetDb: DATABASES, objectId: string, callback: Function) {
        let fnName = 'removeDocument([DocID: ' + objectId + '])';
        let cbName = callback !== undefined ? callback.name : 'N/A';
        log.debug(__filename, fnName, fmt('[%s].%s entered.', DATABASES[targetDb], objectId));

        // set a database reference object
        let tDb = targetDb == DATABASES.MAZES ? this.dbMazes : targetDb == DATABASES.SCORES ? this.dbScores : this.dbTeams;

        // find the first matching document
        tDb.remove({ id: objectId }, function(err, numRemoved) {
            if (err) throw err;
            if (callback !== undefined) callback(err, numRemoved);
            log.debug(__filename, fnName, fmt('[%s].%s completed. %s documents removed. Callback to %s.', DATABASES[targetDb], objectId, numRemoved, cbName));
        });
    }

    public getDocumentCount(targetDb: DATABASES, callback: Function) {
        let tDb = targetDb == DATABASES.MAZES ? this.dbMazes : targetDb == DATABASES.SCORES ? this.dbScores : this.dbTeams;
        tDb.count({}, function(err: Error, n: number) {
            if (err) throw err;
            log.debug(__filename, 'getDocumentCount()', fmt('[%s].getDocumentCount() completed. %s documents found. Callback to %s.', DATABASES[targetDb], n, callback.name));
            callback(err, n);
        });
    }
}

export default LocalDAO;
