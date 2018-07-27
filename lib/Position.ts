import { format } from 'util';
import { IPosition } from './IPosition';

// Position - X, Y Coordinates within the maze grid
export class Position implements IPosition {
    public row: number;
    public col: number;

    constructor(row: number, col: number) {
        this.row = row;
        this.col = col;
    }

    /**
     * Returns true of values of given Pos instance match
     * the values of the current Pos
     * @param position
     */
    public equals(position: IPosition): boolean {
        return this.row == position.row && this.col == position.col;
    }

    public toString(): string {
        return format('row: %s, col: %s', this.row, this.col);
    }

    public toIPosition(): IPosition {
        return { row: this.row, col: this.col };
    }
}

export default Position;
