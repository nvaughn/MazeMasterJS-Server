import assert from 'assert';
import md5 from 'md5';
import { DATABASES } from '../lib/Enums';
import { LOG_LEVELS, Logger } from '../lib/Logger';
import { Maze } from '../lib/Maze';
import Position from '../lib/Position';
import DataAccessObject_TingoDB from '../lib/DAO_TingoDB';
import DataAccessObject_NeDB from '../lib/DAO_NeDB';

// static class instances
let dao: any;

const log: Logger = Logger.getInstance();
log.setLogLevel(LOG_LEVELS.WARN);

// test classes and values
let maze: Maze;
const noteA = '';
const noteB = 'Hello MazeMasterJS';
const mazeId: string = '3:3:5:MochaTestMaze';
const mazeRenderHashA = '0a57600e3b025972b5f30482ae692682';
const mazeRenderHashB = '711f426d24b0e6d39403910fc34d5284';

before(() => {
    // runs before all tests in this block
    dao = DataAccessObject_TingoDB.getInstance();
    //dao = DataAccessObject_NeDB.getInstance();
});

after(() => {
    dao.closeDb();
});

/**
 * Maze class test cases:
 *  + instantiation (new)
 *  + instantiation (from data)
 *  + generation
 *  + text rendering
 */
describe('Maze', () => {
    describe('Maze.generate(height, width, seed, challenge))', () => {
        it('should generate new maze without error: ' + mazeId, done => {
            maze = new Maze();
            maze.generate(3, 3, 'MochaTestMaze', 5);
            done();
        });
    });
    describe('Maze.Id', () => {
        it('should return id ' + mazeId + '', done => {
            assert.equal(maze.Id, mazeId);
            done();
        });
    });
    describe('Maze.TextRender()', () => {
        it('should return return text rendering with MD5 hash value of ' + mazeRenderHashA + '', done => {
            assert.equal(mazeRenderHashA, md5(maze.TextRender));
            done();
        });
    });
    describe('Maze.generateTextRender(forceRegen=false)', () => {
        it('should return return text rendering with MD5 hash value of ' + mazeRenderHashA + '', done => {
            assert.equal(mazeRenderHashA, md5(maze.generateTextRender(false)));
            done();
        });
    });
    describe('Maze.generateTextRender(forceRegen=true, playerPos=(2,2))', () => {
        it('should return return text rendering with MD5 hash value of ' + mazeRenderHashB + '', done => {
            assert.equal(mazeRenderHashB, md5(maze.generateTextRender(true, new Position(1, 1))));
            done();
        });
    });
});

/**
 * Test CRUD operations against local maze database
 */
describe('DAO_Local', () => {
    describe('insertDocument(maze)', () => {
        it('newDoc inserted without error, newDoc.id should be ' + mazeId, done => {
            dao.insertDocument(DATABASES.MAZES, maze, function cbInsertMazeTest(err: Error, newDoc: any) {
                try {
                    assert.equal(err, null, 'error returned');
                    assert.notEqual(newDoc, undefined, 'newDoc is undefined');
                    if (newDoc) {
                        assert.equal(newDoc.id, mazeId);
                    }
                    done();
                } catch (error) {
                    done(error);
                }
            });
        });

        it('Should return unique id error inserting duplicate maze w/ ID=' + mazeId, done => {
            dao.insertDocument(DATABASES.MAZES, maze, function cbUniqueIdTest(err: Error, newDoc: any) {
                assert.notEqual(err, null);
                done();
            });
        });
    });

    describe('getDocument(maze)', () => {
        it('doc.note should be empty, doc.id should be ' + mazeId, done => {
            dao.getDocument(DATABASES.MAZES, mazeId, function cbGetMaze(err: Error, doc: any) {
                try {
                    assert.equal(err, null, 'error returned');
                    assert.notEqual(doc, undefined, 'doc is undefined');
                    if (doc) {
                        assert.equal(doc.id, mazeId);
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
                    assert.notEqual(doc, undefined, 'doc is undefined');
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

    describe('countDocuments', () => {
        it('should return integer', done => {
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
            dao.removeDocument(DATABASES.MAZES, mazeId, function cbRemoveMaze(err: Error, doc: any) {
                try {
                    assert.equal(err, null, 'error returned');
                    assert.notEqual(doc, undefined, 'doc is undefined');
                    if (doc) {
                        assert.equal(doc.id, mazeId);
                    }
                    done();
                } catch (error) {
                    done(error);
                }
            });
        });
    });
});
