// basically an adapter for old API using raw PromiseWorker
import defaultClient, { makeTableInstance, makeMultidexTableInstance } from '@/modules/BfmtDatabase/client';

export function makeWorker (table) {
  const instance = makeTableInstance(table);
  return Object.freeze({
    worker: instance,
    put: entry => instance.put(entry),
    get: query => instance.get(query),
    getFieldInEntry: (query, field) => instance.getFieldInEntry(query, field),
    getFieldKeys: (query, field) => instance.getFieldKeys(query, field),
    getById: (query, field, id) => instance.getById({ query, field, id }),
    getByIds: (query, field, ids, extractedFields) => instance.getByIds({ query, field, ids, extractedFields  }),
    getDbStats: (query) => instance.getDbStats(query),
  });
}

export function makeMultidexWorker (moduleName) {
  const instance = makeMultidexTableInstance(moduleName);
  return Object.freeze({
    worker: instance,
    put: entry => instance.put(entry),
    get: query => instance.get(query),
    getFieldInEntry: (query, field) => instance.getFieldInEntry(query, field),
    getFieldKeys: (query, field) => instance.getFieldKeys(query, field),
    getById: (server, id) => instance.getById({ server, id }),
    getByIds: (server, ids, extractedFields) => instance.getByIds({ server, ids, extractedFields }),
    getDbStats: ({ server } = {}) => instance.getDbStats(server),
    getTablesWithEntries: (tables, server) => instance.getTablesWithEntries(tables, server),
    getMiniDb: (server, filters, extractedFields) => instance.getFilteredDb({ server, filters, extractedFields }),
    getFilteredKeys: (server, filters, sortOptions) => instance.getFilteredDb({ server, filters, sortOptions }),
    getSortedKeys: (server, keys, sortOptions) => instance.getSortedKeys({ server, keys, sortOptions }),
  });
}

export default defaultClient;
