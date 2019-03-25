export default class DbInterface {
  /* eslint-disable no-unused-vars */
  static _defer (name = 'name of method to be deferred') {
    return Promise.reject(new Error(`Must implement ${name}() in subclass`));
  }

  put ({ table = '', entry } = {}) {
    return DbInterface._defer('put');
  }

  get ({ table = '', query } = {}) {
    return DbInterface._defer('get');
  }

  getAll ({ table = '' } = {}) {
    return DbInterface._defer('getAll');
  }

  getFieldInEntry ({ table = '', query, field = '' } = {}) {
    return DbInterface._defer('getFieldInEntry');
  }

  getFieldKeys ({ table = '', query, field = '' } = {}) {
    return DbInterface._defer('getFieldKeys');
  }

  getByIds ({ table, query, field, ids = [], extractedFields = [] } = {}) {
    return DbInterface._defer('getByIds');
  }

  getById ({ table, query, field, id } = {}) {
    return DbInterface._defer('getById');
  }

  getDbStats ({ table, query } = {}) {
    return DbInterface._defer('getDbStats');
  }

  // useful for checking if data is loaded in a given set of tables
  // given an array of table names, return an array of tables that contain entries
  getTablesWithEntries ({ tables = [], query } = {}) {
    return DbInterface._defer('getTablesWithEntries');
  }

  // useful for checking if data has any updates in a given set of tables
  // given an array of table names, return an array of tables that have updates
  getTablesWithUpdates ({ tables = [], query, sourceUrl, forceRefresh } = {}) {
    return DbInterface._defer('getTablesWithUpdates');
  }

  getFilteredDb ({ table, filters, server, extractedFields, sortOptions } = {}) {
    return DbInterface._defer('getFilteredDb');
  }

  getSortedKeys ({ table = '', sortOptions = {}, server = 'gl', keys = [] } = {}) {
    return DbInterface._defer('getSortedKeys');
  }
  /* eslint-enable no-unused-vars */
}
