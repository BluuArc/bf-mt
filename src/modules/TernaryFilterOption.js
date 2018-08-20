import logger from './logger';

// a ternary filter option can have the truthy value, the falsy value, or both
export default class TernaryFilterOption {
  constructor (truthyValue = 'Option A', falsyValue = 'Option B') {
    logger.assert(truthyValue !== falsyValue, 'truthy and falsy values are equivalent', { truthyValue, falsyValue });
    this._truthyValue = truthyValue.slice();
    this._falsyValue = falsyValue.slice();
  }

  get truthyValue () {
    return this._truthyValue.slice();
  }

  get falsyValue () {
    return this._falsyValue.slice();
  }

  get allValue () {
    return [this._truthyValue, this._falsyValue].join(',');
  }

  isAll (input) {
    try {
      const [truthy, falsy] = input.split(',');
      return truthy === this._truthyValue && falsy === this._falsyValue;
    } catch {
      return false;
    }
  }

  isTruthy (input) {
    return this._truthyValue === input;
  }

  isFalsy (input) {
    return this._falsyValue === input;
  }
}
