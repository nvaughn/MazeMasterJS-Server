"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NeDB = require("nedb");
let dbMazes = new NeDB({ filename: '/data/mazes.db', autoload: true });
let dbScores = new NeDB({ filename: '/data/scores.db', autoload: true });
let dbTeams = new NeDB({ filename: '/data/teams.db', autoload: true });
function insertScore(score) {
    dbScores.insert(score);
}
exports.insertScore = insertScore;
//# sourceMappingURL=LocalDB.js.map