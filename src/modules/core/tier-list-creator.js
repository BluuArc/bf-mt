import { convertCompareCodeToInput } from './compare';

export function convertCodeToInput (input = '') {
  return convertCompareCodeToInput(input);
}

export function convertInputToCode ({ type = '', id = '' }) {
  return `${type}-${id}`;
}

export function generateInput ({ type = '', id = '' }) {
  return { type, id };
}
