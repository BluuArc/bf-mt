import { SBB_NO_CUTIN_DELAY, ATTACKING_PROCS, TELEPORTER_OFFSETS, MOVESPEED_OFFSETS, SBB_CUTIN_DELAY } from './constants';
import {
  getBurstEffects,
  getHealFrameData,
  getHitCountData as getHitCountDataFromBurst,
} from '@/modules/core/bursts';
import {
  generateFillerSquadUnitEntry,
  getEffectsListForSquadUnitEntry,
  generateDefaultSquad,
} from '@/modules/core/squads';
import { getMoveType } from '@/modules/core/units';
import {
  targetAreaMapping,
  moveTypeIdByName,
  squadFillerMapping,
  targetTypes,
  squadBuffTypes,
  squadUnitActions,
  ANY_BB_ORDER,
} from '@/modules/constants';
import { getEffectId } from '@/modules/EffectProcessor/processor-helper';

import { Logger } from '@/modules/Logger';
const logger = new Logger({ prefix: '[SparkSimulator/utils]' }); // eslint-disable-line no-unused-vars

export function getHitCountData (burst) {
  return getHitCountDataFromBurst(burst, f => ATTACKING_PROCS.includes(f.id));
}

export function getExtraAttackFrames (burst) {
  const attackFrameSets = getHitCountData(burst).map(d => d.frames);
  const healFrameSets = getHealFrameData(burst).map(d => d.frames);
  
  // aggregate frame data
  const unifiedFrames = [];
  [attackFrameSets, healFrameSets].forEach(frameGroup => {
    frameGroup.forEach((frameSet, setIndex) => {
      let frameIndex = setIndex === 0 ? 0 : 1; // drop first frame for second attack onward
      const numFrames = frameSet['frame times'].length;
      for (; frameIndex < numFrames; frameIndex++) {
        unifiedFrames.push({
          time: frameSet['frame times'][frameIndex],
          dmg: frameSet['hit dmg% distribution'][frameIndex],
        });
      }
    });
  });

  // transform aggregate back into a frame object with sorted times
  const resultFrames = {
    'frame times': [],
    'hit dmg% distribution': [],
  };
  unifiedFrames.sort((a, b) => a.time - b.time).forEach(({ time, dmg }) => {
    resultFrames['frame times'].push(time);
    resultFrames['hit dmg% distribution'].push(dmg);
  });
  return resultFrames;
}

export function convertExtraAttackInfoToHitCountData (extraAttackEffect = {}, extrAttackFrames = getExtraAttackFrames()) {
  return {
    target: targetAreaMapping[extraAttackEffect['random attack'] ? 'random' : extraAttackEffect['target area']],
    id: getEffectId(extraAttackEffect).toString(),
    frames: extrAttackFrames,
    effects: extraAttackEffect,
    delay: extraAttackEffect['effect delay time(ms)/frame'],
    source: extraAttackEffect.source || extraAttackEffect.sourcePath,
  };
}

export function getAttackEffectsFromBurst (burst = {}) {
  return ((getBurstEffects(burst) || {}).effects || [])
    .filter(b => ATTACKING_PROCS.includes(getEffectId(b).toString()));
}

