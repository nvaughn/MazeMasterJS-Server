"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = require("./lib/Logger");
const LocalDAO_1 = require("./lib/LocalDAO");
const Maze_1 = require("./lib/Maze");
Logger_1.Logger;
// set up logger
const log = Logger_1.Logger.getInstance();
log.setLogLevel(Logger_1.LOG_LEVELS.DEBUG);
log.appInfo(__filename, '');
// get data access object instance
// currently using a local NeDB JSON DB
const dao = LocalDAO_1.LocalDAO.getInstance();
// start up the server
startServer();
function startServer() {
    log.info(__filename, 'startServer()', 'Server started.');
    let maze = new Maze_1.Maze();
    maze.generate(11, 15, 'DragonDingle', 4);
    console.log(maze.textRender);
    dao.insertMaze(maze);
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