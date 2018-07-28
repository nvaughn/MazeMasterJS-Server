import Cell from './Cell';
import ICell from './ICell';
import IMaze from './IMaze';
import seedrandom from 'seedrandom';
import Logger from './Logger';
import { Position } from './Position';
import { DIRS, TAGS } from './Enumerations';
import { format as fmt } from 'util';

const log = Logger.getInstance();
const MAX_CELL_COUNT = 2500; // control max maze size to prevent overflow due to recursion errors
const MIN_TRAPS_CHALLENGE_LEVEL = 3; // the minimum maze challenge level that allows traps

let recurseDepth = 0; // tracks the level of recursion during path carving
let maxRecurseDepth = 0; // tracks the deepest level of carve recursion seen
let startGenTime = 0; // used to determine time spent generating a maze

let solutionPath: Array<string>; // used for the maze solver
let playerPos: Position; // used for the maze solver

export class Maze implements IMaze {
    private _height: number;
    private _width: number;
    private _seed: string;
    private _challenge: number;
    private _cells: Array<Array<Cell>>;
    private _textRender: string;
    private _id: string;
    private _startCell: Position;
    private _finishCell: Position;
    private _shortestPathLength: number;

    /**
     * Instantiates or new or pre-loaded Maze object
     * @param data - IMaze interface pre-filled with required data
     */
    constructor(data?: IMaze) {
        if (data !== undefined) {
            this._height = data.height;
            this._width = data.width;
            this._seed = data.seed;
            this._challenge = data.challenge;
            this._textRender = data.textRender;
            this._id = data.id;
            this._startCell = data.startCell;
            this._finishCell = data.finishCell;
            this._shortestPathLength = data.shortestPathLength;
            this._cells = this.buildCellsArray(data.cells);
        } else {
            this._height = 0;
            this._width = 0;
            this._seed = '';
            this._challenge = 0;
            this._textRender = '';
            this._id = '';
            this._startCell = new Position(0, 0);
            this._finishCell = new Position(0, 0);
            this._shortestPathLength = 0;
            this._cells = new Array<Array<Cell>>();
        }
    }

    // actually have to rebuild the entire cells array
    // to repopulate an object from json
    private buildCellsArray(cells: Array<Array<Cell>>): Array<Array<Cell>> {
        let newCells = new Array(this.height);

        for (let y: number = 0; y < this.height; y++) {
            let row: Array<Cell> = new Array();
            for (let x: number = 0; x < this.width; x++) {
                let cData = JSON.parse(JSON.stringify(cells[y][x]));
                let cell: Cell = new Cell(cData);
                cell.setLocation(x, y);
                row.push(cell);
            }
            newCells.push(row);
        }
        return newCells;
    }

    public getCell(pos: Position): Cell {
        if (pos.row < 0 || pos.row > this._cells.length || pos.col < 0 || pos.col > this._cells[0].length) {
            log.warn(__filename, fmt('getCell(%d, %d', pos.row, pos.col), 'Invalid cell coordinates given.');
            throw new Error(fmt('Index Out of Bounds - Invalid cell coordinates given: row:%d, col:%d.'));
        }

        return this._cells[pos.row][pos.col];
    }

    public getICell(pos: Position): ICell {
        return this.getCell(pos).toICell();
    }

    public getCellNeighbor(cell: Cell, dir: DIRS): Cell {
        // move location of next cell according to random direction
        let row = cell.getPos().row;
        let col = cell.getPos().col;

        // find coordinates of the cell in the given direction
        if (dir < DIRS.EAST) row = dir == DIRS.NORTH ? row - 1 : row + 1;
        if (dir > DIRS.SOUTH) col = dir == DIRS.EAST ? col + 1 : col - 1;

        return this.getCell(new Position(row, col));
    }

