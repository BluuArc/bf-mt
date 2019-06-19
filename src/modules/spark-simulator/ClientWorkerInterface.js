import { convertSquadUnitEntryToSparkUnitEntry, getSimulatorOptions } from '@/modules/spark-simulator/utils';

export default class SparkSimWorkerInterface {
  /* eslint-disable no-unused-vars */
  static _defer (name = 'name of method to be deferred') {
    return Promise.reject(new Error(`Must implement ${name}() in subclass`));
  }

  run ({
    permutations = [],
    sparkSquad = [convertSquadUnitEntryToSparkUnitEntry()],
    options = getSimulatorOptions(),
  } = {}) {
    return SparkSimWorkerInterface._defer('run');
  }

  cancel () {
    return SparkSimWorkerInterface._defer('cancel');
  }

  onProgress ({ total = 0, completed = 0 } = {}) {
    return SparkSimWorkerInterface._defer('onProgress');
  }
  /* eslint-enable no-unused-vars */
}
