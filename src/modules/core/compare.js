import { COMPARE_KEY_ORDER } from '@/modules/constants';
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
