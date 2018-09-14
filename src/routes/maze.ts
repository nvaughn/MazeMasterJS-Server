import express from 'express';
import DataAccessObject_TingoDB from '../lib/DAO_TingoDB';
import Logger from '../lib/Logger';
import {DATABASES} from '../lib/Enums';
import {format as fmt} from 'util';
import {Maze} from '../lib/Maze';

const log = Logger.getInstance();
const dao = DataAccessObject_TingoDB.getInstance();

export const mazeRouter = express.Router();

mazeRouter.get('/list', (req, res) => {
    log.debug(__filename, req.url, 'Returning list of mazes.');
    let ret = '';
    let mazes = dao.getDocuments(DATABASES.MAZES, '', function cbListAllMazes(err: Error, docs: any) {
        if (!err && docs) {
            log.debug(__filename, req.url, fmt('%d maze documents found.', docs.length));

            for (let doc of docs) {
                try {
                    let maze: Maze = new Maze(doc);
                    ret += maze.Id + '<br><pre>' + maze.TextRender + '</pre><br>';
                    log.debug(__filename, req.url, fmt('Maze ID: %s', maze.Id));
                } catch (error) {
                    log.error(__filename, req.url, 'Error loading maze from document.', err);
                }
            }
        }
        res.status(200).send(ret);
    });
});

mazeRouter.get('/', (req, res) => {
    res.status(200).json({message: '/maze default route'});
});

export default mazeRouter;
