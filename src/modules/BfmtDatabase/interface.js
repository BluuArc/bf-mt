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
  /* eslint-enable no-unused-vars */
}