    /**
     * Generates a new maze based on the given parameters
     * @param height - The height of the maze grid
     * @param width - The width of the maze grid
     * @param seed - pseudo random number generator seed value.  If empty, maze will be random and unrepeatable
     * @param challengeLevel - The difficulty level of the maze being generated
     */
    public generate(height: number, width: number, seed: string, challengeLevel: number): this {
        this.challenge = challengeLevel;

        if (this._cells.length > 0) {
            log.warn(__filename, 'generate()', 'This maze has already been generated.');
            return this;
        }

        log.info(__filename, 'generate()', fmt('Generating new %d (height) x %d (width) maze with seed "%s"', height, width, seed));
        startGenTime = Date.now();

        // validate height and width and collect errors
        let errors = new Array<string>();
        if (isNaN(height)) throw new Error('Height must be numeric.');
        if (isNaN(width)) throw new Error('Width must be numeric.');

        // set the dimensions
        this.height = height;
        this.width = width;

        // check for size constraint
        if (height * width > MAX_CELL_COUNT) {
            throw new Error(fmt('MAX CELL COUNT (%d) EXCEEDED!  %d*%d=%d - Please reduce Height and/or Width and try again.', MAX_CELL_COUNT, height, width, height * width));
        }

        // implement random seed
        if (seed && seed.length > 0) {
            this.seed = seed;
            seedrandom(seed, { global: true });
        }

        // set maze's ID
        this.id = fmt('%d:%d:%s', this.height, this.width, this.seed);

        // build the empty cells array
        this._cells = new Array(height);
        for (let y: number = 0; y < height; y++) {
            let row: Array<Cell> = new Array();
            for (let x: number = 0; x < width; x++) {
                let cell: Cell = new Cell();
                cell.setLocation(x, y);
                row.push(cell);
            }
            this._cells[y] = row;
        }

        log.debug(__filename, 'generate()', fmt('Generated [%d][%d] grid of %d empty cells.', height, width, height * width));

        // randomize start and finish locations
        let startCol: number = Math.floor(Math.random() * width);
        let finishCol: number = Math.floor(Math.random() * width);

        log.debug(__filename, 'generate()', fmt('Adding START ([%d][%d]) and FINISH ([%d][%d]) cells.', 0, startCol, height - 1, finishCol));

        // tag start and finish columns (start / finish tags force matching exits on edge)
        this.startCell = new Position(0, startCol);

        this._cells[0][startCol].addTag(TAGS.START);

        this.finishCell = new Position(height - 1, finishCol);
        this._cells[height - 1][finishCol].addTag(TAGS.FINISH);

        // start the carving routine
        this.carvePassage(this._cells[0][0]);

        // now solve the maze and tag the path
        recurseDepth = 0;
        this.solveAndTag();

        // then add some traps...
        if (this.challenge >= MIN_TRAPS_CHALLENGE_LEVEL) {
            this.addTraps();
        } else {
            log.debug(__filename, 'generate()', fmt('Maze Challenge Level (%s) is below the minimum CL allowing traps (%s). Skipping trap generation.', this.challenge, MIN_TRAPS_CHALLENGE_LEVEL));
        }

        // render the maze so the text rendering is set
        this.render();

        log.info(__filename, 'generate()', fmt('Generation Complete: Time=%dms, Recursion=%d, MazeID=%s', Date.now() - startGenTime, maxRecurseDepth, this._id));
        return this;
    }

