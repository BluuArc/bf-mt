import { COMPARE_KEY_ORDER, COMPARE_KEY_MAPPING } from '@/modules/constants';

export function convertCompareCodeToInput (input = '') {
  const [type, idAndOptions] = input.split('-');
  const [id, options] = (idAndOptions || '').split('_');

  return COMPARE_KEY_ORDER.includes(type)
    ? { type, id, options }
    : undefined;
}

export function convertCompareInputToCode ({ type = '', id = '', options = '' } = {}) {
  const baseCode = `${type}-${id}`;
  return options
    ? `${baseCode}_${Array.isArray(options) ? options.join('~') : options}`
    : baseCode;
}

export function generateCompareInput ({ type = '', id = '', options }) {
  return { type, id, options };
}

export function getEntryCardType (type) {
  switch(type) {
    case COMPARE_KEY_MAPPING.unit.key: return 'UnitEntryCard';
    case COMPARE_KEY_MAPPING.item.key: return 'ItemEntryCard';
    case COMPARE_KEY_MAPPING.es.key: return 'ExtraSkillEntryCard';
    case COMPARE_KEY_MAPPING.ls.key: return 'LeaderSkillEntryCard';
    case COMPARE_KEY_MAPPING.bb.key: return 'BurstEntryCard';
    default: return 'BaseEntryCard';
  }
}
