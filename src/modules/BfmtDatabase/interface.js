export default class DbInterface {
  /* eslint-disable no-unused-vars */
  static _defer (name = 'name of method to be deferred') {
    return Promise.resolve().then(() => new Error(`Must implement ${name}() in subclass`));
  }

  put ({ table = '', entry } = {}) {
    return DbInterface._defer('put');
  }

  get ({ table = '', query } = {}) {
    return DbInterface._defer('get');
  }

  getFieldInEntry ({ table = '', query, fieldName = '' } = {}) {
    return DbInterface._defer('getFieldInEntry');
  }

  getFieldKeys ({ table = '', query, fieldName = '' } = {}) {
    return DbInterface._defer('getFieldKeys');
  }

  getByIds ({ table, query, field, ids = [], extractedFields = [] } = {}) {
    return DbInterface._defer('getByIds');
  }

  getById ({ table, query, field, id } = {}) {
    return this.getById({ table, query, field, ids: [id] });
  }

  getDbStats ({ table, query } = {}) {
    return DbInterface._defer('getById');
  }
  /* eslint-enable no-unused-vars */
}
