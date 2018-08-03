"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const Logger_1 = require("./lib/Logger");
const helpers = __importStar(require("./lib/Helpers"));
const express_1 = __importDefault(require("express"));
const Enums_1 = require("./lib/Enums");
const maze_1 = require("./routes/maze");
const default_1 = require("./routes/default");
const DAO_NeDB_1 = require("./lib/DAO_NeDB");
// set up loggers
const log = Logger_1.Logger.getInstance();
log.setLogLevel(Logger_1.LOG_LEVELS.DEBUG);
log.appInfo(__filename, '');
const HTTP_PORT = process.env.HTTP_PORT || 80;
// set up express
const app = express_1.default();
// get data access object instance (local NeDB connector)
// const dao = DataAccessObject_NeDB.getInstance();
const dao = DAO_NeDB_1.DataAccessObject_NeDB.getInstance();
// Start the Server
startServer();
/**
 * Starts up the express server
 */
function startServer() {
    log.info(__filename, 'startServer()', 'Server started.');
    // let maze: Maze = new Maze().generate(10, 10, 'test kitty', 5);
    // dao.insertDocument(DATABASES.MAZES, maze, function cbInsMaze() {
    //     console.log('inserted');
    // });
    dao.getDocumentCount(Enums_1.DATABASES.MAZES, function cbMazeCount(err, mazeCount) {
        console.log('Documents Found: ', mazeCount);
        if (mazeCount == 0) {
            log.warn(__filename, 'startServer()', 'No maze documents found in the mazes database - generating default mazes now...');
            helpers.generateDefaultMazes();
        }
    });
    app.use('/maze', maze_1.mazeRouter);
    app.use('/', default_1.defaultRouter);
    app.listen(HTTP_PORT, () => {
        log.info(__dirname, 'startServer()', 'MazeMasterJS HTTP Server Listening on Port ' + HTTP_PORT);
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
//# sourceMappingURL=server.js.map