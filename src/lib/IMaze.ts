import Cell from './Cell';
import Position from './Position';
/**
 *  Maze interface
 */
export interface IMaze {
    height: number;
    width: number;
    seed: string;
    challenge: number;
    cells: Array<Array<Cell>>;
    textRender: string;
    id: string;
    startCell: Position;
    finishCell: Position;
    shortestPathLength: number;
}

export default IMaze;
