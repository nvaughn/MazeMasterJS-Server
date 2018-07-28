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
 * LocalDAO wraps access to a local, document-based NO-SQL database called
 * "NeDB" that stores data as json in local text files.  The NeDB API closely
 * matches the MongoDB API, so creating a MongoDAO should be relatively easy
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
        // NOTE: NeDB automatically invokes unique index on _id ... leaving commented code for future reference
        //
        // this.dbMazes.ensureIndex({ fieldName: '_id', unique: true }, function(err) {
        //     log.error(__filename, 'constructor()', 'Unable to ensure unique index on field _id in ' + mazesDbFile, err);
        // });
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
    /**                     **/
    /**  MAZE DB FUNCTIONS  **/
    /**                     **/
    /**
     * Attempts to insert maze into database. Optional callback provided.
     */
    insertMaze(maze, callback) {
        this.dbMazes.insert(maze, function (err, newDoc) {
            if (err && err !== undefined) {
                log.error(__filename, 'insertMaze()', util_1.format('Error inserting maze [%s] in %s', maze.id, mazesDbFile), err);
            }
            else {
                log.debug(__filename, 'insertMaze()', util_1.format('Maze [%s] inserted into %s', maze.id, mazesDbFile));
            }
            if (callback !== undefined)
                callback(err, newDoc);
        });
    }
    updateMaze(maze, callback) {
        this.dbMazes.update({ _id: maze.id }, maze, {}, function (err, numReplaced) {
            if (err && err !== undefined) {
                log.error(__filename, 'updateMaze()', util_1.format('Error updating maze [%s] in %s', maze.id, mazesDbFile), err);
            }
            else {
                if (numReplaced == 0) {
                    log.error(__filename, 'updateMaze()', util_1.format('Error updating maze [%s] in %s', maze.id, mazesDbFile), new Error('Maze Not Found: ' + maze.id));
                }
                else {
                    log.debug(__filename, 'updateMaze()', util_1.format('%s maze record [%s] updated in %s', numReplaced, maze.id, mazesDbFile));
                }
            }
            if (callback !== undefined)
                callback(err, numReplaced);
        });
    }
    /**                     **/
    /**  SCORE DB FUNCTIONS **/
    /**                     **/
    insertScore(score) {
        log.debug(__filename, 'insertScore()', 'Inserting score into ' + scoresDbFile);
        this.dbScores.insert(score, function (err, newDoc) {
            if (err !== undefined) {
                log.error(__filename, 'insertScore()', util_1.format('Error inserting score in %s', scoresDbFile), err);
            }
            else {
                log.debug(__filename, 'insertScore()', util_1.format('Score inserted into %s', scoresDbFile));
            }
        });
    }
}
exports.LocalDAO = LocalDAO;
exports.default = LocalDAO;
//# sourceMappingURL=LocalDAO.js.map