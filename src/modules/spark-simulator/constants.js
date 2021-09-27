const passiveProcMetadata = require('@/assets/buff-translation/passive-proc-metadata.json');

export const ATTACKING_PROCS = Object.freeze(
  Object.keys(passiveProcMetadata.proc)
    .filter(id => passiveProcMetadata.proc[id].Type === 'Attack')
);

export const MOVESPEED_OFFSETS = Object.freeze({
  '1': {
    'Top Left': 15,
    'Top Right': 30,
    'Middle Left': 20,
    'Middle Right': 40,
    'Bottom Left': 18,
    'Bottom Right': 33,
  },
  '2': {
    'Top Left': 13,
    'Top Right': 24,
    'Middle Left': 16,
    'Middle Right': 33,
    'Bottom Left': 15,
    'Bottom Right': 27,
  },
  '3': {
    'Top Left': 10,
    'Top Right': 19,
    'Middle Left': 13,
    'Middle Right': 26,
    'Bottom Left': 12,
    'Bottom Right': 21,
  },
  '4': {
    'Top Left': 7,
    'Top Right': 14,
    'Middle Left': 9,
    'Middle Right': 19,
    'Bottom Left': 8,
    'Bottom Right': 15,
  },
  '5': {
    'Top Left': 4,
    'Top Right': 9,
    'Middle Left': 6,
    'Middle Right': 12,
    'Bottom Left': 5,
    'Bottom Right': 9,
  },
});

/**
 * @desc Custom known offsets for teleporting units.
 * For those with subtractions, they in the format of:
 * [original calculated value] - [effect delay of skill used to find caluclated value]
 * In most cases the skill used is SBB
 */
export const TELEPORTER_OFFSETS = Object.freeze({
  // from Hamza Khan
  '850328': 19, // ezra
  '750167': 11, // arthur
  '810278': 25, // zeis
  '810108': 32, // ciara
  '61007': 48, // kalon
  '860357': 34, // neferet
  '850418': 30, // gabriela
  '20887': 43, // mariela
  '860258': 21, // zenia
  '850158': 23, // carrol
  '61087': 17, // zalvard
  '51107': 21, // diastima
  '40857': 15, // licht
  '860518': 23, // beatrix
  // '860548': 20, // mard
  // from BluuArc
  '860548': 17 - 1, // mard, sbb
  '51317': 72 - 1, // karna masta, bb
  '830048': 18 - 1, // dranoel, sbb
  '61207': 29 - 1, // alza masta, bb
  '850568': 29 - 1, // qiutong, sbb
  '850928': 22 - 1, // sidonie, sbb
});

export const UNIT_SKILL_TYPES = {
  BB: 'bb',
  SBB: 'sbb',
  UBB: 'ubb',
};

export const SBB_NO_CUTIN_DELAY = 2;
export const SBB_CUTIN_DELAY = 1;

export const MAX_WORKERS = 2;
