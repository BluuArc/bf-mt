import TernaryFilterOption from './TernaryFilterOption';

export const servers = Object.freeze(['gl', 'eu', 'jp']);
export const elements = Object.freeze(['fire', 'water', 'earth', 'thunder', 'light', 'dark']);
export const gender = Object.freeze(['male', 'female', 'other']);
export const unitKind = Object.freeze(['normal', 'evolution', 'enhancing', 'sale']);
export const itemTypes = Object.freeze(['consumable', 'material', 'raid', 'sphere', 'evomat', 'summoner_consumable', 'ls_sphere']);

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

// TODO: dynamically created from effect processor
export const attackingProcs = Object.freeze(['1', '13', '14', '27', '28', '29', '47', '61', '64', '75', '11000'].concat(['46', '48', '97']));

export const targetAreaMapping = Object.freeze({
  aoe: 'AOE',
  single: 'ST',
  random: 'RT',
});
export const buffSearchOptions = Object.freeze(['ls', 'es', 'sp', 'bb', 'sbb', 'ubb']);
export const unitTypes = Object.freeze(['lord', 'anima', 'breaker', 'guardian', 'oracle']);
export const ailments = Object.freeze(['poison', 'weak', 'sick', 'injury', 'curse', 'paralysis']);
export const dropTypes = Object.freeze(['hc', 'bc', 'item', 'zel', 'karma']);
