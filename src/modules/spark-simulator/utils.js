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
  makeSquadUnitEntry,
  cloneSquad,
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
  unitPositionMapping,
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
  originalPosition,
  unitConfig = {},
} = {}) {
  const unitData = synchronousGetters.unit(entry.id);
  const sourcesToIgnore = ['unit.bb', 'unit.sbb', 'unit.ubb'];
  const extraAttackEffects = getEffectsListForSquadUnitEntry({
    unitEntry: {
      ...entry,
      bbOrder: unitConfig.bbOrder || entry.bbOrder,
      action: unitConfig.action || entry.action,
    },
    target: targetTypes.ENEMY,
    effectType: squadBuffTypes.PROC,
    squad,
  }, {
    getUnit: synchronousGetters.unit,
    getItem: synchronousGetters.item,
    getExtraSkill: synchronousGetters.extraSkill,
  }).filter(effect => !sourcesToIgnore.includes(effect.sourcePath) && (!effect.triggeredOn || (effect.triggeredOn === entry.action)));

  const sparkUnitEntry = {
    id: entry.id,
    position: entry.position,
    bbOrder: unitConfig.bbOrder || entry.bbOrder,
    action: unitConfig.action || entry.action,
    name: unitData.name || entry.id,
    extraAttackEffects,
    burst: unitData[entry.action],
    moveTypeId: (unitData.movement && unitData.movement.skill && +unitData.movement.skill['move type']) || 0,
    moveSpeed: (unitData.movement && unitData.movement.skill && +unitData.movement.skill['move speed']) || 0,
    moveSpeedType: (unitData.movement && unitData.movement.skill && +unitData.movement.skill['move speed type']) || '1',
    delay: !isNaN(entry.delay) ? +entry.delay : 0,
    teleporterId: entry.id,
    originalPosition,
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

export function calculateSparksForSparkSimSquad (squad = [convertSquadUnitEntryToSparkUnitEntry()], options = getSimulatorOptions()) {
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
      originalPosition: unit.originalPosition,
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
  const makeEntry = (delay = 0, description = '') => ({ delay, description });
  if (sparkUnitResult.id === squadFillerMapping.EMPTY) {
    return [makeEntry(0, 'Empty Units have no delay')];
  }

  const moveTypeId = (unitData.movement && unitData.movement.skill && +unitData.movement.skill['move type']) || 0;
  const moveSpeed = (unitData.movement && unitData.movement.skill && +unitData.movement.skill['move speed']) || 0;
  const moveTypeName = unitData.movement && getMoveType(unitData);
  const moveSpeedType = (unitData.movement && unitData.movement.skill && +unitData.movement.skill['move speed type']) || '1';

  const teleporterOffset = (moveTypeId === moveTypeIdByName.Teleporting && TELEPORTER_OFFSETS[unitData.id.toString()]) || 0;
  const positionBasedOffset = +MOVESPEED_OFFSETS[moveSpeedType][sparkUnitResult.position];
  const inputDelay = !isNaN(sparkUnitResult.delay) ? +sparkUnitResult.delay : 0;
  const squadLevelDelay = !isNaN(sparkUnitResult.squadLevelDelay) ? +sparkUnitResult.squadLevelDelay : 0;

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
  maxResults = 10,
  optimize = false,
} = {}, squad = generateDefaultSquad()) {
  let resultUnitConfig = Array.isArray(unitConfig)
    ? unitConfig.map((config, i) => getSparkSimUnitConfig({ ...config, id: squad.units[i].id }))
    : [];
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
    maxResults: Math.max(1, Math.min(100, getNumberOrDefault(maxResults, 10))),
    optimize: !!optimize,
  });
}

