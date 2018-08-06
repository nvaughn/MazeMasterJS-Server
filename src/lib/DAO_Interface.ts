import { DATABASES } from './Enums';

export interface DataAccessObject {
    insertDocument(targetRepo: DATABASES, object: any, callback: Function): any;
    updateDocument(targetRepo: DATABASES, object: any, callback: Function): any;
    getDocument(targetRepo: DATABASES, objectId: string, callback: Function): any;
    removeDocument(targetRepo: DATABASES, objectId: string, callback: Function): any;
    getDocumentCount(targetRepo: DATABASES, callback: Function): any;
    closeDb(): any;
}
