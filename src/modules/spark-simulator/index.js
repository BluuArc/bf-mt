import { generateDefaultSquad } from '@/modules/core/squads';
import {
  convertSquadUnitEntryToSparkUnitEntry,
  calculateSparksForSparkSimSquad,
  getSimulatorOptions,
  generateSimulatorPermutations,
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
    const permutations = generateSimulatorPermutations(sparkSquad, options);

    const worker = makeWorker();
    worker.addProgressListener(p => logger.debug(p));
    const result = await worker.run({ permutations, sparkSquad });
    worker.close();
    return result;
  }
}
