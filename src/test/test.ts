import assert from 'assert';
import { DAO_NeDb } from '../lib/DAO_NeDB';
import { Maze } from '../lib/Maze';
import { Logger, LOG_LEVELS } from '../lib/Logger';
import md5 from 'md5';
import Position from '../lib/Position';
import { DATABASES } from '../lib/Enumerations';

let maze: Maze;
let noteA = '';
let noteB = 'Hello MazeMasterJS';
let mazeId: string = '3:3:5:MochaTestMaze';
let mazeRenderHashA = '0a57600e3b025972b5f30482ae692682';
let mazeRenderHashB = '711f426d24b0e6d39403910fc34d5284';
let dao: DAO_NeDb = DAO_NeDb.getInstance();
let log: Logger = Logger.getInstance();

log.setLogLevel(LOG_LEVELS.WARN);

/**
 * Maze class test cases:
 *  + instantiation (new)
 *  + instantiation (from data)
 *  + generation
 *  + text rendering
 */
describe('Maze', function() {
    describe('Maze.generate(height, width, seed, challenge))', function() {
        it('should generate new maze without error: ' + mazeId, function() {
            maze = new Maze();
            maze.generate(3, 3, 'MochaTestMaze', 5);
        });
    });
    describe('Maze.Id', function() {
        it('should return id ' + mazeId + '', function() {
            assert.equal(maze.Id, mazeId);
        });
    });
    describe('Maze.TextRender()', function() {
        it('should return return text rendering with MD5 hash value of ' + mazeRenderHashA + '', function() {
            assert.equal(mazeRenderHashA, md5(maze.TextRender));
        });
    });
    describe('Maze.generateTextRender(forceRegen=false)', function() {
        it('should return return text rendering with MD5 hash value of ' + mazeRenderHashA + '', function() {
            assert.equal(mazeRenderHashA, md5(maze.generateTextRender(false)));
        });
    });
    describe('Maze.generateTextRender(forceRegen=true, playerPos=(2,2))', function() {
        it('should return return text rendering with MD5 hash value of ' + mazeRenderHashB + '', function() {
            assert.equal(mazeRenderHashB, md5(maze.generateTextRender(true, new Position(1, 1))));
        });
    });
});

/**
 * Test CRUD operations against local maze database
 */
describe('DAO_Local', function() {
    describe('insertDocument(maze)', function() {
        it('newDoc.id should be ' + mazeId, function(done) {
            dao.insertDocument(DATABASES.MAZES, maze, function cbInsertMaze(err: Error, newDoc: any) {
                if (err) {
                    assert.fail('Document already exists - previous removeDocument() failure?');
                    done(err);
                } else {
                    assert.equal(newDoc.id, mazeId);
                    done();
                }
            });
        });
    });
    describe('getDocument(maze)', function() {
        it('doc.id should be ' + mazeId, function(done) {
            dao.getDocument(DATABASES.MAZES, mazeId, function cbGetMaze(err: Error, doc: any) {
                assert.equal(doc.id, mazeId);
                done();
            });
        });
        it('doc.note should be empty', function(done) {
            dao.getDocument(DATABASES.MAZES, mazeId, function cbGetMaze(err: Error, doc: any) {
                assert.equal(doc.note, noteA);
                done();
            });
        });
    });
    describe('updateDocument(maze)', function() {
        it('numReplaced should be 1', function(done) {
            maze.Note = noteB;
            dao.updateDocument(DATABASES.MAZES, maze, function cbGetMaze(err: Error, numReplaced: number) {
                assert.equal(numReplaced, 1);
                done();
            });
        });
    });
    describe('updateDocument(maze)', function() {
        it('doc.note should be ' + noteB, function(done) {
            dao.getDocument(DATABASES.MAZES, mazeId, function cbGetMaze(err: Error, doc: any) {
                assert.equal(doc.note, noteB);
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
