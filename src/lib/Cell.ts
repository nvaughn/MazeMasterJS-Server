import { format } from 'util';

import { CELL_TAGS, CELL_TRAPS, DIRS } from './Enums';
import * as Helpers from './Helpers';
import { Logger } from './Logger';
import { Position } from './Position';

/**
 * Used to determine mode of functions modifying cell exits
 */
enum FN_MODES {
    ADD = 0,
    REMOVE
}

let log = Logger.getInstance();

/**
 * Represents a single cell in a maze
 */
export default class Cell {
    private pos: Position;
    private exits: number;
    private tags: number;
    private traps: number;
    private visits: number;
    private lastVisit: number;
    private notes: Array<string>;

    constructor(data?: Cell) {
        if (data !== undefined) {
            this.pos = data.pos;
            this.exits = data.exits;
            this.tags = data.tags;
            this.traps = data.traps;
            this.visits = data.visits;
            this.lastVisit = data.lastVisit;
            this.notes = data.notes;
        } else {
            this.pos = new Position(0, 0);
            this.exits = 0;
            this.tags = 0;
            this.traps = 0;
            this.visits = 0;
            this.lastVisit = 0;
            this.notes = new Array<string>();
        }
    }

    public addNote(note: string) {
        this.notes.push(note);
        log.debug(__filename, 'addNote()', 'Note added to cell: ' + note);
    }

    public getNotes(): string[] {
        return this.notes;
    }

    public addVisit(moveNumber: number) {
        this.visits++;
        this.lastVisit = moveNumber;
    }

    public getVisitCount(): number {
        return this.visits;
    }

    public getLastVisitMoveNum(): number {
        return this.lastVisit;
    }

    public getExits(): number {
        return this.exits;
    }

    public getExitCount(): number {
        return Helpers.getSelectedBitNames(DIRS, this.exits).length;
    }

    public listExits(): string {
        return Helpers.listSelectedBitNames(DIRS, this.exits);
    }

    /**
     * Adds exit to a cell if exit doesn't already exist.
     * Also adds neighboring exit to valid, adjoining cell.
     *
     * @param dir
     * @param cells
     * @returns boolean
     */
    public addExit(dir: DIRS, cells: Array<Array<Cell>>): boolean {
        return this.setExit(FN_MODES.ADD, dir, cells);
    }

    /**
     * Adds exit to a cell if exit doesn't already exist.
     * Also adds neighboring exit to valid, adjoining cell.
     *
     * @param dir
     * @param cells
     * @returns boolean
     */
    public removeExit(dir: DIRS, cells: Array<Array<Cell>>): boolean {
        return this.setExit(FN_MODES.REMOVE, dir, cells);
    }

    /**
     * Returns the opposing direction for a given direction
     * @param dir
     */
    private reverseDir(dir: DIRS): number {
        switch (dir) {
            case DIRS.NORTH:
                return DIRS.SOUTH;
            case DIRS.SOUTH:
                return DIRS.NORTH;
            case DIRS.EAST:
                return DIRS.WEST;
            case DIRS.WEST:
                return DIRS.EAST;
            default:
                return 0;
        }
    }

    /**
     * Adds or Removes cell exits, depending on SET_EXIT_MODES value.
     * Also adds or removes opposite exit from valid, adjoining cell.
     * Only trace logging - this is called frequently by recursive generation
     * routines.
     *
     * @param dir
     * @param cells
     * @returns boolean
     */
    private setExit(mode: FN_MODES, dir: DIRS, cells: Array<Array<Cell>>): boolean {
        let modeName = mode == FN_MODES.ADD ? 'ADD' : 'REMOVE';
        let dirName = DIRS[dir];
        let validMove = true; // only set to true if valid adjoining cell exits to open an exit to

        log.trace(
            __filename,
            format('setExit(%s, %s)', modeName, dirName),
            format('Setting exits in cell [%d][%d]. Existing exits: %s.', this.pos.row, this.pos.col, this.listExits())
        );

        if (mode == FN_MODES.ADD ? !(this.exits & dir) : !!(this.exits & dir)) {
            let nPos = new Position(-1, -1); // location adjoining cell - must open exit on both sides

            switch (dir) {
                case DIRS.NORTH:
                    validMove = this.pos.row > 0;
                    nPos = new Position(this.pos.row - 1, this.pos.col);
                    break;
                case DIRS.SOUTH:
                    validMove = this.pos.row < cells.length;
                    nPos = new Position(this.pos.row + 1, this.pos.col);
                    break;
                case DIRS.EAST:
                    validMove = this.pos.col < cells[0].length;
                    nPos = new Position(this.pos.row, this.pos.col + 1);
                    break;
                case DIRS.WEST:
                    validMove = this.pos.col > 0;
                    nPos = new Position(this.pos.row, this.pos.col - 1);
                    break;
            }

            if (validMove) {
                let neighbor: Cell = cells[nPos.row][nPos.col];

                this.exits = mode == FN_MODES.ADD ? (this.exits += dir) : (this.exits -= dir);
                log.trace(
                    __filename,
                    format('setExit(%s, %s)', modeName, dirName),
                    format('Exits set in cell [%d][%d]. Exits: ', this.pos.row, this.pos.col, this.listExits())
                );

                neighbor.exits = mode == FN_MODES.ADD ? (neighbor.exits += this.reverseDir(dir)) : (neighbor.exits -= dir);
                log.trace(
                    __filename,
                    format('setExit(%s, %s)', modeName, dirName),
                    format('Adjoining exits set in cell [%d][%d]. Exits: ', neighbor.pos.row, neighbor.pos.col, neighbor.listExits())
                );
            } else {
                log.warn(__filename, format('setExit(%s, %s)', modeName, dirName), format('Invalid adjoining cell location: [%d][%d]', nPos.row, nPos.col));
            }
        } else {
            log.warn(
                __filename,
                format('setExit(%s, %s)', modeName, dirName),
                format(
                    'Invalid action in cell [%d][%d]. Exit %s. Cell exits: %s',
                    this.pos.row,
                    this.pos.col,
                    mode == FN_MODES.ADD ? 'already exists' : 'not found',
                    this.listExits()
                )
            );
        }

        return validMove;
    } // setExit

