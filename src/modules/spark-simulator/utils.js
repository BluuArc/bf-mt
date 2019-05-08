import { SBB_NO_CUTIN_DELAY, ATTACKING_PROCS, TELEPORTER_OFFSETS, MOVESPEED_OFFSETS } from './constants';
import {
  getBurstEffects,
  getHealFrameData,
  getHitCountData as getHitCountDataFromBurst,
} from '@/modules/core/bursts';
import { generateFillerSquadUnitEntry } from '@/modules/core/squad';
import {
  targetAreaMapping,
  moveTypeIdByName,
  squadFillerMapping,
} from '@/modules/constants';
import { getEffectId } from '@/modules/EffectProcessor/processor-helper';

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

export function getFramesForSparkUnitEntry ({
  burst = {},
  extraAttackEffects = [],
  delay = 0,
  moveTypeId = moveTypeIdByName.Moving,
  moveSpeed = 0,
  teleporterId = 0,
}) {
  const burstFrames = burst['damage frames']
    .filter(b => ATTACKING_PROCS.includes(getEffectId(b).toString()));
  const burstEffects = getBurstEffects(burst).effects
    .filter(b => ATTACKING_PROCS.includes(getEffectId(b).toString()));
  
  const baseOffset = [
    moveTypeId === moveTypeIdByName['Non-Moving'] ? moveSpeed : 0,
    (moveTypeId === moveTypeIdByName.Teleporting && TELEPORTER_OFFSETS[teleporterId.toString()]) || 0,
    !isNaN(delay) ? +delay : 0,
  ].reduce((acc, val) => acc + val, 0);

  let resultAttackFrames = burstFrames.map((frameInfo, index) => {
    const isAoe = burstEffects[index]['target area'] === 'aoe';
    const effectDelay = moveTypeId === moveTypeIdByName.Teleporting
      ? 0
      : +frameInfo['effect delay time(ms)/frame'].split('/')[1];
    const attackTypeByFrame = {};
    frameInfo['frame times'].forEach(time => {
      const actualTime = +time + (moveTypeId === moveTypeIdByName.Teleporting ? 0 : effectDelay) + baseOffset;
      attackTypeByFrame[actualTime] = isAoe ? 'aoe' : 'st';
    });
    return attackTypeByFrame;
  });

  if (extraAttackEffects.length > 0) {
    const extraAttackFrames = getExtraAttackFrames(burst);
    const resultExtraAttackFrames = extraAttackEffects.filter(b => ATTACKING_PROCS.includes(getEffectId(b).toString()))
      .map(effect => {
        const isAoe = effect['target area'] === 'aoe';
        const effectDelay = +effect['effect delay time(ms)/frame'].split('/')[1];
        const attackTypeByFrame = {};
        // TODO: verify accuracy of this
        extraAttackFrames['frame times'].forEach(time => {
          const actualTime = +time + (moveTypeId === moveTypeIdByName.Teleporting ? 0 : effectDelay) + baseOffset;
          attackTypeByFrame[actualTime] = isAoe ? 'aoe' : 'st';
        });
        return attackTypeByFrame;
      });
    resultAttackFrames = resultAttackFrames.concat(resultExtraAttackFrames);
  }
  return resultAttackFrames;
}

export function convertSquadUnitEntryToSparkUnitEntry (entry = generateFillerSquadUnitEntry(), synchronousGetters = { unit, item, extraSkill }) {
  const unitData = synchronousGetters.unit(entry.id);
  const sparkUnitEntry = {
    id: entry.id,
    position: entry.position,
    bbOrder: entry.bbOrder,
    name: unitData.name || entry.id,
    // TODO: implement extra attack scraping
    extraAttackEffects: [],
    burst: unitData[entry.action],
    moveTypeId: (unitData.movement && unitData.movement.skill && +unitData.movement.skill['move type']) || 0,
    moveSpeed: (unitData.movement && unitData.movement.skill && +unitData.movement.skill['move speed']) || 0,
    moveSpeedType: (unitData.movement && unitData.movement.skill && +unitData.movement.skill['move speed type']) || '1',
    delay: !isNaN(entry.delay) ? +entry.delay : 0,
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
      Object.keys(attack).forEach(frame => {
        const actualFrame = +frame + frameDelay;
        const targetType = attack[frame];
        if (!battleFrames[actualFrame]) {
          battleFrames[actualFrame] = {
            aoe: 0,
            st: 0,
          };
        }
        battleFrames[actualFrame][targetType] += 1;
      });
    });
  }
  return battleFrames;
}

export function calculateSparksForSparkSimSquad (squad = [], numEnemies = 6) {
  const aggregatedBattleFrames = {};

  // aggregate battle frames
  squad.forEach(unit => {
    const unitFrames = getBattleFrames(unit);
    Object.keys(unitFrames)
      .forEach(frame => {
        if (!aggregatedBattleFrames[frame]) {
          aggregatedBattleFrames[frame] = {
            aoe: 0,
            st: 0,
          };
        }

        aggregatedBattleFrames[frame].aoe += unitFrames[frame].aoe;
        aggregatedBattleFrames[frame].st += unitFrames[frame].st;
      });
  });

  // TODO: calculate sparks
}
