import { generateDefaultSquad } from '@/modules/core/squads';
import {
  convertSquadUnitEntryToSparkUnitEntry,
  calculateSparksForSparkSimSquad,
} from './utils';
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

  calculateSparksForSquad (squad = generateDefaultSquad(), numEnemies = 6) {
    const sparkSquad = squad.units.map(u => convertSquadUnitEntryToSparkUnitEntry({
      entry: u,
      synchronousGetters: this._dbGetters,
      squad,
    }));
    return calculateSparksForSparkSimSquad(sparkSquad, numEnemies);
  }
}
