import express from 'express';
import DataAccessObject_TingoDB from '../lib/DAO_TingoDB';
import Logger from '../lib/Logger';
import { DATABASES } from '../lib/Enums';
import { format as fmt } from 'util';
import Maze from '../lib/Maze';

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

/**
 * For testing maze generation algorithm - TODO: remove or replace
 */
mazeRouter.get('/test', (req, res) => {
    let maze = new Maze();
    maze.generate(25, 30, 'Deadly Dash', 6);
    log.debug(__filename, req.url, 'Maze generation complete for "25:30:6:Deadly Dash"');

    //    res.status(200).json({ message: 'Maze "25:30:6:Deadly Dash" regenerated.  New render: <br /><hr>' + maze.generateTextRender(false) });
    res.status(200).send(
        '<html><body>Maze "25:30:6:Deadly Dash" regenerated.  New render: <br /><hr><pre>' + maze.generateTextRender(false) + '</pre></body></html>'
    );
});

mazeRouter.get('/', (req, res) => {
    res.status(200).json({ message: '/maze default route' });
});

export default mazeRouter;
