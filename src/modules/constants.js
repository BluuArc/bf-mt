import TernaryFilterOption from './TernaryFilterOption';

export const servers = Object.freeze(['gl', 'eu', 'jp']);
export const elements = Object.freeze(['fire', 'water', 'earth', 'thunder', 'light', 'dark']);
export const genders = Object.freeze(['male', 'female', 'other']);
export const unitKinds = Object.freeze(['normal', 'evolution', 'enhancing', 'sale']);
export const itemTypes = Object.freeze(['consumable', 'material', 'raid', 'sphere', 'evomat', 'summoner_consumable', 'ls_sphere']);
export const missionLocationTypes = Object.freeze(['land', 'area', 'dungeon']);

export const defaultTernaryOptions = new TernaryFilterOption('with', 'without'); // generic ternary
export const exclusiveFilterOptions = new TernaryFilterOption('exclusive', 'non-exclusive');
export const craftableFilterOptions = new TernaryFilterOption('craftable', 'non-craftable');
export const usageFilterOptions = new TernaryFilterOption('used', 'unused');

export const itemTypeMapping = Object.freeze({
  consumable: 'Item',
  material: 'Material',
  sphere: 'Sphere',
  evomat: 'Evo Material',
  summoner_consumable: 'Booster',
  raid: 'Raid Item',
  ls_sphere: 'LS Sphere',
});

export const sphereTypeMapping = Object.freeze({
  0: 'None',
  1: 'Status Enhancing',
  2: 'Critical',
  3: 'Drop',
  4: 'Ailment Inducing',
  5: 'Element Fusion',
  6: 'BB Gauge',
  7: 'HP Recovery',
  8: 'Target Setting',
  9: 'Damage Deflecting',
  10: 'Damage Reducing',
  11: 'Spark',
  12: 'Defense Piercing',
  13: 'Attack Boosting',
  14: 'Special',
});

export const targetAreaMapping = Object.freeze({
  aoe: 'AOE',
  single: 'ST',
  random: 'RT',
});
export const buffSearchOptions = Object.freeze(['ls', 'es', 'sp', 'bb', 'sbb', 'ubb']);
export const unitTypes = Object.freeze(['lord', 'anima', 'breaker', 'guardian', 'oracle']);
export const ailments = Object.freeze(['poison', 'weak', 'sick', 'injury', 'curse', 'paralysis']);
export const dropTypes = Object.freeze(['hc', 'bc', 'item', 'zel', 'karma']);

export const unitStatFields = Object.freeze(['hp', 'atk', 'def', 'rec']);
export const moveTypeMapping = Object.freeze({
  1: 'Moving',
  2: 'Teleporting',
  3: 'Non-Moving',
});

export const spCategoryMapping = Object.freeze({
  1: 'Parameter Boost',
  2: 'Spark',
  3: 'Critical Hits',
  4: 'Attack Boost',
  5: 'BB Gauge',
  6: 'HP Recovery',
  7: 'Drops',
  8: 'Ailment Resistance',
  9: 'Ailment Infliction',
  10: 'Damage Reduction',
  11: 'Special',
});

export const mimicIds = Object.freeze({
  mimic: '60142',
  batMimic: '60143',
  dragonMimic: '60144',
  metalMimic: '60224',
});

export const missionMonsterGroupMapping = Object.freeze({
  '1000': mimicIds.mimic,
  '1100': mimicIds.batMimic,
  '1101': mimicIds.batMimic,
  '1200': mimicIds.dragonMimic,
  '1300': mimicIds.metalMimic,
});

export const effectTypes = Object.freeze({
  ATTACK: {
    name: 'Attack',
    desc: 'These types of effects directly inflict damage on targets.',
  },
  PASSIVE: {
    name: 'Passive',
    desc: 'These effects are always active unless nullified by an enemy skill or battle restriction. Passives from different sources usually stack.',
  },
  'INSTANT/BURST': {
    name: 'Instant/Burst',
    desc: 'These take effect as soon as they are cast and are usually stackable with other effects of the same type.',
  },
  TIMED: {
    name: 'Timed',
    desc: 'These conditionally occur (e.g. from the start of battle, after X damage is taken, etc.) and last for a set amount of turns. Timed buffs of the same effect do not stack, regardless of the source. Newer timed buffs of the same type will override the old buff.',
  },
  ACTIVE: {
    name: 'Active',
    desc: 'These are usually turn based; the source for these effects are from unit bursts (BB, SBB, UBB) or enemy skills. Newer active buffs of the same type will override the old buff (using the new value and duration).',
  },
  PERMANENT: {
    name: 'Permanent',
    desc: 'These remain in effect for the entire battle. Depending on the buff, it may go away once used.',
  },
  UNKNOWN: {
    name: 'Unknown',
    desc: 'These effects aren\'t fully understood yet.',
  },
  UNTRANSLATED: {
    name: 'Untranslated',
    desc: 'These effects aren\'t supported by the effect processor yet.',
  },
});
