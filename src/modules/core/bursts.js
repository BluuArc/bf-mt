import { attackingProcs } from '@/modules/EffectProcessor/constants';
import { targetAreaMapping, targetTypes, squadBuffTypes } from '@/modules/constants';
import SWorker from '@/assets/sww.min.js';
import { getEffectsList } from './buffs';

export function getBurstEffects (burst, level) {
  // default to last level
  const burstEffectsByLevel = Array.isArray(burst.levels) ? burst.levels : [];
  const levelIndex = (level !== undefined) ? level : burstEffectsByLevel.length - 1;
  return burstEffectsByLevel[levelIndex];
}

export function getBcDcInfo (burst) {
  if (!burst) {
    return { cost: 0, hits: 0, dropchecks: 0 };
  }

  const endLevel = getBurstEffects(burst);

  const attacks = endLevel.effects
    .map((e, i) => ({
      'proc id': e['proc id'] || e['unknown proc id'],
      hits: e.hits || (burst['damage frames'][i] || {}).hits || 0,
    })).filter(e => attackingProcs.indexOf(e['proc id']) > -1);
  const numHits = attacks.reduce((acc, val) => (acc + +val.hits), 0);
  const dropChecks = numHits * +burst['drop check count'];

  return {
    cost: endLevel['bc cost'],
    hits: numHits,
    dropchecks: dropChecks,
  };
}

export function getHitCountData (burst, filterFn = (f) => attackingProcs.includes(f.id)) {
  if (typeof burst !== 'object' || Object.keys(burst).length === 0) {
    return [];
  }
  const endLevel = getBurstEffects(burst);
  return burst['damage frames']
    .map((f, i) => {
      const effectData = endLevel.effects[i];
      return {
        target: targetAreaMapping[effectData['random attack'] ? 'random' : effectData['target area']],
        id: (f['proc id'] || f['unknown proc id']).toString(),
        frames: f,
        delay: effectData['effect delay time(ms)/frame'],
        effects: effectData,
      };
    }).filter(filterFn);
}

export function getHealFrameData (burst) {
  return getHitCountData(burst, f => f.id === '2');
}

export async function getExtraAttackFrames (burst) {
  const attackFrameSets = getHitCountData(burst).map(d => d.frames);
  const healFrameSets = getHealFrameData(burst).map(d => d.frames);

  const frames = await SWorker.run((attackFrameSets, healFrameSets) => {
    let frameTimes = [];
    let hitDmgDistribution = [];

     // gather frame data
    attackFrameSets.forEach((frameSet, i) => {
      const keepFirstFrame = i === 0;
      frameTimes = frameTimes.concat(frameSet['frame times'].slice(keepFirstFrame ? 0 : 1));
      hitDmgDistribution = hitDmgDistribution.concat(frameSet['hit dmg% distribution'].slice(keepFirstFrame ? 0 : 1));
    });

    healFrameSets.forEach((frameSet, i) => {
      const keepFirstFrame = i === 0 && attackFrameSets.length === 0;
      frameTimes = frameTimes.concat(frameSet['frame times'].slice(keepFirstFrame ? 0 : 1));
      hitDmgDistribution = hitDmgDistribution.concat(frameSet['hit dmg% distribution'].slice(keepFirstFrame ? 0 : 1));
    });

    // sort frames by frame time
    const unifiedFrames = [];
    frameTimes.forEach((time, i) => {
      unifiedFrames.push({
        time,
        dmg: hitDmgDistribution[i],
      });
    });

    const frames = {
      'frame times': [],
      'hit dmg% distribution': [],
    };
    unifiedFrames.sort((a, b) => a.time - b.time).forEach(({ time, dmg }) => {
      frames['frame times'].push(time);
      frames['hit dmg% distribution'].push(dmg);
    });
    return frames;
  }, [attackFrameSets, healFrameSets]);

  return frames;
}

export async function getExtraAttackHitCountData (burst, extraAttacks = [], hasWiles = true) {
  if (!burst) {
    return [];
  }

  const attacks = extraAttacks.slice();
  const extraAttackFrames = await getExtraAttackFrames(burst);

  if (hasWiles) {
    attacks.push({
      'target area': 'single',
      'proc id': '1',
      'effect delay time(ms)/frame': '0.0/0',
      source: 'Wiles Sphere',
    });
  }
  return attacks.map(effectData => {
    return {
      target: targetAreaMapping[effectData['random attack'] ? 'random' : effectData['target area']],
      id: (effectData['proc id'] || effectData['unknown proc id']).toString(),
      frames: extraAttackFrames,
      effects: effectData,
      delay: effectData['effect delay time(ms)/frame'],
      source: effectData.source,
    };
  });
}

export function getTotalDistribution (frames) {
  return frames['hit dmg% distribution'].reduce((acc, val) => acc + val, 0);
}

export async function calculateSparkedFrames (hitCountData, extraAttackHitCountData) {
  const result = await SWorker.run((native, extra) => {
    const allFrames = {};
    const addFrame = (time, index, type) => {
      const timeKey = time.toString();
      if (!allFrames[timeKey]) {
        allFrames[timeKey] = [];
      }
      allFrames[timeKey].push({ index, type });
    };
    native.forEach((entry, index) => {
      const delay = +(entry.delay.split('/')[1]);
      const frames = entry.frames['frame times'];
      // console.debug('native', index, delay);
      frames.forEach(time => {
        addFrame(+time + delay, index, 'native');
      });
    });
    extra.forEach((entry, index) => {
      const delay = +(entry.delay.split('/')[1]);
      const frames = entry.frames['frame times'];
      // console.debug('extra', index, delay);
      frames.forEach(time => {
        addFrame(+time + delay, index, 'extra');
      });
    });
    const sparkedFrames = {};
    for (const time in allFrames) {
      const entry = allFrames[time];
      if (entry.length > 1) {
        sparkedFrames[time] = entry.slice();
      }
    }
    return sparkedFrames;
  }, [hitCountData, extraAttackHitCountData]);
  return result;
}

export function hasSelfSpark (frames, inputDelay, sparkedFrames) {
  const delay = +(inputDelay.split('/')[1]);
  return sparkedFrames && frames['frame times'].some((time) => !!sparkedFrames[(+time + delay).toString()]);
}

export function getSelfSparkCount (frames, inputDelay, sparkedFrames) {
  if (!sparkedFrames) {
    return 0;
  }

  const delay = +(inputDelay.split('/')[1]);
  return frames['frame times']
    .filter(time => (sparkedFrames[(+time + delay)] || []).length > 0)
    .length;
}

export function getEffectsListForBurst ({
  burst = {},
  target = targetTypes.PARTY,
  effectType = squadBuffTypes.PROC,
}) {
  const details = getBurstEffects(burst) || {};
  const effects = (Array.isArray(details.effects) ? details.effects : [])
    .map(e => ({ ...e, sourcePath: `Burst: ${burst.name || '(No name found)'} (${burst.id})`}));
  return getEffectsList({
    nonUbbBurstEffects: effects,
    target,
    effectType,
  });
}