export function getFramesForSparkUnitEntry ({
  burst = {},
  extraAttackEffects = [],
  delay = 0,
  moveTypeId = moveTypeIdByName.Moving,
  moveSpeed = 0,
  teleporterId = 0,
}) {
  const burstFrames = (burst['damage frames'] || [])
    .filter(b => ATTACKING_PROCS.includes(getEffectId(b).toString()));
  if (burstFrames.length === 0 && extraAttackEffects.length === 0) {
    return [];
  }

  const burstEffects = getAttackEffectsFromBurst(burst);
  
  const baseOffset = [
    moveTypeId === moveTypeIdByName['Non-Moving'] ? moveSpeed : 0,
    (moveTypeId === moveTypeIdByName.Teleporting && TELEPORTER_OFFSETS[teleporterId.toString()]) || 0,
    !isNaN(delay) ? +delay : 0,
  ].reduce((acc, val) => acc + val, 0);

  const processFrameTimes = (frameTimes = [], totalOffset, isAoe) => {
    return frameTimes.map(time => ({
      frame: (+time) + totalOffset,
      target: isAoe ? 'aoe' : 'st',
    }));
  };

  let resultAttackFrames = burstFrames.map((frameInfo, index) => {
    const isAoe = burstEffects[index]['target area'] === 'aoe';
    const effectDelay = moveTypeId === moveTypeIdByName.Teleporting
      ? 0
      : +frameInfo['effect delay time(ms)/frame'].split('/')[1];
    const totalOffset = (moveTypeId === moveTypeIdByName.Teleporting ? 0 : effectDelay) + baseOffset;
    return processFrameTimes(frameInfo['frame times'], totalOffset, isAoe);
  });

  if (extraAttackEffects.length > 0) {
    const extraAttackFrames = getExtraAttackFrames(burst);
    const resultExtraAttackFrames = extraAttackEffects.filter(b => ATTACKING_PROCS.includes(getEffectId(b).toString()))
      .map(effect => {
        const isAoe = effect['target area'] === 'aoe';
        const effectDelay = +effect['effect delay time(ms)/frame'].split('/')[1];
        const totalOffset = (moveTypeId === moveTypeIdByName.Teleporting ? 0 : effectDelay) + baseOffset;
        return processFrameTimes(extraAttackFrames['frame times'], totalOffset, isAoe);
      });
      resultAttackFrames = resultAttackFrames.concat(resultExtraAttackFrames);
      // logger.warn({
      //   burstFrames,
      //   burstEffects,
      //   extraAttackEffects: extraAttackEffects.filter(b => ATTACKING_PROCS.includes(getEffectId(b).toString())),
      //   extraAttackFrames,
      //   moveSpeed,
      //   resultAttackFrames,
      //   resultExtraAttackFrames,
      //   baseOffset,
      // });
  }
  return resultAttackFrames;
}

export function convertSquadUnitEntryToSparkUnitEntry ({
  entry = generateFillerSquadUnitEntry(),
  synchronousGetters = {},
  squad = generateDefaultSquad(),
} = {}) {
  const unitData = synchronousGetters.unit(entry.id);
  const sourcesToIgnore = ['unit.bb', 'unit.sbb', 'unit.ubb'];
  const extraAttackEffects = getEffectsListForSquadUnitEntry({
    unitEntry: entry,
    target: targetTypes.ENEMY,
    effectType: squadBuffTypes.PROC,
    squad,
  }, {
    getUnit: synchronousGetters.unit,
    getItem: synchronousGetters.getItem,
    getExtraSkill: synchronousGetters.extraSkill,
  }).filter(effect => !sourcesToIgnore.includes(effect.sourcePath) && (!effect.triggeredOn || (effect.triggeredOn === entry.action)));
  const sparkUnitEntry = {
    id: entry.id,
    position: entry.position,
    bbOrder: entry.bbOrder,
    name: unitData.name || entry.id,
    action: entry.action,
    extraAttackEffects,
    burst: unitData[entry.action],
    moveTypeId: (unitData.movement && unitData.movement.skill && +unitData.movement.skill['move type']) || 0,
    moveSpeed: (unitData.movement && unitData.movement.skill && +unitData.movement.skill['move speed']) || 0,
    moveSpeedType: (unitData.movement && unitData.movement.skill && +unitData.movement.skill['move speed type']) || '1',
    delay: !isNaN(entry.delay) ? +entry.delay : 0,
    teleporterId: entry.id,
  };
  sparkUnitEntry.frames = getFramesForSparkUnitEntry(sparkUnitEntry);
  return sparkUnitEntry;
}

export function getBattleFrames (entry = convertSquadUnitEntryToSparkUnitEntry(), cutinDelay = SBB_NO_CUTIN_DELAY) {
  const battleFrames = {};
  if (entry.id !== squadFillerMapping.ANY && entry.id !== squadFillerMapping.EMPTY) {
    const frameDelay = [
      (entry.bbOrder - 1) * cutinDelay,
      entry.moveTypeId === moveTypeIdByName.Moving
        ? +MOVESPEED_OFFSETS[entry.moveSpeedType][entry.position]
        : 0,
    ].reduce((acc, val) => acc + val, 0);

    entry.frames.forEach(attack => {
      attack.forEach(({ frame, target }) => {
        const actualFrame = +frame + frameDelay;
        if (!battleFrames[actualFrame]) {
          battleFrames[actualFrame] = {
            aoe: 0,
            st: 0,
          };
        }
        battleFrames[actualFrame][target] += 1;
      });
    });
  }
  return battleFrames;
}

