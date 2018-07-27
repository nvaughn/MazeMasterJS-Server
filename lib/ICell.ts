/**
 * Maze Cell interface
 */
export interface ICell {
    col: number;
    row: number;
    exits: number;
    tags: number;
    visits: number;
    lastVisit: number;
    notes: Array<string>;
}

export default ICell;
