import {DataAccessObject} from './DAO_Interface';
import {DATABASES} from './Enums';
import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import {Logger} from './Logger';
import {format as fmt} from 'util';
import fileExists from 'file-exists';

const LOW_DB_FILE = 'data/lowdb.json';
const log = Logger.getInstance();
const adapter = new FileSync(LOW_DB_FILE);
const db = low(adapter);

export class DataAccessObject_lowdb implements DataAccessObject {
    private static instance: DataAccessObject_lowdb;

    // must use getInstance()
    private constructor() {
        log.info(__filename, '', fmt('%s %s', !fileExists.sync(LOW_DB_FILE) ? 'Creating' : 'Loading', LOW_DB_FILE));
        db.defaults({MAZES: [], SCORES: [], TEAMS: []}).write();
    }

    // singleton instance pattern
    static getInstance() {
        if (!DataAccessObject_lowdb.instance) {
            log.info(__filename, 'getInstance()', 'New DataAccessObject_NeDB created.');
            DataAccessObject_lowdb.instance = new DataAccessObject_lowdb();
        }
        return DataAccessObject_lowdb.instance;
    }

    insertDocument(targetDb: DATABASES, object: any, callback: Function) {
        let err;
        try {
            db.get(DATABASES[targetDb])
                .push(object)
                .write();
        } catch (error) {
            err = error;
        }

        callback(err, object);
    }

    updateDocument(targetDb: DATABASES, object: any, callback: Function) {
        let err;
        try {
            db.get(DATABASES[targetDb])
                .find({id: object.Id})
                .assign({object})
                .write();
        } catch (error) {
            err = error;
        }

        callback(err, 1);
    }

    getDocument(targetDb: DATABASES, objectId: string, callback: Function) {
        let err;
        let doc: any;
        log.debug(__filename, 'getDocument(' + objectId + ')', 'Searching...');
        try {
            doc = db
                .get(DATABASES[targetDb])
                .filter({id: objectId})
                .value();
            console.log('found: %s', doc.Mazes);
        } catch (error) {
            err = error;
        }
        callback(err, doc.Maze);
    }

    removeDocument(targetDb: DATABASES, objectId: string, callback: Function) {
        let err;
        let numRemoved = 0;
        try {
            numRemoved = db
                .get(DATABASES[targetDb])
                .size()
                .value();

            db.get(DATABASES[targetDb])
                .remove({id: objectId})
                .write();

            numRemoved =
                numRemoved -
                db
                    .get(DATABASES[targetDb])
                    .size()
                    .value();
        } catch (error) {
            err = error;
        }
        callback(err, numRemoved);
    }

    getDocumentCount(targetDb: DATABASES, callback: Function) {
        let err;
        let count = 0;
        try {
            count = db
                .get(DATABASES[targetDb])
                .size()
                .value();
        } catch (error) {
            err = error;
        }
        callback(err, count);
    }
}

export default DataAccessObject_lowdb;
