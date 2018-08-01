"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const DAO_Local_1 = require("../lib/DAO_Local");
const Maze_1 = require("../lib/Maze");
const Logger_1 = require("../lib/Logger");
const md5_1 = __importDefault(require("md5"));
const Position_1 = __importDefault(require("../lib/Position"));
let maze;
let noteA = '';
let noteB = 'Hello MazeMasterJS';
let mazeId = '3:3:5:MochaTestMaze';
let mazeRenderHashA = '0a57600e3b025972b5f30482ae692682';
let mazeRenderHashB = '711f426d24b0e6d39403910fc34d5284';
let dao = DAO_Local_1.LocalDAO.getInstance();
let log = Logger_1.Logger.getInstance();
log.setLogLevel(Logger_1.LOG_LEVELS.WARN);
/**
 * Maze class test cases:
 *  + instantiation (new)
 *  + instantiation (from data)
 *  + generation
 *  + text rendering
 */
describe('Maze', function () {
    describe('Maze.generate(height, width, seed, challenge))', function () {
        it('should generate new maze without error: ' + mazeId, function () {
            maze = new Maze_1.Maze();
            maze.generate(3, 3, 'MochaTestMaze', 5);
        });
    });
    describe('Maze.Id', function () {
        it('should return id ' + mazeId + '', function () {
            assert_1.default.equal(maze.Id, mazeId);
        });
    });
    describe('Maze.TextRender()', function () {
        it('should return return text rendering with MD5 hash value of ' + mazeRenderHashA + '', function () {
            assert_1.default.equal(mazeRenderHashA, md5_1.default(maze.TextRender));
        });
    });
    describe('Maze.generateTextRender(forceRegen=false)', function () {
        it('should return return text rendering with MD5 hash value of ' + mazeRenderHashA + '', function () {
            assert_1.default.equal(mazeRenderHashA, md5_1.default(maze.generateTextRender(false)));
        });
    });
    describe('Maze.generateTextRender(forceRegen=true, playerPos=(2,2))', function () {
        it('should return return text rendering with MD5 hash value of ' + mazeRenderHashB + '', function () {
            assert_1.default.equal(mazeRenderHashB, md5_1.default(maze.generateTextRender(true, new Position_1.default(1, 1))));
        });
    });
});
/**
 * Test CRUD operations against local maze database
 */
describe('DAO_Local', function () {
    describe('insertDocument(maze)', function () {
        it('newDoc.id should be ' + mazeId, function (done) {
            dao.insertDocument(DAO_Local_1.DATABASES.MAZES, maze, function cbInsertMaze(err, newDoc) {
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
    describe('getDocument(maze)', function () {
        it('doc.id should be ' + mazeId, function (done) {
            dao.getDocument(DAO_Local_1.DATABASES.MAZES, mazeId, function cbGetMaze(err, doc) {
                assert_1.default.equal(doc.id, mazeId);
                done();
            });
        });
        it('doc.note should be empty', function (done) {
            dao.getDocument(DAO_Local_1.DATABASES.MAZES, mazeId, function cbGetMaze(err, doc) {
                assert_1.default.equal(doc.note, noteA);
                done();
            });
        });
    });
    describe('updateDocument(maze)', function () {
        it('numReplaced should be 1', function (done) {
            maze.Note = noteB;
            dao.updateDocument(DAO_Local_1.DATABASES.MAZES, maze, function cbGetMaze(err, numReplaced) {
                assert_1.default.equal(numReplaced, 1);
                done();
            });
        });
    });
    describe('updateDocument(maze)', function () {
        it('doc.note should be ' + noteB, function (done) {
            dao.getDocument(DAO_Local_1.DATABASES.MAZES, mazeId, function cbGetMaze(err, doc) {
                assert_1.default.equal(doc.note, noteB);
                done();
            });
        });
    });
    describe('removeDocument(maze)', function () {
        it('numRemoved should be 1', function (done) {
            dao.removeDocument(DAO_Local_1.DATABASES.MAZES, mazeId, function cbGetMaze(err, numRemoved) {
                assert_1.default.equal(numRemoved, 1);
                done();
            });
        });
    });
});
//# sourceMappingURL=test.js.map