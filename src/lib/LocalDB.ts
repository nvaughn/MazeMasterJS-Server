import NeDB = require('nedb');

let dbMazes = new NeDB({ filename: '/data/mazes.db', autoload: true });
let dbScores = new NeDB({ filename: '/data/scores.db', autoload: true });
let dbTeams = new NeDB({ filename: '/data/teams.db', autoload: true });

export function insertScore(score: any) {
    dbScores.insert(score);
}
