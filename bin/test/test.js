"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const md5_1 = __importDefault(require("md5"));
const Enums_1 = require("../lib/Enums");
const Logger_1 = require("../lib/Logger");
const Maze_1 = require("../lib/Maze");
const Position_1 = __importDefault(require("../lib/Position"));
const DAO_TingoDB_1 = __importDefault(require("../lib/DAO_TingoDB"));
// static class instances
let dao;
const log = Logger_1.Logger.getInstance();
log.setLogLevel(Logger_1.LOG_LEVELS.WARN);
// test classes and values
let maze;
const noteA = '';
const noteB = 'Hello MazeMasterJS';
const mazeId = '3:3:5:MochaTestMaze';
const mazeRenderHashA = '0a57600e3b025972b5f30482ae692682';
const mazeRenderHashB = '711f426d24b0e6d39403910fc34d5284';
before(() => {
    // runs before all tests in this block
    dao = DAO_TingoDB_1.default.getInstance();
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
            maze = new Maze_1.Maze();
            maze.generate(3, 3, 'MochaTestMaze', 5);
            done();
        });
    });
    describe('Maze.Id', () => {
        it('should return id ' + mazeId + '', done => {
            assert_1.default.equal(maze.Id, mazeId);
            done();
        });
    });
    describe('Maze.TextRender()', () => {
        it('should return return text rendering with MD5 hash value of ' + mazeRenderHashA + '', done => {
            assert_1.default.equal(mazeRenderHashA, md5_1.default(maze.TextRender));
            done();
        });
    });
    describe('Maze.generateTextRender(forceRegen=false)', () => {
        it('should return return text rendering with MD5 hash value of ' + mazeRenderHashA + '', done => {
            assert_1.default.equal(mazeRenderHashA, md5_1.default(maze.generateTextRender(false)));
            done();
        });
    });
    describe('Maze.generateTextRender(forceRegen=true, playerPos=(2,2))', () => {
        it('should return return text rendering with MD5 hash value of ' + mazeRenderHashB + '', done => {
            assert_1.default.equal(mazeRenderHashB, md5_1.default(maze.generateTextRender(true, new Position_1.default(1, 1))));
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
            dao.insertDocument(Enums_1.DATABASES.MAZES, maze, function cbInsertMazeTest(err, newDoc) {
                try {
                    assert_1.default.equal(err, null, 'error returned');
                    assert_1.default.notEqual(newDoc, undefined, 'newDoc is undefined');
                    if (newDoc) {
                        assert_1.default.equal(newDoc.id, mazeId);
                    }
                    done();
                }
                catch (error) {
                    done(error);
                }
            });
        });
        it('Should return unique id error inserting duplicate maze w/ ID=' + mazeId, done => {
            dao.insertDocument(Enums_1.DATABASES.MAZES, maze, function cbUniqueIdTest(err, newDoc) {
                assert_1.default.notEqual(err, null);
                done();
            });
        });
    });
    describe('getDocument(maze)', () => {
        it('doc.note should be empty, doc.id should be ' + mazeId, done => {
            dao.getDocument(Enums_1.DATABASES.MAZES, mazeId, function cbGetMaze(err, doc) {
                try {
                    assert_1.default.equal(err, null, 'error returned');
                    assert_1.default.notEqual(doc, undefined, 'doc is undefined');
                    if (doc) {
                        assert_1.default.equal(doc.id, mazeId);
                        assert_1.default.equal(doc.note, noteA);
                    }
                    done();
                }
                catch (error) {
                    done(error);
                }
            });
        });
    });
    describe('updateDocument(maze.note)', () => {
        it('new maze.note should be ' + noteB, done => {
            maze.Note = noteB;
            dao.updateDocument(Enums_1.DATABASES.MAZES, maze, function cbUpdateMaze(err, doc) {
                try {
                    assert_1.default.equal(err, null, 'error returned');
                    assert_1.default.notEqual(doc, undefined, 'doc is undefined');
                    if (doc) {
                        assert_1.default.equal(doc.note, noteB);
                    }
                    done();
                }
                catch (error) {
                    done(error);
                }
            });
        });
    });
    describe('countDocuments', () => {
        it('should return integer', done => {
            dao.getDocumentCount(Enums_1.DATABASES.MAZES, function cbGetMazeCount(err, count) {
                try {
                    assert_1.default.equal(err, null, 'error returned');
                    assert_1.default.equal(typeof count, 'number');
                    done();
                }
                catch (error) {
                    done(error);
                }
            });
        });
    });
    describe('removeDocument(maze)', () => {
        it('should return removed document without error', done => {
            dao.removeDocument(Enums_1.DATABASES.MAZES, mazeId, function cbRemoveMaze(err, doc) {
                try {
                    assert_1.default.equal(err, null, 'error returned');
                    assert_1.default.notEqual(doc, undefined, 'doc is undefined');
                    if (doc) {
                        assert_1.default.equal(doc.id, mazeId);
                    }
                    done();
                }
                catch (error) {
                    done(error);
                }
            });
        });
    });
});
//# sourceMappingURL=test.js.map