    /**
     * Returns an array representing the cells grid coordinates (y, x)
     */
    public getPos(): Position {
        return new Position(this.pos.row, this.pos.col);
    }

    // checks for an open direction
    public isDirOpen(dir: DIRS): boolean {
        return !!(this.getExits() & dir);
    }

    /**
     * Set the cell's grid coordinates
     * @param x
     * @param y
     */
    public setLocation(x: number, y: number) {
        this.pos.col = x;
        this.pos.row = y;
    }

    /**
     * Returns the bitwise integer value representing cell tags
     */
    public getTags(): number {
        return this.tags;
    }

    /**
     * Returns the bitwise integer value representing cell traps
     */
    public getTraps(): number {
        return this.traps;
    }

    /**
     * Returns list of string values representing cell tags
     */
    public listTags(): string {
        return Helpers.listSelectedBitNames(CELL_TAGS, this.tags);
    }

    /**
     * Adds trap to this cell if no trap is already set
     * @param trap
     */
    public setTrap(trap: CELL_TRAPS) {
        let trapName = CELL_TRAPS[trap];
        if (this.traps == 0) {
            this.traps = trap;
            log.trace(__filename, 'setTrap(' + trapName + ')', format('Trap %s set on cell [%d][%d].', trapName, this.pos.row, this.pos.col));
        } else {
            log.warn(__filename, 'setTrap(' + trapName + ')', format('Trap (%s) already set on cell [%d][%d].', trapName, this.pos.row, this.pos.col));
        }
    }

    /**
     * Adds an Enums.Tag to this cell if it doesn't already exist
     * @param tag
     */
    public addTag(tag: CELL_TAGS) {
        let tagName = CELL_TAGS[tag];

        if (!(this.tags & tag)) {
            this.tags += tag;

            switch (tag) {
                case CELL_TAGS.START:
                    // force north exit on start cell - do not use addExit() for this!
                    if (!(this.exits & DIRS.NORTH)) {
                        this.exits += DIRS.NORTH;
                        log.trace(
                            __filename,
                            'addTag(' + tagName + ')',
                            format(
                                '[%d][%d] has %s tag. Forcing NORTH exit through edge. Cell exits: %s',
                                this.pos.row,
                                this.pos.col,
                                tagName,
                                this.listExits()
                            )
                        );
                    }
                    break;
                case CELL_TAGS.FINISH:
                    // force north exit on finish cell - do not use addExit() for this!
                    if (!(this.exits & DIRS.SOUTH)) {
                        this.exits += DIRS.SOUTH;
                        log.trace(
                            __filename,
                            'addTag(' + tagName + ')',
                            format(
                                '[%d][%d] has %s tag. Forcing NORTH exit through edge. Cell exits: %s',
                                this.pos.row,
                                this.pos.col,
                                tagName,
                                this.listExits()
                            )
                        );
                    }
                    break;
            }
            log.trace(
                __filename,
                'addTag(' + tagName + ')',
                format('Tag %s added to cell [%d][%d]. Current tags: %s.', tagName, this.pos.row, this.pos.col, this.listTags())
            );
        } else {
            log.warn(
                __filename,
                'addTag(' + tagName + ')',
                format('Tag %s already exists in cell [%d][%d]. Current tags: %s.', tagName, this.pos.row, this.pos.col, this.listTags())
            );
        }
    }

    /**
     * Removes a tag from this cell, if it exists
     * @param tag
     */
    public removeTag(tag: CELL_TAGS) {
        let tagName = CELL_TAGS[tag];
        if (!!(this.tags & tag)) {
            this.tags -= tag;
            log.debug(
                __filename,
                'removeTag(' + tagName + ')',
                format('Tag %s removed from cell [%d][%d]. Current tags: %s.', tagName, this.pos.row, this.pos.col, this.listTags())
            );
        } else {
            log.warn(
                __filename,
                'removeTag(' + tagName + ')',
                format('Tag %s not found in cell [%d][%d]. Current tags: %s.', tagName, this.pos.row, this.pos.col, this.listTags())
            );
        }
    }
}
