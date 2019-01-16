import Dexie from 'dexie';
import DbInterface from '../interface';
import logger from './logger';

export default class WorkerDb extends DbInterface {
  constructor (db = new Dexie()) {
    super();
    this._db = db;
  }

  put ({ table = '', entry }) {
    return this._db[table].put(entry);
  }

  get ({ table = '', query }) {
    return Promise.resolve()
      .then(() => {
        return this._db[table].where(query).toArray();
      }).catch(err => {
        logger.error(`GET error`, { table, query }, err);
        return [];
      });
  }

  async getFieldInEntry ({ table = '', query, field = '' }) {
    const results = await this.get({ table, query });
    return results.length === 0 ? undefined : results[0][field];
  }

  async getFieldKeys ({ table = '', query, field }) {
    const results = await this.get({ table, query });
    return results.length === 0 ? [] : Object.keys(results[0][field]);
  }

  async getByIds ({ table = '', query, field, ids = [], extractedFields = [] }) {
    const results = await this.get({ table, query });
    const returnedResult = {};
    if (results[0] && results[0][field]) {
      const fieldEntry = results[0][field];
      ids.forEach(id => {
        if (fieldEntry[id]) {
          const entry = fieldEntry[id];
          if (extractedFields.length === 0) { // get everything
            returnedResult[id] = entry;
          } else { // get subset of top-level fields based on extractedFields array
            const extractedEntry = {};
            extractedFields.forEach(name => {
              if (entry.hasOwnProperty(name)) {
                extractedEntry[name] = entry[name];
              }
            });
            returnedResult[id] = extractedEntry;
          }
        }
      });
    }
    logger.debug(`input[${ids.length} keys]; output[${Object.keys(returnedResult).length} keys]`);
    return returnedResult;
  }

  async getById ({ table = '', query, field, id }) {
    const result = await this.getByIds({ table, query, field, ids: [id] });
    return result[id];
  }

  async getDbStats ({ table = '', query }) {
    const results = await this.get({ table, query });
    if (results.length > 0) {
      try {
        const { updateTime, cacheTime } = results[0];
        return {
          keyLength: Object.keys(results[0].data).length,
          updateTime,
          cacheTime,
        };
      } catch(err) {
        logger.error(err);
      }
    }
    return undefined;
  }
}
