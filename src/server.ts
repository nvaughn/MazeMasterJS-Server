import { format as fmt } from 'util';
import { Logger, LOG_LEVELS } from './lib/Logger';
import { LocalDAO, DATABASES } from './lib/DAO_Local';
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

testBlock();

// TODO: Remove - for testing only
function testBlock() {
    let maze: Maze = new Maze();
    maze.generate(3, 3, 'test', 5);
    dao.insertDocument(DATABASES.MAZES, maze, function cbInsertTest(err: Error, newDoc: any) {
        console.log('done');
    });
}

/**
 * Starts up the express server
 */
function startServer() {
    log.info(__filename, 'startServer()', 'Server started.');
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
