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
import Logger from './Logger';
import fileExists from 'file-exists';
import { format as fmt } from 'util';
import Maze from './Maze';
import NeDB = require('nedb');

const log = Logger.getInstance();
const mazesDbFile = 'data/mazes.db';
const scoresDbFile = 'data/scores.db';
const teamsDbFile = 'data/teams.db';

export class LocalDAO {
    private static instance: LocalDAO;
    private dbMazes: NeDB;
    private dbScores: NeDB;
    private dbTeams: NeDB;

    // must use getInstance()
    private constructor() {
        log.info(__filename, '', fmt('%s %s', !fileExists.sync(mazesDbFile) ? 'Creating' : 'Loading', mazesDbFile));
        this.dbMazes = new NeDB({ filename: mazesDbFile, autoload: true });

        // NOTE: NeDB automatically invokes unique index on _id ... leaving commented code for future reference
        //
        // this.dbMazes.ensureIndex({ fieldName: '_id', unique: true }, function(err) {
        //     log.error(__filename, 'constructor()', 'Unable to ensure unique index on field _id in ' + mazesDbFile, err);
        // });

        log.info(__filename, '', fmt('%s %s', !fileExists.sync(scoresDbFile) ? 'Creating' : 'Loading', scoresDbFile));
        this.dbScores = new NeDB({ filename: scoresDbFile, autoload: true });

        log.info(__filename, '', fmt('%s %s', !fileExists.sync(teamsDbFile) ? 'Creating' : 'Loading', teamsDbFile));
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
    public insertMaze(maze: Maze) {
        this.dbMazes.insert(maze, function(err, newDoc) {
            if (err && err !== undefined) {
                log.error(__filename, 'insertMaze()', fmt('Error inserting maze [%s] in %s', maze.seed, mazesDbFile), err);
                LocalDAO.getInstance().updateMaze(maze);
            } else {
                log.debug(__filename, 'insertMaze()', fmt('Maze [%s] inserted into %s', newDoc.seed, mazesDbFile));
            }
        });
    }

    public updateMaze(maze: Maze) {
        this.dbMazes.update({ _id: maze.id }, maze, {}, function(err, numReplaced) {
            if (err && err !== undefined) {
                log.error(__filename, 'updateMaze()', fmt('Error updating maze [%s] in %s', maze.seed, mazesDbFile), err);
            } else {
                log.debug(__filename, 'updateMaze()', fmt('%s maze record (%s) updated in %s', numReplaced, maze.seed, mazesDbFile));
            }
        });
    }

    /**                     **/
    /**  SCORE DB FUNCTIONS **/
    /**                     **/

    public insertScore(score: any) {
        log.debug(__filename, 'insertScore()', 'Inserting score into ' + scoresDbFile);
        this.dbScores.insert(score, function(err, newDoc) {
            if (err !== undefined) {
                log.error(__filename, 'insertScore()', fmt('Error inserting score in %s', scoresDbFile), err);
            } else {
                log.debug(__filename, 'insertScore()', fmt('Score inserted into %s', scoresDbFile));
            }
        });
    }
}

export default LocalDAO;
