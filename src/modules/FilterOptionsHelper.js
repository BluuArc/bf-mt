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
  }

  get defaultValues () {
    return {
      elements: elements.slice(),
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
          result[key] = filterOptions[key];
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
