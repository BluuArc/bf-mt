export default {
  elements: ['fire', 'water', 'earth', 'thunder', 'light', 'dark'],
  gender: ['male', 'female', 'other'],
  unitKind: ['normal', 'evolution', 'enhancing', 'sale'],
  itemTypes: ['consumable', 'material', 'raid', 'sphere', 'evomat', 'summoner_consumable', 'ls_sphere'],
  exclusiveFilterOptions: {
    all: ['exclusive', 'non-exclusive'],
    exclusive: ['exclusive'],
    nonExclusive: ['non-exclusive'],
  },
  // default ternary options
  withWithoutTernaryOptions: {
    all: ['with', 'without'],
    with: ['with'],
    without: ['without'],
  },
  associatedUnitOptions: {
    all: ['with', 'without'],
    with: ['with'],
    without: ['without'],
  },
  craftableFilterOptions: {
    all: ['craftable', 'non-craftable'],
    craftable: ['craftable'],
    nonCraftable: ['non-craftable'],
  },
  usageFilterOptions: {
    all: ['used', 'unused'],
    used: ['used'],
    unused: ['unused'],
  },
  itemTypeMapping: {
    consumable: 'Item',
    material: 'Material',
    sphere: 'Sphere',
    evomat: 'Evo Material',
    summoner_consumable: 'Booster',
    raid: 'Raid Item',
    ls_sphere: 'LS Sphere',
  },
  servers: ['gl', 'eu', 'jp'],
  attackingProcs: ['1', '13', '14', '27', '28', '29', '47', '61', '64', '75', '11000'].concat(['46', '48', '97']),
  targetAreaMapping: {
    aoe: 'AOE',
    single: 'ST',
    random: 'RT',
  },
  buffSearchOptions: ['ls', 'es', 'sp', 'bb', 'sbb', 'ubb'],
  unitTypes: ['lord', 'anima', 'breaker', 'guardian', 'oracle'],
};
