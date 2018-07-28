"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
// Position - X, Y Coordinates within the maze grid
class Position {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }
    /**
     * Returns true of values of given Pos instance match
     * the values of the current Pos
     * @param position
     */
    equals(position) {
        return this.row == position.row && this.col == position.col;
    }
    toString() {
        return util_1.format('row: %s, col: %s', this.row, this.col);
    }
    toIPosition() {
        return { row: this.row, col: this.col };
    }
}
exports.Position = Position;
exports.default = Position;
//# sourceMappingURL=Position.js.map