import { convertCompareCodeToInput, convertCompareInputToCode } from '@/modules/core/compare';

class CompareInputManager {
  constructor (compareInputStorageKey = 'bfmt:compareInput') {
    this._compareInputStorageKey = compareInputStorageKey;
  }

  get compareInputString () {
    return sessionStorage.getItem(this._compareInputStorageKey);
  }

  set compareInputString (newString) {
    sessionStorage.setItem(this._compareInputStorageKey, newString);
  }

  get compareInput () {
    const inputString = this.compareInputString;
    return !inputString
      ? []
      : inputString.split(',').map(code => {
        try {
          return convertCompareCodeToInput(code);
        } catch {
          return undefined;
        }
      }).filter(v => v);
  }

  set compareInput (input = []) {
    const code = input.map(convertCompareInputToCode).join(',');
    this.compareInputString = code;
  }
}

export default new CompareInputManager();
