"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const md5_1 = __importDefault(require("md5"));
const DAO_NeDB_1 = require("../lib/DAO_NeDB");
const Enums_1 = require("../lib/Enums");
const Logger_1 = require("../lib/Logger");
const Maze_1 = require("../lib/Maze");
const Position_1 = __importDefault(require("../lib/Position"));
// static class instances
const dao = DAO_NeDB_1.DataAccessObject_NeDB.getInstance();
const log = Logger_1.Logger.getInstance();
log.setLogLevel(Logger_1.LOG_LEVELS.WARN);
// test classes and values
let maze;
const noteA = '';
const noteB = 'Hello MazeMasterJS';
const mazeId = '3:3:5:MochaTestMaze';
const mazeRenderHashA = '0a57600e3b025972b5f30482ae692682';
const mazeRenderHashB = '711f426d24b0e6d39403910fc34d5284';
/**
 * Maze class test cases:
 *  + instantiation (new)
 *  + instantiation (from data)
 *  + generation
 *  + text rendering
 */
describe('Maze', () => {
    describe('Maze.generate(height, width, seed, challenge))', () => {
        it('should generate new maze without error: ' + mazeId, () => {
            maze = new Maze_1.Maze();
            maze.generate(3, 3, 'MochaTestMaze', 5);
        });
    });
    describe('Maze.Id', () => {
        it('should return id ' + mazeId + '', () => {
            assert_1.default.equal(maze.Id, mazeId);
        });
    });
    describe('Maze.TextRender()', () => {
        it('should return return text rendering with MD5 hash value of ' + mazeRenderHashA + '', () => {
            assert_1.default.equal(mazeRenderHashA, md5_1.default(maze.TextRender));
        });
    });
    describe('Maze.generateTextRender(forceRegen=false)', () => {
        it('should return return text rendering with MD5 hash value of ' + mazeRenderHashA + '', () => {
            assert_1.default.equal(mazeRenderHashA, md5_1.default(maze.generateTextRender(false)));
        });
    });
    describe('Maze.generateTextRender(forceRegen=true, playerPos=(2,2))', () => {
        it('should return return text rendering with MD5 hash value of ' + mazeRenderHashB + '', () => {
            assert_1.default.equal(mazeRenderHashB, md5_1.default(maze.generateTextRender(true, new Position_1.default(1, 1))));
        });
    });
});
/**
 * Test CRUD operations against local maze database
 */
describe('DAO_Local', () => {
    describe('insertDocument(maze)', () => {
        it('newDoc.id should be ' + mazeId, (done) => {
            dao.insertDocument(Enums_1.DATABASES.MAZES, maze, function cbInsertMaze(err, newDoc) {
                if (err) {
                    assert_1.default.fail('Document already exists - previous removeDocument() failure?');
                    done(err);
                }
                else {
                    assert_1.default.equal(newDoc.id, mazeId);
                    done();
                }
            });
        });
    });
    describe('getDocument(maze)', () => {
        it('doc.id should be ' + mazeId, (done) => {
            dao.getDocument(Enums_1.DATABASES.MAZES, mazeId, function cbGetMaze(err, doc) {
                assert_1.default.equal(doc.id, mazeId);
                done();
            });
        });
        it('doc.note should be empty', (done) => {
            dao.getDocument(Enums_1.DATABASES.MAZES, mazeId, function cbGetMaze(err, doc) {
                assert_1.default.equal(doc.note, noteA);
                done();
            });
        });
    });
    describe('updateDocument(maze)', () => {
        it('numReplaced should be 1', (done) => {
            maze.Note = noteB;
            dao.updateDocument(Enums_1.DATABASES.MAZES, maze, function cbGetMaze(err, numReplaced) {
                assert_1.default.equal(numReplaced, 1);
                done();
            });
        });
    });
    describe('updateDocument(maze)', () => {
        it('doc.note should be ' + noteB, (done) => {
            dao.getDocument(Enums_1.DATABASES.MAZES, mazeId, function cbGetMaze(err, doc) {
                assert_1.default.equal(doc.note, noteB);
                done();
            });
        });
    });
    describe('removeDocument(maze)', () => {
        it('numRemoved should be 1', (done) => {
            dao.removeDocument(Enums_1.DATABASES.MAZES, mazeId, function cbGetMaze(err, numRemoved) {
                assert_1.default.equal(numRemoved, 1);
                done();
            });
        });
    });
});
//# sourceMappingURL=test.js.map