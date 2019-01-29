import express from 'express';
import DataAccessObject_TingoDB from '../lib/DAO_TingoDb';
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
    let height: number = req.query.height;
    let width: number = req.query.width;
    let challengeLevel: number = req.query.challengeLevel;
    let challenge: number = req.query.challenge;
    let cl: number = req.query.cl;
    let name: string = req.query.name;
    let seed: string = req.query.seed;
    let maze = new Maze();

    // we need a height!
    if (height == null) {
        log.warn(__filename, req.url, 'Request did not specify the height parameter.');
        res.status(400).send('400 - Bad Request. Missing query parameter: height');
        return;
    }

    // we need a width, too!
    if (width == null) {
        log.warn(__filename, req.url, 'Request did not specify the width parameter.');
        res.status(400).send('400 - Bad Request. Missing query parameter: width');
        return;
    }

    // And... we need a challengeLevel (or cl)
    if (cl == null && challenge == null && challengeLevel == null) {
        log.warn(__filename, req.url, 'Request did not specify the challengeLevel (or challenge or cl) parameter.');
        res.status(400).send('400 - Bad Request. Missing query parameter: [cl | challengeLevel]');
        return;
    } else {
        // use cl from here on out
        if (cl == null) cl = challengeLevel;
    }

    if (isNaN(height) || isNaN(width) || isNaN(cl)) {
        log.warn(__filename, req.url, 'Non-numeric height, width, and/or challengeLevel detected.');
        res.status(400).send('400 - Bad Request. Non-numeric height, width, and/or challengeLevel');
        return;
    }

    if (height * width > maze.getMaxCellCount()) {
        log.warn(__filename, req.url, 'Request exceeds maximum maze dimensions.');
        res.status(400).send('400 - Bad Request. Total maze cell count (height * width) may not exceed ' + maze.getMaxCellCount());
        return;
    }

    if (height < maze.getMinHeight() || width < maze.getMinWidth()) {
        log.warn(__filename, req.url, fmt('Requested maze dimensions below minimum values: %sx%s.', maze.getMinHeight(), maze.getMinWidth()));
        res.status(400).send(fmt('400 - Bad Request. Requested maze dimensions below minimum values: %sx%s', maze.getMinHeight(), maze.getMinWidth()));
        return;
    }

    // The maze needs a seed (or name)
    if (name == null && seed == null) {
        log.warn(__filename, req.url, 'Request did not specify the seed or name parameter.');
        res.status(400).send('400 - Bad Request. Missing query parameter: [seed | name]');
        return;
    } else {
        // we'll be using seed from here on out
        if (seed == null) seed = name;
    }

    maze.generate(height, width, seed, cl);
    log.debug(__filename, req.url, 'Maze generation complete for "' + maze.Id + '"');

    //    res.status(200).json({ message: 'Maze "25:30:6:Deadly Dash" regenerated.  New render: <br /><hr>' + maze.generateTextRender(false) });
    res.status(200).send('<html><body>Maze "' + maze.Id + '" generated.<br /><hr><pre>' + maze.generateTextRender(false) + '</pre></body></html>');
});

mazeRouter.get('/', (req, res) => {
    res.status(200).json({ message: '/maze default route' });
});

export default mazeRouter;
