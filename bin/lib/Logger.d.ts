export declare enum LOG_LEVELS {
    NONE = 0,
    ERROR = 1,
    WARN = 2,
    INFO = 3,
    DEBUG = 4,
    TRACE = 5
}
export declare class Logger {
    private static instance;
    private logLevel;
    private constructor();
    static getInstance(): Logger;
    setLogLevel(level: LOG_LEVELS): void;
    getLogLevel(): LOG_LEVELS;
    debug(file: string, method: string, message: string): void;
    error(file: string, method: string, message: string, error: Error): void;
    warn(file: string, method: string, message: string): void;
    info(file: string, method: string, message: string): void;
    trace(file: string, method: string, message: string): void;
    appInfo(file: string, method: string): void;
}
export default Logger;
