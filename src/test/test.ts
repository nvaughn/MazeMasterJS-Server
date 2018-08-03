import assert from 'assert';
import md5 from 'md5';
import {DataAccessObject_NeDB} from '../lib/DAO_NeDB';
import {DATABASES} from '../lib/Enums';
import {LOG_LEVELS, Logger} from '../lib/Logger';
import {Maze} from '../lib/Maze';
import Position from '../lib/Position';
import {DataAccessObject_lowdb} from '../lib/DAO_lowdb';

// static class instances
//const dao: DataAccessObject_NeDB = DataAccessObject_NeDB.getInstance();
const dao: DataAccessObject_lowdb = DataAccessObject_lowdb.getInstance();
const log: Logger = Logger.getInstance();
log.setLogLevel(LOG_LEVELS.WARN);

// test classes and values
let maze: Maze;
const noteA = '';
const noteB = 'Hello MazeMasterJS';
const mazeId: string = '3:3:5:MochaTestMaze';
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
            maze = new Maze();
            maze.generate(3, 3, 'MochaTestMaze', 5);
        });
    });
    describe('Maze.Id', () => {
        it('should return id ' + mazeId + '', () => {
            assert.equal(maze.Id, mazeId);
        });
    });
    describe('Maze.TextRender()', () => {
        it('should return return text rendering with MD5 hash value of ' + mazeRenderHashA + '', () => {
            assert.equal(mazeRenderHashA, md5(maze.TextRender));
        });
    });
    describe('Maze.generateTextRender(forceRegen=false)', () => {
        it('should return return text rendering with MD5 hash value of ' + mazeRenderHashA + '', () => {
            assert.equal(mazeRenderHashA, md5(maze.generateTextRender(false)));
        });
    });
    describe('Maze.generateTextRender(forceRegen=true, playerPos=(2,2))', () => {
        it('should return return text rendering with MD5 hash value of ' + mazeRenderHashB + '', () => {
            assert.equal(mazeRenderHashB, md5(maze.generateTextRender(true, new Position(1, 1))));
        });
    });
});

/**
 * Test CRUD operations against local maze database
 */
describe('DAO_Local', () => {
    describe('insertDocument(maze)', () => {
        it('newDoc.id should be ' + mazeId, (done) => {
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
    describe('getDocument(maze)', () => {
        it('doc.id should be ' + mazeId, (done) => {
            dao.getDocument(DATABASES.MAZES, mazeId, function cbGetMaze(err: Error, doc: any) {
                assert.equal(doc.id, mazeId);
                done();
            });
        });
        it('doc.note should be empty', (done) => {
            dao.getDocument(DATABASES.MAZES, mazeId, function cbGetMaze(err: Error, doc: any) {
                assert.equal(doc.note, noteA);
                done();
            });
        });
    });
    describe('updateDocument(maze)', () => {
        it('numReplaced should be 1', (done) => {
            maze.Note = noteB;
            dao.updateDocument(DATABASES.MAZES, maze, function cbGetMaze(err: Error, numReplaced: number) {
                assert.equal(numReplaced, 1);
                done();
            });
        });
    });
    describe('updateDocument(maze)', () => {
        it('doc.note should be ' + noteB, (done) => {
            dao.getDocument(DATABASES.MAZES, mazeId, function cbGetMaze(err: Error, doc: any) {
                assert.equal(doc.note, noteB);
                done();
            });
        });
    });
    // describe('removeDocument(maze)', () => {
    //     it('numRemoved should be 1', (done) => {
    //         dao.removeDocument(DATABASES.MAZES, mazeId, function cbGetMaze(err: Error, numRemoved: number) {
    //             assert.equal(numRemoved, 1);
    //             done();
    //         });
    //     });
    // });
});
