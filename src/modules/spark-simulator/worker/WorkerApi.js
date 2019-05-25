import SparkSimWorkerInterface from '../ClientWorkerInterface';
import {
  convertSquadUnitEntryToSparkUnitEntry,
  getSimulatorOptions,
  applyPermutationToSparkSquad,
  calculateSparksForSparkSimSquad,
  generateSimulatorPermutations,
} from '@/modules/spark-simulator/utils';
import { Logger } from '@/modules/Logger';

function delay (amount = 0) {
  return new Promise(fulfill => {
    setTimeout(() => {
      fulfill();
    }, amount);
  });
}

// eslint-disable-next-line no-unused-vars
const logger = new Logger({ prefix: '[SparkSimWorker/worker]' });
export default class SparkSimWorker extends SparkSimWorkerInterface {
  constructor () {
    super();
    this._runToken = 0;
    this._onProgress = () => {};
  }

  async run({
      permutations,
      sparkSquad = [convertSquadUnitEntryToSparkUnitEntry()],
      options = getSimulatorOptions(),
    } = {}) {
    this._runToken = Date.now();
    const currentRunToken = this._runToken;

    let allPermutations;
    if (!Array.isArray(permutations)) {
      logger.debug('generating permutations');
      allPermutations = await generateSimulatorPermutations(sparkSquad, options);
    } else {
      logger.debug('input permutations', permutations.length);
      allPermutations = permutations;
    }
    logger.debug('permutations', allPermutations.length);

    const results = [], errors = [];
    let lastTimeoutPercent = 0;
    let permutationIndex = 0, numPermutations = allPermutations.length;
    try {
      while (currentRunToken === this._runToken && permutationIndex < numPermutations) {
        // give opportunities for cancel calls to occur every 1 percent
        const currentPercent = Math.floor(permutationIndex / numPermutations * 100);
        if (currentPercent - lastTimeoutPercent > 1) {
          await delay();
          lastTimeoutPercent = currentPercent;
        }
        this.onProgress({ total: numPermutations, completed: permutationIndex });
        const permutation = allPermutations[permutationIndex++];
        const sparkResult = calculateSparksForSparkSimSquad(
          applyPermutationToSparkSquad(sparkSquad, permutation),
          options,
        );
        if (sparkResult.weightedPercentage * 100 >= options.resultThreshold) {
          results.push(sparkResult);
        }
        this.onProgress({ total: numPermutations, completed: permutationIndex });
      }
    } catch (err) {
      logger.error(err);
      errors.push('An error occurred while calculating spark results');
    }

    if (currentRunToken !== this._runToken) {
      errors.push('Simulator run was cancelled');
    }

    return {
      errors,
      results: results.sort((a, b) => b.weightedPercentage - a.weightedPercentage).slice(0, options.maxResults),
    };
  }

  cancel () {
    this._runToken = -1;
  }

  setProgressFunction (fn) {
    if (typeof fn === 'function') {
      this._onProgress = fn;
    }
  }

  onProgress (progress = { total: 0, completed: 0 }) {
    this._onProgress(progress);
  }
}
