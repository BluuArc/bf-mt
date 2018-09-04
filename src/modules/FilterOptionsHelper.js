import {
  elements,
} from '@/modules/constants';

import {
  arraysAreDifferent
} from '@/modules/utils';

import { Logger } from '@/modules/Logger';

const logger = new Logger({ prefix: 'FILTER-OPTIONS-HELPER' });

export default class FilterOptionsHelper {
  constructor (minRarity = 0, maxRarity = 8) {
    this._minRarity = minRarity;
    this._maxRarity = maxRarity;
    this._arraySeparator = '@';
  }

  get defaultValues () {
    return {
      elements: elements.slice(),
      rarity: Object.keys(new Array(this._maxRarity - this._minRarity + 1).fill(0)).map(i => +i + this._minRarity),
      name: '',
    };
  }

  get filterTypes () {
    return Object.keys(this.defaultValues);
  }

  hasFilters (filterOptions = {}, field) {
    if (field !== undefined) {
      const filter = filterOptions[field];
      const defaultFilter = this.defaultValues[field];
      if (defaultFilter === undefined) {
        return false;
      } else if (Array.isArray(filter)) {
        return arraysAreDifferent(filter, defaultFilter);
      } else {
        return filter !== defaultFilter;
      }
    } else {
      return Object.keys(filterOptions)
        .some(key => this.hasFilters(filterOptions, key));
    }
  }

  optionsToString (filterOptions = {}) {
    const result = {};
    Object.keys(filterOptions)
      .forEach(key => {
        if (this.hasFilters(filterOptions, key)) {
          const entry = filterOptions[key];
          // turn to single string to shorten encoded version
          result[key] = Array.isArray(entry) ? entry.join(this._arraySeparator) : entry;
        }
      });

    return Object.keys(result).length > 0 ? JSON.stringify(result) : '';
  }

  stringToOptions (stringOptions) {
    if (!stringOptions) {
      return {};
    }
    try {
      const inputOptions = JSON.parse(stringOptions);
      const defaultFilters = this.defaultValues;
      Object.keys(inputOptions)
        .forEach(key => {
          if (Array.isArray(defaultFilters[key])) {
            inputOptions[key] = inputOptions[key].split(this._arraySeparator)
              .filter(val => val)
              .map(val => !isNaN(val) ? +val : val);
          }
        });
      return {
        ...(this.defaultValues),
        ...inputOptions,
      };
    } catch (err) {
      logger.error(`error parsing stringOptions (${stringOptions})`, err);
      return {};
    }
  }
}
