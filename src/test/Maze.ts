import Maze from '../lib/Maze';
import assert from 'assert';
import md5 from 'md5';
import Position from '../lib/Position';

/**
 * Maze class test cases:
 *  + instantiation (new)
 *  + instantiation (from data)
 *  + generation
 *  + text rendering
 */

const maze: Maze = new Maze();
const mazeRenderHashA = '0a57600e3b025972b5f30482ae692682';
const mazeRenderHashB = '711f426d24b0e6d39403910fc34d5284';

describe('Maze', () => {
    describe('Maze.generate(height, width, seed, challenge))', () => {
        it('should generate new maze without error: ' + maze.Id, done => {
            maze.generate(3, 3, 'MochaTestMaze', 5);
            done();
        });
    });
    describe('Maze.Id', () => {
        it('should return id ' + maze.Id + '', done => {
            assert.equal(maze.Id, maze.Id);
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
