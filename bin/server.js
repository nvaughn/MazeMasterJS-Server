"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = require("./lib/Logger");
const DAO_Local_1 = require("./lib/DAO_Local");
const Maze_1 = require("./lib/Maze");
Logger_1.Logger;
// set up logger
const log = Logger_1.Logger.getInstance();
log.setLogLevel(Logger_1.LOG_LEVELS.DEBUG);
log.appInfo(__filename, '');
// get data access object instance
// currently using a local NeDB JSON DB
const dao = DAO_Local_1.LocalDAO.getInstance();
// start up the server
startServer();
testBlock();
// TODO: Remove - for testing only
function testBlock() {
    let maze = new Maze_1.Maze();
    maze.generate(3, 3, 'test', 5);
    dao.insertDocument(DAO_Local_1.DATABASES.MAZES, maze, function cbInsertTest(err, newDoc) {
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
//# sourceMappingURL=server.js.map