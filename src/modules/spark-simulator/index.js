import { generateDefaultSquad } from '@/modules/core/squads';
import {
  convertSquadUnitEntryToSparkUnitEntry,
  calculateSparksForSparkSimSquad,
  getSimulatorOptions,
  getUnitConfigForUnoptimizedRun,
} from './utils';
import makeWorker from './client';
import { Logger } from '@/modules/Logger';

// eslint-disable-next-line no-unused-vars
const logger = new Logger({ prefix: '[SparkSimulator]' });
export default class SparkSimulator {
  constructor () {
    this._squad = null;

    const noop = () => ({});
    this._dbGetters = {
      unit: noop,
      item: noop,
      extraSkill: noop,
    };

    this._progressListeners = new Set();
    this._currentWorker = null;
  }

  set getters (getters = {}) {
    Object.keys(this._dbGetters).forEach(getterType => {
      if (typeof getters[getterType] === 'function') {
        this._dbGetters[getterType] = getters[getterType];
      }
    });
  }

  calculateSparksForSquad (squad = generateDefaultSquad(), options = getSimulatorOptions()) {
    const sparkSquad = squad.units.map((u, i) => convertSquadUnitEntryToSparkUnitEntry({
      entry: u,
      synchronousGetters: this._dbGetters,
      squad,
      originalPosition: u.position,
      unitConfig: getUnitConfigForUnoptimizedRun(options.unitConfig[i], u),
    }));
    return calculateSparksForSparkSimSquad(sparkSquad, options);
  }

  async calculateOptimalOrdersForSquad(squad = generateDefaultSquad(), options = getSimulatorOptions()) {
    const sparkSquad = squad.units.map((u, i) => convertSquadUnitEntryToSparkUnitEntry({
      entry: u,
      synchronousGetters: this._dbGetters,
      squad,
      originalPosition: u.position,
      unitConfig: options.unitConfig[i],
    }));

    const worker = makeWorker();
    this._currentWorker = worker;

    this._progressListeners.forEach(listener => {
      worker.addProgressListener(p => listener(p));
    });
    const result = await worker.run({ sparkSquad, options });
    worker.close();
    this._currentWorker = null;
    return result;
  }

  onProgress (progress = { total: 0, completed: 0 }) {
    this._progressListeners.forEach(listener => {
      listener(progress);
    });
  }
  
  addProgressListener (fn) {
    if (typeof fn === 'function') {
      this._progressListeners.add(fn);
    }
  }

  removeProgressListener (fn) {
    if (typeof fn === 'function') {
      this._progressListeners.delete(fn);
    }
  }

  cancelCalculations () {
    if (this._currentWorker) {
      this._currentWorker.cancel();
    }
  }
}
