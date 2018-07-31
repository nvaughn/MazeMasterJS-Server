"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const Logger_1 = require("./Logger");
const Enumerations_1 = require("./Enumerations");
const Position_1 = require("./Position");
const Helpers = __importStar(require("./Helpers"));
/**
 * Used to determine mode of functions modifying cell exits
 */
var FN_MODES;
(function (FN_MODES) {
    FN_MODES[FN_MODES["ADD"] = 0] = "ADD";
    FN_MODES[FN_MODES["REMOVE"] = 1] = "REMOVE";
})(FN_MODES || (FN_MODES = {}));
let log = Logger_1.Logger.getInstance();
/**
 * Represents a single cell in a maze
 */
class Cell {
    constructor(data) {
        if (data !== undefined) {
            this.pos = data.pos;
            this.exits = data.exits;
            this.tags = data.tags;
            this.visits = data.visits;
            this.lastVisit = data.lastVisit;
            this.notes = data.notes;
        }
        else {
            //            this.pos.col = 0; // col
            this.pos = new Position_1.Position(0, 0);
            this.exits = 0;
            this.tags = 0;
            this.visits = 0;
            this.lastVisit = 0;
            this.notes = new Array();
        }
    }
    addNote(note) {
        this.notes.push(note);
        log.debug(__filename, 'addNote()', 'Note added to cell: ' + note);
    }
    getNotes() {
        return this.notes;
    }
    addVisit(moveNumber) {
        this.visits++;
        this.lastVisit = moveNumber;
    }
    getVisitCount() {
        return this.visits;
    }
    getLastVisitMoveNum() {
        return this.lastVisit;
    }
    getExits() {
        return this.exits;
    }
    listExits() {
        return Helpers.listSelectedBitNames(Enumerations_1.DIRS, this.exits);
    }
    /**
     * Adds exit to a cell if exit doesn't already exist.
     * Also adds neighboring exit to valid, adjoining cell.
     *
     * @param dir
     * @param cells
     * @returns boolean
     */
    addExit(dir, cells) {
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
    removeExit(dir, cells) {
        return this.setExit(FN_MODES.REMOVE, dir, cells);
    }
    /**
     * Returns the opposing direction for a given direction
     * @param dir
     */
    reverseDir(dir) {
        switch (dir) {
            case Enumerations_1.DIRS.NORTH:
                return Enumerations_1.DIRS.SOUTH;
            case Enumerations_1.DIRS.SOUTH:
                return Enumerations_1.DIRS.NORTH;
            case Enumerations_1.DIRS.EAST:
                return Enumerations_1.DIRS.WEST;
            case Enumerations_1.DIRS.WEST:
                return Enumerations_1.DIRS.EAST;
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
    setExit(mode, dir, cells) {
        let modeName = mode == FN_MODES.ADD ? 'ADD' : 'REMOVE';
        let dirName = Enumerations_1.DIRS[dir];
        let validMove = true; // only set to true if valid adjoining cell exits to open an exit to
        log.trace(__filename, util_1.format('setExit(%s, %s)', modeName, dirName), util_1.format('Setting exits in cell [%d][%d]. Existing exits: %s.', this.pos.row, this.pos.col, this.listExits()));
        if (mode == FN_MODES.ADD ? !(this.exits & dir) : !!(this.exits & dir)) {
            let nPos = new Position_1.Position(-1, -1); // location adjoining cell - must open exit on both sides
            switch (dir) {
                case Enumerations_1.DIRS.NORTH:
                    validMove = this.pos.row > 0;
                    nPos = new Position_1.Position(this.pos.row - 1, this.pos.col);
                    break;
                case Enumerations_1.DIRS.SOUTH:
                    validMove = this.pos.row < cells.length;
                    nPos = new Position_1.Position(this.pos.row + 1, this.pos.col);
                    break;
                case Enumerations_1.DIRS.EAST:
                    validMove = this.pos.col < cells[0].length;
                    nPos = new Position_1.Position(this.pos.row, this.pos.col + 1);
                    break;
                case Enumerations_1.DIRS.WEST:
                    validMove = this.pos.col > 0;
                    nPos = new Position_1.Position(this.pos.row, this.pos.col - 1);
                    break;
            }
            if (validMove) {
                let neighbor = cells[nPos.row][nPos.col];
                this.exits = mode == FN_MODES.ADD ? (this.exits += dir) : (this.exits -= dir);
                log.trace(__filename, util_1.format('setExit(%s, %s)', modeName, dirName), util_1.format('Exits set in cell [%d][%d]. Exits: ', this.pos.row, this.pos.col, this.listExits()));
                neighbor.exits = mode == FN_MODES.ADD ? (neighbor.exits += this.reverseDir(dir)) : (neighbor.exits -= dir);
                log.trace(__filename, util_1.format('setExit(%s, %s)', modeName, dirName), util_1.format('Adjoining exits set in cell [%d][%d]. Exits: ', neighbor.pos.row, neighbor.pos.col, neighbor.listExits()));
            }
            else {
                log.warn(__filename, util_1.format('setExit(%s, %s)', modeName, dirName), util_1.format('Invalid adjoining cell location: [%d][%d]', nPos.row, nPos.col));
            }
        }
        else {
            log.warn(__filename, util_1.format('setExit(%s, %s)', modeName, dirName), util_1.format('Invalid action in cell [%d][%d]. Exit %s. Cell exits: %s', this.pos.row, this.pos.col, mode == FN_MODES.ADD ? 'already exists' : 'not found', this.listExits()));
        }
        return validMove;
    } // setExit
    /**
     * Returns an array representing the cells grid coordinates (y, x)
     */
    getPos() {
        return new Position_1.Position(this.pos.row, this.pos.col);
    }
    // checks for an open direction
    isDirOpen(dir) {
        return !!(this.getExits() & dir);
    }
    /**
     * Set the cell's grid coordinates
     * @param x
     * @param y
     */
    setLocation(x, y) {
        this.pos.col = x;
        this.pos.row = y;
    }
    /**
     * Returns the bitwise integer value representing cell tags
     */
    getTags() {
        return this.tags;
    }
    /**
     * Returns list of string values representing cell tags
     */
    listTags() {
        return Helpers.listSelectedBitNames(Enumerations_1.TAGS, this.tags);
    }
    // removes all but the carved tag - used for removing traps from the solution path
    clearTags() {
        let tags = Enumerations_1.TAGS.CARVED;
        if (!!(this.tags & Enumerations_1.TAGS.START))
            tags += Enumerations_1.TAGS.START;
        if (!!(this.tags & Enumerations_1.TAGS.FINISH))
            tags += Enumerations_1.TAGS.FINISH;
        this.tags = tags;
    }
    /**
     * Adds an Enums.Tag to this cell if it doesn't already exist
     * @param tag
     */
    addTag(tag) {
        let tagName = Enumerations_1.TAGS[tag];
        if (!(this.tags & tag)) {
            this.tags += tag;
            switch (tag) {
                case Enumerations_1.TAGS.START:
                    // force north exit on start cell - do not use addExit() for this!
                    if (!(this.exits & Enumerations_1.DIRS.NORTH)) {
                        this.exits += Enumerations_1.DIRS.NORTH;
                        log.debug(__filename, 'addTag(' + tagName + ')', util_1.format('[%d][%d] has %s tag. Forcing NORTH exit through edge. Cell exits: %s', this.pos.row, this.pos.col, tagName, this.listExits()));
                    }
                    break;
                case Enumerations_1.TAGS.FINISH:
                    // force north exit on finish cell - do not use addExit() for this!
                    if (!(this.exits & Enumerations_1.DIRS.SOUTH)) {
                        this.exits += Enumerations_1.DIRS.SOUTH;
                        log.debug(__filename, 'addTag(' + tagName + ')', util_1.format('[%d][%d] has %s tag. Forcing NORTH exit through edge. Cell exits: %s', this.pos.row, this.pos.col, tagName, this.listExits()));
                    }
                    break;
            }
            log.trace(__filename, 'addTag(' + tagName + ')', util_1.format('Tag %s added to cell [%d][%d]. Current tags: %s.', tagName, this.pos.row, this.pos.col, this.listTags()));
        }
        else {
            log.warn(__filename, 'addTag(' + tagName + ')', util_1.format('Tag %s already exists in cell [%d][%d]. Current tags: %s.', tagName, this.pos.row, this.pos.col, this.listTags()));
        }
    }
    /**
     * Removes a tag from this cell, if it exists
     * @param tag
     */
    removeTag(tag) {
        let tagName = Enumerations_1.TAGS[tag];
        if (!!(this.tags & tag)) {
            this.tags -= tag;
            log.debug(__filename, 'removeTag(' + tagName + ')', util_1.format('Tag %s removed from cell [%d][%d]. Current tags: %s.', tagName, this.pos.row, this.pos.col, this.listTags()));
        }
        else {
            log.warn(__filename, 'removeTag(' + tagName + ')', util_1.format('Tag %s not found in cell [%d][%d]. Current tags: %s.', tagName, this.pos.row, this.pos.col, this.listTags()));
        }
    }
}
exports.default = Cell;
//# sourceMappingURL=Cell.js.map