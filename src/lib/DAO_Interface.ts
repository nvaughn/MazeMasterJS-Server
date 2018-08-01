import { DATABASES } from './Enumerations';

export interface DAO_Interface {
    insertDocument(targetDb: DATABASES, object: any, callback?: Function): any;
    updateDocument(targetDb: DATABASES, object: any, callback?: Function): any;
    getDocument(targetDb: DATABASES, objectId: string, callback: Function): any;
    removeDocument(targetDb: DATABASES, objectId: string, callback: Function): any;
    getDocumentCount(targetDb: DATABASES, callback: Function): any;
}
