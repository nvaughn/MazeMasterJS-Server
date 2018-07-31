import assert from 'assert';
import { LocalDAO, DATABASES } from '../lib/DAO_Local';
import { Maze } from '../lib/Maze';
import { Logger, LOG_LEVELS } from '../lib/Logger';

let maze: Maze;
let noteA = '';
let noteB = 'Hello MazeMasterJS';
let mazeId: string = '3:3:5:MochaTestMaze';
let dao: LocalDAO = LocalDAO.getInstance();

let log: Logger = Logger.getInstance();
log.setLogLevel(LOG_LEVELS.WARN);

describe('Maze', function() {
    describe('Maze().generate()', function() {
        it('should generate new maze without error: ' + mazeId, function() {
            maze = new Maze();
            maze.generate(3, 3, 'MochaTestMaze', 5);
        });
    });
    describe('Maze().id()', function() {
        it('should return id ' + mazeId + '', function() {
            assert.equal(maze.id, mazeId);
        });
    });
});

describe('DAO_Local', function() {
    describe('insertDocument(maze)', function() {
        it('newDoc._id should be ' + mazeId, function(done) {
            dao.insertDocument(DATABASES.MAZES, maze, function cbInsertMaze(err: Error, newDoc: any) {
                if (err) {
                    assert.fail('Document already exists - previous removeDocument() failure?');
                    done(err);
                } else {
                    assert.equal(newDoc._id, mazeId);
                    done();
                }
            });
        });
    });
    describe('getDocument(maze)', function() {
        it('doc._id should be ' + mazeId, function(done) {
            dao.getDocument(DATABASES.MAZES, mazeId, function cbGetMaze(err: Error, doc: any) {
                assert.equal(doc._id, mazeId);
                done();
            });
        });
        it('doc._note should be empty', function(done) {
            dao.getDocument(DATABASES.MAZES, mazeId, function cbGetMaze(err: Error, doc: any) {
                assert.equal(doc._note, noteA);
                done();
            });
        });
    });
    describe('updateDocument(maze)', function() {
        it('numReplaced should be 1', function(done) {
            maze.note = noteB;
            dao.updateDocument(DATABASES.MAZES, maze, function cbGetMaze(err: Error, numReplaced: number) {
                assert.equal(numReplaced, 1);
                done();
            });
        });
    });
    describe('updateDocument(maze)', function() {
        it('doc._note should be ' + noteB, function(done) {
            dao.getDocument(DATABASES.MAZES, mazeId, function cbGetMaze(err: Error, doc: any) {
                assert.equal(doc._note, noteB);
                done();
            });
        });
    });
    describe('removeDocument(maze)', function() {
        it('numRemoved should be 1', function(done) {
            dao.removeDocument(DATABASES.MAZES, mazeId, function cbGetMaze(err: Error, numRemoved: number) {
                assert.equal(numRemoved, 1);
                done();
            });
        });
    });
});