export function calculateSparksForSparkSimSquad (squad = [], options = getSimulatorOptions()) {
  const { enemyCount, burstCutins } = options;
  const aggregatedBattleFrames = {};
  const battleFramesByUnit = new Map();
  // aggregate battle frames
  squad.forEach(unit => {
    const unitBattleFrames = getBattleFrames(unit, burstCutins ? SBB_CUTIN_DELAY : SBB_NO_CUTIN_DELAY);
    Object.keys(unitBattleFrames)
      .forEach(frame => {
        if (!aggregatedBattleFrames[frame]) {
          aggregatedBattleFrames[frame] = {
            aoe: 0,
            st: 0,
          };
        }

        aggregatedBattleFrames[frame].aoe += unitBattleFrames[frame].aoe;
        aggregatedBattleFrames[frame].st += unitBattleFrames[frame].st;
      });
    battleFramesByUnit.set(unit, unitBattleFrames);
  });

  let possibleSparksSquad = 0;
  let actualSparkSquad = 0;
  // logger.warn(battleFramesByUnit);
  const sparkResults = squad.map(unit => {
    const unitBattleFrames = battleFramesByUnit.get(unit);
    const frameTimes = Object.keys(unitBattleFrames);

    const possibleSparks = frameTimes
      .map(frame => unitBattleFrames[frame].aoe * enemyCount + unitBattleFrames[frame].st)
      .reduce((acc, val) => acc + val, 0);
    const actualSparks = frameTimes.map(frame => {
      const { aoe: selfAoe, st: selfSt } = unitBattleFrames[frame];
      const remainingAoe = aggregatedBattleFrames[frame].aoe - selfAoe;
      const remainingSt = aggregatedBattleFrames[frame].st - selfSt;

      const hasSparkableAoe = [
        remainingAoe > 0 && selfAoe > 0, // 1+ AOE and self AOE
        selfAoe > 1, // self sparking AOE
      ].some(v => v);
      const hasSparkableSt = [
        remainingSt > 0 && selfSt > 0, // 2+ ST attacks in same frame
        remainingAoe > 0 && selfSt > 0, // 1+ AOE and self ST
        remainingSt > 0 && selfAoe > 0, // 1+ ST and self AOE
        selfAoe > 0 && selfSt > 0, // self AOE and self ST
        selfSt > 1, // self sparking ST
      ].some(v => v);

      let count = 0;
      if (hasSparkableAoe) {
        count += selfAoe * enemyCount;
      }

      if (hasSparkableSt) {
        count += selfSt;
        if (remainingSt > 0 && selfAoe > 0 && !hasSparkableAoe) {
          count += selfAoe;
        }
      }
      return count;
    }).reduce((acc, val) => acc + val, 0);

    possibleSparksSquad += possibleSparks;
    actualSparkSquad += actualSparks;

    return {
      id: unit.id,
      name: unit.name || unit.id,
      position: unit.position,
      bbOrder: unit.bbOrder,
      action: unit.action,
      actualSparks,
      possibleSparks,
      delay: unit.delay,
    };
  });

  const perUnitPercentages = sparkResults
    .filter(u => u.possibleSparks > 0)
    .map(u => u.actualSparks / u.possibleSparks);
  const weightedPercentage = perUnitPercentages
    .map(val => val * (1 / perUnitPercentages.length))
    .reduce((acc, val) => acc + val, 0);
  return {
    actualSparks: actualSparkSquad,
    possibleSparks: possibleSparksSquad,
    weightedPercentage,
    squad: sparkResults,
  };
}

