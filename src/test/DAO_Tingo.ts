/**
 *
 * Mocha-based Unit tests for Data Access Objects that implement the
 * Data Access Object Interface (DAO_Interface).
 *
 * To test different DAO Implementations, change the "dao" variable
 * to the DAO Implementation of your choosing.
 *
 */
import assert from 'assert';

import DataAccessObject_TingoDB from '../lib/DAO_TingoDB';
import { DATABASES } from '../lib/Enums';
import { LOG_LEVELS, Logger } from '../lib/Logger';
import { Maze } from '../lib/Maze';

// set up logger
const log: Logger = Logger.getInstance();
log.setLogLevel(LOG_LEVELS.NONE);

// globals
let dao: DataAccessObject_TingoDB = DataAccessObject_TingoDB.getInstance();
const maze: Maze = new Maze();
const noteA = '';
const noteB = 'Hello MazeMasterJS';

before(() => {
    // runs before all tests in this block
    maze.generate(3, 3, 'MochaTestMaze', 5);
});

after(() => {
    dao.closeDb();
});

/**
 * Test CRUD operations against local maze database
 */
describe('DataAccessObject_TingoDB', () => {
    describe('insertDocument(maze)', () => {
        it('newDoc inserted without error, newDoc.id should be ' + maze.Id, done => {
            dao.insertDocument(DATABASES.MAZES, maze, function cbInsertMazeTest(err: Error, newDoc: any) {
                try {
                    assert.equal(err, null, 'error returned');
                    assert.notEqual(newDoc, undefined, 'newDoc is undefined');
                    if (newDoc) {
                        assert.equal(newDoc.id, maze.Id);
                    }
                    done();
                } catch (error) {
                    done(error);
                }
            });
        });

        it('Should return unique id error inserting duplicate maze', done => {
            dao.insertDocument(DATABASES.MAZES, maze, function cbUniqueIdTest(err: Error, newDoc: any) {
                assert.notEqual(err, null);
                done();
            });
        });
    });

    describe('getDocument(maze)', () => {
        it('doc.note should be empty, doc.id should be ' + maze.Id, done => {
            dao.getDocument(DATABASES.MAZES, maze.Id, function cbGetMaze(err: Error, doc: any) {
                try {
                    assert.equal(err, null, 'error returned');
                    assert.notEqual(doc, undefined, 'doc is undefined');
                    if (doc) {
                        assert.equal(doc.id, maze.Id);
                        assert.equal(doc.note, noteA);
                    }
                    done();
                } catch (error) {
                    done(error);
                }
            });
        });
    });

    describe('updateDocument(maze.note)', () => {
        it('new maze.note should be ' + noteB, done => {
            maze.Note = noteB;
            dao.updateDocument(DATABASES.MAZES, maze, function cbUpdateMaze(err: Error, doc: any) {
                try {
                    assert.equal(err, null, 'error returned');
                    assert.notEqual(doc, undefined);
                    if (doc) {
                        assert.equal(doc.note, noteB);
                    }
                    done();
                } catch (error) {
                    done(error);
                }
            });
        });
    });

    describe('countDocuments()', () => {
        it('should return number', done => {
            dao.getDocumentCount(DATABASES.MAZES, function cbGetMazeCount(err: Error, count: number) {
                try {
                    assert.equal(err, null, 'error returned');
                    assert.equal(typeof count, 'number');
                    done();
                } catch (error) {
                    done(error);
                }
            });
        });
    });

    describe('removeDocument(maze)', () => {
        it('should return removed document without error', done => {
            dao.removeDocument(DATABASES.MAZES, maze.Id, function cbRemoveMaze(err: Error, doc: any) {
                try {
                    assert.equal(err, null, 'error returned');
                    assert.notEqual(doc, undefined, 'doc is undefined');
                    if (doc) {
                        assert.equal(doc.id, maze.Id);
                    }
                    done();
                } catch (error) {
                    done(error);
                }
            });
        });
    });
});