    /**
     * Carves passages out of a new maze grid that has no exits set
     * Only trace logging in here due to recursive log spam
     * @param cell
     */
    private carvePassage(cell: Cell) {
        recurseDepth++;
        if (recurseDepth > maxRecurseDepth) maxRecurseDepth = recurseDepth; // track deepest level of recursion during generation

        log.trace(__filename, 'carvePassage()', fmt('Recursion: %d. Carving STARTED for cell [%d][%d].', recurseDepth, cell.getPos().row, cell.getPos().col));

        // randomly sort an array of bitwise directional values (see also: Enums.Dirs)
        let dirs = [1, 2, 4, 8].sort(function(a, b) {
            return 0.5 - Math.random();
        });

        // wander through the grid using randomized directions provided in dirs[],
        // carving out cells by adding exits as we go
        for (let n: number = 0; n < dirs.length; n++) {
            let ny: number = cell.getPos().row;
            let nx: number = cell.getPos().col;

            // move location of next cell according to random direction
            if (dirs[n] < DIRS.EAST) ny = dirs[n] == DIRS.NORTH ? ny - 1 : ny + 1;
            if (dirs[n] > DIRS.SOUTH) nx = dirs[n] == DIRS.EAST ? nx + 1 : nx - 1;

            try {
                // if the next call has valid grid coordinates, get it and carve into it
                if (ny >= 0 && ny < this._cells.length && nx >= 0 && nx < this._cells[0].length) {
                    let nextCell: Cell = this._cells[ny][nx];
                    if (!(nextCell.getTags() & TAGS.CARVED) && cell.addExit(dirs[n], this._cells)) {
                        // this is a good move, so mark the cell as carved
                        nextCell.addTag(TAGS.CARVED);

                        // and carve into the next cell
                        this.carvePassage(nextCell);
                    }
                }
            } catch (error) {
                // somehow still grabbed an invalid cell
                log.error(__filename, 'carvePassage()', fmt('Error getting cell [%d][%d].', ny, nx), error);
            }
        }

        // exiting the function relieves one level of recursion
        recurseDepth--;
        log.trace(__filename, 'carvePassage()', fmt('Max Recursion: %d. Carve COMPLETED for cell [%d][%d].', recurseDepth, cell.getPos().row, cell.getPos().col));
    }

    /**
     * Returns a text rendering of the maze as a grid of 3x3
     * character blocks.
     */
    public render() {
        const H_WALL = '+---';
        const S_DOOR = '+ S ';
        const F_DOOR = '+ F ';
        const V_WALL = '|';
        const H_DOOR = '+   ';
        const V_DOOR = ' ';
        const CENTER = '   ';
        const SOLUTION = ' . ';
        const ROW_END = '+';
        const CARVED = '   ';
        const AVATAR = ' @ ';

        // TODO: Turn back on render caching after solver work is completed
        if (this.textRender.length > 0) {
            return this.textRender;
        }

        let textMaze = '';

        // walk the array, one row at a time
        for (let y = 0; y < this.height; y++) {
            for (let subRow = 0; subRow < 3; subRow++) {
                let row = '';

                // each text-cell is actually three
                for (let x = 0; x < this.width; x++) {
                    let cell = this._cells[y][x];
                    switch (subRow) {
                        case 0:
                            // only render north walls on first row
                            if (y == 0) {
                                if (!!(cell.getTags() & TAGS.START)) {
                                    row += S_DOOR;
                                } else {
                                    row += !!(cell.getExits() & DIRS.NORTH) ? H_DOOR : H_WALL;
                                }
                            }
                            break;
                        case 1:
                            // only render west walls on first column
                            if (x == 0) {
                                row += !!(cell.getExits() & DIRS.WEST) ? V_DOOR : V_WALL;
                            }

                            // render room center - check for cell properties and render appropriately
                            let cellFill = CENTER;
                            if (!!(cell.getTags() & TAGS.PATH)) cellFill = SOLUTION;
                            if (!!(cell.getTags() & TAGS.TRAP_BEARTRAP)) cellFill = '>b<';
                            if (!!(cell.getTags() & TAGS.TRAP_PIT)) cellFill = '>p<';
                            if (!!(cell.getTags() & TAGS.TRAP_FLAMETHOWER)) cellFill = '>f<';
                            row += cellFill;

                            // always render east walls (with room center)
                            row += !!(cell.getExits() & DIRS.EAST) ? V_DOOR : V_WALL;

                            break;
                        case 2:
                            // always render south walls
                            if (!!(cell.getTags() & TAGS.FINISH)) {
                                row += F_DOOR;
                            } else {
                                row += !!(cell.getExits() & DIRS.SOUTH) ? H_DOOR : H_WALL;
                            }
                            break;
                    }
                }

                if (subRow != 1) {
                    row += ROW_END;
                }

                // end the line - only draw the top subRow if on the first line
                if ((subRow == 0 && y == 0) || subRow > 0) {
                    textMaze += row + '\n';
                }
            }
        }

        this.textRender = textMaze.toString();
        return textMaze;
    }

