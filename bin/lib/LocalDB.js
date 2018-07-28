"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 * Data access object abstracts database implementation from server logic
 * allowing the underlying database to be replaced if needed.
 *
 * LocalDAO wraps access to a local, document-based NOSQL database called
 * "NeDB" that stores data as json in local text files.  The NeDB API closely
 * matches MongoDB's API, so creating a MongoDAO should be relatively easy
 * if NeDB proves unstable or doesn't perform well enough.
 *
 */
const Logger_1 = __importDefault(require("./Logger"));
const file_exists_1 = __importDefault(require("file-exists"));
const util_1 = require("util");
const NeDB = require("nedb");
const log = Logger_1.default.getInstance();
const mazesDbFile = 'data/mazes.db';
const scoresDbFile = 'data/scores.db';
const teamsDbFile = 'data/teams.db';
class LocalDAO {
    // must use getInstance()
    constructor() {
        log.info(__filename, '', util_1.format('%s %s', !file_exists_1.default.sync(mazesDbFile) ? 'Creating' : 'Loading', mazesDbFile));
        this.dbMazes = new NeDB({ filename: mazesDbFile, autoload: true });
        log.info(__filename, '', util_1.format('%s %s', !file_exists_1.default.sync(scoresDbFile) ? 'Creating' : 'Loading', scoresDbFile));
        this.dbScores = new NeDB({ filename: scoresDbFile, autoload: true });
        log.info(__filename, '', util_1.format('%s %s', !file_exists_1.default.sync(teamsDbFile) ? 'Creating' : 'Loading', teamsDbFile));
        this.dbTeams = new NeDB({ filename: teamsDbFile, autoload: true });
    }
    // singleton instance pattern
    static getInstance() {
        if (!LocalDAO.instance) {
            LocalDAO.instance = new LocalDAO();
        }
        return LocalDAO.instance;
    }
    insertScore(score) {
        log.debug(__filename, 'insertScore()', 'Inserting score into dbScores');
        this.dbScores.insert(score);
    }
}
exports.LocalDAO = LocalDAO;
exports.default = LocalDAO;
//# sourceMappingURL=LocalDB.js.map