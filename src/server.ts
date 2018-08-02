import { format as fmt } from 'util';
import { Logger, LOG_LEVELS } from './lib/Logger';
import { DAO_NeDb } from './lib/DAO_NeDB';
import * as helpers from './lib/Helpers';
import express from 'express';
import { DATABASES } from './lib/Enumerations';
import * as mazeRouter from './routes/maze';
const mazesRouter = express().router;

// set up logger
const log = Logger.getInstance();
log.setLogLevel(LOG_LEVELS.DEBUG);
log.appInfo(__filename, '');

// set up express
const app = express();

// get data access object instance (local NeDB connector)
const dao = DAO_NeDb.getInstance();

// Start the Server
startServer();

/**
 * Starts up the express server
 */
function startServer() {
    log.info(__filename, 'startServer()', 'Server started.');

    dao.getDocumentCount(DATABASES.MAZES, function cbCountMazes(err: Error, count: number) {
        if (count == 0) {
            log.warn(__filename, 'startServer()', 'No maze documents found in the mazes database - generating default mazes now...');
            helpers.generateDefaultMazes();
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
