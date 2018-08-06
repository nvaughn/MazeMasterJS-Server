import Maze from '../lib/Maze';
import assert from 'assert';
import md5 from 'md5';
import Position from '../lib/Position';
import Logger, {LOG_LEVELS} from '../lib/Logger';
import {DIRS} from '../lib/Enums';

/**
 * This tests the Maze Class. It is specifically designed to fail
 * when changes are made to the maze generation algorithm.
 *
 * If the algorithm changes, all mazes should be regenerated to
 * ensure that changes are reflected everywhere and EACH MAZE
 * should be visually inspected to ensure that it is solvable.
 *
 * Maze class test cases:
 *  + instantiation (new)
 *  + instantiation (from data)
 *  + generation (with max/min error validation)
 *  + getCell
 *  + getCellNeighbor
 *  + text rendering (multiple modes)
 */

let maze: Maze = new Maze();
const mazeCellHash = 'fbd02b8e0012a94fba2275027704219f';
const mazeCellNeighborHash = '4c2172b185d3cb25c7ec916b9f11bba1';
const mazeRenderHashA = '0a57600e3b025972b5f30482ae692682';
const mazeRenderHashB = '711f426d24b0e6d39403910fc34d5284';

// configure log level for these tests
const log = Logger.getInstance();
log.setLogLevel(LOG_LEVELS.NONE); // disable standard logging

describe('Maze', () => {
    describe('Maze.generate(100, 100, MochaTestMazeTooBig, 5))', () => {
        it('should return error - maze too large', (done) => {
            let errMsg = 'MAX CELL COUNT (2500) EXCEEDED!  100*100=10000 - Please reduce Height and/or Width and try again.';
            try {
                maze = new Maze();
                maze.generate(100, 100, 'MochaTestMazeTooBig', 5);
                assert.fail('Oversized maze creation did not cause error.');
                done();
            } catch (err) {
                assert.equal(err.message, errMsg);
                done();
            }
        });
    });
    describe('Maze.generate(1, 1, MochaTestTooSmall, 5))', () => {
        it('should return error - maze too large', (done) => {
            let errMsg = 'MINIMUM MAZE DIMENSIONS (3x3) NOT MET! Please increase Height and/or Width and try again.';
            try {
                maze = new Maze();
                maze.generate(1, 1, 'MochaTestTooSmall', 5);
                assert.fail('Undersized maze creation did not cause error.');
                done();
            } catch (err) {
                assert.equal(err.message, errMsg);
                done();
            }
        });
    });
    describe('Maze.generate(3, 3, MochaTestMaze, 5))', () => {
        it('should generate new maze without error', (done) => {
            maze = new Maze();
            maze.generate(3, 3, 'MochaTestMaze', 5);
            done();
        });
    });
    describe('New Maze(JSON Data)', () => {
        it('should instantiate a maze from JSON Maze Data', (done) => {
            let jMaze = new Maze(JSON.parse(JSON.stringify(maze)));
            done();
        });
    });
    describe('Maze.Id', () => {
        it('should return id ' + maze.Id + '', (done) => {
            assert.equal(maze.Id, maze.Id);
            done();
        });
    });
    describe('Maze.ShortestPathLength()', () => {
        it('should return 9', (done) => {
            assert.equal(maze.ShortestPathLength, 3);
            done();
        });
    });
    describe('Maze.getCell(1,1)', () => {
        it('should return return cell object with MD5 hash value of ' + mazeCellHash + '', (done) => {
            let cPos = new Position(1, 1);
            let cell = maze.getCell(cPos);
            assert.equal(mazeCellHash, md5(JSON.stringify(cell)));
            done();
        });
    });
    describe('Maze.getCellNeighbor(Cell(1,1), DIRS.EAST)', () => {
        it('should return return cell object with MD5 hash value of ' + mazeCellNeighborHash + '', (done) => {
            let cPos = new Position(1, 1);
            let cell = maze.getCell(cPos);
            let cellNeighbor = maze.getCellNeighbor(cell, DIRS.EAST);
            assert.equal(mazeCellNeighborHash, md5(JSON.stringify(cellNeighbor)));
            done();
        });
    });
    describe('Maze.TextRender()', () => {
        it('should return return text rendering with MD5 hash value of ' + mazeRenderHashA + '', (done) => {
            assert.equal(mazeRenderHashA, md5(maze.TextRender));
            done();
        });
    });
    describe('Maze.generateTextRender(forceRegen=false)', () => {
        it('should return return text rendering with MD5 hash value of ' + mazeRenderHashA + '', (done) => {
            assert.equal(mazeRenderHashA, md5(maze.generateTextRender(false)));
            done();
        });
    });
    describe('Maze.generateTextRender(forceRegen=true, playerPos=(2,2))', () => {
        it('should return return text rendering with MD5 hash value of ' + mazeRenderHashB + '', (done) => {
            assert.equal(mazeRenderHashB, md5(maze.generateTextRender(true, new Position(1, 1))));
            done();
        });
    });
});
