import { format } from 'util';
import { Logger } from './Logger';
import { DIRS, TAGS } from './Enumerations';
import { ICell } from './ICell';
import { Position } from './Position';
import * as Helpers from './Helpers';

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
    private x: number; // col
    private y: number; // row
    private exits: number;
    private tags: number;
    private visits: number;
    private lastVisit: number;
    private notes: Array<string>;

    constructor(data?: ICell) {
        if (data !== undefined) {
            this.x = data.col;
            this.y = data.row;
            this.exits = data.exits;
            this.tags = data.tags;
            this.visits = data.visits;
            this.lastVisit = data.lastVisit;
            this.notes = data.notes;
        } else {
            this.x = 0; // col
            this.y = 0; // row
            this.exits = 0;
            this.tags = 0;
            this.visits = 0;
            this.lastVisit = 0;
            this.notes = new Array<string>();
        }
    }

    public toICell(): ICell {
        let cellData = {
            row: this.getPos().row,
            col: this.getPos().col,
            exits: this.exits,
            tags: this.tags,
            visits: this.visits,
            lastVisit: this.lastVisit,
            notes: this.notes
        };

        return cellData;
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
     *
     * @param dir
     * @param cells
     * @returns boolean
     */
    private setExit(mode: FN_MODES, dir: DIRS, cells: Array<Array<Cell>>): boolean {
        let modeName = mode == FN_MODES.ADD ? 'ADD' : 'REMOVE';
        let dirName = DIRS[dir];
        let validMove = true; // only set to true if valid adjoining cell exits to open an exit to

        log.debug(__filename, format('setExit(%s, %s)', modeName, dirName), format('Setting exits in cell [%d][%d]. Existing exits: %s.', this.y, this.x, this.listExits()));

        if (mode == FN_MODES.ADD ? !(this.exits & dir) : !!(this.exits & dir)) {
            let nLoc = { y: -1, x: -1 }; // location adjoining cell - must open exit on both sides

            switch (dir) {
                case DIRS.NORTH:
                    validMove = this.y > 0;
                    nLoc = { y: this.y - 1, x: this.x };
                    break;
                case DIRS.SOUTH:
                    validMove = this.y < cells.length;
                    nLoc = { y: this.y + 1, x: this.x };
                    break;
                case DIRS.EAST:
                    validMove = this.x < cells[0].length;
                    nLoc = { y: this.y, x: this.x + 1 };
                    break;
                case DIRS.WEST:
                    validMove = this.x > 0;
                    nLoc = { y: this.y, x: this.x - 1 };
                    break;
            }

            if (validMove) {
                let neighbor: Cell = cells[nLoc.y][nLoc.x];

                this.exits = mode == FN_MODES.ADD ? (this.exits += dir) : (this.exits -= dir);
                log.debug(__filename, format('setExit(%s, %s)', modeName, dirName), format('Exits set in cell [%d][%d]. Exits: ', this.y, this.x, this.listExits()));

                neighbor.exits = mode == FN_MODES.ADD ? (neighbor.exits += this.reverseDir(dir)) : (neighbor.exits -= dir);
                log.debug(__filename, format('setExit(%s, %s)', modeName, dirName), format('Adjoining exits set in cell [%d][%d]. Exits: ', neighbor.y, neighbor.x, neighbor.listExits()));
            } else {
                log.warn(__filename, format('setExit(%s, %s)', modeName, dirName), format('Invalid adjoining cell location: [%d][%d]', nLoc.y, nLoc.x));
            }
        } else {
            log.warn(__filename, format('setExit(%s, %s)', modeName, dirName), format('Invalid action in cell [%d][%d]. Exit %s. Cell exits: %s', this.y, this.x, mode == FN_MODES.ADD ? 'already exists' : 'not found', this.listExits()));
        }

        return validMove;
    } // setExit

    /**
     * Returns an array representing the cells grid coordinates (y, x)
     */
    public getPos(): Position {
        return new Position(this.y, this.x);
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
        this.x = x;
        this.y = y;
    }

    /**
     * Returns the bitwise integer value representing cell tags
     */
    public getTags(): number {
        return this.tags;
    }

    /**
     * Returns list of string values representing cell tags
     */
    public listTags(): string {
        return Helpers.listSelectedBitNames(TAGS, this.tags);
    }

    // removes all but the carved tag - used for removing traps from the solution path
    public clearTags() {
        let tags = TAGS.CARVED;
        if (!!(this.tags & TAGS.START)) tags += TAGS.START;
        if (!!(this.tags & TAGS.FINISH)) tags += TAGS.FINISH;
        this.tags = tags;
    }

    /**
     * Adds an Enums.Tag to this cell if it doesn't already exist
     * @param tag
     */
    public addTag(tag: TAGS) {
        let tagName = TAGS[tag];

        if (!(this.tags & tag)) {
            this.tags += tag;

            switch (tag) {
                case TAGS.START:
                    // force north exit on start cell - do not use addExit() for this!
                    if (!(this.exits & DIRS.NORTH)) {
                        this.exits += DIRS.NORTH;
                        log.debug(__filename, 'addTag(' + tagName + ')', format('[%d][%d] has %s tag. Forcing NORTH exit through edge. Cell exits: %s', this.y, this.x, tagName, this.listExits()));
                    }
                    break;
                case TAGS.FINISH:
                    // force north exit on finish cell - do not use addExit() for this!
                    if (!(this.exits & DIRS.SOUTH)) {
                        this.exits += DIRS.SOUTH;
                        log.debug(__filename, 'addTag(' + tagName + ')', format('[%d][%d] has %s tag. Forcing NORTH exit through edge. Cell exits: %s', this.y, this.x, tagName, this.listExits()));
                    }
                    break;
            }
            log.debug(__filename, 'addTag(' + tagName + ')', format('Tag %s added to cell [%d][%d]. Current tags: %s.', tagName, this.y, this.x, this.listTags()));
        } else {
            log.warn(__filename, 'addTag(' + tagName + ')', format('Tag %s already exists in cell [%d][%d]. Current tags: %s.', tagName, this.y, this.x, this.listTags()));
        }
    }

    /**
     * Removes a tag from this cell, if it exists
     * @param tag
     */
    public removeTag(tag: TAGS) {
        let tagName = TAGS[tag];
        if (!!(this.tags & tag)) {
            this.tags -= tag;
            log.debug(__filename, 'removeTag(' + tagName + ')', format('Tag %s removed from cell [%d][%d]. Current tags: %s.', tagName, this.y, this.x, this.listTags()));
        } else {
            log.warn(__filename, 'removeTag(' + tagName + ')', format('Tag %s not found in cell [%d][%d]. Current tags: %s.', tagName, this.y, this.x, this.listTags()));
        }
    }
}
