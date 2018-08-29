import {
  elements,
} from '@/modules/constants';

export default class FilterOptionsHelper {
  constructor (minRarity = 0, maxRarity = 8) {
    this._minRarity = minRarity;
    this._maxRarity = maxRarity;
  }

  get defaultValues () {
    return {
      elements: elements.slice(),
    };
  }

  get filterTypes () {
    return Object.keys(this.defaultValues);
  }
}
