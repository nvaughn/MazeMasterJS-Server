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
const Logger_1 = require("./lib/Logger");
const DAO_NeDB_1 = require("./lib/DAO_NeDB");
const helpers = __importStar(require("./lib/Helpers"));
const express_1 = __importDefault(require("express"));
const Enumerations_1 = require("./lib/Enumerations");
const mazesRouter = express_1.default().router;
// set up logger
const log = Logger_1.Logger.getInstance();
log.setLogLevel(Logger_1.LOG_LEVELS.DEBUG);
log.appInfo(__filename, '');
// set up express
const app = express_1.default();
// get data access object instance (local NeDB connector)
const dao = DAO_NeDB_1.DAO_NeDb.getInstance();
// Start the Server
startServer();
/**
 * Starts up the express server
 */
function startServer() {
    log.info(__filename, 'startServer()', 'Server started.');
    dao.getDocumentCount(Enumerations_1.DATABASES.MAZES, function cbCountMazes(err, count) {
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
//# sourceMappingURL=server.js.map