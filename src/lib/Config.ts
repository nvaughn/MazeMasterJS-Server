/**
 * Collect and provide application configuration information
 *
 */
import * as os from 'os';
import { Logger } from './Logger';

export class Config {
    private static instance: Config;

    // environment variables / global config values
    public HTTP_PORT: number = parseInt(process.env.HTTP_PORT || '80');
    public HOST_NAME: string = process.env.HOSTNAME || os.hostname();
    public WORK_DIR: string = __dirname;
    public LOKIJS_DATA_FILE: string = process.env.LOKIJS_DATA_FILE || '';

    // must use getInstance()
    private constructor() {}

    // singleton instance pattern
    static getInstance() {
        if (!Config.instance) {
            Config.instance = new Config();

            let log = Logger.getInstance();
            log.debug(__filename, 'getInstance()', 'HTTP_PORT=' + this.instance.HTTP_PORT);
            log.debug(__filename, 'getInstance()', 'HOST_NAME=' + this.instance.HOST_NAME);
            log.debug(__filename, 'getInstance()', 'HOME_DIR=' + this.instance.WORK_DIR);
            log.debug(__filename, 'getInstance()', 'LOKIJS_DATA_FILE=' + this.instance.LOKIJS_DATA_FILE);
        }
        return Config.instance;
    }
}

export default Config;
