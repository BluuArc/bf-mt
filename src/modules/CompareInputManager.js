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
}

export default new CompareInputManager();
