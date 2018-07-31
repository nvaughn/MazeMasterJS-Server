"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const DAO_Local_1 = require("../lib/DAO_Local");
const Maze_1 = require("../lib/Maze");
const Logger_1 = require("../lib/Logger");
let maze;
let noteA = '';
let noteB = 'Hello MazeMasterJS';
let mazeId = '3:3:5:MochaTestMaze';
let dao = DAO_Local_1.LocalDAO.getInstance();
let log = Logger_1.Logger.getInstance();
log.setLogLevel(Logger_1.LOG_LEVELS.WARN);
describe('Maze', function () {
    describe('Maze().generate()', function () {
        it('should generate new maze without error: ' + mazeId, function () {
            maze = new Maze_1.Maze();
            maze.generate(3, 3, 'MochaTestMaze', 5);
        });
    });
    describe('Maze().id()', function () {
        it('should return id ' + mazeId + '', function () {
            assert_1.default.equal(maze.id, mazeId);
        });
    });
});
describe('DAO_Local', function () {
    describe('insertDocument(maze)', function () {
        it('newDoc._id should be ' + mazeId, function (done) {
            dao.insertDocument(DAO_Local_1.DATABASES.MAZES, maze, function cbInsertMaze(err, newDoc) {
                if (err) {
                    assert_1.default.fail('Document already exists - previous removeDocument() failure?');
                    done(err);
                }
                else {
                    assert_1.default.equal(newDoc._id, mazeId);
                    done();
                }
            });
        });
    });
    describe('getDocument(maze)', function () {
        it('doc._id should be ' + mazeId, function (done) {
            dao.getDocument(DAO_Local_1.DATABASES.MAZES, mazeId, function cbGetMaze(err, doc) {
                assert_1.default.equal(doc._id, mazeId);
                done();
            });
        });
        it('doc._note should be empty', function (done) {
            dao.getDocument(DAO_Local_1.DATABASES.MAZES, mazeId, function cbGetMaze(err, doc) {
                assert_1.default.equal(doc._note, noteA);
                done();
            });
        });
    });
    describe('updateDocument(maze)', function () {
        it('numReplaced should be 1', function (done) {
            maze.note = noteB;
            dao.updateDocument(DAO_Local_1.DATABASES.MAZES, maze, function cbGetMaze(err, numReplaced) {
                assert_1.default.equal(numReplaced, 1);
                done();
            });
        });
    });
    describe('updateDocument(maze)', function () {
        it('doc._note should be ' + noteB, function (done) {
            dao.getDocument(DAO_Local_1.DATABASES.MAZES, mazeId, function cbGetMaze(err, doc) {
                assert_1.default.equal(doc._note, noteB);
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