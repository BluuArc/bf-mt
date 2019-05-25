import { generateDefaultSquad } from '@/modules/core/squads';
import {
  convertSquadUnitEntryToSparkUnitEntry,
  calculateSparksForSparkSimSquad,
  getSimulatorOptions,
  getUnitConfigForUnoptimizedRun,
  generateSimulatorPermutations,
} from './utils';
import { MAX_WORKERS } from './constants';
import makeWorker from './client';
import { Logger } from '@/modules/Logger';

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
    this._workers = [];
    this._progressTotal = 0;
    this._progressPerWorker = [];
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
    logger.debug('getting permutations');
    const permutations = await generateSimulatorPermutations(sparkSquad, options, () => new Promise(fulfill => setTimeout(() => fulfill())));
    logger.debug('permutations', permutations.length);
    this._progressTotal = permutations.length;

    const calcPromises = [];
    const workerCount = Math.min(MAX_WORKERS, Math.max(1, options.workerCount));
    const sliceSize = Math.max(1, Math.floor(permutations.length / workerCount));
    let sliceIndex = 0;
    for (let i = 0; i < workerCount; ++i) {
      const currentWorker = makeWorker();
      this._workers.push(currentWorker);
      this._progressPerWorker.push(0);
      currentWorker.addProgressListener(p => this.onProgress(p, i));
      let permutationsForWorker;
      if (workerCount === 1) {
        permutationsForWorker = permutations;
      } else {
        permutationsForWorker = i + 1 !== workerCount
          ? permutations.slice(sliceIndex, sliceIndex + sliceSize)
          : permutations.slice(sliceIndex);
      }
      logger.debug('slice', sliceIndex, sliceSize, permutationsForWorker.length);
      sliceIndex += sliceSize;
      calcPromises.push(currentWorker.run({
        permutations: permutationsForWorker,
        sparkSquad,
        options,
      }));
    }
    const results = await Promise.all(calcPromises);
    const aggregateResult = { errors: [], results: [], countTested: permutations.length };
    results.forEach((sparkResult, i) => {
      aggregateResult.errors = aggregateResult.errors.concat(sparkResult.errors);
      aggregateResult.results = aggregateResult.results.concat(sparkResult.results)
        .sort((a, b) => b.weightedPercentage - a.weightedPercentage)
        .slice(0, options.maxResults);
      this._workers[i].close();
    });

    this._workers = [];
    this._progressPerWorker = [];
    return aggregateResult;
  }

  onProgress ({ completed = 0 } = {}, workerIndex = 0) {
    this._progressPerWorker[workerIndex] = completed;
    const sum = this._progressPerWorker.reduce((acc, val) => acc + val, 0);
    this._progressListeners.forEach(listener => {
      listener({ total: this._progressTotal, completed: sum });
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

  removeAllListeners () {
    this._progressListeners.clear();
  }

  cancelCalculations () {
    this._workers.forEach(worker => {
      worker.cancel();
    });
  }
}
