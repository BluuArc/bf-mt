import Dexie from 'dexie';
import DbInterface from '../interface';
import logger from './logger';
import { multidexModuleInfo } from '@/modules/constants';
import * as getFilteredDb from './multidex/getFilteredDb';
import * as getSortedKeys from './multidex/getSortedKeys';

const multidexModuleNames = multidexModuleInfo.map(({ name }) => name);
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
        logger.error(`GET error. Returning default value: []`, { table, query }, err);
        return [];
      });
  }

  getAll ({ table }) {
    return Promise.resolve()
      .then(() => {
        return this._db[table].toArray();
      }).catch(err => {
        logger.error(`GET error. Returning default value: []`, { table }, err);
        return [];
      });
  }

  delete ({ table, key }) {
    return this._db[table].delete(key);
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
    if (results[0] !== undefined && results[0][field] !== undefined) {
      const fieldEntry = results[0][field];
      ids.forEach(id => {
        if (fieldEntry[id] !== undefined) {
          const entry = fieldEntry[id];
          if (extractedFields.length === 0) { // get everything
            returnedResult[id] = entry;
          } else { // get subset of available top-level fields based on extractedFields array
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
    const resultLength = Object.keys(returnedResult).length;
    if (ids.length !== resultLength) {
      logger.warn(`input[${ids.length} keys]; output[${resultLength} keys]`);
    } else {
      logger.debug(`input[${ids.length} keys]; output[${resultLength} keys]`);
    }
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

  // Multidex specific
  async getTablesWithEntries ({ tables = [], server }) {
    const getCountMapping = (table) => this.getDbStats({
        table,
        query: { server },
      })
      .then(r => ({
        table,
        count: (r && r.keyLength) || 0,
      }));
    const countMapping = await Promise.all(tables.map(getCountMapping));
    logger.debug(countMapping);
    return countMapping
      .filter(({ count }) => count > 0)
      .map(({ table }) => table);
  }

  // Multidex specific
  async getTablesWithUpdates ({ tables = [], server, sourceUrl }) {
    const getDateMapping = (table) => this.getDbStats({
        table,
        query: { server },
      })
      .then(r => ({
        table,
        updateTime: new Date((r && r.updateTime) || 0),
        count: (r && r.keyLength) || 0,
      }));
    const [dateMapping, updateTimes] = await Promise.all([
      Promise.all(tables.map(getDateMapping)),
      fetch(sourceUrl).then(res => res.ok ? res.json() : Promise.reject(res.statusText)),
    ]);
    logger.debug({ dateMapping, updateTimes });
    return dateMapping
      .filter(entry =>
        entry.updateTime && updateTimes[entry.table] && // entries exist
        updateTimes[entry.table][server] && // server is valid
        ((entry.count <= 0) || new Date(updateTimes[entry.table][server]) > new Date(entry.updateTime)) // no entries found or if entry date is old
      ).map(({ table }) => table);
  }

  async getFilteredDb ({ table = '', filters, server = 'gl', extractedFields, sortOptions }) {
    const keysOnly = !Array.isArray(extractedFields);
    if (multidexModuleNames.includes(table)) {
      const { keys, fullDb } = await getFilteredDb[table](filters, server, this);
      // logger.debug('filtered keys', keys, filters);
      if (keysOnly) {
        // return only the keys
        return typeof sortOptions === 'object'
          ? getSortedKeys[table]({ keys, db: fullDb, sortOptions })
          : keys;
      } else if (extractedFields.length === 0) {
        // return DB such that checking db[key] indicates presence of ID (faster than [].includes)
        const db = {};
        keys.forEach(key => db[key] = true);
        return db;
      } else {
        // return a DB containing the extracted fields for each ID
        // grab everything if extractedFields === ['*']
        const getEverything = extractedFields.length === 1 && extractedFields[0] === '*';
        return this.getByIds({
          table,
          query: { server },
          ids: keys,
          extractedFields: getEverything ? [] : extractedFields,
          field: 'data',
        });
      }
    } else {
      logger.error(`Table not found [${table}]`);
      return keysOnly ? [] : {};
    }
  }

  async getSortedKeys ({ table = '', sortOptions = {}, server = 'gl', keys = [] }) {
    const results = await this.get({ table, query: { server } });
    if (results.length === 0 || !results[0].data || Object.keys(results[0].data).length === 0) {
      logger.warn(`no table found for [${table}]. Returning input keys back.`);
      return keys;
    } else {
      return getSortedKeys[table]({
        keys,
        db: results[0].data,
        sortOptions,
      });
    }
  }
}
