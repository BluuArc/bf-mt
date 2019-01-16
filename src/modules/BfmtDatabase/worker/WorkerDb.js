import Dexie from 'dexie';
import DbInterface from '../interface';

export default class WorkerDb extends DbInterface {
  constructor (db = new Dexie()) {
    super();
    this._db = db;
  }

  _defaultGet (table, query) {
    return this._db[table].where(query).toArray();
  }

  put ({ table = '', entry }) {
    return this._db[table].put(entry);
  }

  get ({ table = '', query }) {
    return this._defaultGet(table, query);
  }
}
