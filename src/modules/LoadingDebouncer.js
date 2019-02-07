
// main usage is for loading flags that control when to show loading indicators
// intended to prevent display flickering when the loading flag flips constantly
export default class LoadingDebouncer {
  constructor (setter = () => {}, delay = 150) {
    this._delay = delay; // delay in ms before flipping to false
    this._timeout = null;
    this._setter = (val) => setter(val); // actually sets the value of the target given a value
  }

  // synchronous getter that gets current boolean value when evaluated
  setValue (valueGetter = () => false) {
    // debounce timeout
    if (this._timeout) {
      clearTimeout(this._timeout);
    }

    const currentValue = !!valueGetter();
    if (currentValue) {
      this._setter(currentValue);
    } else {
      this._timeout = setTimeout(() => {
        this._setter(!!valueGetter());
      }, this._delay);
    }
  }

  dispose () {
    if (this._timeout) {
      clearTimeout(this._timeout);
    }
  }
}