export function getDelayDescriptionForSparkUnitResult ({
  sparkUnitResult = {},
  unitData = {},
  burstCutins = false,
} = {}) {
  const moveTypeId = (unitData.movement && unitData.movement.skill && +unitData.movement.skill['move type']) || 0;
  const moveSpeed = (unitData.movement && unitData.movement.skill && +unitData.movement.skill['move speed']) || 0;
  const moveTypeName = unitData.movement && getMoveType(unitData);
  const moveSpeedType = (unitData.movement && unitData.movement.skill && +unitData.movement.skill['move speed type']) || '1';

  const teleporterOffset = (moveTypeId === moveTypeIdByName.Teleporting && TELEPORTER_OFFSETS[unitData.id.toString()]) || 0;
  const positionBasedOffset = +MOVESPEED_OFFSETS[moveSpeedType][sparkUnitResult.position];
  const inputDelay = !isNaN(sparkUnitResult.delay) ? +sparkUnitResult.delay : 0;
  const squadLevelDelay = !isNaN(sparkUnitResult.squadLevelDelay) ? +sparkUnitResult.squadLevelDelay : 0;

  const makeEntry = (delay = 0, description = '') => ({ delay, description });
  return [
    moveTypeId === moveTypeIdByName['Non-Moving'] && makeEntry(moveSpeed, `innate move speed as a ${moveTypeName} unit`),
    moveTypeId === moveTypeIdByName.Teleporting && makeEntry(teleporterOffset, `custom offset as a ${moveTypeName} unit`),
    moveTypeId === moveTypeIdByName.Moving && makeEntry(positionBasedOffset, `offset based on position and move speed type as a ${moveTypeName} unit`),
    makeEntry(burstCutins ? SBB_CUTIN_DELAY : SBB_NO_CUTIN_DELAY, `burst cut-in delay (cut-ins ${burstCutins ? 'on' : 'off'})`),
    inputDelay > 0 && makeEntry(inputDelay, `custom unit delay`),
    squadLevelDelay > 0 && makeEntry(squadLevelDelay, `custom squad delay`),
  ].filter(v => v);
}

function getNumberOrDefault (num, defaultValue = 0) {
  return !isNaN(num) ? +num : defaultValue;
}

export function getSimulatorOptions ({
  unitConfig = [],
  enemyCount = 6,
  burstCutins = false,
  resultThreshold = 50,
  workerCount = 1,
  optimizeOrder = true,
  optimizePosition = true,
  maxResults = 10,
} = {}, squad = generateDefaultSquad()) {
  let resultUnitConfig = Array.isArray(unitConfig) ? unitConfig : [];
  if (Array.isArray(squad.units) && resultUnitConfig.length < squad.units.length) {
    const numUnits = squad.units.length;
    // ensure that every unit entry has a corresponding spark unit config entry
    for (let i = resultUnitConfig.length; i < numUnits; ++i) {
      resultUnitConfig.push(getSparkSimUnitConfig(squad.units[i]));
    }
  }
  return Object.freeze({
    unitConfig: resultUnitConfig,
    enemyCount: Math.max(1, getNumberOrDefault(enemyCount, 6)),
    burstCutins: !!burstCutins,
    resultThreshold: Math.max(0, Math.min(100, getNumberOrDefault(resultThreshold, 50))),
    workerCount: Math.max(1, getNumberOrDefault(workerCount, 1)),
    optimizeOrder: !!optimizeOrder,
    optimizePosition: !!optimizePosition,
    maxResults: Math.max(1, Math.min(100, getNumberOrDefault(maxResults, 10))),
  });
}

export function getSparkSimUnitConfig ({
  action = squadUnitActions.ATK,
  bbOrder = 1,
  delay = 0,
  weight = 1,
  lockPosition = false,
} = {}) {
  return Object.freeze({
    action,
    bbOrder: getNumberOrDefault(bbOrder, ANY_BB_ORDER),
    delay: getNumberOrDefault(delay, 0),
    weight: getNumberOrDefault(weight, 1),
    lockPosition: !!lockPosition,
  });
}

export function getSimulatorWarningsForSquadUnit ({
  unit = generateFillerSquadUnitEntry(),
  attackEffects = [],
  unitData = {},
} = {}) {
  const attackTargets = new Set();
  attackEffects.forEach(attack => {
    const effectId = getEffectId(attack);
    const targetArea = attack['target area'];
    const isRandom = +effectId === 13 && !!attack['random attack'];

    attackTargets.add(isRandom ? 'rt' : targetArea);
  });

  const warnings = Array.from(attackTargets).length === 0
    ? []
    : [
      attackTargets.has('rt') && 'Random attacks aren\'t supported yet',
      !attackTargets.has('aoe') && 'No AOE attacks found',
    ].filter(v => v);

  const moveTypeId = (unitData.movement && unitData.movement.skill && +unitData.movement.skill['move type']) || 0;
  if (moveTypeId === moveTypeIdByName.Teleporting && !TELEPORTER_OFFSETS.hasOwnProperty((unitData.id || unit.id).toString())) {
    warnings.push('This teleporting unit is not supported yet');
  }

  return warnings;
}