    /**
     * Wraps the recursive tagSolution function
     * and initializes tracking variables
     */
    public solveAndTag() {
        playerPos = new Position(this.startCell.row, this.startCell.col);
        solutionPath = new Array<string>();
        this.tagSolution(playerPos, 0);
    }

    /**
     * Finds the best solution path and tags it with TAGS.PATH
     * Only trace logging in here because it's recursive and very noisy
     * @param cellPos
     * @param pathId
     */
    private tagSolution(cellPos: Position, pathId: number) {
        recurseDepth++;
        if (recurseDepth > maxRecurseDepth) maxRecurseDepth = recurseDepth; // track deepest level of recursion during generation
        let cell: Cell;

        log.trace(__filename, fmt('tagSolution(%s)', cellPos.toString()), fmt('R:%d P:%s -- Solve pass started.', recurseDepth, pathId));

        // Attempt to get the cell - if it errors we can return from this call
        try {
            cell = this.getCell(cellPos);
        } catch (err) {
            log.warn(__filename, fmt('tagSolution(%s)', cellPos.toString()), fmt('R:%d P:%s -- Invalid cell.', recurseDepth, pathId));
            recurseDepth--;
            return;
        }

        // add the cell to the list of explored cells
        solutionPath.push(cell.getPos().toString());

        // helpful vars
        let dirs = [DIRS.NORTH, DIRS.SOUTH, DIRS.EAST, DIRS.WEST];
        let moveMade = false;

        if (playerPos.equals(this.finishCell)) {
            log.trace(__filename, fmt('tagSolution(%s)', cellPos.toString()), fmt('R:%d P:%s -- WINNING PATH!', recurseDepth, pathId));
        } else {
            // update player location, but don't move it once it finds the finish
            playerPos.col = cell.getPos().col;
            playerPos.row = cell.getPos().row;

            dirs.forEach(dir => {
                let cLoc: Position = cell.getPos(); // current position
                let nLoc: Position = new Position(cLoc.row, cLoc.col); // next position

                switch (dir) {
                    case DIRS.NORTH:
                        // start always has an exit on the north wall, but it's not usable
                        if (!!(cell.getExits() & DIRS.NORTH) && !(cell.getTags() & TAGS.START)) nLoc.row -= 1;
                        break;
                    case DIRS.SOUTH:
                        if (!!(cell.getExits() & DIRS.SOUTH) && !(cell.getTags() & TAGS.FINISH)) nLoc.row += 1;
                        break;
                    case DIRS.EAST:
                        if (!!(cell.getExits() & DIRS.EAST)) nLoc.col += 1;
                        break;
                    case DIRS.WEST:
                        if (!!(cell.getExits() & DIRS.WEST)) nLoc.col -= 1;
                        break;
                }

                // ensure that a move is being made, that the cell is not visited, and that we aren't already at the finish
                if (!nLoc.equals(cLoc) && solutionPath.indexOf(nLoc.toString()) < 0) {
                    // update the path ID if moving into a new branch
                    if (moveMade) {
                        pathId++;
                        log.trace(__filename, fmt('tagSolution(%s)', cellPos.toString()), fmt('R:%d P:%s -- Moving %s [NEW PATH] to cell %s.', recurseDepth, pathId, DIRS[dir], nLoc.toString()));
                    } else {
                        log.trace(__filename, fmt('tagSolution(%s)', cellPos.toString()), fmt('R:%d P:%s -- Moving %s [CONTINUING PATH] to cell %s.', recurseDepth, pathId, DIRS[dir], nLoc.toString()));
                    }

                    if (!playerPos.equals(this.finishCell)) this.tagSolution(nLoc, pathId);

                    // mark that a move was made
                    moveMade = true;
                }
            });

            if (!moveMade) {
                log.trace(__filename, fmt('tagSolution(%s)', cellPos.toString()), fmt('R:%d P:%s -- DEAD_END: Cannot move from cell %s', recurseDepth, pathId, cell.getPos().toString()));
            }
        }

        if (playerPos.equals(this.finishCell)) {
            log.trace(__filename, fmt('tagSolution(%s)', cellPos.toString()), fmt('R:%d P:%s -- Adding PATH tag to %s.', recurseDepth, pathId, cell.getPos().toString()));
            this.shortestPathLength++;
            cell.clearTags();
            cell.addTag(TAGS.PATH);
        }

        recurseDepth--;
        log.trace(__filename, fmt('tagSolution(%s)', cellPos.toString()), fmt('R:%d P:%s -- Path complete.', recurseDepth, pathId));
    } // end tagSolution()

