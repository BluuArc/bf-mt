import { Logger } from '@/modules/Logger';

export default class CacheSingleton {
  constructor({
    lifetime = 1000 * 60 * 5, // default: 5 minutes in milliseconds
    loggerOptions = { prefix: '[CACHE-SINGLETON]'},
    getter = () => {},
    defaultValue = {},
  }) {
    this._lifetime = lifetime;
    this._logger = new Logger(loggerOptions);
    this._updateTime = new Date('Jan 01 1969');
    this._value = defaultValue;
    this._getter = (...args) => Promise.resolve(getter(this._logger, ...args));
  }

  async getValue (forceRefresh, ...args) {
    const currentDate = new Date();
    const diff = currentDate - this._updateTime;
    if (diff > this._lifetime || !!forceRefresh) {
      this._logger.debug('refreshing cache');
      try {
        this._value = await this._getter(...args);
        this._updateTime = currentDate;
      } catch (err) {
        this._logger.error(err);
      }
    } else {
      this._logger.debug('using cached data. cache lifetime (secs):', Math.floor(diff / 1000), this._updateTime);
    }
    return Promise.resolve(this._value);
  }

  // usage for loading a previously cached value on first load
  setValue (value, updateTime) {
    this._logger.debug('manually setting cache value to', value, updateTime);
    this._value = value;
    this._updateTime = updateTime !== undefined ? new Date(updateTime) : this._updateTime;
  }

  get isStale () {
    return (new Date() - this._updateTime) > this._lifetime;
  }
}
