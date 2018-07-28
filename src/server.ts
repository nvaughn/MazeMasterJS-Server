import { format as fmt } from 'util';
import { Logger, LOG_LEVELS } from './lib/Logger';
import { LocalDAO } from './lib/LocalDAO';
import { Maze } from './lib/Maze';

Logger;
// set up logger
const log = Logger.getInstance();
log.setLogLevel(LOG_LEVELS.DEBUG);
log.appInfo(__filename, '');

// get data access object instance
// currently using a local NeDB JSON DB
const dao = LocalDAO.getInstance();

// start up the server
startServer();

function startServer() {
    log.info(__filename, 'startServer()', 'Server started.');

    let maze = new Maze();
    maze.generate(10, 10, 'NewbishMaze', 3);
    console.log(maze.textRender);

    dao.insertMaze(maze, function cbInsertMaze(err: Error, newDoc: any) {
        if (!err || err === undefined) {
            log.debug(__filename, 'startServer()', fmt('Maze [%s] stored successfully.', newDoc._id));
            // add to mazes array or something?
        }
    });
}

/**
 * Watch for SIGINT (process interrupt signal) and trigger shutdown
 */
process.on('SIGINT', function onSigInt() {
    // all done, close the db connection
    log.info(__filename, 'onSigInt()', 'Got SIGINT - Exiting application...');
    doShutdown();
});

/**
 * Watch for SIGTERM (process terminate signal) and trigger shutdown
 */
process.on('SIGTERM', function onSigTerm() {
    // all done, close the db connection
    log.info(__filename, 'onSigTerm()', 'Got SIGTERM - Exiting application...');
    doShutdown();
});

/**
 * Gracefully shut down the service
 */
function doShutdown() {
    log.info(__filename, 'doShutDown()', 'Closing HTTP Server connections...');
}