    private addTraps() {
        log.debug(__filename, 'addTraps()', fmt('Generating traps for challenge level %s maze.', this.challenge));

        let trapCount = 0;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let cell = this._cells[y][x];

                // traps only allowed if there are open cells on either side to allow jumping
                // traps on the solution path will be removed when solution is

                let trapAllowed = !!(cell.getExits() & DIRS.NORTH) && !!(cell.getExits() & DIRS.SOUTH); // north-south safe
                if (!trapAllowed) trapAllowed = !!(cell.getExits() & DIRS.NORTH) && !!(cell.getExits() & DIRS.SOUTH); // not north-south save, but east-west safe?
                if (trapAllowed) trapAllowed = !(cell.getTags() & TAGS.PATH); // cancel both if trap is on solution path

                if (trapAllowed) {
                    let trapTries = Math.floor(this.challenge / 4);
                    log.trace(__filename, 'addTraps()', fmt('trapTries=', trapTries));

                    for (let trapCheck = 1; trapCheck <= Math.floor(this.challenge / 3); trapCheck++) {
                        let trapNum = Math.floor(Math.random() * 13) - this.challenge + 1;
                        log.trace(__filename, 'addTraps()', fmt('trapNum=%s', trapNum));
                        switch (trapNum) {
                            case 1: {
                                cell.addTag(TAGS.TRAP_PIT);
                                trapCount++;
                                break;
                            }
                            case 2: {
                                cell.addTag(TAGS.TRAP_FLAMETHOWER);
                                trapCount++;
                                break;
                            }
                            default: {
                                log.trace(__filename, 'addTraps()', fmt('No hit on trap num %s', trapNum));
                            }
                        }
                        if (trapNum > 0 && trapNum < 4) break;
                    }
                } else {
                    log.trace(__filename, 'addTraps()', fmt('No room for traps.'));
                }
            }
        }
        log.debug(__filename, 'addTraps()', fmt('Trap generation complete. Total trap count=%s', trapCount));
    }

    public get height(): number {
        return this._height;
    }
    public set height(value: number) {
        this._height = value;
    }
    public get width(): number {
        1;
        return this._width;
    }
    public set width(value: number) {
        this._width = value;
    }
    public get seed(): string {
        return this._seed;
    }
    public set seed(value: string) {
        this._seed = value;
    }
    public get challenge(): number {
        return this._challenge;
    }
    public set challenge(value: number) {
        this._challenge = value;
    }
    public get cells(): Array<Array<Cell>> {
        return this._cells;
    }
    public get textRender(): string {
        return this._textRender;
    }
    public set textRender(value: string) {
        this._textRender = value;
    }
    public get id(): string {
        return this._id;
    }
    public set id(value: string) {
        this._id = value;
    }
    public get startCell(): Position {
        return this._startCell;
    }
    public set startCell(value: Position) {
        this._startCell = value;
    }
    public get finishCell(): Position {
        return this._finishCell;
    }
    public set finishCell(value: Position) {
        this._finishCell = value;
    }
    public get shortestPathLength(): number {
        return this._shortestPathLength;
    }
    public set shortestPathLength(value: number) {
        this._shortestPathLength = value;
    }
}

export default Maze;