export function getSparkSimUnitConfig ({
  action = squadUnitActions.ATK,
  bbOrder = 1,
  delay = 0,
  weight = 1,
  lockPosition = false,
  id,
} = {}) {
  let finalAction;
  if (id === squadFillerMapping.EMPTY) {
    finalAction = squadUnitActions.NONE;
  } else if (id !== squadFillerMapping.EMPTY && action === squadUnitActions.NONE) {
    finalAction = squadUnitActions.ATK;
  } else {
    finalAction = action;
  }

  return Object.freeze({
    action: finalAction,
    bbOrder: id !== squadFillerMapping.EMPTY ? getNumberOrDefault(bbOrder, ANY_BB_ORDER) : ANY_BB_ORDER,
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

export function getSimulatorWarningsForSquad (squad = generateDefaultSquad(), options = getSimulatorOptions()) {
  const warnings = [];
  const emptyUnits = squad.units.filter(u => u.id === squadFillerMapping.EMPTY);
  const maxBbOrder = squad.units.length - emptyUnits.length;
  let highestBbOrderForNonEmptyUnits = 0, lowestBbOrderForEmptyUnits = 0;
  squad.units.forEach((unit, index) => {
    const unitConfig = options.unitConfig[index];
    if (unit.id === squadFillerMapping.EMPTY) {
      const bbOrder = !isNaN(unitConfig.bbOrder) ? +unitConfig.bbOrder : squad.units.length;
      lowestBbOrderForEmptyUnits = Math.min(lowestBbOrderForEmptyUnits, bbOrder);
    } else {
      const bbOrder = !isNaN(unitConfig.bbOrder) ? +unitConfig.bbOrder : 0;
      highestBbOrderForNonEmptyUnits = Math.max(highestBbOrderForNonEmptyUnits, bbOrder);
    }
  });

  if (highestBbOrderForNonEmptyUnits > maxBbOrder) {
    warnings.push(`BB Order for non-empty units should not exceed number of non-empty units (${maxBbOrder})`);
  }
  if (lowestBbOrderForEmptyUnits > 0 && lowestBbOrderForEmptyUnits <= maxBbOrder) {
    warnings.push(`BB Order for empty units should not be lower than the number of non-empty units (${maxBbOrder})`);
  }

  return warnings;
}

export function applySparkResultToSquad (squad = generateDefaultSquad(), sparkResult = calculateSparksForSparkSimSquad()) {
  const newUnitSet = [];
  let { lead, friend } = squad;
  unitPositionMapping.forEach((position, index) => {
    const squadUnitIndex = squad.units.findIndex(u => u.position === position);
    const sparkUnitIndex = sparkResult.squad.findIndex(u => u.originalPosition === position);

    newUnitSet.push(makeSquadUnitEntry({
      ...squad.units[squadUnitIndex],
      position: sparkResult.squad[sparkUnitIndex].position,
      bbOrder: sparkResult.squad[sparkUnitIndex].bbOrder,
      action: sparkResult.squad[sparkUnitIndex].action,
    }));

    if (squadUnitIndex === lead) {
      lead = index;
    }
    if (squadUnitIndex === friend) {
      friend = index;
    }
  });

  return cloneSquad({
    ...squad,
    lead,
    friend,
    units: newUnitSet,
  });
}

// original source: https://initjs.org/all-permutations-of-a-set-f1be174c79f8
export function getAllPermutations(arr = []) {
  const results = [];

  if (arr.length === 1) {
    results.push(arr);
  } else {
    arr.forEach((d, i) => {
      const remainingElements = arr.slice(0, i).concat(arr.slice(i + 1, arr.length));
      const innerPermutations = getAllPermutations(remainingElements);
      innerPermutations.forEach(permutation => {
        results.push([d].concat(permutation));
      });
    });
  }
  return results;
}

export function getPositionPermutations (squad = [convertSquadUnitEntryToSparkUnitEntry()], options = getSimulatorOptions()) {
  const lockedIndices = [], unlockedPositions = [];
  squad.forEach((unit, i) => {
    const unitConfig = options.unitConfig[i];
    if (unitConfig.lockPosition) {
      lockedIndices.push(i);
    } else {
      unlockedPositions.push(unit.position);
    }
  });

  let resultPositions = [[]];
  const createPositionArray = (positionPermutation = []) => {
    let currentPermutationIndex = 0;
    // fill in mapping based on locked and unlocked indices
    return unitPositionMapping.map((_, i) =>
      lockedIndices.includes(i)
        ? squad[i].position
        : positionPermutation[currentPermutationIndex++]
    );
  };
  if (unlockedPositions.length > 0) {
    resultPositions = getAllPermutations(unlockedPositions)
      .map(permutation => createPositionArray(permutation));
  } else {
    resultPositions = [lockedIndices.map(i => squad[i].position)];
  }
  return resultPositions;
}

export function getOrderPermutations (squad = [convertSquadUnitEntryToSparkUnitEntry()], options = getSimulatorOptions()) {
  const allOrders = squad.map((_, i) => i + 1);
  const emptyUnits = squad.filter(u => u.id === squadFillerMapping.EMPTY);
  const lockedUnits = [], unlockedUnits = [];
  squad.forEach((unit, i) => {
    const config = options.unitConfig[i];
    if (!isNaN(config.bbOrder) && allOrders.includes(config.bbOrder)) {
      lockedUnits.push({ unit, bbOrder: +config.bbOrder });
    } else if (config.bbOrder === ANY_BB_ORDER) {
      unlockedUnits.push({ unit });
    }
  });
  const emptyOrders = allOrders
    .filter(order => order > (squad.length - emptyUnits.length))
    .map((order, index) => ({ unit: emptyUnits[index], bbOrder: order }));
  const lockedOrders = lockedUnits.map(({ bbOrder }) => bbOrder);
  const unlockedOrders = allOrders.filter(order => !lockedOrders.includes(order) && order <= (squad.length - emptyUnits.length));

  let unitOrderPairings = [[]];
  if (unlockedOrders.length > 0) {
    unitOrderPairings = getAllPermutations(unlockedOrders)
      .map(permutation => {
        return permutation.map((bbOrder, index) => ({ unit: unlockedUnits[index], bbOrder }))
          .filter(p => p.unit)
          .concat(lockedUnits).concat(emptyOrders);
      });
  } else {
    unitOrderPairings = [lockedUnits.concat(emptyOrders)];
  }
  return unitOrderPairings.map(permutation => {
    return permutation
      .sort((a, b) => squad.indexOf(a.unit) - squad.indexOf(b.unit))
      .map(p => p.bbOrder);
  });
}

export function generateSimulatorPermutations (squad = [convertSquadUnitEntryToSparkUnitEntry()], options = getSimulatorOptions()) {
  const positionPermutations = getPositionPermutations(squad, options);
  const orderPermutations = getOrderPermutations(squad, options);
  const getResultKey = (currentSquad = squad, unitConfig = [{ bbOrder: 0, position: unitPositionMapping[0] }]) => {
    return currentSquad.map((unit, index) => {
      const config = unitConfig[index];
      const unitKey = unit.id === squadFillerMapping.EMPTY || unit.id === squadFillerMapping.ANY
        ? ''
        : `${unit.id}|${unit.extraAttackEffects.length}|${unit.action}|${config.position}|${config.bbOrder}`;
      return unitKey;
    }).filter(v => v).join('-');
  };
  const squadPermutations = [];
  const permutationHistory = new Map();
  positionPermutations.forEach(positionPermutation => {
    orderPermutations.forEach(orderPermutation => {
      const resultMapping = squad.map((_, i) => ({ position: positionPermutation[i], bbOrder: orderPermutation[i] }));
      const resultKey = getResultKey(squad, resultMapping);
      if (!permutationHistory.get(resultKey)) {
        permutationHistory.set(resultKey, true);
        squadPermutations.push(resultMapping);
      }
    });
  });

  return squadPermutations;
}

export function getUnitConfigForUnoptimizedRun (config = getSparkSimUnitConfig(), unit = generateFillerSquadUnitEntry()) {
  return {
    ...config,
    bbOrder: !isNaN(config.bbOrder) ? config.bbOrder : unit.bbOrder,
  };
}

export function applyPermutationToUnitConfig (options = [getSparkSimUnitConfig()], permutation = [{ bbOrder: 1, position: unitPositionMapping[0] }]) {
  return options.map((config, i) => getSparkSimUnitConfig({
    ...config,
    ...permutation[i],
  }));
}

export function applyPermutationToSparkSquad (squad = [convertSquadUnitEntryToSparkUnitEntry()], permutation = [{ bbOrder: 1, position: unitPositionMapping[0] }]) {
  return squad.map((unit, i) => ({
    ...unit,
    bbOrder: permutation[i].bbOrder,
    position: permutation[i].position,
  }));
}
