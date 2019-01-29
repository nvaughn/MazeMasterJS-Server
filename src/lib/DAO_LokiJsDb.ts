/**
 *
 * Implements the DataAccessObject Interface to provide a mostly MongoDB compatible
 * abstraction layer for database operations.
 *
 * This class implements a DAO for the LokiJS (https://www.npmjs.com/package/lokijs) embedded,
 * in-memory, document-based datastore
 *
 * All objects passed MUST HAVE an "id" property that returns a unique value.
 *
 * WARNING: NeDB does NOT work correctly in virtualized host environments due to a problem
 * with flushToDisk.  NeDB is no longer supported by the author(s), so I've switched over
 * to TingoDb.
 *
 */
import fs from 'fs';
import lzutf8 from 'lzutf8';
import dot
import lokiDb from 'lokijs';

import path from 'path';
import pathExists from 'path-exists';
import { format as fmt } from 'util';

import { DataAccessObject } from './DAO_Interface';
import { DATABASES } from './Enums';
import Logger from './Logger';

const log = Logger.getInstance();

const LOKIJS_DATA_FILE = 'data/lokijs/mmjs-data.json';

const MAZE_COL = 'mazes';
const SCORES_COL = 'scores';
const TEAMS_COL = 'teams';

let db = new lokiDb(LOKIJS_DATA_FILE);
