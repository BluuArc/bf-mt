import colors from 'vuetify/es5/util/colors';
import { convertCompareCodeToInput } from './compare';

export function convertCodeToCategory (input = '', isUriComponent = true) {
  const [name, textColor, backgroundColor] = input.split('-');

  let result;
  if (name) {
    result = {
      name: isUriComponent ? decodeURIComponent(name) : name,
      // text and background color are hex values without hashes
      textColor: textColor ? `#${textColor}` : colors.shades.black,
      backgroundColor: backgroundColor ? `#${backgroundColor}` : colors.shades.white,
    };
  }
  return result;
}

export function convertCategoryToCode ({ name, textColor, backgroundColor }) {
  let textColorCode, backgroundColorCode;
  if (textColor) {
    textColorCode = textColor[0] === '#' ? textColor.slice(1): textColor;
  } else {
    textColorCode = '';
  }

  if (backgroundColor) {
    backgroundColorCode = backgroundColor[0] === '#' ? backgroundColor.slice(1) : backgroundColor;
  } else {
    backgroundColorCode = '';
  }
  return `${encodeURIComponent(name)}-${textColorCode}-${backgroundColorCode}`;
}

export function convertCodeToEntry (input = '') {
  const convertedInput = convertCompareCodeToInput(input);
  let result;
  if (convertedInput) {
    result = {
      type: convertedInput.type,
      id: convertedInput.id,
      altArtId: convertedInput.options || '',
    };
  }
  return result;
}

export function convertEntryToCode ({ type, id, altArtId }) {
  const baseCode = `${type}-${id}`;
  return altArtId
    ? `${baseCode}_${altArtId}`
    : baseCode;
}

export function generateTierListCode (categories = [], entries = []) {
  const categoriesCode = categories
    .map(convertCategoryToCode)
    .join(',');
  const entriesCode = categories
    .map((_, i) => (entries[i] || []).map(convertEntryToCode).join(','))
    .join('!');
  return `${categoriesCode}.${entriesCode}`;
}

export function fetchBase64Png (url = '') {
  // const BASE_URL = 'https://macabre-broomstick-39921.herokuapp.com/getImage';
  const BASE_URL = 'http://localhost:5000/getImage';
  return fetch(`${BASE_URL}/${encodeURIComponent(url)}?format=text/plain`)
    .then(res => res.ok
        ? res.text()
        : Promise.reject(res.statusText)
    ).then(b64 => `data:image/png;base64,${b64}`);
}

export function getDefaultCategories () {
  return [
    {
      name: 'S',
      backgroundColor: colors.red.accent1,
      textColor: colors.shades.black,
    },
    {
      name: 'A',
      backgroundColor: colors.orange.accent1,
      textColor: colors.shades.black,
    },
    {
      name: 'B',
      backgroundColor: colors.yellow.lighten1,
      textColor: colors.shades.black,
    },
    {
      name: 'C',
      backgroundColor: colors.green.lighten2,
      textColor: colors.shades.black,
    },
    {
      name: 'D',
      backgroundColor: colors.blue.lighten2,
      textColor: colors.shades.black,
    },
  ];
}
