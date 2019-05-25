import SparkSimWorkerInterface from '../ClientWorkerInterface';
import {
  convertSquadUnitEntryToSparkUnitEntry,
  getSimulatorOptions,
  applyPermutationToSparkSquad,
  calculateSparksForSparkSimSquad,
} from '@/modules/spark-simulator/utils';
import { Logger } from '@/modules/Logger';

// eslint-disable-next-line no-unused-vars
const logger = new Logger({ prefix: '[SparkSimWorker/worker]' });
export default class SparkSimWorker extends SparkSimWorkerInterface {
  constructor () {
    super();
    this._runToken = 0;
    this._onProgress = () => {};
  }

  run({
      permutations = [],
      sparkSquad = [convertSquadUnitEntryToSparkUnitEntry()],
      options = getSimulatorOptions(),
    } = {}) {
    this._runToken = Date.now();
    const currentRunToken = this._runToken;

    const results = [], errors = [];
    let permutationIndex = 0, numPermutations = permutations.length;
    try {
      while (currentRunToken === this._runToken && permutationIndex < numPermutations) {
        this.onProgress({ total: numPermutations, completed: permutationIndex });
        const permutation = permutations[permutationIndex++];
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
