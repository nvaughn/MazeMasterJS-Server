"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// console output colors
var COLORS;
(function (COLORS) {
    COLORS["NONE"] = "\u001B[49m\u001B[0m";
    COLORS["RED"] = "\u001B[49m\u001B[31m";
    COLORS["YELLOW"] = "\u001B[49m\u001B[35m";
    COLORS["BLUE"] = "\u001B[49m\u001B[36m";
    COLORS["MAGENTA"] = "\u001B[49m\u001B[35m";
    COLORS["WHITE_ON_RED"] = "\u001B[41m\u001B[37m";
    COLORS["RED_UNDERLINE"] = "\u001B[4m\u001B[37m";
})(COLORS || (COLORS = {}));
var LOG_LEVELS;
(function (LOG_LEVELS) {
    LOG_LEVELS[LOG_LEVELS["NONE"] = 0] = "NONE";
    LOG_LEVELS[LOG_LEVELS["ERROR"] = 1] = "ERROR";
    LOG_LEVELS[LOG_LEVELS["WARN"] = 2] = "WARN";
    LOG_LEVELS[LOG_LEVELS["INFO"] = 3] = "INFO";
    LOG_LEVELS[LOG_LEVELS["DEBUG"] = 4] = "DEBUG";
    LOG_LEVELS[LOG_LEVELS["TRACE"] = 5] = "TRACE";
})(LOG_LEVELS = exports.LOG_LEVELS || (exports.LOG_LEVELS = {}));
class Logger {
    // must use getInstance()
    constructor() {
        this.logLevel = LOG_LEVELS.INFO;
    }
    // singleton instance pattern
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    setLogLevel(level) {
        this.logLevel = level;
        let method = 'setLogLevel(' + level + ')';
        console.log('%s : %s : %s : %s : Log Level set to %s', getTimeStamp(), 'N/A', fileName(__filename), method, LOG_LEVELS[this.logLevel]);
    }
    getLogLevel() {
        return this.logLevel;
    }
    debug(file, method, message) {
        if (this.logLevel >= LOG_LEVELS.DEBUG) {
            console.log('%s%s : %s : %s' + (method == '' ? '' : ' : ') + '%s : %s%s', COLORS.BLUE, getTimeStamp(), 'DBG', fileName(file), method, message, COLORS.NONE);
        }
    }
    error(file, method, message, error) {
        if (this.logLevel >= LOG_LEVELS.ERROR) {
            console.log('%s%s : %s : %s' + (method == '' ? '' : ' : ') + '%s : %s%s\r\n%s', COLORS.RED, getTimeStamp(), 'ERR', fileName(file), method, message, COLORS.NONE, error.stack);
        }
    }
    warn(file, method, message) {
        if (this.logLevel >= LOG_LEVELS.WARN) {
            console.log('%s%s : %s : %s' + (method == '' ? '' : ' : ') + '%s : %s%s', COLORS.YELLOW, getTimeStamp(), 'WRN', fileName(file), method, message, COLORS.NONE);
        }
    }
    info(file, method, message) {
        if (this.logLevel >= LOG_LEVELS.INFO) {
            console.log('%s%s : %s : %s' + (method == '' ? '' : ' : ') + '%s : %s%s', COLORS.NONE, getTimeStamp(), 'INF', fileName(file), method, message, COLORS.NONE);
        }
    }
    trace(file, method, message) {
        if (this.logLevel >= LOG_LEVELS.TRACE) {
            console.log('%s%s : %s : %s' + (method == '' ? '' : ' : ') + '%s : %s', COLORS.MAGENTA, getTimeStamp(), 'TRC', fileName(file), method, message, COLORS.NONE);
        }
    }
    appInfo(file, method) {
        let pkg = getPackageInfo();
        console.log('%s : %s : %s' + (method == '' ? '' : ' : ') + '%s : %s v%s', getTimeStamp(), 'N/A', fileName(__filename), method, pkg.name, pkg.version);
    }
}
exports.Logger = Logger;
function getPackageInfo() {
    let data = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve('package.json'), 'utf8'));
    return { name: data.name, version: data.version };
}
// returns the current timestamp
function getTimeStamp() {
    var dt = new Date();
    return dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString();
}
// strips path and returns just the name (and extension) of the file
function fileName(file) {
    return typeof file !== 'undefined' ? path_1.default.basename(file) : 'FILE_UNKNOWN';
}
exports.default = Logger;
//TODO: Add file logging option
//# sourceMappingURL=Logger.js.map